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
    description?: string;
    useCases?: { title: string; description: string; tag: string }[];
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
    type: 'mcq' | 'card' | 'short-answer' | 'coding';
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    keywords?: string[];
    acceptableAnswers?: string[];
    language?: 'javascript' | 'python';
    starterCode?: string;
    testCases?: {
        input: string;
        expectedOutput: string;
        isHidden: boolean;
    }[];
    hints?: string[];
};

export type QuizResult = {
    topicId: string;
    score: number;
    correctCount: number;
    totalCount: number;
    weakUnits: string[];
    testedUnitIds?: string[];
};
