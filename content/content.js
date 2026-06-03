import { waitForFormReady } from './observer';
import { detectAllFields } from './detector';
import { mapFieldsToResume } from './mapper';
import { fillAllFields } from './filler';
import { getCurrentStep, goToNextStep, isReviewStep } from './navigator';
import { sleep } from '../utils/helpers';

let isRunning = false;

async function runAutofillFlow() {
  if (isRunning) return;
  isRunning = true;
  
  const sendMessage = (msg) => chrome.runtime.sendMessage(msg).catch(() => {});

  try {
    const { resumeData } = await chrome.storage.local.get(['resumeData']);
    if (!resumeData) {
      throw new Error("No parsed resume data found. Please upload your resume in the extension.");
    }

    while (isRunning) {
      await waitForFormReady(15000).catch(() => console.warn("Form ready timeout"));
      
      const stepInfo = getCurrentStep();
      sendMessage({ 
        action: "progress", 
        step: stepInfo.number, 
        total: stepInfo.total, 
        status: stepInfo.name 
      });

      if (isReviewStep()) {
        sendMessage({ 
          action: "progress", 
          status: "Review step reached. Please review manually.", 
          log: "Reached final review step. Stopping." 
        });
        break;
      }

      const fields = detectAllFields();
      if (fields.length === 0) {
        sendMessage({ action: "progress", log: "No fields detected on this step." });
      } else {
        sendMessage({ action: "progress", log: `Found ${fields.length} fillable fields.` });
        
        const mappings = await mapFieldsToResume(fields, resumeData);
        sendMessage({ action: "progress", log: `AI mapped ${mappings.length} fields.` });
        
        if (mappings.length > 0) {
          const result = await fillAllFields(mappings);
          sendMessage({ action: "progress", log: `Filled ${result.filled}, Failed ${result.failed}` });
        }
      }

      await sleep(1500);

      const navigated = await goToNextStep();
      if (!navigated) {
        sendMessage({ action: "progress", log: "Could not auto-navigate. Please click Continue manually." });
        break;
      }
      
      await sleep(2000);
    }
  } catch (error) {
    sendMessage({ action: "progress", log: `Error: ${error.message}`, error: true });
  } finally {
    isRunning = false;
    sendMessage({ action: "progress", done: true });
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startAutofill") {
    runAutofillFlow();
    sendResponse({ success: true });
  } else if (request.action === "stopAutofill") {
    isRunning = false;
    sendResponse({ success: true });
  } else if (request.action === "ping") {
    sendResponse({ alive: true });
  }
  return true;
});
