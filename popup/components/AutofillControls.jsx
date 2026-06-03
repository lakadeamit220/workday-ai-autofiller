import React, { useEffect, useRef } from 'react';

export default function AutofillControls({ isRunning, progress, logs, onStart }) {
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col">
      <h2 className="text-sm font-semibold mb-3 text-slate-800">Autofill Controls</h2>
      
      <button 
        onClick={onStart}
        disabled={isRunning}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all shadow-sm ${
          isRunning 
            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
            : 'bg-[#10b981] hover:bg-[#059669] text-white active:scale-[0.98]'
        }`}
      >
        {isRunning ? 'Autofill in Progress...' : 'Start Autofill on Workday'}
      </button>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1 font-medium text-slate-700">
          <span>{progress.status || 'Ready'}</span>
          {progress.total > 0 && <span>Step {progress.step} of {progress.total}</span>}
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progress.total > 0 ? (progress.step / progress.total) * 100 : 0}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4 bg-slate-900 border border-slate-800 rounded-lg p-3 h-32 overflow-y-auto custom-scrollbar font-mono shadow-inner">
        {logs.length === 0 ? (
          <p className="text-[10px] text-slate-500">Waiting to start...</p>
        ) : (
          logs.map((log, i) => (
            <p key={i} className={`text-[10px] mb-1 ${log.includes('Error') ? 'text-red-400' : log.includes('AI mapped') ? 'text-blue-300' : 'text-emerald-300'}`}>
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
            </p>
          ))
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}
