import { generateDesign } from '@/lib/cerebras';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Parse the incoming JSON request
    const body = await request.json();
    const { prompt, originalPrompt } = body;
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Change request is required' },
        { status: 400 }
      );
    }
    
    // Create a detailed instruction for the AI
    let fullPrompt = originalPrompt
      ? `Based on this original design concept: "${originalPrompt}", create a new variation with the following specific changes: "${prompt}". Preserve the core functionality but implement these requested modifications.`
      : prompt;
      
    console.log('Sending prompt to Cerebras:', fullPrompt);
    
    try {
      // Generate 3 different design variations based on the request
      const designs = await generateDesign(fullPrompt);
      
      if (!designs || designs.length === 0) {
        throw new Error('No designs were generated');
      }
      
      // Add specific IDs and metadata to the designs
      const enhancedDesigns = designs.map((design, index) => ({
        ...design,
        id: `remix-${Date.now()}-${index + 1}`,
        remixPrompt: prompt,
        createdAt: new Date().toISOString()
      }));
      
      return NextResponse.json({ designs: enhancedDesigns });
    } catch (generationError) {
      console.error('Error generating designs:', generationError);
      return NextResponse.json(
        { error: 'Failed to generate designs: ' + (generationError.message || 'Unknown error') },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in refine-design API:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
} 