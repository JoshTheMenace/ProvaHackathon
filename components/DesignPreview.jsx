'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RefineModal from '@/components/RefineModal';

export default function DesignPreview({ params }) {
  const router = useRouter();
  const { designId } = params;
  
  const [designs, setDesigns] = useState([]);
  const [activeDesign, setActiveDesign] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [refineModalOpen, setRefineModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState(null);
  const [refining, setRefining] = useState(false);

  // Load designs from localStorage on component mount
  useEffect(() => {
    try {
      const storedDesigns = JSON.parse(localStorage.getItem('generatedDesigns') || '[]');
      if (storedDesigns.length > 0) {
        setDesigns(storedDesigns);
        const current = storedDesigns.find(d => d.id === designId) || storedDesigns[0];
        setActiveDesign(current);
      }
    } catch (error) {
      console.error('Error loading designs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [designId]);

  // Update URL when changing designs
  const handleDesignChange = (design) => {
    setActiveDesign(design);
    router.push(`/preview/${design.id}`);
  };

  // Set up event delegation for hovering over elements in the design
  const handleMouseOver = (e) => {
    // Ignore if we're already refining or modal is open
    if (refining || refineModalOpen) return;

    // Find the closest element that would make sense to refine
    // (div, button, form, etc.)
    const refinableElements = ['DIV', 'BUTTON', 'FORM', 'NAV', 'SECTION', 'HEADER', 'FOOTER', 'ARTICLE'];
    let target = e.target;
    
    // Traverse up to find a suitable parent element if needed
    while (target && target !== e.currentTarget) {
      if (refinableElements.includes(target.tagName)) {
        break;
      }
      target = target.parentElement;
    }
    
    if (target && target !== e.currentTarget) {
      setHoveredElement(target);
      
      // Add highlight to the hovered element
      target.classList.add('design-hover-highlight');
    }
  };

  const handleMouseOut = (e) => {
    if (hoveredElement) {
      hoveredElement.classList.remove('design-hover-highlight');
      setHoveredElement(null);
    }
  };

  const handleElementClick = (e) => {
    // Ignore if we're already refining or modal is open
    if (refining || refineModalOpen) return;
    
    if (hoveredElement) {
      e.preventDefault();
      e.stopPropagation();
      
      // Store the selected element
      setSelectedElement({
        element: hoveredElement,
        html: hoveredElement.outerHTML,
        tagName: hoveredElement.tagName.toLowerCase()
      });
      
      // Open the refine modal
      setRefineModalOpen(true);
    }
  };

  const handleRefineComponent = async (prompt) => {
    if (!selectedElement) return;
    
    try {
      setRefining(true);
      
      const response = await fetch('/api/refine-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: selectedElement.html,
          prompt: prompt,
          tagName: selectedElement.tagName
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refine component');
      }
      
      const { refinedHtml } = await response.json();
      
      // Create a temporary div to parse the HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = refinedHtml;
      const newElement = tempDiv.firstChild;
      
      // Replace the old element with the new one
      if (selectedElement.element && newElement) {
        selectedElement.element.outerHTML = newElement.outerHTML;
        
        // Update the design in state
        const designContainer = document.getElementById('design-container');
        if (designContainer) {
          const updatedDesigns = designs.map(d => {
            if (d.id === activeDesign.id) {
              return {
                ...d,
                html: designContainer.innerHTML
              };
            }
            return d;
          });
          
          setDesigns(updatedDesigns);
          localStorage.setItem('generatedDesigns', JSON.stringify(updatedDesigns));
        }
      }
    } catch (error) {
      console.error('Error refining component:', error);
      alert('Failed to refine component. Please try again.');
    } finally {
      setRefining(false);
      setRefineModalOpen(false);
      setSelectedElement(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your design...</p>
        </div>
      </div>
    );
  }

  if (!activeDesign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Design Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the design you're looking for. It may have been removed or never existed.</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New Design
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header with tabs for switching between designs */}
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
          
          <div className="mt-3 border-b border-gray-200">
            <nav className="flex space-x-4 -mb-px overflow-x-auto">
              {designs.map((design, index) => (
                <button
                  key={design.id}
                  onClick={() => handleDesignChange(design)}
                  className={`whitespace-nowrap py-2 px-3 text-sm font-medium ${
                    activeDesign.id === design.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Design {index + 1}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Instructions */}
      <div className="bg-blue-50 border-b border-blue-100 py-2">
        <div className="container mx-auto px-4">
          <p className="text-sm text-blue-700">
            <strong>Hover</strong> over any component to highlight it, then <strong>click</strong> to refine it with a new prompt.
          </p>
        </div>
      </div>

      {/* Design preview */}
      <main className="container mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div 
            id="design-container"
            className="relative design-preview"
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onClick={handleElementClick}
            dangerouslySetInnerHTML={{ __html: activeDesign.html }}
          />
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-medium text-gray-800 mb-2">Design Prompt</h2>
          <p className="text-gray-600">{activeDesign.prompt}</p>
        </div>
      </main>

      {/* Refine Modal */}
      {refineModalOpen && (
        <RefineModal
          isOpen={refineModalOpen}
          onClose={() => {
            setRefineModalOpen(false);
            setSelectedElement(null);
          }}
          onRefine={handleRefineComponent}
          elementType={selectedElement?.tagName || 'component'}
          isRefining={refining}
        />
      )}

      {/* CSS for highlighting */}
      <style jsx global>{`
        .design-hover-highlight {
          outline: 2px solid #3b82f6 !important;
          position: relative;
          cursor: pointer;
        }
        
        .design-preview * {
          transition: outline 0.2s ease;
        }
      `}</style>
    </div>
  );
}