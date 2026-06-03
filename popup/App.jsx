import React, { useState, useEffect } from 'react';
import ApiKeyInput from './components/ApiKeyInput';
import ResumeUpload from './components/ResumeUpload';
import ResumePreview from './components/ResumePreview';
import AutofillControls from './components/AutofillControls';

function App() {
  const [apiKey, setApiKey] = useState('');
  const [resumeData, setResumeData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState({ step: 0, total: 0, status: '' });
  const [logs, setLogs] = useState([]);

  // Load saved data on mount
  useEffect(() => {
    chrome.storage.local.get(['openaiApiKey', 'resumeData'], (result) => {
      if (result.openaiApiKey) setApiKey(result.openaiApiKey);
      if (result.resumeData) setResumeData(result.resumeData);
    });

    // Listen for progress messages from content script
    const messageListener = (msg) => {
      if (msg.action === 'progress') {
        if (msg.step !== undefined) setProgress(prev => ({ ...prev, step: msg.step, total: msg.total, status: msg.status }));
        if (msg.log) setLogs(prev => [...prev, msg.log]);
        if (msg.done || msg.error) setIsRunning(false);
      }
    };
    chrome.runtime.onMessage.addListener(messageListener);
    return () => chrome.runtime.onMessage.removeListener(messageListener);
  }, []);

  const handleClearResume = () => {
    chrome.storage.local.remove(['resumeData'], () => {
      setResumeData(null);
    });
  };

  const handleStartAutofill = () => {
    if (!resumeData) {
      setLogs(prev => [...prev, "Error: Please upload a resume first."]);
      return;
    }
    
    setIsRunning(true);
    setLogs(prev => [...prev, "Initiating autofill..."]);
    setProgress({ step: 0, total: 0, status: 'Connecting to Workday tab...' });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab || !activeTab.url.includes('myworkdayjobs.com')) {
        setLogs(prev => [...prev, "Error: You are not on a Workday job application page."]);
        setIsRunning(false);
        setProgress(prev => ({ ...prev, status: 'Error' }));
        return;
      }

      chrome.tabs.sendMessage(activeTab.id, { action: "startAutofill" }, (response) => {
        if (chrome.runtime.lastError) {
          setLogs(prev => [...prev, "Error: Could not connect to page. Try reloading the tab."]);
          setIsRunning(false);
        }
      });
    });
  };

  return (
    <div className="flex flex-col h-full text-slate-200">
      <header className="p-4 border-b border-slate-700 bg-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold">🚀</div>
        <h1 className="text-lg font-bold">Workday AI Autofiller</h1>
      </header>
      
      <main className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
        <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />
        
        <ResumeUpload 
          apiKey={apiKey} 
          onParsed={(data) => {
            setResumeData(data);
            chrome.storage.local.set({ resumeData: data });
          }} 
        />
        
        <ResumePreview 
          resumeData={resumeData} 
          onClear={handleClearResume} 
        />
        
        <AutofillControls 
          isRunning={isRunning} 
          progress={progress} 
          logs={logs}
          onStart={handleStartAutofill} 
        />
      </main>
    </div>
  );
}

export default App;
