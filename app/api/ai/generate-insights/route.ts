import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ success: false, error: 'Missing prompt' }, { status: 400 });
        }

        const response = await callWithRetry({ prompt, maxTokens: 500, temperature: 0.7 });

        if (!response.success) {
            return NextResponse.json({ success: false, error: response.error || 'AI failed' });
        }

        try {
            let text = response.text.trim();
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            const parsed = JSON.parse(text);
            return NextResponse.json({ success: true, insight: parsed });
        } catch {
            return NextResponse.json({ success: true, rawText: response.text });
        }
    } catch (error) {
        console.error('[generate-insights] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
