import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topicName } = body;

        if (!topicName) {
            return NextResponse.json(
                { success: false, error: 'Missing topicName' },
                { status: 400 }
            );
        }

        const prompt = `Return ONLY valid JSON with no markdown or code fences: { "description": string, "useCases": [{ "title": string, "description": string, "tag": string }] }. The description should explain ${topicName} in 2-3 sentences — what it is and why it matters to someone learning it. useCases should contain exactly 3 real-world applications of this topic. Each tag should be a single word category like 'Efficiency', 'Storage', 'Compilers', 'Networking', etc.`;

        console.log('[generate-description] Calling HuggingFace for:', topicName);

        const response = await callWithRetry({ prompt, maxTokens: 600, temperature: 0.7 });

        if (!response.success) {
            console.warn('[generate-description] AI failed:', response.error);
            return NextResponse.json({
                success: false,
                error: response.error || 'AI generation failed',
            });
        }

        // Try to parse JSON from the response
        try {
            // Strip markdown code fences if present
            let text = response.text.trim();
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            
            const parsed = JSON.parse(text);
            console.log('[generate-description] Generated description for:', topicName);
            return NextResponse.json({
                success: true,
                description: parsed.description || '',
                useCases: parsed.useCases || [],
            });
        } catch {
            console.warn('[generate-description] Failed to parse JSON, returning raw text');
            return NextResponse.json({
                success: true,
                description: response.text,
                useCases: [],
            });
        }
    } catch (error) {
        console.error('[generate-description] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
