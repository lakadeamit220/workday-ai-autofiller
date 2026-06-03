import { simulateClick, findElementByText } from '../utils/helpers';
import { waitForFormReady } from './observer';

export function getCurrentStep() {
  let name = "Unknown Section";
  let number = 0;
  let total = 0;

  const headerEl = document.querySelector('h2');
  if (headerEl) {
    name = headerEl.textContent.trim();
  }

  const pageText = document.body.textContent;
  const stepMatch = pageText.match(/Step\s+(\d+)\s+of\s+(\d+)/i);
  if (stepMatch) {
    number = parseInt(stepMatch[1]);
    total = parseInt(stepMatch[2]);
  }

  return { name, number, total };
}

export async function goToNextStep() {
  const nextButtons = [
    document.querySelector('[data-automation-id="bottom-navigation-next-button"]'),
    findElementByText("Save and Continue", "button"),
    findElementByText("Continue", "button"),
    findElementByText("Next", "button")
  ].filter(Boolean);

  if (nextButtons.length > 0) {
    const btn = nextButtons[0];
    simulateClick(btn);
    try {
      await waitForFormReady(10000);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  return false;
}

export function isReviewStep() {
  const isReviewHeader = !!findElementByText("Review", "h2");
  const isSubmitBtn = !!findElementByText("Submit", "button");
  return isReviewHeader || isSubmitBtn;
}
