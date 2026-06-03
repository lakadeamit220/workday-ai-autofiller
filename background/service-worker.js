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

async function callOpenAI(messages, apiKey, model = "gpt-4o-mini", jsonMode = false) {
  let attempt = 0;
  let delay = 1000;
  
  while (attempt < 3) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          response_format: jsonMode ? { type: "json_object" } : undefined
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.status === 401) throw new Error("Invalid API Key");
      if (response.status === 429) throw new Error("Rate limit exceeded");
      if (!response.ok) throw new Error(`API Error: ${response.statusText}`);

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      attempt++;
      if (attempt >= 3 || error.message === "Invalid API Key") throw error;
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "parseResume") {
    chrome.storage.local.get(['openaiApiKey']).then(async (result) => {
      try {
        if (!result.openaiApiKey) throw new Error("API Key not found. Please set it in the popup.");
        const responseText = await callOpenAI([
          { role: "system", content: RESUME_PARSE_PROMPT },
          { role: "user", content: request.text }
        ], result.openaiApiKey, "gpt-4o-mini", true);
        
        const parsedJSON = JSON.parse(responseText);
        await chrome.storage.local.set({ resumeData: parsedJSON });
        sendResponse({ success: true, data: parsedJSON });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; 
  }

  if (request.action === "mapFields") {
    chrome.storage.local.get(['openaiApiKey']).then(async (result) => {
      try {
        if (!result.openaiApiKey) throw new Error("API Key not found");
        
        const userContent = `FIELDS: ${JSON.stringify(request.fields)}\nRESUME: ${JSON.stringify(request.resumeData)}`;
        const responseText = await callOpenAI([
          { role: "system", content: FIELD_MAP_PROMPT },
          { role: "user", content: userContent }
        ], result.openaiApiKey, "gpt-4o-mini", true);
        
        const parsed = JSON.parse(responseText);
        sendResponse({ success: true, mappings: parsed.mappings || [] });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; 
  }

  if (request.action === "answerQuestion") {
    chrome.storage.local.get(['openaiApiKey']).then(async (result) => {
      try {
        if (!result.openaiApiKey) throw new Error("API Key not found");
        const prompt = "Generate a professional 2-3 sentence answer. Be honest. Never fabricate data not present in resume.";
        const userContent = `QUESTION: ${request.question}\nRESUME: ${JSON.stringify(request.resumeData)}`;
        const responseText = await callOpenAI([
          { role: "system", content: prompt },
          { role: "user", content: userContent }
        ], result.openaiApiKey, "gpt-4o-mini", false);
        
        sendResponse({ success: true, answer: responseText });
      } catch (error) {
        sendResponse({ success: false, error: error.message });
      }
    });
    return true; 
  }
});
