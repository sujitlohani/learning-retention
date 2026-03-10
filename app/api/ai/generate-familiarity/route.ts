import { NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';

export async function POST(request: Request) {
    try {
        const { topic, level } = await request.json();

        if (!topic) {
            return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
        }

        const difficulty = level || 'intermediate';

        // Prompt from Task 4
        const prompt = `
Given the topic "${topic}" and difficulty level "${difficulty}", generate 4-5 knowledge statements a user at this level might or might not already know. 
Statements should range from very foundational to moderately advanced within this difficulty band.
Format as short, clear first-person declarations. (e.g., "I can explain what X is", "I know how to use Y").

Return ONLY a JSON array of strings. Do not include any other text, markdown formatting blocks, or explanations.

Example format:
[
  "I understand the basic definition of this concept.",
  "I have applied this concept in a simple scenario.",
  "I can explain the differences between this and related concepts."
]
`;

        const response = await callWithRetry({ prompt, maxTokens: 500, temperature: 0.3 });

        if (!response.success) {
            console.warn('[generate-familiarity] AI failed, using fallback:', response.error);
            return NextResponse.json({
                success: true,
                statements: [
                    "I understand the basic definition of this.",
                    "I know the main use cases for this.",
                    "I have tried applying this before.",
                    "I can explain this to someone else."
                ]
            });
        }

        const content = response.text || '[]';

        let statements: string[] = [];
        try {
            // Remove markdown code blocks if the model wrapped it
            const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            statements = JSON.parse(cleanedContent);

            if (!Array.isArray(statements)) {
                statements = [];
            }
        } catch (e) {
            console.error('Failed to parse familiarity statements JSON:', e, content);
            statements = [];
        }

        return NextResponse.json({
            success: true,
            statements
        });
    } catch (error) {
        console.error('Failed to generate familiarity statements:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate statements'
        }, { status: 500 });
    }
}
