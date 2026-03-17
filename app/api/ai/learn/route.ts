import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';
import { extractJSON } from '@/src/lib/json-extractor';

type StepType = 'key-idea' | 'example' | 'mini-check' | 'alternate';

function buildPrompt(step: StepType, ctx: Record<string, string>): string {
    const baseRule = "You must respond with ONLY a raw JSON object. No markdown, no code fences, no explanation text before or after. Your entire response must be parseable by JSON.parse().\n\n";
    const endRule = "\n\nRemember: raw JSON only. No ``` fences. No prose.";

    switch (step) {
        case 'key-idea':
            return baseRule + `Return ONLY valid JSON: { "title": string, "explanation": string, "codeSnippet": { "language": string, "code": string, "resultLine": string } | null } — Generate a key idea explanation for the unit '${ctx.unitName}' from topic '${ctx.topicName}'. title should start with 'Key Idea:' and be 4–6 words. explanation should be exactly 2–3 sentences — the core concept only, no fluff. If the unit involves code, include codeSnippet with a 5–8 line example and a resultLine showing the output. If not code-related, set codeSnippet to null.` + endRule;
        case 'example':
            return baseRule + `Return ONLY valid JSON: { "lines": [{ "code": string, "explanation": string }] } — Take this code from unit '${ctx.unitName}':\n${ctx.code}\nBreak it into 3–5 meaningful lines or logical blocks. For each, provide the code fragment and a one-sentence plain-English explanation of exactly what it does and why. Use only the programming language relevant to the topic. Do not switch languages. Return only the lines array — no introduction, no summary.` + endRule;
        case 'mini-check':
            return baseRule + `Return ONLY valid JSON: { "questions": [{ "question": string, "options": string[], "correctIndex": number, "explanation": string }] } — Generate exactly 3 multiple-choice questions testing the concept '${ctx.title}' from unit '${ctx.unitName}'. Each question has exactly 4 options. correctIndex is 0-based. explanation is shown after the user answers — make it genuinely explain why the correct answer is right, not just restate it. Make each question slightly harder than the previous.` + endRule;
        case 'alternate':
            return baseRule + `Return ONLY valid JSON: { "explanation": string } — A student still finds '${ctx.title}' confusing after the standard explanation. Write a completely different explanation using a real-world analogy or a different framing. 3–4 sentences. Do not repeat any phrasing from the original explanation.` + endRule;
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
        try {
            const parsed = extractJSON(response.text);
            return NextResponse.json({ success: true, data: parsed });
        } catch (e: any) {
            console.error('[learn] Could not parse AI response:', response.text.slice(0, 200));
            return NextResponse.json({ success: false, error: 'AI returned invalid JSON' });
        }
    } catch (error) {
        console.error('[learn] Error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
