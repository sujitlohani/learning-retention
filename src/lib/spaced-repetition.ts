// Spaced repetition algorithm for session scheduling

/**
 * Generate spaced repetition intervals based on timeframe.
 * Returns an array of day offsets from start date.
 */
export function calculateSessionIntervals(
    timeframeDays: number,
    sessionsPerConcept: number
): number[] {
    const baseIntervals = [0, 1, 3, 7, 14, 21, 30];
    const sessionCount = Math.min(sessionsPerConcept, baseIntervals.length);
    const scaleFactor = timeframeDays / 30;

    const intervals = baseIntervals
        .slice(0, sessionCount)
        .map(day => Math.round(day * scaleFactor));

    if (intervals.length > 0 && intervals[intervals.length - 1] > timeframeDays) {
        intervals[intervals.length - 1] = timeframeDays;
    }

    const unique: number[] = [];
    intervals.forEach(interval => {
        if (unique.length === 0 || interval > unique[unique.length - 1]) {
            unique.push(interval);
        } else {
            unique.push(unique[unique.length - 1] + 1);
        }
    });

    return unique;
}

/**
 * Determine the session type based on its position in the sequence.
 */
export function getSessionType(
    sessionIndex: number,
    totalSessions: number
): 'initial' | 'reinforcement' | 'mixed-review' | 'final-review' {
    if (sessionIndex === 0) return 'initial';
    if (sessionIndex === 1) return 'reinforcement';
    if (sessionIndex === totalSessions - 1) return 'final-review';
    return 'mixed-review';
}

/**
 * Calculate next review date based on quiz performance.
 */
export function calculateNextReview(
    score: number,
    currentIntervalDays: number
): number {
    if (score >= 90) return Math.round(currentIntervalDays * 2.5);
    if (score >= 80) return Math.round(currentIntervalDays * 2.0);
    if (score >= 70) return Math.round(currentIntervalDays * 1.5);
    if (score >= 60) return currentIntervalDays;
    return Math.max(1, Math.round(currentIntervalDays * 0.5));
}
