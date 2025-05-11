import React, { useState } from 'react';
import { uploadDocument } from '../services/api';
import { Document } from '../types';

interface DocumentUploaderProps {
  onUploadSuccess: (document: Document) => void;
}

const DocumentUploader: React.FC<DocumentUploaderProps> = ({ onUploadSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const document = await uploadDocument(file);
      onUploadSuccess(document);
    } catch (err) {
      setError('Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded">
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
          disabled={isLoading}
        />
        <label
          htmlFor="file-upload"
          className={`px-4 py-2 bg-blue-500 text-white rounded cursor-pointer ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {isLoading ? 'Uploading...' : 'Upload Document'}
        </label>
        {error && <p className="text-red-500">{error}</p>}
      </div>
    </div>
  );
};

export default DocumentUploader; 