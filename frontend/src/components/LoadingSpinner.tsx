import React from 'react';

export const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-48">
    <div className="h-8 w-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
  </div>
);
