'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Calendar, Clock } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { useSchedule, DueSession } from '@/src/features/schedule/hooks/useSchedule';
import { Topic } from '@/src/types';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
}

function DueSessionCard({ dueSession }: { dueSession: DueSession }) {
    const { topic, session } = dueSession;
    if (!topic) return null;

    const scoreColor = getScoreColor(topic.memoryScore);
    // Get concept names from ids
    const conceptNames = session.conceptIds
        .map(id => topic.concepts.find(c => c.id === id)?.text)
        .filter(Boolean)
        .slice(0, 4);

    return (
        <Link href={`/learn/${topic.id}?session=${session.id}`}>
            <motion.div
                className="group flex flex-col gap-4 p-6 transition-ui cursor-pointer"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-resting)',
                }}
            >
                {/* Top row — topic name + score */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{topic.name}</h3>
                        {/* Concept pills */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {conceptNames.map((name) => (
                                <span
                                    key={name}
                                    className="text-xs font-medium px-2.5 py-1"
                                    style={{
                                        background: 'var(--bg-raised)',
                                        color: 'var(--text-muted)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                >
                                    {name}
                                </span>
                            ))}
                            {session.conceptIds.length > 4 && (
                                <span
                                    className="text-xs font-medium px-2.5 py-1"
                                    style={{
                                        background: 'var(--bg-raised)',
                                        color: 'var(--text-muted)',
                                        borderRadius: 'var(--radius-sm)',
                                    }}
                                >
                                    +{session.conceptIds.length - 4}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Large score numeral — color-coded, no ring */}
                    <div className="text-right flex-shrink-0">
                        <div
                            className="text-5xl font-bold leading-none"
                            style={{ color: scoreColor }}
                        >
                            {topic.memoryScore}
                        </div>
                        <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            Topic score
                        </div>
                    </div>
                </div>

                {/* Bottom row — meta + action */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1">
                            {session.questionCount} questions
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            ~{session.estimatedMinutes} min
                        </span>
                    </div>
                    <button
                        className="flex items-center gap-2 h-10 px-5 text-sm font-bold text-white transition-ui"
                        style={{
                            background: 'var(--accent)',
                            borderRadius: '9999px',
                        }}
                    >
                        Start Session
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </Link>
    );
}

export function HomeDashboard() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const { todaySessions, upcomingSessions, isLoading } = useSchedule();

    useEffect(() => {
        setTopics(topicsService.getTopics());
    }, []);

    const hasTopics = topics.length > 0;

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-10">
            {/* Header */}
            <motion.div
                className="space-y-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                    {getGreeting()}
                </h1>
                <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
                    {hasTopics
                        ? todaySessions.length > 0
                            ? `You have ${todaySessions.length} session${todaySessions.length !== 1 ? 's' : ''} due today.`
                            : 'Nothing due today.'
                        : 'Add your first topic to start learning.'}
                </p>
            </motion.div>

            {/* Add Topic CTA */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
            >
                <Link href="/add-topic">
                    <div
                        className="group p-5 border-2 border-dashed transition-all cursor-pointer flex items-center gap-4"
                        style={{
                            borderColor: 'var(--border)',
                            borderRadius: 'var(--radius-md)',
                            transitionDuration: 'var(--duration-fast)',
                        }}
                    >
                        <div
                            className="w-10 h-10 flex items-center justify-center"
                            style={{
                                background: 'var(--accent-light)',
                                borderRadius: 'var(--radius-sm)',
                            }}
                        >
                            <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                        </div>
                        <div>
                            <div className="font-semibold">Add a new topic</div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                                AI will generate concepts, schedule, and quiz questions
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto transition-ui" style={{ color: 'var(--text-muted)' }} />
                    </div>
                </Link>
            </motion.div>

            {/* Due Today */}
            {todaySessions.length > 0 && (
                <motion.section
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <h2 className="text-lg font-semibold">Due today</h2>
                    <div className="grid gap-4">
                        {todaySessions.map((ds) => (
                            <DueSessionCard key={ds.session.id} dueSession={ds} />
                        ))}
                    </div>
                </motion.section>
            )}

            {/* This Week */}
            {upcomingSessions.length > 0 && (
                <motion.section
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                        <h2 className="text-lg font-semibold">This week</h2>
                    </div>
                    <div
                        className="divide-y overflow-hidden"
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        {upcomingSessions.map((ds) => {
                            const { topic, session } = ds;
                            if (!topic) return null;
                            return (
                                <div
                                    key={session.id}
                                    className="flex items-center justify-between px-5 py-3"
                                    style={{ borderColor: 'var(--border)' }}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Date pill */}
                                        <span
                                            className="text-xs font-medium px-2.5 py-1 shrink-0"
                                            style={{
                                                background: 'var(--bg-raised)',
                                                color: 'var(--text-muted)',
                                                borderRadius: 'var(--radius-sm)',
                                            }}
                                        >
                                            {new Date(session.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </span>
                                        <span className="text-sm font-medium">{topic.name}</span>
                                    </div>
                                    {/* Session type badge */}
                                    <span
                                        className="text-xs font-medium px-2.5 py-1 capitalize"
                                        style={{
                                            background: 'var(--accent-light)',
                                            color: 'var(--accent)',
                                            borderRadius: 'var(--radius-sm)',
                                        }}
                                    >
                                        {session.type.replace('-', ' ')}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {/* All Topics */}
            {hasTopics && (
                <motion.section
                    className="space-y-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <h2 className="text-lg font-semibold">All topics</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {topics.map((topic) => (
                            <Link key={topic.id} href={`/cockpit?topic=${topic.id}`}>
                                <div
                                    className="group p-5 transition-ui cursor-pointer"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        border: '1px solid var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-resting)',
                                    }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-semibold text-[15px]">{topic.name}</h3>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                                                {topic.concepts.length} concepts · {topic.level}
                                            </p>
                                        </div>
                                        <div
                                            className="text-3xl font-bold"
                                            style={{ color: getScoreColor(topic.memoryScore) }}
                                        >
                                            {topic.memoryScore}
                                        </div>
                                    </div>
                                    {/* Score bar */}
                                    <div className="mt-3 w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${topic.memoryScore}%`,
                                                background: getScoreColor(topic.memoryScore),
                                                transition: 'width var(--duration-progress) ease-in-out',
                                            }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            )}

            {/* Empty state */}
            {!hasTopics && !isLoading && (
                <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p style={{ color: 'var(--text-muted)' }}>Nothing here yet. Add your first topic.</p>
                </motion.div>
            )}
        </div>
    );
}
