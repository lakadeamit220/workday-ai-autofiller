import { 
  fillReactInput, fillReactTextarea, simulateClick, simulateTyping, 
  fuzzyMatch, normalizeDate, sleep 
} from '../utils/helpers';

export async function fillField(fieldInfo, value) {
  if (!value) return false;
  const { element, type, currentValue, label } = fieldInfo;
  
  if (currentValue && currentValue.length > 2 && currentValue !== value) {
    // Optionally skip if already filled
  }

  try {
    if (type === 'text' || type === 'email' || type === 'tel' || type === 'textarea') {
      if (type === 'textarea') fillReactTextarea(element, value);
      else fillReactInput(element, value);
      
      await sleep(100);
      if (element.value !== value) {
        await simulateTyping(element, value);
      }
      return true;
    }

    if (type === 'date') {
      const format = fieldInfo.placeholder || 'MM/DD/YYYY';
      const formattedDate = normalizeDate(value, format.includes('YYYY-MM-DD') ? 'YYYY-MM-DD' : 'MM/DD/YYYY');
      fillReactInput(element, formattedDate);
      document.body.click();
      return true;
    }

    if (type === 'select' || type === 'combobox' || type === 'listbox') {
      simulateClick(element);
      await sleep(300);
      
      const options = Array.from(document.querySelectorAll('[role="option"], li'));
      const visibleOptions = options.filter(o => o.offsetParent !== null);
      
      let bestMatch = null;
      let bestScore = 0;
      
      for (const opt of visibleOptions) {
        const text = opt.textContent.trim();
        const score = fuzzyMatch(value, text);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = opt;
        }
      }
      
      if (bestMatch && bestScore > 0.4) {
        simulateClick(bestMatch);
        await sleep(200);
        return true;
      }
      
      document.body.click();
      return false;
    }

    if (type === 'radio') {
      if (value.toLowerCase() === 'true' || value.toLowerCase() === 'yes') {
         if (!element.checked) simulateClick(element);
      }
      return true;
    }

    if (type === 'checkbox') {
      const shouldBeChecked = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
      if (element.checked !== shouldBeChecked) {
        simulateClick(element);
      }
      return true;
    }

  } catch (e) {
    console.error(`Failed to fill ${label}:`, e);
    return false;
  }
  
  return false;
}

export async function fillAllFields(mappings) {
  let filled = 0;
  let skipped = 0;
  let failed = 0;
  
  const validMappings = mappings.filter(m => m.confidence >= 0.3);
  
  for (const m of validMappings) {
    if (!m.element) continue;
    const success = await fillField(m, m.value);
    if (success) filled++;
    else failed++;
    await sleep(200);
  }
  
  return { filled, skipped, failed };
}
