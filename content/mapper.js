export function mapFieldsToResume(fields, resumeData) {
  return new Promise((resolve) => {
    const serializedFields = fields.map(f => ({
      index: f.index,
      label: f.label,
      type: f.type,
      placeholder: f.placeholder,
      options: f.options,
      sectionName: f.sectionName
    }));

    chrome.runtime.sendMessage(
      { action: "mapFields", fields: serializedFields, resumeData },
      (response) => {
        if (!response || !response.success) {
          console.error("AI mapping failed:", response?.error);
          resolve([]);
          return;
        }

        const mappings = response.mappings.map(m => {
          const field = fields.find(f => f.index === m.fieldIndex);
          return {
            ...m,
            element: field ? field.element : null,
            label: field ? field.label : '',
            type: field ? field.type : ''
          };
        }).filter(m => m.element);

        resolve(mappings);
      }
    );
  });
}
