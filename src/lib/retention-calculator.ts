import { QuizAttempt } from '@/src/types/ai';
import { Topic } from '@/src/types';

export interface Recommendation {
    type: 'weak-unit' | 'ready-for-challenge' | 'challenge-stale';
    topicId: string;
    topicName: string;
    unitId?: string;
    unitName?: string;
    message: string;
}

export function computeUnitScore(topicId: string, unitId: string, allAttempts: QuizAttempt[]): number {
    const relevantAttempts = allAttempts
        .filter(a => a.topicId === topicId && (a.type === 'unit-test' || a.type === 'daily'))
        .filter(a => a.unitBreakdown.some(ub => ub.unitId === unitId))
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
        .slice(0, 5);

    if (relevantAttempts.length === 0) return 0;

    const unitTests = relevantAttempts.filter(a => a.type === 'unit-test');
    const dailyTests = relevantAttempts.filter(a => a.type === 'daily');

    const getAvg = (attempts: QuizAttempt[]) => {
        if (attempts.length === 0) return 0;
        const sum = attempts.reduce((acc, curr) => {
            const ub = curr.unitBreakdown.find(u => u.unitId === unitId);
            return acc + (ub ? ub.score : 0);
        }, 0);
        return sum / attempts.length;
    };

    const unitAvg = getAvg(unitTests);
    const dailyAvg = getAvg(dailyTests);

    if (unitTests.length === 0) return Math.round(dailyAvg);
    if (dailyTests.length === 0) return Math.round(unitAvg);

    return Math.round((unitAvg * 0.7) + (dailyAvg * 0.3));
}

export function computeTopicScore(topic: Topic, allAttempts: QuizAttempt[]): number {
    const topicChallenges = allAttempts
        .filter(a => a.topicId === topic.id && a.type === 'topic-challenge')
        .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    const latestChallenge = topicChallenges[0];
    
    let avgUnitScore = 0;
    if (topic.units.length > 0) {
        let sum = 0;
        for (const unit of topic.units) {
            sum += computeUnitScore(topic.id, unit.id, allAttempts);
        }
        avgUnitScore = sum / topic.units.length;
    }

    if (!latestChallenge) {
        return Math.round(avgUnitScore);
    }

    const daysSince = (new Date().getTime() - new Date(latestChallenge.completedAt).getTime()) / (1000 * 3600 * 24);
    
    if (daysSince <= 30) {
        return Math.round((latestChallenge.score * 0.6) + (avgUnitScore * 0.4));
    } else {
        return Math.round((latestChallenge.score * 0.4) + (avgUnitScore * 0.6));
    }
}

export function computeOverallMastery(topics: Topic[], allAttempts: QuizAttempt[]): number {
    let totalScoreWeight = 0;
    let totalUnits = 0;
    
    for (const topic of topics) {
        const tScore = computeTopicScore(topic, allAttempts);
        const uCount = topic.units.length;
        totalScoreWeight += tScore * uCount;
        totalUnits += uCount;
    }
    
    if (totalUnits === 0) return 0;
    return Math.round(totalScoreWeight / totalUnits);
}

export function scoreTopicPriority(topic: Topic, allAttempts: QuizAttempt[]): number {
    const topicScore = computeTopicScore(topic, allAttempts);
    
    const daysSince = topic.lastPracticed 
        ? (new Date().getTime() - new Date(topic.lastPracticed).getTime()) / (1000 * 3600 * 24)
        : 14; 
        
    let hasWeakUnits = false;
    for (const unit of topic.units) {
        const score = computeUnitScore(topic.id, unit.id, allAttempts);
        // Only consider it weak if they've actually attempted it, or just strictly < 60
        // We strictly follow: hasWeakUnits = any unit with computeUnitScore < 60
        // But if an unattempted unit is score 0, it pushes priority. That works well to encourage practice.
        if (score < 60) {
            hasWeakUnits = true;
            break;
        }
    }
    
    return ((1 - (topicScore / 100)) * 0.4) + (daysSince * 0.35) + (hasWeakUnits ? 0.25 : 0);
}

export function checkThresholds(topics: Topic[], allAttempts: QuizAttempt[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const topic of topics) {
        const tScore = computeTopicScore(topic, allAttempts);
        
        // Topic Challenge Checks
        const topicChallenges = allAttempts
            .filter(a => a.topicId === topic.id && a.type === 'topic-challenge')
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
            
        const latestChallenge = topicChallenges[0];
        
        // Unit Checks
        for (const unit of topic.units) {
            const uScore = computeUnitScore(topic.id, unit.id, allAttempts);
            // Only flag weak if they've at least attempted it, otherwise Home gets spammed with "has dropped" for new units
            const hasAttempts = allAttempts.some(a => a.topicId === topic.id && a.unitBreakdown.some(ub => ub.unitId === unit.id));
            if (hasAttempts && uScore < 60) {
                recommendations.push({
                    type: 'weak-unit',
                    topicId: topic.id,
                    topicName: topic.name,
                    unitId: unit.id,
                    unitName: unit.text,
                    message: `⚠ ${unit.text} has dropped — review now`
                });
            }
        }
        
        // Topic ready for challenge
        // Using >= 75 as it logically maps to "Ready for Challenge" prompt
        if (tScore >= 75) {
            recommendations.push({
                type: 'ready-for-challenge',
                topicId: topic.id,
                topicName: topic.name,
                message: `🎯 ${topic.name} is ready for a Challenge`
            });
        }
        
        // Topic Challenge Stale
        if (latestChallenge) {
            const daysSinceChallenge = (new Date().getTime() - new Date(latestChallenge.completedAt).getTime()) / (1000 * 3600 * 24);
            if (daysSinceChallenge > 14) {
                recommendations.push({
                    type: 'challenge-stale',
                    topicId: topic.id,
                    topicName: topic.name,
                    message: `🔁 ${topic.name} hasn't been challenged in 14 days`
                });
            }
        }
    }

    return recommendations;
}
