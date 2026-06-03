import React from 'react';

export default function ResumePreview({ resumeData, onClear }) {
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
        )}
      </div>

      {resumeData ? (
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-3 overflow-y-auto max-h-[200px] custom-scrollbar">
          <pre className="text-[10px] text-slate-600 whitespace-pre-wrap font-mono">
            {JSON.stringify(resumeData, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center border border-dashed border-slate-200 rounded-lg bg-slate-50">
          <p className="text-xs text-slate-400">No resume parsed yet.</p>
        </div>
      )}
    </div>
  );
}
