import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-700 text-lg font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay; 