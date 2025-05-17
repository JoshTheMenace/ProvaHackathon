'use client';

import { useEffect } from 'react';

/**
 * This component sanitizes Tailwind classes on the client side
 * for dynamically inserted content that might have invalid classes.
 */
export default function TailwindClassFixer() {
  useEffect(() => {
    // Flag to prevent processing mutations caused by our own fixes
    let isProcessing = false;

    // Cache of elements that have already been processed
    const processedElements = new WeakSet();

    // Function to fix invalid Tailwind classes
    const sanitizeTailwindClasses = (rootElements) => {
      if (isProcessing) return;
      
      try {
        isProcessing = true;
        
        // Use provided containers or find all design-preview containers
        const containers = rootElements || document.querySelectorAll('.design-preview');
        
        containers.forEach(container => {
          // Skip if we've already processed this container in this cycle
          if (processedElements.has(container)) return;
          
          const elementsWithClasses = container.querySelectorAll('[class]');
          
          elementsWithClasses.forEach(element => {
            // Skip if we've already processed this element
            if (processedElements.has(element)) return;
            
            const classAttribute = element.getAttribute('class');
            if (!classAttribute) return;
            
            // Only process if it potentially has invalid classes
            if (!classAttribute.includes('property') && 
                !classAttribute.includes('text-color') && 
                !classAttribute.includes('bg-color')) {
              processedElements.add(element);
              return;
            }
            
            const classes = classAttribute.split(/\s+/).filter(Boolean);
            let hasChanges = false;
            
            const sanitizedClasses = classes.map(cls => {
              // Fix common invalid patterns
              if (cls.startsWith('property') && cls.includes('-')) {
                hasChanges = true;
                return cls.replace('property', '');
              }
              
              if (cls.startsWith('text-color-')) {
                hasChanges = true;
                return cls.replace('text-color-', 'text-');
              }
              
              if (cls.startsWith('bg-color-')) {
                hasChanges = true;
                return cls.replace('bg-color-', 'bg-');
              }
              
              return cls;
            });
            
            // Only update if we actually made changes
            if (hasChanges) {
              element.setAttribute('class', sanitizedClasses.join(' '));
            }
            
            // Mark as processed to avoid re-processing
            processedElements.add(element);
          });
          
          // Mark container as processed
          processedElements.add(container);
        });
      } finally {
        // Always make sure to reset the processing flag
        isProcessing = false;
      }
    };

    // Initial processing when the component mounts
    setTimeout(() => sanitizeTailwindClasses(), 100);
    
    // Set up a mutation observer to catch dynamic changes, with debounce
    let debounceTimer = null;
    const observer = new MutationObserver((mutations) => {
      // Skip if we're currently processing
      if (isProcessing) return;
      
      // Clear any pending debounce timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      
      // Collect affected elements for batch processing
      const affectedElements = new Set();
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          // New nodes were added
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              affectedElements.add(node);
            }
          });
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          // Class attribute was modified
          affectedElements.add(mutation.target);
        }
      });
      
      // Debounce the processing
      debounceTimer = setTimeout(() => {
        if (affectedElements.size > 0) {
          sanitizeTailwindClasses(Array.from(affectedElements));
        }
      }, 200);
    });
    
    // Start observing with a short delay to allow initial rendering
    setTimeout(() => {
      const designPreviews = document.querySelectorAll('.design-preview');
      designPreviews.forEach(container => {
        observer.observe(container, { 
          childList: true, 
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      });
    }, 300);
    
    // Cleanup function
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      observer.disconnect();
    };
  }, []);
  
  // This component doesn't render anything
  return null;
} 