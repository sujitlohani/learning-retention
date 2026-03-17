// topics.service.ts — All topic CRUD operations
// Currently wraps localStorage. Swap to Supabase here only.

import { Topic, QuizResult, Unit } from '@/src/types';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { computeTopicScore, computeUnitScore } from '@/src/lib/retention-calculator';
import { getUserId } from '@/src/lib/user-store';

const getKey = () => `learning-retention-mvp-data-${getUserId()}`;

export const topicsService = {
    _saveTopics: (topics: Topic[]) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(getKey(), JSON.stringify(topics));
        }
    },

    getTopics: (): Topic[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(getKey());
        if (!data) return [];
        return JSON.parse(data, (key, value) => {
            if (key === 'lastPracticed' || key === 'nextReviewDate') return new Date(value);
            return value;
        });
    },

    getTopicById: (id: string): Topic | undefined => {
        const topics = topicsService.getTopics();
        return topics.find(t => t.id === id);
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
            localStorage.setItem(getKey(), JSON.stringify(topics));
        }
    },

    createTopic: (name: string, level: 'beginner' | 'intermediate' | 'expert' = 'beginner'): Topic => {
        const newTopic: Topic = {
            id: crypto.randomUUID(),
            name,
            units: [],
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

        topic.totalAttempts += 1;
        topic.lastPracticed = new Date();

        // Calculate advanced memory score instead of naive running average
        const allAttempts = quizHistoryService.getAllAttempts();
        topic.memoryScore = Math.round(computeTopicScore(topic, allAttempts));

        // Naive spaced repetition: score > 80 → 72h, > 60 → 24h, else → 4h
        const hoursToAdd = result.score > 80 ? 72 : result.score > 60 ? 24 : 4;
        topic.nextReviewDate = new Date(Date.now() + 1000 * 60 * 60 * hoursToAdd);

        // Sub-level adjustment
        if (result.score >= 80) {
            topic.subLevel = Math.min((topic.subLevel || 1) + 1, 5);
        } else if (result.score < 50) {
            topic.subLevel = Math.max((topic.subLevel || 1) - 1, 1);
        }

        // Update unit statuses — only for tested units based on new 60/75 thresholds
        const topicAttempts = allAttempts.filter(a => a.topicId === topicId);
        const latestAttempt = topicAttempts[topicAttempts.length - 1];
        const sessionUnitIds = latestAttempt ? latestAttempt.unitBreakdown.map(b => b.unitId) : [];

        topic.units = topic.units.map(u => {
            if (!sessionUnitIds.includes(u.id)) return u;
            
            const uScore = quizHistoryService.computeUnitAccuracy(topic.id, u.id);
            if (uScore >= 75) return { ...u, status: 'strong' as const };
            if (uScore < 50) return { ...u, status: 'weak' as const };
            return { ...u, status: 'neutral' as const };
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

    updateUnitFamiliarity: (topicId: string, unitId: string, familiar: boolean) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        topic.units = topic.units.map(u =>
            u.id === unitId ? { ...u, familiar } : u
        );

        topicsService.saveTopic(topic);
    },

    addCustomUnit: (topicId: string, unitText: string) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        const newUnit: Unit = {
            id: crypto.randomUUID(),
            text: unitText,
            status: 'neutral',
            familiar: false
        };

        topic.units.push(newUnit);
        topicsService.saveTopic(topic);
        return newUnit;
    },

    deleteUnit: (topicId: string, unitId: string) => {
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);
        if (!topic) return;

        topic.units = topic.units.filter(u => u.id !== unitId);
        topicsService.saveTopic(topic);
    },

    checkDuplicateName: (name: string): boolean => {
        const topics = topicsService.getTopics();
        return topics.some(t => t.name.toLowerCase().trim() === name.toLowerCase().trim());
    }
};
