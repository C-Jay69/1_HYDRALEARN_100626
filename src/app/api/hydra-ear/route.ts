import { NextRequest, NextResponse } from 'next/server';
import { chatWithHydraEar } from '@/ai/flows/hydra-ear';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const result = await chatWithHydraEar(message, history || []);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in HydraEar chat:', error);
    return NextResponse.json(
      { error: 'Failed to get response', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
