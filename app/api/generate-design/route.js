// app/api/generate-design/route.js

import { generateDesign } from '@/lib/cerebras';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    const designs = await generateDesign(prompt);
    
    return NextResponse.json({ designs });
  } catch (error) {
    console.error('Error in generate-design API:', error);
    return NextResponse.json(
      { error: 'Failed to generate design' },
      { status: 500 }
    );
  }
}