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
            const parsed = JSON.parse(raw) as QuizAttempt[];
            // Shim: normalise legacy type values
            return parsed.map(attempt => ({
                ...attempt,
                type: (attempt.type as any) === 'unit' ? 'unit-test'
                    : (attempt.type as any) === 'topic' ? 'topic-challenge'
                    : attempt.type
            }));
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

    getHistoryForUnit: (topicId: string, unitId: string): QuizAttempt[] => {
        const topicHistory = quizHistoryService.getHistoryForTopic(topicId);
        return topicHistory.filter(h =>
            h.targetUnitId === unitId ||
            h.unitBreakdown.some(b => b.unitId === unitId)
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

    getAttemptsByTopicId: (topicId: string): QuizAttempt[] => {
        return quizHistoryService.getHistoryForTopic(topicId);
    },

    getUnitStats: (unitId: string): { accuracy: number; attempts: number; lastPracticed: string | null } => {
        const history = quizHistoryService.getAllHistory();
        
        // Find all attempts that cover this unit
        const unitAttempts = history.filter(h => 
            h.targetUnitId === unitId || 
            h.unitBreakdown.some(b => b.unitId === unitId)
        );

        if (unitAttempts.length === 0) {
            return { accuracy: 0, attempts: 0, lastPracticed: null };
        }

        let totalCorrect = 0;
        let totalCount = 0;
        let latestDate: Date | null = null;

        for (const attempt of unitAttempts) {
            const attemptDate = new Date(attempt.completedAt);
            if (!latestDate || attemptDate > latestDate) {
                latestDate = attemptDate;
            }

            if (attempt.targetUnitId === unitId) {
                totalCorrect += attempt.correctCount;
                totalCount += attempt.totalCount;
            } else {
                const breakdown = attempt.unitBreakdown.find(b => b.unitId === unitId);
                if (breakdown) {
                    totalCorrect += breakdown.correctCount;
                    totalCount += breakdown.totalCount;
                }
            }
        }

        const accuracy = totalCount > 0 ? Math.round((totalCorrect / totalCount) * 100) : 0;

        return {
            accuracy,
            attempts: unitAttempts.length,
            lastPracticed: latestDate ? latestDate.toISOString() : null
        };
    },

    computeUnitAccuracy: (topicId: string, unitId: string): number => {
        const history = quizHistoryService.getHistoryForTopic(topicId);
        
        const unitAttempts = history.filter(h => 
            h.targetUnitId === unitId || 
            h.unitBreakdown.some(b => b.unitId === unitId)
        );

        if (unitAttempts.length === 0) return 0;

        let sumScores = 0;
        let count = 0;

        for (const attempt of unitAttempts) {
            if (attempt.targetUnitId === unitId) {
                sumScores += attempt.score;
                count++;
            } else {
                const breakdown = attempt.unitBreakdown.find(b => b.unitId === unitId);
                if (breakdown) {
                    sumScores += breakdown.score;
                    count++;
                }
            }
        }

        return count > 0 ? Math.round(sumScores / count) : 0;
    },

    getAccuracyOverTime: (topicId: string): { date: string; score: number }[] => {
        const history = quizHistoryService.getHistoryForTopic(topicId);
        if (history.length === 0) return [];

        // Group by date (YYYY-MM-DD)
        const dailyScores: Record<string, { totalScore: number; count: number }> = {};

        // Sort ascending by time for chronologial chart
        const sortedHistory = [...history].sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime());

        sortedHistory.forEach(attempt => {
            const dateStr = new Date(attempt.completedAt).toISOString().split('T')[0];
            if (!dailyScores[dateStr]) {
                dailyScores[dateStr] = { totalScore: 0, count: 0 };
            }
            dailyScores[dateStr].totalScore += attempt.score;
            dailyScores[dateStr].count += 1;
        });

        // Convert to array of {date, score} averaging multiple attempts per day
        return Object.entries(dailyScores).map(([date, data]) => ({
            date,
            score: Math.round(data.totalScore / data.count)
        }));
    },

    getPracticeDistribution: (topicId: string): { unitId: string; unitName: string; count: number }[] => {
        const history = quizHistoryService.getHistoryForTopic(topicId);
        const distribution: Record<string, { name: string; count: number }> = {};

        history.forEach(attempt => {
            attempt.unitBreakdown.forEach(breakdown => {
                if (!distribution[breakdown.unitId]) {
                    distribution[breakdown.unitId] = { name: breakdown.unitName || 'Unknown Unit', count: 0 };
                }
                distribution[breakdown.unitId].count += 1; // Count sessions/attempts covering this unit
            });
        });

        return Object.entries(distribution)
            .map(([unitId, data]) => ({
                unitId,
                unitName: data.name,
                count: data.count
            }))
            .sort((a, b) => b.count - a.count); // sort most practiced first
    },

    getAllAttempts: (): QuizAttempt[] => {
        return quizHistoryService.getAllHistory();
    },

    getWeekOverWeekChange: (): number => {
        const history = quizHistoryService.getAllHistory();
        if (history.length === 0) return 0;

        const now = new Date();
        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - now.getDay());
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfLastWeek = new Date(startOfThisWeek);
        startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

        const thisWeekAttempts = history.filter(a => new Date(a.completedAt) >= startOfThisWeek);
        const lastWeekAttempts = history.filter(a => {
            const d = new Date(a.completedAt);
            return d >= startOfLastWeek && d < startOfThisWeek;
        });

        const avg = (arr: QuizAttempt[]) => arr.length === 0 ? 0 : arr.reduce((s, a) => s + a.score, 0) / arr.length;

        return Math.round((avg(thisWeekAttempts) - avg(lastWeekAttempts)) * 10) / 10;
    }
};
