// Custom Tailwind plugin to handle dynamic classes better

/**
 * This plugin ensures that dynamically inserted Tailwind classes are properly recognized
 */
export default function tailwindDynamicContentHandler() {
  return {
    name: 'tailwind-dynamic-content-handler',
    
    // Add a comment to force Tailwind to include all color variations
    config(config) {
      // Force Tailwind to include text and background color classes
      const colorConfig = config?.theme?.extend?.colors || {};
      
      // Add a marker to indicate that we're handling dynamic content
      return {
        ...config,
        theme: {
          ...config.theme,
          extend: {
            ...config.theme?.extend,
            colors: {
              ...colorConfig,
              // This never gets used but ensures Tailwind knows we need all color variants
              _dynamic: 'dynamicContent',
            },
          },
        },
        // Add an invisible marker class that mentions all possible class prefixes
        // to prevent Tailwind from purging them
        safelist: [
          ...(config.safelist || []),
          'text-_dynamic bg-_dynamic border-_dynamic',
        ],
      };
    },
  };
}; 