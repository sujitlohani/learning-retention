// quiz-history.service.ts — Quiz attempt history CRUD
// Currently wraps localStorage. Swap to Supabase here only.

import { QuizAttempt } from '@/src/types/ai';

const STORAGE_KEY = 'learning_loop_quiz_history';

export const quizHistoryService = {
    getAllHistory: (): QuizAttempt[] => {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.error('Failed to parse quiz history', e);
            return [];
        }
    },

    getHistoryForTopic: (topicId: string): QuizAttempt[] => {
        const history = quizHistoryService.getAllHistory();
        return history
            .filter(h => h.topicId === topicId)
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    },

    getHistoryForConcept: (topicId: string, conceptId: string): QuizAttempt[] => {
        const topicHistory = quizHistoryService.getHistoryForTopic(topicId);
        return topicHistory.filter(h =>
            h.targetConceptId === conceptId ||
            h.conceptBreakdown.some(b => b.conceptId === conceptId)
        );
    },

    saveAttempt: (attempt: QuizAttempt): void => {
        if (typeof window === 'undefined') return;
        const history = quizHistoryService.getAllHistory();
        history.push(attempt);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    },

    deleteHistoryForTopic: (topicId: string): void => {
        if (typeof window === 'undefined') return;
        const history = quizHistoryService.getAllHistory();
        const filtered = history.filter(h => h.topicId !== topicId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },
};
