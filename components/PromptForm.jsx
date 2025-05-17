'use client';

import { useState } from 'react';

export default function PromptForm({ onSubmit, isLoading }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      alert('Please enter a prompt');
      return;
    }
    
    onSubmit({ prompt });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Describe your design:
        </label>
        <textarea
          id="prompt"
          rows="4"
          className="w-full px-4 py-3 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="E.g., 'A modern signup form with social login buttons'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-transform hover:scale-105"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              <span>Generating...</span>
            </div>
          ) : (
            'Generate Designs'
          )}
        </button>
      </div>
    </form>
  );
}