import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';
import { buildUnitPrompt, getFallbackUnits } from '@/src/services/ai/prompts/unit-prompts';
import { parseUnitResponse } from '@/src/services/ai/parsers/unit-parser';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, level } = body;

        if (!topic || !level) {
            return NextResponse.json(
                { units: [], success: false, error: 'Missing topic or level' },
                { status: 400 }
            );
        }

        // Build prompt and call AI
        const prompt = buildUnitPrompt(topic, level);
        console.log('[generate-units] Calling HuggingFace for:', topic, level);

        const response = await callWithRetry({ prompt, maxTokens: 500, temperature: 0.7 });

        if (!response.success) {
            console.warn('[generate-units] AI failed, using fallback:', response.error);
            return NextResponse.json({
                units: getFallbackUnits(topic, level),
                success: true,
                fallback: true,
            });
        }

        // Parse the response
        const units = parseUnitResponse(response.text);

        if (units.length === 0) {
            console.warn('[generate-units] Failed to parse units, using fallback');
            return NextResponse.json({
                units: getFallbackUnits(topic, level),
                success: true,
                fallback: true,
            });
        }

        console.log('[generate-units] Generated', units.length, 'units');
        return NextResponse.json({
            units,
            success: true,
            fallback: false,
        });
    } catch (error) {
        console.error('[generate-units] Error:', error);
        return NextResponse.json(
            { units: [], success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}
