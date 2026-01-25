import { Concept, QuizQuestion } from "@/types";

export const generateQuiz = (topicName: string, concepts: Concept[]): QuizQuestion[] => {
    // In a real app, this would call an LLM. 
    // For MVP, we use templates based on the topic/concepts.

    return concepts.map((concept, index) => {
        // Alternating types for variety
        const type = index % 2 === 0 ? 'mcq' : 'card';

        if (type === 'mcq') {
            return {
                id: `q-${index}`,
                question: `Which of the following best describes "${concept.text}" in the context of ${topicName}?`,
                type: 'mcq',
                options: [
                    `It is the primary driver of ${topicName}.`, // Generic correct-looking answer
                    `It has no relation to ${topicName}.`,
                    `It is an outdated theory in ${topicName}.`,
                    `It is the opposite of ${topicName}.`
                ],
                correctAnswer: `It is the primary driver of ${topicName}.`, // Always the first one for this mock logic
                explanation: `"${concept.text}" is a fundamental component of ${topicName}.`
            };
        } else {
            return {
                id: `q-${index}`,
                question: `Explain the concept of "${concept.text}".`,
                type: 'card',
                correctAnswer: `(Self-assessed) ${concept.text} involves...`,
                explanation: `Key points: Definition, Importance, and Application of ${concept.text}.`
            };
        }
    });
};
