// app/api/refine-component/route.js

import { refineComponent } from '@/lib/cerebras';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { html, prompt, tagName } = await request.json();
    
    if (!html || !prompt) {
      return NextResponse.json(
        { error: 'HTML and prompt are required' },
        { status: 400 }
      );
    }
    
    const refinedHtml = await refineComponent(html, prompt, tagName || 'div');
    
    return NextResponse.json({ refinedHtml });
  } catch (error) {
    console.error('Error in refine-component API:', error);
    return NextResponse.json(
      { error: 'Failed to refine component' },
      { status: 500 }
    );
  }
}