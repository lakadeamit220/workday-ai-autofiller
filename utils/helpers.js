export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export async function retry(fn, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === maxRetries - 1) throw e;
      await sleep(delay);
      delay *= 2;
    }
  }
}

export function fillReactInput(element, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  nativeSetter.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function fillReactTextarea(element, value) {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype, 'value'
  ).set;
  nativeSetter.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function simulateClick(element) {
  ['mousedown', 'mouseup', 'click'].forEach(eventType => {
    element.dispatchEvent(new MouseEvent(eventType, { bubbles: true, cancelable: true, view: window }));
  });
}

export async function simulateTyping(element, text, delayMs = 50) {
  element.focus();
  let currentValue = '';
  for (const char of text) {
    currentValue += char;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      element.tagName.toLowerCase() === 'textarea' 
        ? window.HTMLTextAreaElement.prototype 
        : window.HTMLInputElement.prototype, 
      'value'
    ).set;
    nativeSetter.call(element, currentValue);
    element.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(delayMs);
  }
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function waitForElement(selector, timeout = 10000, root = document) {
  return new Promise((resolve, reject) => {
    const el = root.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const el = root.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout waiting for element: ${selector}`));
    }, timeout);
  });
}

export function findElementByText(text, tag = '*', root = document) {
  const elements = Array.from(root.querySelectorAll(tag));
  const lowerText = text.toLowerCase();
  return elements.find(el => el.textContent.trim().toLowerCase().includes(lowerText)) || null;
}

export function isElementVisible(element) {
  if (!element || element.offsetParent === null) return false;
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  return true;
}

export function getClosestLabel(element) {
  let labelText = '';
  
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) labelText = label.textContent;
  }
  
  if (!labelText) {
    labelText = element.getAttribute('aria-label') || '';
  }
  
  if (!labelText) {
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelEl = document.getElementById(labelledBy);
      if (labelEl) labelText = labelEl.textContent;
    }
  }
  
  if (!labelText) {
    const parentLabel = element.closest('label');
    if (parentLabel) labelText = parentLabel.textContent;
  }
  
  if (!labelText) {
    labelText = element.placeholder || '';
  }

  // Workday specific hacks
  if (!labelText) {
    const labelParent = element.closest('[data-automation-id="formField"]');
    if (labelParent) {
      const labelEl = labelParent.querySelector('label');
      if (labelEl) labelText = labelEl.textContent;
    }
  }

  return labelText.replace(/\*/g, '').trim();
}

export function fuzzyMatch(str1, str2) {
  const s1 = (str1 || '').toLowerCase();
  const s2 = (str2 || '').toLowerCase();
  if (s1 === s2) return 1;
  if (s1.includes(s2) || s2.includes(s1)) return 0.8;
  
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  const intersection = words1.filter(w => words2.includes(w));
  const union = new Set([...words1, ...words2]);
  
  if (union.size === 0) return 0;
  return intersection.length / union.size;
}

export function normalizeDate(dateStr, targetFormat = 'MM/DD/YYYY') {
  if (!dateStr) return '';
  
  const match = dateStr.match(/(?:(?:19|20)\d\d|\d{1,2})[-\/]\d{1,2}(?:[-\/](?:19|20)\d\d)?/);
  if (!match) return dateStr;
  
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;

  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const yyyy = d.getFullYear();

  if (targetFormat === 'MM/DD/YYYY') return `${mm}/${dd}/${yyyy}`;
  if (targetFormat === 'YYYY-MM-DD') return `${yyyy}-${mm}-${dd}`;
  
  return dateStr;
}
