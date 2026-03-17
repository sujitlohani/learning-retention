import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || typeof name !== 'string' || !name.trim()) {
            return NextResponse.json({ corrected: name || '', success: false, error: 'Missing name' }, { status: 400 });
        }

        const prompt = `Return ONLY the corrected spelling of this topic name, nothing else: '${name.trim()}'. If it is already correct, return it unchanged. Do not add quotes, explanations, or any other text — just the corrected name.`;

        const response = await callWithRetry({ prompt, maxTokens: 50, temperature: 0.1 });

        if (!response.success) {
            return NextResponse.json({ corrected: name.trim(), success: true });
        }

        // Clean up the response — strip quotes, whitespace
        let corrected = response.text
            .replace(/^["'`]+|["'`]+$/g, '')
            .replace(/\n/g, '')
            .trim();

        // If AI returned garbage or empty, fallback to original
        if (!corrected || corrected.length > name.length * 3) {
            corrected = name.trim();
        }

        return NextResponse.json({ corrected, success: true });
    } catch (error) {
        console.error('[fix-topic-name] Error:', error);
        return NextResponse.json({ corrected: '', success: false, error: 'Internal server error' }, { status: 500 });
    }
}
