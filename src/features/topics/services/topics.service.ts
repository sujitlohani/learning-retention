// topics.service.ts — All topic CRUD operations
// Currently wraps localStorage. Swap to Supabase here only.

import { Topic, QuizResult, Concept } from '@/src/types';

const STORAGE_KEY = 'learning-retention-mvp-data';

export const topicsService = {
    _saveTopics: (topics: Topic[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
        }
    },

    getTopics: (): Topic[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data, (key, value) => {
            if (key === 'lastPracticed' || key === 'nextReviewDate') return new Date(value);
            return value;
        });
    },

    saveTopic: (topic: Topic) => {
        const topics = topicsService.getTopics();
        const existingIndex = topics.findIndex((t) => t.id === topic.id);

        if (existingIndex >= 0) {
            topics[existingIndex] = topic;
        } else {
            topics.push(topic);
        }

        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
        }
    },

    createTopic: (name: string, level: 'beginner' | 'intermediate' | 'expert' = 'beginner'): Topic => {
        const newTopic: Topic = {
            id: crypto.randomUUID(),
            name,
            concepts: [],
            memoryScore: 0,
            lastPracticed: new Date(),
            nextReviewDate: new Date(),
            totalAttempts: 0,
            level
        };

        topicsService.saveTopic(newTopic);
        return newTopic;
    },

    updateTopicAfterQuiz: (topicId: string, result: QuizResult) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        // Weighted average memory score
        const newMemoryScore = Math.round((topic.memoryScore * topic.totalAttempts + result.score) / (topic.totalAttempts + 1));
        topic.memoryScore = newMemoryScore;
        topic.totalAttempts += 1;
        topic.lastPracticed = new Date();

        // Naive spaced repetition: score > 80 → 72h, > 60 → 24h, else → 4h
        const hoursToAdd = result.score > 80 ? 72 : result.score > 60 ? 24 : 4;
        topic.nextReviewDate = new Date(Date.now() + 1000 * 60 * 60 * hoursToAdd);

        // Update concept statuses
        topic.concepts = topic.concepts.map(c => {
            if (result.weakConcepts.includes(c.id)) return { ...c, status: 'weak' as const };
            return { ...c, status: 'strong' as const };
        });

        topicsService.saveTopic(topic);
    },

    deleteTopic: (id: string) => {
        const topics = topicsService.getTopics();
        const filtered = topics.filter(t => t.id !== id);
        topicsService._saveTopics(filtered);
    },

    updateTopic: (updatedTopic: Topic): void => {
        const topics = topicsService.getTopics();
        const index = topics.findIndex(t => t.id === updatedTopic.id);
        if (index !== -1) {
            topics[index] = updatedTopic;
            topicsService._saveTopics(topics);
        }
    },

    updateConceptFamiliarity: (topicId: string, conceptId: string, familiar: boolean) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        topic.concepts = topic.concepts.map(c =>
            c.id === conceptId ? { ...c, familiar } : c
        );

        topicsService.saveTopic(topic);
    },

    addCustomConcept: (topicId: string, conceptText: string) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        const newConcept: Concept = {
            id: crypto.randomUUID(),
            text: conceptText,
            status: 'neutral',
            familiar: false
        };

        topic.concepts.push(newConcept);
        topicsService.saveTopic(topic);
        return newConcept;
    },

    deleteConcept: (topicId: string, conceptId: string) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        topic.concepts = topic.concepts.filter(c => c.id !== conceptId);
        topicsService.saveTopic(topic);
    },

    checkDuplicateName: (name: string): boolean => {
        const topics = topicsService.getTopics();
        return topics.some(t => t.name.toLowerCase().trim() === name.toLowerCase().trim());
    }
};
