'use client';

import { useState, useEffect, useCallback } from 'react';
import { scheduleService } from '@/src/features/schedule/services/schedule.service';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { StudySchedule, ScheduleSession } from '@/src/types/ai';
import { Topic } from '@/src/types';

export interface DueSession {
    schedule: StudySchedule;
    session: ScheduleSession;
    topic: Topic | null;
}

export function useSchedule() {
    const [todaySessions, setTodaySessions] = useState<DueSession[]>([]);
    const [upcomingSessions, setUpcomingSessions] = useState<DueSession[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(() => {
        const topics = topicsService.getTopics();
        const topicMap = new Map(topics.map(t => [t.id, t]));

        const todayRaw = scheduleService.getTodaysSessions();
        const upcomingRaw = scheduleService.getUpcomingSessions(7);

        const todayStr = new Date().toISOString().split('T')[0];

        setTodaySessions(todayRaw.map(r => ({
            ...r,
            topic: topicMap.get(r.schedule.topicId) || null,
        })));

        // Exclude today's sessions from upcoming
        setUpcomingSessions(
            upcomingRaw
                .filter(r => r.session.date !== todayStr)
                .map(r => ({
                    ...r,
                    topic: topicMap.get(r.schedule.topicId) || null,
                }))
        );

        setIsLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        todaySessions,
        upcomingSessions,
        isLoading,
        refresh,
    };
}
