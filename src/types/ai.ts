// AI-related types for unit generation, quiz generation, scheduling

// === Unit Generation ===
export interface UnitGenerationRequest {
    topic: string;
    level: 'beginner' | 'intermediate' | 'expert';
}

export interface UnitGenerationResponse {
    units: string[];
    success: boolean;
    error?: string;
}

// === Quiz Generation ===
export interface QuizGenerationRequest {
    topic: string;
    unit: string;
    level: 'beginner' | 'intermediate' | 'expert';
    count?: number;
}

export interface QuizGenerationResponse {
    questions: AIGeneratedQuestion[];
    success: boolean;
    error?: string;
}

export interface AIGeneratedQuestion {
    id: string;
    topicId: string;
    unitId: string;
    unitName?: string;
    type: 'mcq' | 'short-answer';
    difficulty: 'beginner' | 'intermediate' | 'expert';
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    keywords: string[];
    acceptableAnswers?: string[];
    validationScore: number;
    aiGenerated: boolean;
    createdAt: string;
}

// === Schedule Generation ===
export interface ScheduleGenerationRequest {
    topicId: string;
    units: { id: string; name: string }[];
    timeframeDays: number;
    dailyMinutes: number;
}

export interface ScheduleGenerationResponse {
    schedule: StudySchedule;
    success: boolean;
    error?: string;
}

export interface StudySchedule {
    id: string;
    topicId: string;
    sessions: ScheduleSession[];
    createdAt: string;
}

export interface ScheduleSession {
    id: string;
    date: string;
    unitIds: string[];
    type: 'initial' | 'reinforcement' | 'mixed-review' | 'final-review';
    questionCount: number;
    estimatedMinutes: number;
    completed: boolean;
    result: SessionResult | null;
}

export interface SessionResult {
    score: number;
    correctCount: number;
    totalCount: number;
    completedAt: string;
}

// === Validation ===
export interface ValidationResult {
    isValid: boolean;
    score: number;
    issues: string[];
    warnings: string[];
    flagForReview: boolean;
}

// === Study Plan (stored on Topic) ===
export interface StudyPlan {
    selectedTimeframe: string;
    timeframeDays: number;
    dailyMinutes: number;
    targetDate: string;
    questionsPerSession: number;
}

// === Quiz History ===
export interface QuizAttempt {
    id: string;
    topicId: string;
    sessionId?: string;
    type: 'topic' | 'unit';
    targetUnitId?: string;
    score: number;
    correctCount: number;
    totalCount: number;
    completedAt: string;
    durationSeconds?: number;
    questions: {
        questionId: string;
        unitId: string;
        unitName?: string;
        questionText?: string;
        explanation?: string;
        isCorrect: boolean;
        userAnswer: string;
        correctAnswer: string;
        timeSpentSeconds?: number;
    }[];
    unitBreakdown: {
        unitId: string;
        unitName?: string;
        correctCount: number;
        totalCount: number;
        score: number;
    }[];
}
