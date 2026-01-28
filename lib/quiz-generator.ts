// lib/quiz-generator.ts
import { QuizQuestion, Concept } from "@/types";

// Import JSON directly
import quizDataJson from "./data/quiz-data.json";

type QuizData = Record<string, { displayName: string; questions: QuizQuestion[] }>;

const quizData = quizDataJson as QuizData;

/**
 * Load quiz for a topic name (matches topic.name in storage)
 * If topic not found in JSON, generate mock questions from concepts
 */
export function loadQuiz(topicName: string, concepts: Concept[]): QuizQuestion[] {
  const entry = Object.values(quizData).find(
    (t) => t.displayName.toLowerCase() === topicName.toLowerCase()
  );

  if (entry) return entry.questions;

  // Fallback: generate mock questions from concepts
  const mockQuestions: QuizQuestion[] = concepts.flatMap((concept, i) => [
    {
      id: `mock-mcq-${i}`,
      conceptId: concept.id,
      type: 'mcq',
      question: `What do you know about "${concept.text}"?`,
      options: [
        `Basic idea of ${concept.text}`,
        `It is the Batman of this codebase (dark, necessary, misunderstood`,
        `but Thanos snapped half the ${concept.text} away`,
        `It is someone whose origin story never got a sequel`,
      ],
      correctAnswer: `Basic idea of ${concept.text}`,
      explanation: `This is a mock question about ${concept.text}`,
    },
    {
      id: `mock-card-${i}`,
      conceptId: concept.id,
      type: 'card',
      question: `Explain "${concept.text}" in your own words.`,
      correctAnswer: `This is a sample answer for ${concept.text}`,
      explanation: `This is a mock card question about ${concept.text}`,
    },
  ]);

  return mockQuestions;
}

/**
 * Optional: get all available topic names
 */
export function getAvailableTopics() {
  return Object.values(quizData).map((t) => t.displayName);
}
