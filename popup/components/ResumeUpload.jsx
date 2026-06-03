import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractText } from '../../utils/resumeParser';

export default function ResumeUpload({ apiKey, onParsed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!apiKey) {
      setError('Please save your API key first.');
      return;
    }
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const rawText = await extractText(file);

      chrome.runtime.sendMessage({ action: "parseResume", text: rawText }, (response) => {
        setLoading(false);
        if (chrome.runtime.lastError || !response || !response.success) {
          setError(response?.error || 'Failed to parse resume with AI.');
          return;
        }
        onParsed(response.data);
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error reading file.');
      setLoading(false);
    }
  }, [apiKey, onParsed]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxFiles: 1
  });

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
      <h2 className="text-sm font-semibold mb-3 text-slate-800">Upload Resume</h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <input {...getInputProps()} />
        {loading ? (
          <div className="text-blue-600 text-sm font-medium animate-pulse">
            Parsing with AI... this may take 10-20 seconds.
          </div>
        ) : isDragActive ? (
          <p className="text-blue-600 text-sm font-medium">Drop it here!</p>
        ) : (
          <p className="text-slate-500 text-sm">
            Click or drag <span className="font-semibold text-slate-700">PDF/DOCX</span> here
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-xs mt-2 font-medium">{error}</p>}
    </div>
  );
}
