import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { summaryData } = body;

        if (!summaryData) {
            return NextResponse.json({ success: false, error: 'Missing summary data' }, { status: 400 });
        }

        const prompt = `You are analyzing a student's quiz performance in a memory retention app.
Based on the following data, return ONLY valid JSON with no markdown, no explanation, no code fences:
{
  "insight": { "topicArea": string, "accuracyPercent": number },
  "commonPattern": string,
  "suggestedFocus": string[],
  "recommendedUnit": { "unitName": string, "topicId": string, "unitId": string }
}
Data: ${JSON.stringify(summaryData)}
Base everything strictly on the provided data. suggestedFocus should be 2-3 unit names.`;

        const response = await callWithRetry({ prompt, maxTokens: 500, temperature: 0.7 });

        if (!response.success) {
            return NextResponse.json({ success: false, error: response.error || 'AI failed' });
        }

        try {
            let text = response.text.trim();
            text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
            const parsed = JSON.parse(text);
            return NextResponse.json({ success: true, ...parsed });
        } catch {
            return NextResponse.json({ success: true, rawText: response.text });
        }
    } catch (error) {
        console.error('[generate-insights] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
