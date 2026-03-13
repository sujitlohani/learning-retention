'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, ArrowRight, Flame, ClipboardList, CheckCircle2, BarChart3, AlertTriangle, Target, RefreshCw, X as XIcon } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { Topic } from '@/src/types';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { checkThresholds, Recommendation, computeOverallMastery, scoreTopicPriority } from '@/src/lib/retention-calculator';
import { QuizAttempt } from '@/src/types/ai';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function getFormattedDate(): string {
    return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function computeStreak(allAttempts: QuizAttempt[]): number {
    if (allAttempts.length === 0) return 0;
    const dateSet = new Set<string>();
    allAttempts.forEach(a => {
        const d = new Date(a.completedAt);
        dateSet.add(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`);
    });
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (dateSet.has(key)) {
            streak++;
        } else {
            // Allow today to be missing (haven't quizzed yet today)
            if (i === 0) continue;
            break;
        }
    }
    return streak;
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
}

export function HomeDashboard() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
    const [dismissedRecs, setDismissedRecs] = useState<Set<number>>(new Set());

    useEffect(() => {
        setTopics(topicsService.getTopics());
        setAllAttempts(quizHistoryService.getAllAttempts());
    }, []);

    const streak = useMemo(() => computeStreak(allAttempts), [allAttempts]);
    const totalSessions = allAttempts.length;
    const overallMastery = useMemo(() => topics.length > 0 ? Math.round(computeOverallMastery(topics, allAttempts)) : -1, [topics, allAttempts]);

    const focusTopic = useMemo(() => {
        if (topics.length === 0) return null;
        let best: Topic | null = null;
        let bestScore = -Infinity;
        topics.forEach(t => {
            const s = scoreTopicPriority(t, allAttempts);
            if (s > bestScore) { bestScore = s; best = t; }
        });
        return best as Topic | null;
    }, [topics, allAttempts]);

    const recommendations = useMemo(() => {
        if (topics.length === 0) return [];
        const recs = checkThresholds(topics, allAttempts);
        // Priority: weak-unit → ready-for-challenge → challenge-stale, max 3
        const sorted = [
            ...recs.filter(r => r.type === 'weak-unit'),
            ...recs.filter(r => r.type === 'ready-for-challenge'),
            ...recs.filter(r => r.type === 'challenge-stale'),
        ];
        return sorted.slice(0, 3);
    }, [topics, allAttempts]);

    const visibleRecs = recommendations.filter((_, i) => !dismissedRecs.has(i));
    const hasTopics = topics.length > 0;

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8 font-display" style={{ color: 'var(--text-primary)' }}>

            {/* ── 1. Greeting Header ── */}
            <motion.div className="flex items-end justify-between" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <div>
                    <h1 className="text-[26px] font-extrabold tracking-tight">{getGreeting()}</h1>
                    <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>{getFormattedDate()}</p>
                </div>
                <div className="text-right">
                    {streak > 0 ? (
                        <div className="flex items-center gap-1.5">
                            <Flame className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                            <span className="text-sm font-bold">{streak} day streak</span>
                        </div>
                    ) : (
                        <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Start your streak today</span>
                    )}
                </div>
            </motion.div>

            {/* ── 2. Daily Quiz Card ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
                <Link href={hasTopics ? '/quiz/daily' : '/add-topic'}>
                    <div className="p-6 rounded-xl text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4338CA 40%, #5B4FE8 100%)' }}>
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <ClipboardList className="w-7 h-7 shrink-0 opacity-90" />
                                <div>
                                    <div className="text-lg font-bold">Daily Quiz</div>
                                    <div className="text-sm text-white/80 mt-0.5">
                                        {hasTopics && focusTopic
                                            ? `Focusing on ${focusTopic.name} today · 20 questions`
                                            : hasTopics
                                                ? 'Practice across your topics · 20 questions'
                                                : 'Add a topic to get started'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shrink-0" style={{ background: '#fff', color: '#4338CA' }}>
                                Start <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </Link>
            </motion.div>

            {/* ── Add Topic ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.08 }}>
                <Link href="/add-topic">
                    <div className="group p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer flex items-center gap-4 hover:border-[var(--accent)]" style={{ borderColor: 'var(--border)' }}>
                        <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: 'var(--accent-light)' }}>
                            <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                        </div>
                        <div>
                            <div className="font-semibold">Add a new topic</div>
                            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>AI will generate units, schedule, and quiz questions</div>
                        </div>
                        <ArrowRight className="w-5 h-5 ml-auto" style={{ color: 'var(--text-muted)' }} />
                    </div>
                </Link>
            </motion.div>

            {/* ── 3. Stats Row ── */}
            <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <Flame className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold">{streak} <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>days</span></div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Total Sessions</span>
                    </div>
                    <div className="text-2xl font-bold">{totalSessions} <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>sessions</span></div>
                </div>
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <BarChart3 className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Overall Mastery</span>
                    </div>
                    <div className="text-2xl font-bold">{overallMastery >= 0 ? `${overallMastery}%` : '—'}</div>
                </div>
            </motion.div>

            {/* ── 4. Recommendations (max 3) ── */}
            {visibleRecs.length > 0 && (
                <motion.section className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Suggested for you</h2>
                    <div className={`grid gap-3 ${visibleRecs.length > 1 ? 'sm:grid-cols-2' : ''}`}>
                        {recommendations.map((rec, i) => {
                            if (dismissedRecs.has(i)) return null;
                            const isWeak = rec.type === 'weak-unit';
                            const isReady = rec.type === 'ready-for-challenge';
                            const Icon = isWeak ? AlertTriangle : isReady ? Target : RefreshCw;
                            const iconColor = isWeak ? 'var(--warning)' : isReady ? 'var(--accent)' : 'var(--text-muted)';
                            const href = isWeak
                                ? `/quiz/weak-area?topicId=${rec.topicId}${rec.unitId ? `&unitId=${rec.unitId}` : ''}`
                                : `/topics/${rec.topicId}`;
                            const actionLabel = isWeak ? 'Review now →' : isReady ? 'Start Challenge →' : 'Revisit →';

                            return (
                                <div key={i} className="p-4 rounded-xl border relative group" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                    <button
                                        onClick={() => setDismissedRecs(prev => new Set(prev).add(i))}
                                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--bg-raised)]"
                                    >
                                        <XIcon className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                    <div className="flex items-start gap-3">
                                        <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: iconColor }} />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium leading-snug">{rec.message}</p>
                                            <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                                                {rec.unitName || rec.topicName}
                                            </p>
                                            <Link href={href} className="inline-flex items-center gap-1 text-xs font-bold mt-2 transition-colors hover:opacity-80" style={{ color: 'var(--accent)' }}>
                                                {actionLabel}
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {/* ── 5. Your Topics ── */}
            {hasTopics ? (
                <motion.section className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Your topics</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {topics.map(topic => (
                            <Link key={topic.id} href={`/topics/${topic.id}`}>
                                <div className="group p-5 rounded-xl border transition-all cursor-pointer hover:shadow-md" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                    <div className="flex items-start justify-between">
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-[15px] truncate">{topic.name}</h3>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{topic.units.length} units · {topic.level}</p>
                                        </div>
                                        <div className="text-3xl font-bold shrink-0" style={{ color: getScoreColor(topic.memoryScore) }}>{topic.memoryScore}</div>
                                    </div>
                                    <div className="mt-3 w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                                        <div className="h-full rounded-full transition-all" style={{ width: `${topic.memoryScore}%`, background: getScoreColor(topic.memoryScore) }} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.section>
            ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
                    <Link href="/add-topic">
                        <div className="group p-5 border-2 border-dashed rounded-xl transition-all cursor-pointer flex items-center gap-4" style={{ borderColor: 'var(--border)' }}>
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg" style={{ background: 'var(--accent-light)' }}>
                                <Plus className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                            </div>
                            <div>
                                <div className="font-semibold">Add a new topic</div>
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>AI will generate units, schedule, and quiz questions</div>
                            </div>
                            <ArrowRight className="w-5 h-5 ml-auto" style={{ color: 'var(--text-muted)' }} />
                        </div>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
