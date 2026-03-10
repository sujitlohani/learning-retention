import { TopicProgress, TopicProgressBreakdown } from '../types';
import { masteryService } from './mastery.service';
import { xpService } from './xp.service';

export const progressService = {
    // Calculates overall progress for a topic based on how many of its concepts are strong or better
    getTopicProgress: (topicId: string, conceptIds: string[]): TopicProgress => {
        if (!conceptIds || conceptIds.length === 0) {
            return {
                percentage: 0,
                breakdown: {
                    total: 0,
                    mastered: 0,
                    strong: 0,
                    learning: 0,
                    weak: 0,
                    new: 0,
                    almost_mastered: 0
                },
                xpEarned: 0
            };
        }

        const breakdown: TopicProgressBreakdown = {
            total: conceptIds.length,
            mastered: 0,
            strong: 0,
            learning: 0,
            weak: 0,
            new: 0,
            almost_mastered: 0
        };

        let strongOrBetterCount = 0;

        conceptIds.forEach(id => {
            const record = masteryService.getRecord(id);
            breakdown[record.state]++;

            if (record.state === 'strong' || record.state === 'almost_mastered' || record.state === 'mastered') {
                strongOrBetterCount++;
            }
        });

        const percentage = Math.round((strongOrBetterCount / breakdown.total) * 100);

        // Calculate XP earned within this topic by checking history for concept mastery events 
        // Note: For a more true representation, we'd add 'topicId' to the XP transaction itself, 
        // but for MVP, we just take the overall balance or calculate a proxy based on mastery.
        // As a simple proxy for 'XP earned in this topic':
        const xpEarned = (breakdown.mastered * 25) + (strongOrBetterCount * 10);

        return {
            percentage,
            breakdown,
            xpEarned
        };
    }
};
