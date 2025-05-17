'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@/components/Icons';
import RemixModal from './RemixModal';
import TailwindClassFixer from './TailwindClassFixer';

export default function SwipeableDesign({ designs, activeDesignId, onRemix }) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [swipeComplete, setSwipeComplete] = useState(false);
  const [designHistory, setDesignHistory] = useState([]);
  const [currentDesigns, setCurrentDesigns] = useState([]);
  const [isRemixModalOpen, setIsRemixModalOpen] = useState(false);
  const [isRemixLoading, setIsRemixLoading] = useState(false);
  const swipeRef = useRef(null);
  
  // Add memoized version of the active design right with the other hooks
  const activeDesign = useMemo(() => {
    return currentDesigns[activeIndex] || null;
  }, [currentDesigns, activeIndex]);
  
  // Initialize designs on first render
  useEffect(() => {
    if (designs && designs.length > 0) {
      // Only update currentDesigns if they've actually changed
      if (!currentDesigns.length || 
          JSON.stringify(designs) !== JSON.stringify(currentDesigns)) {
        setCurrentDesigns(designs);
      }
      
      // Find index of the active design
      const index = designs.findIndex(d => d.id === activeDesignId);
      if (index >= 0 && index !== activeIndex) {
        setActiveIndex(index);
      } else if (index < 0 && activeIndex !== 0) {
        setActiveIndex(0);
      }
    }
  }, [designs, activeDesignId, activeIndex, currentDesigns]);

  const handleSwipe = (direction) => {
    if (swipeComplete) return;
    
    setSwipeDirection(direction);
    setSwipeComplete(true);
    
    // Wait for animation to complete
    setTimeout(() => {
      if (direction === 'right') {
        handleNext();
      } else if (direction === 'left') {
        handlePrevious();
      }
      setSwipeDirection(null);
      setSwipeComplete(false);
    }, 300);
  };

  const handlePrevious = () => {
    if (activeIndex > 0) {
      const newIndex = activeIndex - 1;
      setActiveIndex(newIndex);
      router.push(`/preview/${currentDesigns[newIndex].id}`);
    }
  };

  const handleNext = () => {
    if (activeIndex < currentDesigns.length - 1) {
      const newIndex = activeIndex + 1;
      setActiveIndex(newIndex);
      router.push(`/preview/${currentDesigns[newIndex].id}`);
    }
  };

  const openRemixModal = () => {
    setIsRemixModalOpen(true);
  };

  const closeRemixModal = () => {
    setIsRemixModalOpen(false);
  };

  const handleRemixSubmit = async (changeRequest) => {
    setIsRemixLoading(true);
    
    try {
      // Save current designs to history before creating new ones
      setDesignHistory([...designHistory, [...currentDesigns]]);
      
      // Pass both the original design and the change request
      await onRemix(activeDesign, changeRequest);
      
      // Close the modal after successful submission
      closeRemixModal();
    } catch (error) {
      console.error("Error submitting remix:", error);
      alert("Failed to remix design. Please try again.");
    } finally {
      setIsRemixLoading(false);
    }
  };

  const handleGoBack = () => {
    if (designHistory.length > 0) {
      const previousDesigns = designHistory[designHistory.length - 1];
      setCurrentDesigns(previousDesigns);
      setActiveIndex(0);
      router.push(`/preview/${previousDesigns[0].id}`);
      
      // Remove the last entry from history
      setDesignHistory(designHistory.slice(0, -1));
    }
  };

  if (!currentDesigns || currentDesigns.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading designs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">Design Preview</h1>
            
            <div className="flex space-x-2">
              <button
                onClick={() => router.push('/')}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                New Design
              </button>
              
              <button
                onClick={() => {
                  // Copy HTML to clipboard
                  navigator.clipboard.writeText(activeDesign.html);
                  alert('HTML copied to clipboard!');
                }}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Copy HTML
              </button>
            </div>
          </div>
          
          {/* Design navigation */}
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleGoBack}
                disabled={designHistory.length === 0}
                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Go back to previous designs"
              >
                <ArrowPathIcon className="w-5 h-5 text-gray-600" />
              </button>
              
              <div className="text-sm text-gray-500">
                Design {activeIndex + 1} of {currentDesigns.length}
              </div>
            </div>
            
            <button
              onClick={openRemixModal}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:opacity-90"
            >
              Remix This Design
            </button>
          </div>
        </div>
      </header>

      {/* Design card with swipe functionality */}
      <div className="flex-1 container mx-auto p-4 flex items-center justify-center">
        <div className="relative w-full max-w-2xl mx-auto">
          {/* Swipe controls for larger screens */}
          <div className="absolute inset-y-0 left-0 z-10 flex items-center">
            <button
              onClick={() => handleSwipe('left')}
              disabled={activeIndex === 0}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-0"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="absolute inset-y-0 right-0 z-10 flex items-center">
            <button
              onClick={() => handleSwipe('right')}
              disabled={activeIndex === currentDesigns.length - 1}
              className="p-2 rounded-full bg-white shadow-md hover:bg-gray-100 disabled:opacity-0"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          {/* Design card */}
          <div 
            ref={swipeRef}
            className={`bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 ${
              swipeDirection === 'left' ? '-translate-x-full opacity-0' : 
              swipeDirection === 'right' ? 'translate-x-full opacity-0' : ''
            }`}
          >
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm text-gray-500">
                {activeDesign?.prompt || "No design selected"}
              </div>
              
              {activeDesign?.changeRequest && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs font-medium text-purple-600">Changes requested:</span>
                  <p className="text-xs text-gray-600 mt-1">{activeDesign.changeRequest}</p>
                </div>
              )}
              
              {activeDesign?.parentId && (
                <div className="mt-2 flex items-center">
                  <span className="text-xs text-gray-400">
                    Variant {activeDesign.variant || ''} based on design {activeDesign.parentId}
                  </span>
                </div>
              )}
            </div>
            
            <div className="p-6 design-container min-h-[400px] max-h-[70vh] overflow-auto">
              {/* Only render the active design to save resources */}
              {activeDesign && (
                <div
                  className="design-preview"
                  dangerouslySetInnerHTML={{ __html: activeDesign.html }}
                  key={`design-${activeDesign.id}`}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile swipe indicators */}
      <div className="container mx-auto px-4 py-4 flex justify-center">
        <div className="flex space-x-2">
          {currentDesigns.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === activeIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Remix Modal */}
      <RemixModal 
        isOpen={isRemixModalOpen}
        onClose={closeRemixModal}
        onSubmit={handleRemixSubmit}
        isLoading={isRemixLoading}
      />

      {/* Client-side fixer for Tailwind classes */}
      <TailwindClassFixer />
    </div>
  );
} 