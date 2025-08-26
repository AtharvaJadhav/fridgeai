'use client';

import { useState } from 'react';
import Header from './components/header';
import UploadSection from './components/upload-section';
import ResultsSection from './components/results-section';
import EmptyState from './components/empty-state';
import { UploadState, AnalysisResult } from '@/lib/types';

export default function Home() {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    error: null,
    result: null,
  });

  const handleUpload = async (file: File) => {
    setUploadState({
      isUploading: true,
      error: null,
      result: null,
    });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const result: AnalysisResult = await response.json();

      setUploadState({
        isUploading: false,
        error: null,
        result,
      });
    } catch (error) {
      setUploadState({
        isUploading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
        result: null,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <UploadSection onUpload={handleUpload} uploadState={uploadState} />

          {uploadState.result && (
            <ResultsSection result={uploadState.result} />
          )}

          {!uploadState.isUploading && !uploadState.result && !uploadState.error && (
            <EmptyState />
          )}
        </div>
      </main>
    </div>
  );
}
