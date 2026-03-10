'use client';

import { useState, useEffect, useCallback } from 'react';
import { TopicProgress } from '../types';
import { progressService } from '../services/progress.service';
import { topicsService } from '@/src/features/topics/services/topics.service';

export function useTopicProgress(topicId: string) {
    const [progress, setProgress] = useState<TopicProgress>({
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
    });

    const loadProgress = useCallback(() => {
        if (!topicId) return;

        // Get concept IDs from the existing topics service for this topic
        const topics = topicsService.getTopics();
        const topic = topics.find(t => t.id === topicId);

        if (topic) {
            const conceptIds = topic.concepts.map(c => c.id);
            setProgress(progressService.getTopicProgress(topicId, conceptIds));
        }
    }, [topicId]);

    useEffect(() => {
        loadProgress();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'mastery_v1' || e.key === 'learning-retention-mvp-data') {
                loadProgress();
            }
        };

        const handleLocalUpdate = () => loadProgress();

        window.addEventListener('storage', handleStorage);
        window.addEventListener('mastery_updated', handleLocalUpdate);
        // Topic concepts might update 
        window.addEventListener('topics_updated', handleLocalUpdate);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('mastery_updated', handleLocalUpdate);
            window.removeEventListener('topics_updated', handleLocalUpdate);
        };
    }, [loadProgress]);

    return progress;
}
