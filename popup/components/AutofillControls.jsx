import React from 'react';

export default function AutofillControls({ isRunning, progress, logs, onStart }) {
  const { step, total, status } = progress;
  const progressPercent = total > 0 ? (step / total) * 100 : 0;

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-slate-300">Autofill Controls</h2>

      <button 
        onClick={onStart}
        disabled={isRunning}
        className={`w-full py-2.5 rounded font-medium transition-colors ${
          isRunning 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
        }`}
      >
        {isRunning ? 'Autofill in Progress...' : 'Start Autofill on Workday'}
      </button>

      {/* Progress Section */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{status || 'Ready'}</span>
          {total > 0 && <span>Step {step} of {total}</span>}
        </div>
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Logs Window */}
      <div className="mt-2 bg-slate-900 border border-slate-700 rounded p-2 h-32 overflow-y-auto custom-scrollbar flex flex-col gap-1">
        {logs.length === 0 ? (
          <span className="text-xs text-slate-600 italic">Waiting to start...</span>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="text-xs font-mono text-slate-400 break-words">
              <span className="text-slate-600 mr-2">{'>'}</span>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
