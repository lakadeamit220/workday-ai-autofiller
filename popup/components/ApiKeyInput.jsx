import React, { useState, useEffect } from 'react';

export default function ApiKeyInput({ apiKey, setApiKey }) {
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (apiKey) setInputVal(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    chrome.storage.local.set({ openaiApiKey: inputVal }, () => {
      setApiKey(inputVal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <h2 className="text-sm font-semibold mb-2 text-slate-300">OpenAI API Key</h2>
      <div className="flex gap-2">
        <input 
          type="password" 
          placeholder="sk-..." 
          className="flex-1 bg-slate-900 border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
        />
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>
      <p className="text-xs text-slate-500 mt-2">Stored locally. Required for AI parsing and mapping.</p>
    </div>
  );
}
