import React, { useState, useEffect } from 'react';

export default function ApiKeyInput({ apiKey, setApiKey, provider, setProvider }) {
  const [inputVal, setInputVal] = useState(apiKey || '');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (apiKey) setInputVal(apiKey);
  }, [apiKey]);

  const handleSave = () => {
    chrome.storage.local.set({ openaiApiKey: inputVal, aiProvider: provider }, () => {
      setApiKey(inputVal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const getHelpText = () => {
    if (provider === 'gemini') return <p className="text-xs text-slate-500 mt-2">Get a <b>free</b> Gemini key at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">aistudio.google.com</a></p>;
    if (provider === 'groq') return <p className="text-xs text-slate-500 mt-2">Get a <b>free</b> Groq key at <a href="https://console.groq.com/keys" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">console.groq.com</a></p>;
    return <p className="text-xs text-slate-500 mt-2">Requires a paid OpenAI account.</p>;
  };

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <h2 className="text-sm font-semibold mb-3 text-slate-800">AI Setup</h2>
      
      <div className="flex flex-col gap-2">
        <select 
          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-shadow"
          value={provider}
          onChange={(e) => {
            setProvider(e.target.value);
            setSaved(false);
          }}
        >
          <option value="gemini">Google Gemini (Free Tier)</option>
          <option value="groq">Groq (Free Tier, Lightning Fast)</option>
          <option value="openai">OpenAI (Paid)</option>
        </select>

        <div className="flex gap-2">
          <input 
            type="password" 
            placeholder="Paste your API key here..." 
            className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-shadow"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 shadow-sm"
          >
            {saved ? 'Saved ✓' : 'Save'}
          </button>
        </div>
      </div>
      {getHelpText()}
    </div>
  );
}
