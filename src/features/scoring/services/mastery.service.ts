import { MasteryRecord, MasteryState } from '../types';
import { xpService } from '@/src/features/scoring/services/xp.service';

const STORAGE_KEY = 'mastery_v1';

const STATE_THRESHOLDS = [
    { state: 'mastered' as MasteryState, min: 95 },
    { state: 'almost_mastered' as MasteryState, min: 76 },
    { state: 'strong' as MasteryState, min: 56 },
    { state: 'weak' as MasteryState, min: 36 },
    { state: 'learning' as MasteryState, min: 16 },
    { state: 'new' as MasteryState, min: 0 }
];

export const masteryService = {
    _getAllRecords: (): Record<string, MasteryRecord> => {
        if (typeof window === 'undefined') return {};
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        try {
            return JSON.parse(raw);
        } catch {
            return {};
        }
    },

    _saveRecords: (records: Record<string, MasteryRecord>) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
        }
    },

    getStateFromPercentage: (percentage: number): MasteryState => {
        const p = Math.max(0, Math.min(100, percentage));
        return STATE_THRESHOLDS.find(t => p >= t.min)?.state || 'new';
    },

    getRecord: (conceptId: string): MasteryRecord => {
        const records = masteryService._getAllRecords();
        return records[conceptId] || {
            conceptId,
            percentage: 0,
            state: 'new',
            lastUpdated: new Date().toISOString()
        };
    },

    applyQuizDelta: (conceptId: string, isCorrect: boolean, isPerfectQuiz: boolean) => {
        const records = masteryService._getAllRecords();
        const existing = masteryService.getRecord(conceptId);

        const delta = isCorrect ? 15 : -10;
        const newPercentage = Math.max(0, Math.min(100, existing.percentage + delta));
        const newState = masteryService.getStateFromPercentage(newPercentage);

        const updated: MasteryRecord = {
            ...existing,
            percentage: newPercentage,
            state: newState,
            lastUpdated: new Date().toISOString()
        };

        records[conceptId] = updated;
        masteryService._saveRecords(records);

        // Check if crossed into mastered threshold
        if (existing.state !== 'mastered' && newState === 'mastered') {
            xpService.earn('concept_mastered');
        }
    }
};
