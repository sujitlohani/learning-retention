export type MasteryState = 'new' | 'learning' | 'weak' | 'strong' | 'almost_mastered' | 'mastered';

export interface MasteryRecord {
    conceptId: string;
    percentage: number;
    state: MasteryState;
    lastUpdated: string;
}

export type XPTransactionType = 'earn' | 'spend';
export type XPEarnEvent = 'correct_answer' | 'quiz_completed' | 'perfect_quiz' | 'concept_mastered' | 'daily_streak';

export interface XPTransaction {
    id: string;
    type: XPTransactionType;
    amount: number;
    event?: XPEarnEvent;
    timestamp: string;
}

export interface TopicProgressBreakdown {
    total: number;
    mastered: number;
    strong: number;
    learning: number;
    weak: number;
    new: number;
    almost_mastered: number;
}

export interface TopicProgress {
    percentage: number;
    breakdown: TopicProgressBreakdown;
    xpEarned: number;
}
