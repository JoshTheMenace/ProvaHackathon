// app/preview/[designId]/page.js

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import SwipeableDesign from '@/components/SwipeableDesign';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const designId = params.designId;
  
  const [designs, setDesigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load designs from localStorage
    try {
      const storedDesigns = JSON.parse(localStorage.getItem('generatedDesigns') || '[]');
      setDesigns(storedDesigns);
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle design remix with specific change request
  const handleRemix = async (design, changeRequest) => {
    try {
      setIsLoading(true);
      
      // Log what we're doing for debugging
      console.log(`Remixing design with prompt: ${design.prompt}`);
      console.log(`User requested changes: ${changeRequest}`);
      
      // Generate new designs based on the selected one and user's change request
      const response = await fetch('/api/refine-design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalPrompt: design.prompt,
          prompt: changeRequest,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to remix design');
      }
      
      const { designs: newDesigns } = await response.json();
      
      // Add metadata to track design lineage 
      const enhancedDesigns = newDesigns.map((newDesign, index) => ({
        ...newDesign,
        parentId: design.id,
        changeRequest: changeRequest,
        variant: index + 1
      }));
      
      // Store all designs in localStorage
      const allDesigns = [...designs, ...enhancedDesigns];
      localStorage.setItem('generatedDesigns', JSON.stringify(allDesigns));
      
      // Navigate to the first new design
      router.push(`/preview/${enhancedDesigns[0].id}`);
    } catch (error) {
      console.error('Error remixing design:', error);
      alert(`Failed to remix design: ${error.message || 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designs...</p>
        </div>
      </div>
    );
  }

  // If no designs found, show message
  if (designs.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Designs Found</h2>
          <p className="text-gray-600 mb-6">
            It seems you dont have any designs yet or they have been cleared.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90"
          >
            Create New Design
          </button>
        </div>
      </div>
    );
  }

  return (
    <SwipeableDesign 
      designs={designs} 
      activeDesignId={designId} 
      onRemix={handleRemix}
    />
  );
}