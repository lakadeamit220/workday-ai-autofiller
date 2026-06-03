const RESUME_PARSE_PROMPT = `
You are a resume parser. Extract structured data from the resume text.
Return ONLY valid JSON with this exact structure:
{
  "personalInfo": {
    "firstName": "", "lastName": "", "email": "", "phone": "",
    "address": { "street": "", "city": "", "state": "", "zip": "", "country": "" },
    "linkedIn": "", "github": "", "website": ""
  },
  "summary": "",
  "workExperience": [{
    "title": "", "company": "", "location": "",
    "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present",
    "description": "", "highlights": [""]
  }],
  "education": [{
    "degree": "", "field": "", "institution": "", "location": "",
    "startDate": "YYYY-MM", "endDate": "YYYY-MM", "gpa": ""
  }],
  "skills": [""],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "languages": [""],
  "totalYearsExperience": 0
}
Normalize dates to YYYY-MM. Infer missing info where possible.
Use empty string for truly unknown fields. Never fabricate data.
`;

const FIELD_MAP_PROMPT = `
You are a Workday form-filling assistant. Given form fields and resume data,
determine the best value for each field.

Rules:
- Match semantically: "Given Name"=firstName, "Family Name"=lastName,
  "Email Address"=email, "Phone Number"=phone
- For dropdowns, pick the closest option from the options array
- For date fields, use the format shown in placeholder or MM/DD/YYYY
- Set confidence 0-1 (1=certain, 0=unknown)
- Never fabricate info not in the resume
- For "How did you hear" -> "Company Website"
- For country/region dropdowns, match to resume address

Return ONLY valid JSON with this exact structure:
{
  "mappings": [
    { "fieldIndex": 0, "value": "...", "confidence": 0.95 }
  ]
}
`;

async function callAI(messages, apiKey, provider, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      let url, headers, body;

      if (provider === 'gemini') {
        url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
        headers = { 'Content-Type': 'application/json' };

        const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
        const userPrompt = messages.find(m => m.role === 'user')?.content || '';

        body = JSON.stringify({
          system_instruction: { parts: { text: systemPrompt } },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
      } else if (provider === 'groq') {
        url = 'https://api.groq.com/openai/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages,
          response_format: { type: "json_object" }
        });
      } else {
        // Default to OpenAI
        url = 'https://api.openai.com/v1/chat/completions';
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        };
        body = JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          response_format: { type: "json_object" }
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      let content = "";

      if (provider === 'gemini') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      } else {
        content = data.choices?.[0]?.message?.content || '{}';
      }

      return JSON.parse(content);
    } catch (e) {
      console.warn(`AI request failed (attempt ${i + 1}/${retries}):`, e);
      if (i === retries - 1) throw e;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}

// ── Message Listener ──────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  // ── Parse Resume ────────────────────────────────────────────────────────────
  if (request.action === "parseResume") {
    (async () => {
      try {
        const { openaiApiKey, aiProvider } = await chrome.storage.local.get(['openaiApiKey', 'aiProvider']);
        if (!openaiApiKey) {
          sendResponse({ success: false, error: "API key not found. Please save it in the popup." });
          return;
        }
        const provider = aiProvider || 'gemini';

        const messages = [
          { role: "system", content: RESUME_PARSE_PROMPT },
          { role: "user", content: request.text }
        ];

        const result = await callAI(messages, openaiApiKey, provider);
        await chrome.storage.local.set({ resumeData: result });
        sendResponse({ success: true, data: result });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  // ── Map Fields ──────────────────────────────────────────────────────────────
  if (request.action === "mapFields") {
    (async () => {
      try {
        const { openaiApiKey, aiProvider } = await chrome.storage.local.get(['openaiApiKey', 'aiProvider']);
        if (!openaiApiKey) {
          sendResponse({ success: false, error: "API key not found." });
          return;
        }
        const provider = aiProvider || 'gemini';

        const messages = [
          { role: "system", content: FIELD_MAP_PROMPT },
          { role: "user", content: `RESUME DATA:\n${JSON.stringify(request.resumeData)}\n\nFORM FIELDS:\n${JSON.stringify(request.fields)}` }
        ];

        const result = await callAI(messages, openaiApiKey, provider);
        sendResponse({ success: true, mappings: result.mappings || [] });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }

  // ── Answer Question ─────────────────────────────────────────────────────────
  if (request.action === "answerQuestion") {
    (async () => {
      try {
        const { openaiApiKey, aiProvider } = await chrome.storage.local.get(['openaiApiKey', 'aiProvider']);
        if (!openaiApiKey) {
          sendResponse({ success: false, error: "API key not found." });
          return;
        }
        const provider = aiProvider || 'gemini';

        const prompt = "Generate a professional 2-3 sentence answer. Be honest. Never fabricate data not present in resume. Return JSON: { \"answer\": \"...\" }";
        const userContent = `QUESTION: ${request.question}\nRESUME: ${JSON.stringify(request.resumeData)}`;

        const result = await callAI([
          { role: "system", content: prompt },
          { role: "user", content: userContent }
        ], openaiApiKey, provider);

        sendResponse({ success: true, answer: result.answer || "" });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
});
