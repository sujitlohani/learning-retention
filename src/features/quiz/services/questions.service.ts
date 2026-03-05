// questions.service.ts — All quiz question CRUD
// Currently wraps localStorage. Swap to Supabase here only.

import { AIGeneratedQuestion } from '@/src/types/ai';

const QUESTIONS_KEY = 'learning-retention-questions';

export const questionsService = {
    getQuestions: (): AIGeneratedQuestion[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(QUESTIONS_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    },

    getQuestionsForTopic: (topicId: string): AIGeneratedQuestion[] => {
        return questionsService.getQuestions().filter(q => q.topicId === topicId);
    },

    getQuestionsForConcept: (topicId: string, conceptId: string): AIGeneratedQuestion[] => {
        return questionsService.getQuestions().filter(
            q => q.topicId === topicId && q.conceptId === conceptId
        );
    },

    getQuestionsForSession: (
        topicId: string,
        conceptIds: string[],
        count: number
    ): AIGeneratedQuestion[] => {
        const allQuestions = questionsService.getQuestions().filter(
            q => q.topicId === topicId && conceptIds.includes(q.conceptId)
        );

        // Shuffle and pick the requested count
        const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    },

    saveQuestions: (questions: AIGeneratedQuestion[]): void => {
        if (typeof window === 'undefined') return;
        const existing = questionsService.getQuestions();
        const existingIds = new Set(existing.map(q => q.id));

        const newQuestions = questions.filter(q => !existingIds.has(q.id));
        const combined = [...existing, ...newQuestions];

        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(combined));
    },

    deleteQuestionsForTopic: (topicId: string): void => {
        if (typeof window === 'undefined') return;
        const questions = questionsService.getQuestions();
        const filtered = questions.filter(q => q.topicId !== topicId);
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
    },

    deleteQuestionsForConcept: (topicId: string, conceptId: string): void => {
        if (typeof window === 'undefined') return;
        const questions = questionsService.getQuestions();
        const filtered = questions.filter(q => !(q.topicId === topicId && q.conceptId === conceptId));
        localStorage.setItem(QUESTIONS_KEY, JSON.stringify(filtered));
    },

    hasQuestionsForTopic: (topicId: string): boolean => {
        return questionsService.getQuestionsForTopic(topicId).length > 0;
    },

    getQuestionCountByConcept: (topicId: string): Record<string, number> => {
        const questions = questionsService.getQuestionsForTopic(topicId);
        const counts: Record<string, number> = {};
        questions.forEach(q => {
            counts[q.conceptId] = (counts[q.conceptId] || 0) + 1;
        });
        return counts;
    },
};
