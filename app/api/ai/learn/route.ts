import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

type StepType = 'key-idea' | 'example' | 'mini-check' | 'alternate';

function buildPrompt(step: StepType, ctx: Record<string, string>): string {
    switch (step) {
        case 'key-idea':
            return `Return ONLY valid JSON with no markdown: { "title": string, "explanation": string, "codeSnippet": { "language": string, "code": string, "resultLine": string } | null } — Generate a key idea explanation for the unit '${ctx.unitName}' from topic '${ctx.topicName}'. title should start with 'Key Idea:' and be 4–6 words. explanation should be exactly 2–3 sentences — the core concept only, no fluff. If the unit involves code, include codeSnippet with a 5–8 line example and a resultLine showing the output. If not code-related, set codeSnippet to null.`;
        case 'example':
            return `Return ONLY valid JSON with no markdown: { "lines": [{ "code": string, "explanation": string }] } — Take this code from unit '${ctx.unitName}':\n${ctx.code}\nBreak it into 3–5 meaningful lines or logical blocks. For each, provide the code fragment and a one-sentence plain-English explanation of exactly what it does and why.`;
        case 'mini-check':
            return `Return ONLY valid JSON with no markdown: { "questions": [{ "question": string, "options": string[], "correctIndex": number, "explanation": string }] } — Generate exactly 3 multiple-choice questions testing the concept '${ctx.title}' from unit '${ctx.unitName}'. Each question has exactly 4 options. correctIndex is 0-based. explanation is shown after the user answers — make it genuinely explain why the correct answer is right, not just restate it. Make each question slightly harder than the previous.`;
        case 'alternate':
            return `Return ONLY valid JSON with no markdown: { "explanation": string } — A student still finds '${ctx.title}' confusing after the standard explanation. Write a completely different explanation using a real-world analogy or a different framing. 3–4 sentences. Do not repeat any phrasing from the original explanation.`;
        default:
            return '';
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { step, unitName, topicName, code, title } = body;

        if (!step || !unitName) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
        }

        const prompt = buildPrompt(step as StepType, { unitName, topicName: topicName || '', code: code || '', title: title || '' });

        if (!prompt) {
            return NextResponse.json({ success: false, error: 'Invalid step' }, { status: 400 });
        }

        const response = await callWithRetry({ prompt, maxTokens: 800, temperature: 0.7 });

        if (!response.success) {
            return NextResponse.json({ success: false, error: response.error || 'AI failed' });
        }

        // Try multiple strategies to extract valid JSON from the LLM response
        let text = response.text.trim();

        // Strip markdown code fences
        text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

        // Attempt 1: direct parse
        try {
            const parsed = JSON.parse(text);
            return NextResponse.json({ success: true, data: parsed });
        } catch {
            // Attempt 2: find the first { ... } or [ ... ] in the text
            const objMatch = text.match(/\{[\s\S]*\}/);
            const arrMatch = text.match(/\[[\s\S]*\]/);
            const candidate = objMatch?.[0] || arrMatch?.[0];
            if (candidate) {
                try {
                    const parsed = JSON.parse(candidate);
                    return NextResponse.json({ success: true, data: parsed });
                } catch {
                    // fall through
                }
            }
            console.error('[learn] Could not parse AI response:', text.slice(0, 200));
            return NextResponse.json({ success: false, error: 'AI returned invalid JSON' });
        }
    } catch (error) {
        console.error('[learn] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
