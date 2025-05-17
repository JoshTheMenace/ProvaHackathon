// lib/gemini.js

import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI with your API key
const initGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing in environment variables');
  }
  return new GoogleGenerativeAI(apiKey);
};

// Function to convert a file to base64 data URL
const fileToGenerativePart = async (file) => {
  const buffer = Buffer.from(await file.arrayBuffer());
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType: file.type,
    },
  };
};

// Generate a description of an image using Gemini Pro Vision
export async function generateImageDescription(imageFile) {
  try {
    const genAI = initGemini();
    const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' });

    const imagePart = await fileToGenerativePart(imageFile);

    const prompt = `Describe this image in detail for the purpose of creating a web design based on it. 
                    Focus on:
                    1. The overall layout and structure
                    2. Color schemes and visual style
                    3. UI components visible (buttons, forms, cards, etc.)
                    4. The mood/feel of the design
                    Keep the description concise but detailed enough for a design system to recreate something similar.`;

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    return {
      description: text.trim(),
    };
  } catch (error) {
    console.error('Error generating image description:', error);
    return {
      description: 'Unable to generate description. Please try again or provide a text prompt instead.',
      error: error.message,
    };
  }
}