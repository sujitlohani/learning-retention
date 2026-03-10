'use client';

import { useState, useEffect, useCallback } from 'react';
import { MasteryRecord } from '../types';
import { masteryService } from '../services/mastery.service';

export function useMastery(conceptId: string) {
    const [record, setRecord] = useState<MasteryRecord | null>(null);

    const loadRecord = useCallback(() => {
        if (!conceptId) return;
        setRecord(masteryService.getRecord(conceptId));
    }, [conceptId]);

    useEffect(() => {
        loadRecord();

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'mastery_v1') {
                loadRecord();
            }
        };

        const handleLocalUpdate = () => loadRecord();

        window.addEventListener('storage', handleStorage);
        window.addEventListener('mastery_updated', handleLocalUpdate);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('mastery_updated', handleLocalUpdate);
        };
    }, [loadRecord]);

    const updateMastery = useCallback((isCorrect: boolean, isPerfectQuiz: boolean = false) => {
        if (!conceptId) return;
        masteryService.applyQuizDelta(conceptId, isCorrect, isPerfectQuiz);
        window.dispatchEvent(new Event('mastery_updated'));

        // Also fire xp update just in case a boundary was crossed
        window.dispatchEvent(new Event('xp_updated'));

        loadRecord();
    }, [conceptId, loadRecord]);

    return {
        record: record || { conceptId, percentage: 0, state: 'new', lastUpdated: new Date().toISOString() },
        updateMastery
    };
}
