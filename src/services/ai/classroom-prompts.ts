// src/services/ai/classroom-prompts.ts

import { ClassroomLanguage, ClassroomQuestion } from '@/src/types/classroom';

export function buildReviewPrompt(question: ClassroomQuestion, language: ClassroomLanguage, code: string): string {
  return `You are a friendly coding mentor. Review this ${language} code for the problem "${question.title}".
Give feedback in exactly 2-3 sentences. Be encouraging, specific, and concise.
Focus on: correctness, edge cases, and one improvement tip.

Code:
\`\`\`${language}
${code}
\`\`\``;
}

export function buildEvaluatePrompt(question: ClassroomQuestion, language: ClassroomLanguage, code: string): string {
  return `You are a code evaluator. Problem: "${question.title}".

Test cases:
${question.testCases.map((tc, i) => `${i + 1}. Input: ${tc.input} → Expected output: ${tc.expectedOutput}`).join('\n')}

User's ${language} code:
\`\`\`${language}
${code}
\`\`\`

Reply in EXACTLY this format and nothing else:
VERDICT: PASS
REASON: one sentence explaining why it passes all test cases

Or if wrong:
VERDICT: FAIL
REASON: one sentence explaining what is wrong`;
}

export function buildHintPrompt(question: ClassroomQuestion, language: ClassroomLanguage, code: string, hintNumber: number): string {
  return `The user is stuck on "${question.title}" in ${language}.
Their current code:
\`\`\`${language}
${code}
\`\`\`

Give hint number ${hintNumber}. Be helpful but don't give away the answer. One sentence only.`;
}