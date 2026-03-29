// ============================================================
// FILE: src/services/ai/classroom-prompts.ts
// Purpose: Builds prompt strings sent to the HuggingFace AI.
//          Keep prompts concise — responses are capped at 300 tokens.
// ============================================================

import { ClassroomLanguage, ClassroomQuestion } from '@/src/types/classroom';

/**
 * Builds a mentor-style review prompt.
 * Called when the user clicks the "AI Review" button.
 * The AI should give 2-3 sentences of encouraging, constructive feedback.
 */
export function buildReviewPrompt(
  question: ClassroomQuestion,
  language: ClassroomLanguage,
  code: string,
): string {
  return `You are a friendly coding mentor. Review this ${language} code for the problem "${question.title}".
Give feedback in exactly 2-3 sentences. Be encouraging, specific, and concise.
Focus on: correctness, edge cases, and one improvement tip.

Code:
\`\`\`${language}
${code}
\`\`\``;
}

/**
 * Builds an evaluation prompt for non-JS languages (Python, Java, C, C++).
 * The UI reads "VERDICT: PASS" to determine if the student passed —
 * keep the response format EXACTLY as shown below.
 */
export function buildEvaluatePrompt(
  question: ClassroomQuestion,
  language: ClassroomLanguage,
  code: string,
): string {
  const testCaseLines = question.testCases
    .map((tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`)
    .join('\n');

  return `You are a code evaluator. Problem: "${question.title}".

Test cases:
${testCaseLines}

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

/**
 * Builds a single-hint prompt when the user is stuck.
 * The hint should guide without giving away the answer.
 */
export function buildHintPrompt(
  question: ClassroomQuestion,
  language: ClassroomLanguage,
  code: string,
  hintNumber: number,
): string {
  return `The user is stuck on "${question.title}" in ${language}.
Their current code:
\`\`\`${language}
${code}
\`\`\`

Give hint number ${hintNumber}. Be helpful but do not give away the answer. One sentence only.`;
}