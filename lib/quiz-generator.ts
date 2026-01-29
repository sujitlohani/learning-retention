// lib/quiz-generator.ts
import { QuizQuestion, Concept } from "@/types";
import quizDataJson from "./data/quiz-data.json";

type QuizData = Record<string, { displayName: string; questions: QuizQuestion[] }>;

const quizData = quizDataJson as QuizData;

/**
 * Load quiz for a topic
 * - If conceptId is provided → filter questions for that concept
 * - If topic not found → generate mock questions (optionally filtered)
 */
export function loadQuiz(
  topicName: string,
  concepts: Concept[],
  conceptId?: string
): QuizQuestion[] {
  const entry = Object.values(quizData).find(
    (t) => t.displayName.toLowerCase() === topicName.toLowerCase()
  );

  // ---------- JSON-backed questions ----------
  if (entry) {
    const questions = entry.questions;
    // Filter by conceptId if provided
    if (conceptId) {
      const filtered = questions.filter((q) => q.conceptId === conceptId);
      if (filtered.length > 0) {
        return filtered;
      }
    } else {
      return questions;
    }
  }

  // ---------- Mock fallback ----------
  const mockQuestions: QuizQuestion[] = concepts.flatMap((concept, i) => {
    if (conceptId && concept.id !== conceptId) return [];

    return [
      {
        id: `mock-mcq-${i}`,
        conceptId: concept.id,
        level: 'basic',
        type: "mcq",
        question: `What do you know about "${concept.text}"?`,
        options: [
          `Basic idea of ${concept.text}`,
          `Batman-level mysterious knowledge`,
          `Thanos snapped half of it away`,
          `Origin story with no sequel`,
        ],
        correctAnswer: `Basic idea of ${concept.text}`,
        explanation: `Mock question for ${concept.text}`,
      },
      {
        id: `mock-card-${i}`,
        conceptId: concept.id,
        level: 'advanced',
        type: "card",
        question: `Explain "${concept.text}" in your own words.`,
        correctAnswer: `Sample answer for ${concept.text}`,
        explanation: `Mock explanation`,
      },
    ];
  });

  return mockQuestions;
}
