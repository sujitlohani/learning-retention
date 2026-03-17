// schedule.service.ts — All schedule CRUD + temporal queries
// Currently wraps localStorage. Swap to Supabase here only.

import { StudySchedule, ScheduleSession, SessionResult } from '@/src/types/ai';
import { getUserId } from '@/src/lib/user-store';

const getKey = () => `learning-retention-schedules-${getUserId()}`;

export const scheduleService = {
    getSchedules: (): StudySchedule[] => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(getKey());
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    },

    getScheduleForTopic: (topicId: string): StudySchedule | null => {
        const schedules = scheduleService.getSchedules();
        return schedules.find(s => s.topicId === topicId) || null;
    },

    getScheduleById: (scheduleId: string): StudySchedule | null => {
        const schedules = scheduleService.getSchedules();
        return schedules.find(s => s.id === scheduleId) || null;
    },

    saveSchedule: (schedule: StudySchedule): void => {
        if (typeof window === 'undefined') return;
        const schedules = scheduleService.getSchedules();
        const filtered = schedules.filter(s => s.topicId !== schedule.topicId);
        filtered.push(schedule);
        localStorage.setItem(getKey(), JSON.stringify(filtered));
    },

    getTodaysSessions: (): { schedule: StudySchedule; session: ScheduleSession }[] => {
        const schedules = scheduleService.getSchedules();
        const today = new Date().toISOString().split('T')[0];
        const results: { schedule: StudySchedule; session: ScheduleSession }[] = [];

        schedules.forEach(schedule => {
            schedule.sessions.forEach(session => {
                if (session.date === today && !session.completed) {
                    results.push({ schedule, session });
                }
            });
        });

        return results;
    },

    getUpcomingSessions: (days: number = 7): { schedule: StudySchedule; session: ScheduleSession }[] => {
        const schedules = scheduleService.getSchedules();
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(futureDate.getDate() + days);

        const todayStr = today.toISOString().split('T')[0];
        const futureStr = futureDate.toISOString().split('T')[0];

        const results: { schedule: StudySchedule; session: ScheduleSession }[] = [];

        schedules.forEach(schedule => {
            schedule.sessions.forEach(session => {
                if (session.date >= todayStr && session.date <= futureStr && !session.completed) {
                    results.push({ schedule, session });
                }
            });
        });

        return results.sort((a, b) => a.session.date.localeCompare(b.session.date));
    },

    markSessionComplete: (
        scheduleId: string,
        sessionId: string,
        result: SessionResult
    ): void => {
        const schedules = scheduleService.getSchedules();
        const schedule = schedules.find(s => s.id === scheduleId);
        if (!schedule) return;

        const session = schedule.sessions.find(s => s.id === sessionId);
        if (!session) return;

        session.completed = true;
        session.result = result;

        if (typeof window !== 'undefined') {
            localStorage.setItem(getKey(), JSON.stringify(schedules));
        }
    },

    getScheduleProgress: (scheduleId: string): { completed: number; total: number; percentage: number } => {
        const schedule = scheduleService.getScheduleById(scheduleId);
        if (!schedule) return { completed: 0, total: 0, percentage: 0 };

        const total = schedule.sessions.length;
        const completed = schedule.sessions.filter(s => s.completed).length;
        return {
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
        };
    },

    deleteSchedule: (topicId: string): void => {
        if (typeof window === 'undefined') return;
        const schedules = scheduleService.getSchedules();
        const filtered = schedules.filter(s => s.topicId !== topicId);
        localStorage.setItem(getKey(), JSON.stringify(filtered));
    },
};
