import React, { useState } from 'react';

export default function ResumePreview({ resumeData, onClear }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!resumeData) {
    return (
      <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
        <h2 className="text-sm font-semibold mb-2 text-slate-300">Resume Data</h2>
        <p className="text-sm text-slate-500">No resume parsed yet.</p>
      </div>
    );
  }

  const { personalInfo } = resumeData;
  const name = personalInfo ? `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() : 'Candidate';

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-semibold text-slate-300">Resume Data</h2>
        <button 
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-700 rounded p-3">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-slate-300">{name}</span>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            {isOpen ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        {isOpen && (
          <div className="mt-3 pt-3 border-t border-slate-700 max-h-48 overflow-y-auto custom-scrollbar">
            <pre className="text-xs text-slate-400 whitespace-pre-wrap font-mono">
              {JSON.stringify(resumeData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
