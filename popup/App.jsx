import React from 'react';

function App() {
  return (
    <div className="flex flex-col h-full text-slate-200">
      <header className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">🚀</div>
        <h1 className="text-lg font-bold">Workday AI Autofiller</h1>
      </header>
      
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-sm font-semibold mb-2 text-slate-400">Settings (Phase 5)</h2>
          <div className="h-10 bg-slate-700 rounded animate-pulse"></div>
        </div>

        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-sm font-semibold mb-2 text-slate-400">Resume Upload (Phase 5)</h2>
          <div className="h-20 bg-slate-700 rounded animate-pulse flex items-center justify-center">
            <span className="text-sm text-slate-500">Drop area placeholder</span>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-sm font-semibold mb-2 text-slate-400">Resume Preview (Phase 5)</h2>
          <div className="h-16 bg-slate-700 rounded animate-pulse"></div>
        </div>

        <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
          <h2 className="text-sm font-semibold mb-2 text-slate-400">Autofill Controls (Phase 5)</h2>
          <div className="h-10 bg-slate-700 rounded animate-pulse"></div>
        </div>
      </main>
    </div>
  );
}

export default App;
