'use client';

import { useState, useEffect } from 'react';

export default function FastModeToggle({ onChange }) {
  const [isFastMode, setIsFastMode] = useState(false);

  // Load saved mode preference from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('fastMode');
    if (savedMode !== null) {
      const parsedMode = savedMode === 'true';
      setIsFastMode(parsedMode);
      // Notify parent of initial state
      if (onChange) onChange(parsedMode);
    }
  }, [onChange]);

  const toggleFastMode = () => {
    const newMode = !isFastMode;
    setIsFastMode(newMode);
    localStorage.setItem('fastMode', newMode.toString());
    if (onChange) onChange(newMode);
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-600 whitespace-nowrap">Fast Mode</span>
      <button
        onClick={toggleFastMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          isFastMode ? 'bg-purple-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isFastMode}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isFastMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      <span className="text-xs text-gray-500">{isFastMode ? 'On' : 'Off'}</span>
      <div className="hidden sm:block">
        <span className="text-xs text-gray-400 italic ml-1">
          {isFastMode ? '(Faster, lower quality)' : '(Higher quality, slower)'}
        </span>
      </div>
    </div>
  );
} 