import React, { useState } from 'react';
import { extractText } from '../../utils/resumeParser';

export default function ResumeUpload({ apiKey, onParsed }) {
  const [status, setStatus] = useState('idle'); // idle, extracting, parsing, done, error
  const [fileName, setFileName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!apiKey) {
      setErrorMsg('Please save your OpenAI API key first.');
      return;
    }

    setFileName(file.name);
    setStatus('extracting');
    setErrorMsg('');

    try {
      const rawText = await extractText(file);
      setStatus('parsing');
      
      chrome.runtime.sendMessage({ action: "parseResume", text: rawText }, (response) => {
        if (chrome.runtime.lastError) {
          setErrorMsg('Background script not responding. Ensure extension is reloaded.');
          setStatus('error');
          return;
        }

        if (response && response.success) {
          setStatus('done');
          onParsed(response.data);
        } else {
          setErrorMsg(response?.error || 'Failed to parse resume with AI.');
          setStatus('error');
        }
      });
      
    } catch (err) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
      <h2 className="text-sm font-semibold mb-2 text-slate-300">Upload Resume</h2>
      
      <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center hover:bg-slate-750 transition-colors relative">
        <input 
          type="file" 
          accept=".pdf,.docx" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {status === 'idle' && (
          <span className="text-sm text-slate-400">Click or drag PDF/DOCX here</span>
        )}
        
        {status === 'extracting' && (
          <span className="text-sm text-blue-400">Extracting text from {fileName}...</span>
        )}

        {status === 'parsing' && (
          <span className="text-sm text-purple-400">AI is parsing your resume...</span>
        )}

        {status === 'done' && (
          <span className="text-sm text-green-400">✓ {fileName} parsed successfully!</span>
        )}

        {status === 'error' && (
          <div className="text-sm text-red-400">
            Error processing {fileName}. <br/>
            <span className="text-xs">{errorMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
}
