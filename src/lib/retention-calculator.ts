import { QuizAttempt } from '@/src/types/ai';
import { Topic } from '@/src/types';

/**
 * Calculates time-decayed retention scores using exponential decay.
 * Formula: decayed_score = base_score * e^(-elapsed_days / half_life_days)
 */

interface DecayConfig {
    halfLifeDays: number;
}

const LEVEL_CONFIGS: Record<string, DecayConfig> = {
    beginner: { halfLifeDays: 3 },
    intermediate: { halfLifeDays: 7 },
    expert: { halfLifeDays: 14 },
};

export const retentionCalculator = {
    /**
     * Calculates the time-decayed score for a specific unit based on its history.
     */
    calculateUnitScore: (unitId: string, history: QuizAttempt[], topicLevel: string = 'beginner'): number => {
        const config = LEVEL_CONFIGS[topicLevel] || LEVEL_CONFIGS.beginner;
        const now = new Date().getTime();

        const unitAttempts = history.filter(h =>
            h.unitBreakdown.some(cb => cb.unitId === unitId)
        );

        if (unitAttempts.length === 0) return 0;

        let totalWeightedScore = 0;
        let totalWeight = 0;

        unitAttempts.forEach(attempt => {
            const unitData = attempt.unitBreakdown.find(cb => cb.unitId === unitId);
            if (!unitData) return;

            const attemptDate = new Date(attempt.completedAt).getTime();
            const daysElapsed = (now - attemptDate) / (1000 * 60 * 60 * 24);

            const lambda = Math.LN2 / config.halfLifeDays;
            const weight = Math.exp(-lambda * daysElapsed);

            totalWeightedScore += unitData.score * weight;
            totalWeight += weight;
        });

        if (totalWeight === 0) return 0;

        return Math.round(totalWeightedScore / totalWeight);
    },

    /**
     * Calculates the overall time-decayed score for a Topic.
     */
    calculateTopicScore: (topic: Topic, history: QuizAttempt[]): number => {
        if (topic.units.length === 0 || history.length === 0) return 0;

        let totalScore = 0;
        let unitsWithScore = 0;

        topic.units.forEach(unit => {
            const unitScore = retentionCalculator.calculateUnitScore(unit.id, history, topic.level);
            const hasHistory = history.some(h => h.unitBreakdown.some(cb => cb.unitId === unit.id));
            if (hasHistory) {
                totalScore += unitScore;
                unitsWithScore++;
            }
        });

        if (unitsWithScore === 0) return 0;

        return Math.round(totalScore / unitsWithScore);
    }
};
