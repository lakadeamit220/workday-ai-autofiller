import React, { useState } from 'react';

export default function ResumePreview({ resumeData, onClear }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!resumeData) {
    return (
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <h2 className="text-sm font-semibold mb-2 text-slate-300">Resume Data</h2>
  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col min-h-[150px]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-slate-800">Resume Data</h2>
        {resumeData && (
          <button 
            onClick={onClear}
            className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Clear Data
          </button>
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
