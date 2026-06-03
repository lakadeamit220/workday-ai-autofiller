import { isElementVisible, getClosestLabel } from '../utils/helpers';

export function detectAllFields() {
  const fields = [];
  const rawElements = Array.from(document.querySelectorAll('input:not([type="hidden"]), textarea, select, [role="listbox"], [role="combobox"], [role="radio"], [role="checkbox"]'));
  
  const visibleElements = rawElements.filter(isElementVisible);
  let sectionName = "Unknown Section";
  const header = document.querySelector('h2');
  if (header) sectionName = header.textContent.trim();

  visibleElements.forEach((el, index) => {
    const label = getClosestLabel(el);
    if (!label) return;

    let type = el.tagName.toLowerCase();
    if (type === 'input') type = el.type || 'text';
    if (el.getAttribute('role')) type = el.getAttribute('role');
    
    if (type === 'text' && (el.placeholder.includes('YYYY') || label.toLowerCase().includes('date'))) {
      type = 'date';
    }

    const fieldInfo = {
      index,
      label,
      type,
      placeholder: el.placeholder || '',
      required: el.hasAttribute('required') || el.getAttribute('aria-required') === 'true',
      currentValue: el.value || '',
      options: [],
      dataAutomationId: el.getAttribute('data-automation-id') || '',
      element: el,
      sectionName
    };

    if (type === 'select') {
      fieldInfo.options = Array.from(el.options).map(o => o.text.trim()).filter(Boolean);
    }

    fields.push(fieldInfo);
  });

  return fields;
}

export async function extractDropdownOptions(triggerElement) {
  return [];
}
