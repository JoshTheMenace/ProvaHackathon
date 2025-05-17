'use client';

import { useState } from 'react';
import { XMarkIcon } from './Icons';

export default function RemixModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [changeRequest, setChangeRequest] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (changeRequest.trim()) {
      onSubmit(changeRequest);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        ></div>
        
        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div className="absolute top-0 right-0 p-2">
            <button 
              type="button"
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <XMarkIcon className="h-6 w-6 text-gray-400" />
            </button>
          </div>
          
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Remix This Design
                </h3>
                
                <div className="mb-3 p-3 bg-gray-50 rounded-md text-xs text-gray-600 border border-gray-100">
                  <strong>Note:</strong> Your changes will be applied to both the HTML code and visual appearance of this design. The AI will analyze the current design's structure and apply your requested modifications.
                </div>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="change-request" className="block text-sm font-medium text-gray-700 mb-2">
                      What changes would you like to see?
                    </label>
                    <textarea
                      id="change-request"
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="E.g., 'Use a dark theme', 'Add more colorful buttons', 'Make it more minimal'"
                      value={changeRequest}
                      onChange={(e) => setChangeRequest(e.target.value)}
                      required
                    ></textarea>
                  </div>
                  
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:opacity-90 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        'Generate Variations'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 