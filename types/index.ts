export type Topic = {
    id: string;
    name: string;
    concepts: Concept[];
    memoryScore: number; // 0-100
    lastPracticed: Date;
    nextReviewDate: Date;
    totalAttempts: number;
};

export type Concept = {
    id: string;
    text: string;
    status: 'strong' | 'weak' | 'neutral';
};

export type QuizQuestion = {
    id: string;
    conceptId: string;
    question: string;
    type: 'mcq' | 'card';
    options?: string[];
    correctAnswer: string;
    explanation: string;
};

export type QuizResult = {
    topicId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    weakConcepts: string[]; // ids of weak concepts
};
