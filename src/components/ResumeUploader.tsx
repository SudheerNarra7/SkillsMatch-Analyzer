import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface ResumeUploaderProps {
  onUpload: (text: string) => void;
  disabled?: boolean;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onUpload, disabled }) => {
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onUpload(text);
    };
    reader.readAsText(file);
  }, [onUpload]);

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-semibold text-gray-800">Resume Upload</h2>
      </div>
      
      <label 
        className={`
          flex flex-col items-center justify-center w-full h-32 
          border-2 border-dashed rounded-lg cursor-pointer 
          transition-colors
          ${disabled 
            ? 'border-gray-300 bg-gray-50' 
            : 'border-indigo-300 hover:bg-indigo-50'
          }
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <Upload className={`w-8 h-8 mb-2 ${disabled ? 'text-gray-400' : 'text-indigo-500'}`} />
          <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-600'}`}>
            {disabled 
              ? 'Please analyze job description first'
              : 'Upload your resume (TXT format)'}
          </p>
        </div>
        <input
          type="file"
          className="hidden"
          accept=".txt"
          onChange={handleFileUpload}
          disabled={disabled}
        />
      </label>
    </div>
  );
};