// lib/cerebras.js - a refactored version of your provided code

import Cerebras from '@cerebras/cerebras_cloud_sdk';

// Cerebras Inference API service
export async function generateDesign(prompt, fastMode = false) {
  const cerebrasClient = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY || 'your-api-key-here',
  });

  console.log(`Generating design with Cerebras API (${fastMode ? 'Fast Mode' : 'Standard Mode'})...`);
  
  try {
    // Using the actual Cerebras API through the SDK
    const systemPrompt = `You are an expert HTML/CSS developer specializing in Tailwind CSS.
    You will create clean, modern HTML component based on the user's description.
    The component should be self-contained and render visibly on its own.
    
    IMPORTANT TAILWIND CSS INSTRUCTIONS:
    1. Use ONLY standard Tailwind CSS classes that are part of the official Tailwind library.
    2. DO NOT invent custom class names or combine words incorrectly (e.g., "propertytext-cyan-400" is WRONG, "text-cyan-400" is CORRECT).
    3. Ensure proper spacing between Tailwind classes.
    4. Class names should follow the pattern: property-value (e.g., "text-lg", "bg-blue-500", "rounded-md").
    5. Never create composite class names like "bg-gradient-blue" - use proper Tailwind syntax like "bg-gradient-to-r from-blue-500 to-blue-700".
    6. For custom styles that can't be achieved with Tailwind, use inline styles with the "style" attribute, not custom classes.
    
    The component needs to be beautiful, modern, and responsive with interactive elements like hover effects where appropriate.
    ONLY return the raw HTML code with tailwind CSS classes. DO NOT include any text before or after the HTML.
    DO NOT use markdown code blocks. DO NOT include any explanations or thinking.
    
    IMPORTANT: Ensure that all generated UI elements are clearly visible. For example, buttons should contain sample text like "Click Me" or have explicit dimensions (e.g., using padding, width, height) and borders. Cards should have placeholder titles or content.
    
    CRUCIALLY: Assume generated components will be displayed on a light page background (e.g., off-white or light gray) unless a dark theme context is explicitly requested. Therefore, ensure high contrast: for elements with transparent backgrounds, text and border colors must be dark enough to be clearly visible against a light page background. For instance, avoid \`text-white\` combined with \`bg-transparent\` if the component is intended for a light theme.`;
    
    // Setup for generating 3 different designs
    const designs = [];
    
    // Choose model based on fast mode
    const modelName = fastMode ? 'claude-3-haiku' : 'qwen-3-32b';
    
    // Generate 3 different variations
    for (let i = 1; i <= 3; i++) {
      try {
        console.log(`Generating design ${i} with model ${modelName}...`);
        
        const response = await cerebrasClient.chat.completions.create({
          model: modelName,
          messages: [
            { 
              role: 'system', 
              content: systemPrompt 
            },
            { 
              role: 'user', 
              content: `Create a ${prompt} component. This is generation ${i} of 3, make it visually different from other versions.
                        IMPORTANT: Only return the HTML code, nothing else. No explanations, no code blocks, no thinking text.` 
            }
          ],
          temperature: fastMode ? 0.9 + (i * 0.1) : 0.7 + (i * 0.1),  // More variation in fast mode
          max_tokens: fastMode ? 1000 : 1500
        });
        
        // Extract and clean HTML code from the response
        let rawResponse = response.choices[0].message.content.trim();
        
        let htmlCode = extractAndCleanHtml(rawResponse);
        htmlCode = sanitizeTailwindClasses(htmlCode);
        
        // If we failed to extract valid HTML, use a fallback
        if (!isValidHtml(htmlCode)) {
          console.warn(`Failed to extract valid HTML for design ${i}, using fallback`);
          htmlCode = generateMockDesign(prompt, i).html;
        }
        
        designs.push({
          id: `design-${i}`,
          html: htmlCode,
          prompt: prompt
        });
      } catch (error) {
        console.error(`Error generating design ${i}:`, error);
        // Add a fallback design if API call fails
        designs.push(generateMockDesign(prompt, i));
      }
    }
    
    return designs;
  } catch (error) {
    console.error('Error generating designs:', error);
    
    // Fallback to mock designs if the API is unavailable
    console.log('Falling back to mock designs...');
    return [
      generateMockDesign(prompt, 1),
      generateMockDesign(prompt, 2),
      generateMockDesign(prompt, 3)
    ];
  }
}

// Function to refine a specific component
export async function refineComponent(html, prompt, tagName = 'div', fastMode = false) {
  const cerebrasClient = new Cerebras({
    apiKey: process.env.CEREBRAS_API_KEY || 'your-api-key-here',
  });

  console.log(`Refining component with Cerebras API (${fastMode ? 'Fast Mode' : 'Standard Mode'})...`);
  
  try {
    const systemPrompt = `You are an expert HTML/CSS developer specializing in Tailwind CSS.
    You will refine an existing HTML component based on the user's instructions.
    You will be given an HTML component and a prompt for how to modify it.
    
    IMPORTANT TAILWIND CSS INSTRUCTIONS:
    1. Use ONLY standard Tailwind CSS classes that are part of the official Tailwind library.
    2. DO NOT invent custom class names or combine words incorrectly (e.g., "propertytext-cyan-400" is WRONG, "text-cyan-400" is CORRECT).
    3. Ensure proper spacing between Tailwind classes.
    4. Class names should follow the pattern: property-value (e.g., "text-lg", "bg-blue-500", "rounded-md").
    5. Never create composite class names like "bg-gradient-blue" - use proper Tailwind syntax like "bg-gradient-to-r from-blue-500 to-blue-700".
    6. For custom styles that can't be achieved with Tailwind, use inline styles with the "style" attribute, not custom classes.
    
    ONLY return the raw HTML code with tailwind CSS classes. DO NOT include any text before or after the HTML.
    DO NOT use markdown code blocks. DO NOT include any explanations or thinking.
    
    Maintain the same basic structure and functionality of the original component, but implement the requested changes.
    Make sure the refined component is still self-contained and renders visibly on its own.
    
    IMPORTANT: Ensure that all UI elements remain clearly visible after refinement.
    CRUCIALLY: Assume the component will be displayed on a light page background unless a dark theme is explicitly requested.`;
    
    // Choose model based on fast mode
    const modelName = fastMode ? 'claude-3-haiku' : 'qwen-3-32b';
    
    const response = await cerebrasClient.chat.completions.create({
      model: modelName,
      messages: [
        { 
          role: 'system', 
          content: systemPrompt 
        },
        { 
          role: 'user', 
          content: `Here is the original ${tagName} component:\n\n${html}\n\nRefine this component by: ${prompt}\n\nIMPORTANT: Only return the HTML code, nothing else.` 
        }
      ],
      temperature: fastMode ? 0.7 : 0.5,
      max_tokens: fastMode ? 1000 : 1500
    });
    
    // Extract and clean HTML code from the response
    let rawResponse = response.choices[0].message.content.trim();
    let refinedHtml = extractAndCleanHtml(rawResponse);
    refinedHtml = sanitizeTailwindClasses(refinedHtml);
    
    // If we failed to extract valid HTML, return the original
    if (!isValidHtml(refinedHtml)) {
      console.warn('Failed to extract valid HTML for refinement, returning original');
      return html;
    }
    
    return refinedHtml;
  } catch (error) {
    console.error('Error refining component:', error);
    // Return the original HTML if the API fails
    return html;
  }
}

// Function to check if a string contains valid HTML
function isValidHtml(html) {
  if (!html || typeof html !== 'string') return false;
  
  // Check if it has at least one HTML tag
  const hasHtmlTag = /<[a-z][^>]*>/i.test(html);
  
  // Check if content is too short (likely incomplete)
  const isTooShort = html.length < 20;
  
  // Check for self-closing tags like <input>, <img>, etc.
  const hasSelfClosingTag = /<(input|img|br|hr|meta|link|source|area|base|col|embed|param|track|wbr)[^>]*\/?>/i.test(html);
  
  // Check if it has closing tags for common elements
  const hasClosingTags = html.includes('</div>') || html.includes('</button>') || 
                        html.includes('</span>') || html.includes('</a>');
  
  // It's valid if:
  // 1. It has HTML tags AND
  // 2. It's not too short AND 
  // 3. It either has proper closing tags OR contains self-closing tags
  return hasHtmlTag && !isTooShort && (hasClosingTags || hasSelfClosingTag);
}

// Function to extract and clean HTML output
function extractAndCleanHtml(text) {
  // First remove any markdown code block markers
  let cleanedHtml = text.replace(/```html|```css|```jsx|```/g, '');
  
  // Remove thinking sections if present (any format)
  cleanedHtml = cleanedHtml.replace(/<think>[\s\S]*?<\/think>/g, '');
  cleanedHtml = cleanedHtml.replace(/thinking:[\s\S]*?end thinking/gi, '');

  // Remove any leading/trailing newlines or spaces
  cleanedHtml = cleanedHtml.trim();

  const firstTagIndex = cleanedHtml.indexOf('<');
  const lastTagIndex = cleanedHtml.lastIndexOf('>');

  if (firstTagIndex !== -1 && lastTagIndex !== -1 && lastTagIndex > firstTagIndex) {
    // Check if there's non-whitespace content before the first tag or after the last tag
    const beforeFirstTag = cleanedHtml.substring(0, firstTagIndex);
    const afterLastTag = cleanedHtml.substring(lastTagIndex + 1);

    if (beforeFirstTag.trim().length > 0 || afterLastTag.trim().length > 0) {
      // If there is extraneous text, isolate the core HTML block
      cleanedHtml = cleanedHtml.substring(firstTagIndex, lastTagIndex + 1);
    }
  }
  
  return cleanedHtml.trim();
}

// Function to create mock designs - used as fallback if API fails
function generateMockDesign(prompt, variationNumber) {
  // Mock designs based on common prompt types
  const lowerPrompt = prompt.toLowerCase();
  let htmlCode = '';
  
  if (lowerPrompt.includes('button')) {
    if (variationNumber === 1) {
      htmlCode = `<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-transform hover:scale-105 hover:shadow-lg">
  Click Me
</button>`;
    } else if (variationNumber === 2) {
      htmlCode = `<button class="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
  Click Me
</button>`;
    } else {
      htmlCode = `<button class="border-2 border-green-500 text-green-500 font-semibold py-2 px-4 rounded hover:bg-green-500 hover:text-white transition-colors duration-300 hover:animate-pulse">
  Click Me
</button>`;
    }
  } else if (lowerPrompt.includes('card')) {
    if (variationNumber === 1) {
      htmlCode = `<div class="max-w-sm rounded overflow-hidden shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
  <div class="px-6 py-4">
    <div class="font-bold text-xl mb-2">Card Title</div>
    <p class="text-gray-700 text-base">
      Some quick example text to build on the card title.
    </p>
  </div>
  <div class="px-6 pt-4 pb-2">
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#tag1</span>
    <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">#tag2</span>
  </div>
</div>`;
    } else if (variationNumber === 2) {
      htmlCode = `<div class="max-w-sm bg-gradient-to-br from-blue-100 to-white rounded-lg border border-gray-200 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
  <div class="p-5">
    <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900">Card Title</h5>
    <p class="mb-3 font-normal text-gray-700">Here is some example content for this beautiful card.</p>
    <button class="inline-flex items-center py-2 px-3 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300">
      Read more
      <svg class="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
    </button>
  </div>
</div>`;
    } else {
      htmlCode = `<div class="max-w-sm rounded-xl overflow-hidden border border-gray-300 bg-white hover:border-blue-500 transition-all duration-300">
  <div class="px-4 py-5">
    <div class="font-bold text-xl mb-2 text-gray-800">Card Title</div>
    <p class="text-gray-600 text-sm">
      This is a simple card that transforms on hover.
    </p>
  </div>
  <div class="px-4 py-3 bg-gray-50 flex justify-end">
    <button class="text-blue-500 hover:text-blue-700 font-medium text-sm">Learn More</button>
  </div>
</div>`;
    }
  } else if (lowerPrompt.includes('form')) {
    if (variationNumber === 1) {
      htmlCode = `<form class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 max-w-md mx-auto">
  <div class="mb-4">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="username">
      Username
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="username" type="text" placeholder="Username">
  </div>
  <div class="mb-6">
    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
      Password
    </label>
    <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" id="password" type="password" placeholder="******************">
  </div>
  <div class="flex items-center justify-between">
    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors" type="button">
      Sign In
    </button>
    <a class="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" href="#">
      Forgot Password?
    </a>
  </div>
</form>`;
    } else if (variationNumber === 2) {
      htmlCode = `<form class="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg shadow-lg max-w-md mx-auto">
  <h2 class="text-2xl font-bold text-center text-gray-800 mb-8">Login</h2>
  <div class="mb-6">
    <input class="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" type="email" placeholder="Email Address">
  </div>
  <div class="mb-6">
    <input class="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" type="password" placeholder="Password">
  </div>
  <div class="mb-6">
    <div class="flex items-center">
      <input type="checkbox" id="remember" class="h-4 w-4 text-blue-600">
      <label for="remember" class="ml-2 text-gray-700">Remember me</label>
    </div>
  </div>
  <button class="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none transition-all duration-300 transform hover:scale-105" type="submit">
    Sign In
  </button>
  <div class="text-center mt-4">
    <a href="#" class="text-blue-600 hover:text-blue-800 text-sm">Forgot Password?</a>
  </div>
</form>`;
    } else {
      htmlCode = `<form class="bg-white p-6 rounded-xl shadow-md border border-gray-100 max-w-md mx-auto">
  <div class="text-center mb-6">
    <h2 class="text-xl font-bold text-gray-800">Create Account</h2>
    <p class="text-gray-600 text-sm mt-1">Join our community today</p>
  </div>
  <div class="space-y-4">
    <div class="flex space-x-4">
      <div class="w-1/2">
        <input type="text" placeholder="First Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all">
      </div>
      <div class="w-1/2">
        <input type="text" placeholder="Last Name" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all">
      </div>
    </div>
    <input type="email" placeholder="Email Address" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all">
    <input type="password" placeholder="Password" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-all">
  </div>
  <button type="submit" class="w-full mt-6 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors">
    Sign Up
  </button>
  <p class="text-center text-gray-500 text-xs mt-4">
    By signing up, you agree to our Terms and Privacy Policy
  </p>
</form>`;
    }
  } else {
    // Default to a button if we can't determine type
    if (variationNumber === 1) {
      htmlCode = `<button class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-xl transition-all hover:rotate-1">
  ${prompt}
</button>`;
    } else if (variationNumber === 2) {
      htmlCode = `<button class="relative overflow-hidden bg-blue-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-blue-700 transition-colors before:content-[''] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:bg-white/20 before:translate-x-full before:skew-x-30 before:transition-transform hover:before:translate-x-[-180%] before:duration-700">
  ${prompt}
</button>`;
    } else {
      htmlCode = `<button class="border-2 border-yellow-400 bg-yellow-50 text-gray-800 font-bold py-2 px-5 rounded-full hover:bg-yellow-400 hover:text-white transition-all hover:shadow-lg hover:scale-105">
  ${prompt}
</button>`;
    }
  }
  
  return {
    id: `design-${variationNumber}`,
    html: htmlCode,
    prompt: prompt
  };
}

// Update sanitizeTailwindClasses for better performance
function sanitizeTailwindClasses(html) {
  if (!html) return html;
  
  // Don't process if there are no problematic patterns
  if (!html.includes('property') && 
      !html.includes('text-color-') && 
      !html.includes('bg-color-')) {
    return html;
  }
  
  // Find class attributes in the HTML more efficiently
  const classAttributeRegex = /class="([^"]*)"/g;
  
  // Use a faster replacement method
  return html.replace(classAttributeRegex, (match, classContent) => {
    // Skip if there are no problematic patterns in this attribute
    if (!classContent.includes('property') && 
        !classContent.includes('text-color-') && 
        !classContent.includes('bg-color-')) {
      return match;
    }
    
    // Split classes by space
    const classes = classContent.split(/\s+/).filter(c => c.trim());
    
    // Sanitize individual classes
    const sanitizedClasses = classes.map(cls => {
      // Remove any invalid prefixes or combinations
      if (cls.startsWith('property') && cls.includes('-')) {
        // e.g. "propertytext-gray-500" -> "text-gray-500"
        return cls.replace('property', '');
      }
      
      // Fix common mistakes
      if (cls.startsWith('text-color-')) {
        // e.g. "text-color-gray-500" -> "text-gray-500"
        return cls.replace('text-color-', 'text-');
      }
      
      if (cls.startsWith('bg-color-')) {
        // e.g. "bg-color-blue-500" -> "bg-blue-500"
        return cls.replace('bg-color-', 'bg-');
      }
      
      return cls;
    });
    
    // Rebuild the class attribute
    return `class="${sanitizedClasses.join(' ')}"`;
  });
}