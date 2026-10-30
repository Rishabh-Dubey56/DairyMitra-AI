import { NextResponse } from 'next/server';
import { generateLocalAIResponse } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const { query, language = 'en' } = await request.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const answer = generateLocalAIResponse(query, language);
    return NextResponse.json({
      answer,
      category: 'general',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process AI query' }, { status: 500 });
  }
}
