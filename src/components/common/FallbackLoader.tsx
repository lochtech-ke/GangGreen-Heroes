/**
 * Fallback Loader Component
 * 
 * Simple CSS-based loading spinner displayed when WebGL is not available
 * or Pixi.js fails to initialize.
 */

import React from 'react';

export const FallbackLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      {/* Spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-transparent border-t-green-600 rounded-full animate-spin"></div>
      </div>

      {/* Brand text */}
      <p className="mt-6 text-2xl font-bold text-green-700">#GangGreen</p>
      
      {/* Loading text */}
      <p className="mt-2 text-sm text-gray-600">Loading...</p>
    </div>
  );
};
