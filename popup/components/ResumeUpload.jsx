import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractText } from '../../utils/resumeParser';

export default function ResumeUpload({ apiKey, onParsed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!apiKey) {
      setError('Please save your OpenAI API key first.');
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
