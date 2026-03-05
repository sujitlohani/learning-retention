import { StudyPlan } from './ai';

export type Topic = {
    id: string;
    name: string;
    concepts: Concept[];
    level: 'beginner' | 'intermediate' | 'expert';
    memoryScore: number;
    lastPracticed: Date;
    nextReviewDate: Date;
    totalAttempts: number;
    studyPlan?: StudyPlan;
    scheduleId?: string;
};

export type Concept = {
    id: string;
    text: string;
    status: 'strong' | 'weak' | 'neutral';
    familiar?: boolean;
    aiGenerated?: boolean;
};

export type QuizQuestion = {
    id: string;
    conceptId: string;
    conceptName?: string;
    level?: 'basic' | 'advanced' | 'pitfall';
    question: string;
    type: 'mcq' | 'card' | 'short-answer';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    keywords?: string[];
    acceptableAnswers?: string[];
};

export type QuizResult = {
    topicId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    weakConcepts: string[];
};
