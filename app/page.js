'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PromptForm from '@/components/PromptForm';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateDesign = async (data) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate designs using only text prompts with Cerebras
      const response = await fetch('/api/generate-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: data.prompt,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate designs');
      }
      
      const designData = await response.json();
      
      // Store designs in localStorage for persistence
      localStorage.setItem('generatedDesigns', JSON.stringify(designData.designs));
      
      // Redirect to the preview page with the first design
      router.push(`/preview/${designData.designs[0].id}`);
    } catch (err) {
      console.error('Error generating designs:', err);
      setError(err.message || 'Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDesigns = () => {
    if (window.confirm('Are you sure you want to clear all saved designs?')) {
      localStorage.removeItem('generatedDesigns');
      window.alert('All designs have been cleared.');
    }
  };

  // Example prompts for users to try
  const examplePrompts = [
    { text: "Hero section with CTA", bgColor: "bg-purple-50", textColor: "text-purple-700" },
    { text: "Pricing table", bgColor: "bg-pink-50", textColor: "text-pink-700" },
    { text: "Contact form", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { text: "Product gallery", bgColor: "bg-green-50", textColor: "text-green-700" },
    { text: "Testimonial carousel", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
    { text: "Newsletter subscribe", bgColor: "bg-indigo-50", textColor: "text-indigo-700" }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Decorative Floating Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-pink-600/20 to-yellow-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      
      <div className="max-w-5xl mx-auto px-6 py-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text leading-tight">
            Interactive Web Design Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe what you want, and our AI will generate beautiful web components for you
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100">
          <PromptForm onSubmit={handleGenerateDesign} isLoading={isLoading} 
            customClasses={{
              label: "block text-lg font-medium text-gray-700 mb-3",
              input: "w-full p-4 text-gray-700 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition",
              button: "w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition duration-200"
            }}
          />
          
          {/* Example Prompts */}
          <div className="mt-6 mb-4">
            <p className="text-sm font-medium text-gray-500 mb-3">Or try one of these examples:</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    // Find the PromptForm's input and set its value
                    const inputElement = document.querySelector('textarea[name="prompt"]');
                    if (inputElement) inputElement.value = prompt.text;
                  }}
                  className={`px-3 py-2 ${prompt.bgColor} ${prompt.textColor} text-sm rounded-full hover:shadow-md transform hover:-translate-y-1 transition-all duration-200`}
                >
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Step 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm mr-3">1</div>
              <h3 className="font-semibold text-gray-800">Describe</h3>
            </div>
            <p className="text-gray-600 mb-4">Enter a detailed description of the web component you want to create</p>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
          
          {/* Step 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm mr-3">2</div>
              <h3 className="font-semibold text-gray-800">Explore</h3>
            </div>
            <p className="text-gray-600 mb-4">Swipe through multiple AI-generated design options</p>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
          
          {/* Step 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm mr-3">3</div>
              <h3 className="font-semibold text-gray-800">Refine</h3>
            </div>
            <p className="text-gray-600 mb-4">Click any element to refine it with additional prompts</p>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          
          {/* Step 4 */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 transform hover:-translate-y-2 transition duration-300">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm mr-3">4</div>
              <h3 className="font-semibold text-gray-800">Export</h3>
            </div>
            <p className="text-gray-600 mb-4">Get the HTML code for your perfect design</p>
            <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-100 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-1/2">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-100 rounded-lg opacity-60"></div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-pink-100 rounded-lg opacity-60"></div>
              <div className="relative bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden p-4">
                <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">Generate Beautiful Web Components in Minutes</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Intelligent AI Design</h3>
                  <p className="text-gray-600">Powered by Cerebras for high-quality, responsive components</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Interactive Refinement</h3>
                  <p className="text-gray-600">Click on any element to refine it with natural language</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full p-1 bg-green-100 text-green-600 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Ready-to-Use Code</h3>
                  <p className="text-gray-600">Export clean HTML that works in any modern website</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="space-y-3 mb-6">
            <p className="font-medium text-gray-700">Generate beautiful web components with AI</p>
            <p className="text-gray-500">Swipe through designs, remix your favorites, and export the code</p>
            <p className="text-sm text-gray-400 italic">Powered by Cerebras</p>
          </div>
          
          <button
            onClick={handleClearDesigns}
            className="text-sm text-gray-500 hover:text-gray-700 underline transition"
          >
            Clear all saved designs
          </button>
        </div>
      </div>
    </main>
  );
}