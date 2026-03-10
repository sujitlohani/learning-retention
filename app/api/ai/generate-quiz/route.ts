import { NextRequest, NextResponse } from 'next/server';
import { callWithRetry } from '@/src/services/ai/huggingface-client';
import { buildQuizPrompt } from '@/src/services/ai/prompts/quiz-prompts';
import { parseQuizResponse } from '@/src/services/ai/parsers/quiz-parser';
import { validateAndFilterQuestions } from '@/src/services/ai/validators/quality-scorer';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { topic, unit, unitId, topicId, level, count = 10, subLevel, knowledgeGaps } = body;

        if (!topic || !unit || !unitId || !topicId || !level) {
            return NextResponse.json(
                { questions: [], success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Build prompt and call AI
        const prompt = buildQuizPrompt(topic, unit, level, count, subLevel, knowledgeGaps);
        console.log('[generate-quiz] Calling HuggingFace for:', topic, unit, level);

        const response = await callWithRetry({
            prompt,
            maxTokens: 2000,
            temperature: 0.7,
        });

        if (!response.success) {
            console.warn('[generate-quiz] AI failed:', response.error);
            // Return fallback mock questions
            const fallbackQuestions = generateFallbackQuestions(topicId, unitId, unit, level, count);
            return NextResponse.json({
                questions: fallbackQuestions,
                success: true,
                fallback: true,
            });
        }

        // Parse the response
        let questions = parseQuizResponse(response.text, topicId, unitId, level, unit);

        if (questions.length === 0) {
            console.warn('[generate-quiz] Failed to parse questions, using fallback');
            const fallbackQuestions = generateFallbackQuestions(topicId, unitId, unit, level, count);
            return NextResponse.json({
                questions: fallbackQuestions,
                success: true,
                fallback: true,
            });
        }

        // Validate and filter questions
        questions = validateAndFilterQuestions(questions);

        // If too few questions passed validation, supplement with fallback
        if (questions.length < Math.floor(count * 0.5)) {
            console.warn('[generate-quiz] Too few questions passed validation, supplementing');
            const fallbackCount = count - questions.length;
            const fallback = generateFallbackQuestions(topicId, unitId, unit, level, fallbackCount);
            questions = [...questions, ...fallback];
        }

        console.log('[generate-quiz] Returning', questions.length, 'validated questions');
        return NextResponse.json({
            questions,
            success: true,
            fallback: false,
        });
    } catch (error) {
        console.error('[generate-quiz] Error:', error);
        return NextResponse.json(
            { questions: [], success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * Generate fallback quiz questions when AI fails.
 */
function generateFallbackQuestions(
    topicId: string,
    unitId: string,
    unit: string,
    level: 'beginner' | 'intermediate' | 'expert',
    count: number
) {
    const questions = [];
    const mcqCount = Math.ceil(count * 0.6);
    const saCount = count - mcqCount;
    const now = new Date().toISOString();

    for (let i = 0; i < mcqCount; i++) {
        questions.push({
            id: `fallback-${unitId}-mcq-${i}-${Date.now()}`,
            topicId,
            unitId,
            unitName: unit,
            type: 'mcq' as const,
            difficulty: level,
            question: getFallbackMCQQuestion(unit, i),
            options: getFallbackOptions(unit, i),
            correctAnswer: getFallbackOptions(unit, i)[0],
            explanation: `This tests your understanding of ${unit}.`,
            keywords: [unit.toLowerCase().split(' ')[0], 'unit', 'understanding'],
            validationScore: 75,
            aiGenerated: false,
            createdAt: now,
        });
    }

    for (let i = 0; i < saCount; i++) {
        questions.push({
            id: `fallback-${unitId}-sa-${i}-${Date.now()}`,
            topicId,
            unitId,
            unitName: unit,
            type: 'short-answer' as const,
            difficulty: level,
            question: `Explain the key aspects of "${unit}" in your own words.`,
            correctAnswer: `${unit} is a fundamental unit that involves understanding and applying core principles effectively.`,
            explanation: `This tests your ability to articulate ${unit}.`,
            keywords: [unit.toLowerCase().split(' ')[0], 'explain', 'unit'],
            acceptableAnswers: [`${unit} involves key principles`, `Understanding ${unit}`],
            validationScore: 75,
            aiGenerated: false,
            createdAt: now,
        });
    }

    return questions;
}

function getFallbackMCQQuestion(unit: string, index: number): string {
    const templates = [
        `What is the primary purpose of "${unit}"?`,
        `Which of the following best describes "${unit}"?`,
        `When should you apply "${unit}" in practice?`,
        `What is a key characteristic of "${unit}"?`,
        `How does "${unit}" differ from related units?`,
        `What is the main benefit of understanding "${unit}"?`,
    ];
    return templates[index % templates.length];
}

function getFallbackOptions(unit: string, index: number): string[] {
    const optionSets = [
        [
            `To understand and apply ${unit} fundamentals`,
            `To replace all other methodologies`,
            `To complicate the development process`,
            `It has no practical purpose`,
        ],
        [
            `A systematic approach to ${unit}`,
            `An outdated technique`,
            `A purely theoretical concept`,
            `A random methodology`,
        ],
        [
            `When it solves a specific problem efficiently`,
            `Always, in every situation`,
            `Never, it's deprecated`,
            `Only in academic settings`,
        ],
        [
            `It provides structured problem-solving capabilities`,
            `It makes code run slower`,
            `It increases complexity unnecessarily`,
            `It has no real-world applications`,
        ],
        [
            `It focuses on specific aspects while related units cover broader areas`,
            `There is no difference`,
            `It's always better than alternatives`,
            `It's always worse than alternatives`,
        ],
        [
            `It enables more effective and efficient solutions`,
            `It has no benefits`,
            `It only works in specific programming languages`,
            `It requires expensive tools`,
        ],
    ];
    return optionSets[index % optionSets.length];
}
