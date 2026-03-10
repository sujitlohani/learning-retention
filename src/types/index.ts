import { StudyPlan } from './ai';

export type Topic = {
    id: string;
    name: string;
    units: Unit[];
    level: 'beginner' | 'intermediate' | 'expert';
    memoryScore: number;
    lastPracticed: Date;
    nextReviewDate: Date;
    totalAttempts: number;
    subLevel?: number;
    knowledgeGaps?: string[];
    studyPlan?: StudyPlan;
    scheduleId?: string;
};

export type Unit = {
    id: string;
    text: string;
    description?: string;
    order?: number;
    status: 'strong' | 'weak' | 'neutral';
    familiar?: boolean;
    aiGenerated?: boolean;
};

export type QuizQuestion = {
    id: string;
    unitId: string;
    unitName?: string;
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
    weakUnits: string[];
};
