import { NextRequest, NextResponse } from 'next/server';
import { getWatchRecommendations, GroqMessage } from '@/lib/ai/groq';

export async function POST(req: NextRequest) {
  try {
    const { query, history = [] } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const response = await getWatchRecommendations(query, history as GroqMessage[]);
    
    // Try to extract JSON if present
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return NextResponse.json({ 
          text: response.replace(jsonMatch[0], '').trim(),
          data 
        });
      } catch (e) {
        console.warn('Failed to parse Groq JSON:', e);
      }
    }

    return NextResponse.json({ text: response });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Advisor API Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
