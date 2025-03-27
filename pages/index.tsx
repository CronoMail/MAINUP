import React from 'react';
import UploadForm from '../components/UploadForm';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Welcome to MAINUP
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            A platform for managing and uploading artwork
          </p>
        </div>
        
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-center mb-6">Upload New Work</h2>
          <UploadForm />
        </div>
      </div>
    </div>
  );
}