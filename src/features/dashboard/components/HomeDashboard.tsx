'use client';

import Link from 'next/link';
import { useEffect, useState, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, ClipboardList, CheckCircle2, BarChart3, AlertTriangle, Target, RefreshCw, X as XIcon, BookOpen, Plus, Search, Zap, Code2 } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { Topic } from '@/src/types';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { checkThresholds, Recommendation, computeOverallMastery, scoreTopicPriority } from '@/src/lib/retention-calculator';
import { QuizAttempt } from '@/src/types/ai';
import { classroomService } from '@/src/features/classroom/services/classroom.service';
import { classroomQuestions } from '@/src/lib/classroom-question-bank';

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
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

const STATIC_PILLS = ['Binary Trees', 'React Hooks', 'SQL Joins'];

export function HomeDashboard() {
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
    const [dismissedRecs, setDismissedRecs] = useState<Set<number>>(new Set());
    const [heroInput, setHeroInput] = useState('');

    useEffect(() => {
        setTopics(topicsService.getTopics());
        setAllAttempts(quizHistoryService.getAllAttempts());
    }, []);

    // Classroom stats
    const [classroomProgress] = useState(() => classroomService.getProgress());
    const classroomSolved = classroomProgress.solvedIds.length;
    const classroomTotal = classroomQuestions.length;
    const classroomPct = classroomTotal > 0 ? Math.round((classroomSolved / classroomTotal) * 100) : 0;
    const suggestedProblem = classroomQuestions.find(q => !classroomProgress.solvedIds.includes(q.id));

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
        const sorted = [
            ...recs.filter(r => r.type === 'weak-unit'),
            ...recs.filter(r => r.type === 'ready-for-challenge'),
            ...recs.filter(r => r.type === 'challenge-stale'),
        ];
        return sorted.slice(0, 3);
    }, [topics, allAttempts]);

    const visibleRecs = recommendations.filter((_, i) => !dismissedRecs.has(i));
    const hasTopics = topics.length > 0;

    const suggestionPills = useMemo(() => {
        if (topics.length === 0) return STATIC_PILLS;
        const sorted = [...topics].sort((a, b) => {
            const aTime = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
            const bTime = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
            return bTime - aTime;
        });
        return sorted.slice(0, 3).map(t => t.name);
    }, [topics]);

    const handleHeroSubmit = () => {
        if (!heroInput.trim()) return;
        router.push(`/add-topic?name=${encodeURIComponent(heroInput.trim())}`);
    };

    const handlePillClick = (text: string) => {
        setHeroInput(text);
        inputRef.current?.focus();
    };

    return (
        <div className="max-w-4xl mx-auto p-6 lg:p-10 space-y-8 font-display" style={{ color: 'var(--text-primary)' }}>

            {/* ── 1. Greeting Row ── */}
            <motion.div
                className="flex items-end justify-between"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-[32px] font-extrabold tracking-tight">{getGreeting()}</h1>
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

            {/* ── 2. Add Topic Section ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="p-7 border"
                style={{
                    background: 'var(--bg-surface)',
                    borderColor: 'var(--border)',
                    borderRadius: 'var(--radius-md)',
                }}
            >
                <h2 className="text-lg font-bold text-center mb-5" style={{ color: 'var(--text-primary)' }}>
                    What do you want to learn?
                </h2>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                        ref={inputRef}
                        value={heroInput}
                        onChange={(e) => setHeroInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleHeroSubmit()}
                        placeholder="Start typing a topic..."
                        className="w-full h-12 pl-11 pr-14 text-[15px] font-medium outline-none transition-all"
                        style={{
                            background: 'var(--bg-raised)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--text-primary)',
                        }}
                    />
                    <button
                        onClick={handleHeroSubmit}
                        disabled={!heroInput.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                    {suggestionPills.map((pill) => (
                        <button
                            key={pill}
                            onClick={() => handlePillClick(pill)}
                            className="text-xs font-medium px-3 py-1 transition-all cursor-pointer"
                            style={{
                                background: 'var(--bg-raised)',
                                border: '1px solid var(--border)',
                                borderRadius: '20px',
                                color: 'var(--text-muted)',
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                        >
                            {pill}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* ── 3. Daily Quiz Card ── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}>
                {hasTopics ? (
                    <Link href="/quiz/daily">
                        <div className="p-6 text-white relative overflow-hidden group cursor-pointer transition-all" style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4338CA 40%, #5B4FE8 100%)', borderRadius: 'var(--radius-md)' }}>
                            <div className="mb-4">
                                <span className="text-[10px] font-bold uppercase tracking-[.1em] px-2.5 py-1 rounded-full" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                    Daily Quiz
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="text-xl font-bold">Ready when you are</div>
                                    <div className="text-sm text-white/70 mt-1">
                                        Across your {topics.length} topic{topics.length !== 1 ? 's' : ''} · 20 questions
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 transition-transform group-hover:scale-105" style={{ background: '#fff', color: '#4338CA' }}>
                                    <Zap className="w-4 h-4" /> Start
                                </div>
                            </div>
                        </div>
                    </Link>
                ) : (
                    <div className="p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #3730A3 0%, #4338CA 40%, #5B4FE8 100%)', borderRadius: 'var(--radius-md)', opacity: 0.6 }}>
                        <div className="mb-4">
                            <span className="text-[10px] font-bold uppercase tracking-[.1em] px-2.5 py-1 rounded-full" style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                Daily Quiz
                            </span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                            <div>
                                <div className="text-xl font-bold">Daily Quiz</div>
                                <div className="text-sm text-white/70 mt-1">Add a topic to start your daily practice</div>
                            </div>
                            <div className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold shrink-0 opacity-50 cursor-not-allowed" style={{ background: '#fff', color: '#4338CA' }}>
                                <Zap className="w-4 h-4" /> Start
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* ── 4. Stats Row ── */}
            <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }}>
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
                <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                        <BookOpen className="w-3.5 h-3.5" style={{ color: 'var(--warning)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Topics Active</span>
                    </div>
                    <div className="text-2xl font-bold">{topics.length} <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>topics</span></div>
                </div>
            </motion.div>

            {/* ── 4b. Classroom Card ── */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.18 }}
                className="rounded-xl border overflow-hidden"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
            >
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                            Classroom
                        </span>
                    </div>
                    <Link href="/classroom" className="text-xs font-bold transition-opacity hover:opacity-70" style={{ color: 'var(--accent)' }}>
                        Open →
                    </Link>
                </div>
                <div className="p-4 flex items-center gap-4">
                    {/* Score */}
                    <div className="shrink-0 text-center w-16">
                        <div className="text-2xl font-black" style={{ color: classroomPct === 100 ? 'var(--success)' : 'var(--accent)' }}>
                            {classroomPct}%
                        </div>
                        <div className="text-[10px] font-bold leading-tight" style={{ color: 'var(--text-muted)' }}>
                            {classroomSolved}/{classroomTotal} solved
                        </div>
                    </div>
                    {/* Divider */}
                    <div className="w-px h-10 shrink-0" style={{ background: 'var(--border)' }} />
                    {/* Suggested problem */}
                    <div className="flex-1 min-w-0">
                        {suggestedProblem ? (
                            <>
                                <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--text-muted)' }}>
                                    Next challenge
                                </div>
                                <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                                    {suggestedProblem.title}
                                </div>
                                <div className="text-[11px] capitalize mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {suggestedProblem.difficulty} · {suggestedProblem.category}
                                </div>
                            </>
                        ) : (
                            <div className="text-sm font-bold" style={{ color: 'var(--success)' }}>
                                🎉 All problems solved!
                            </div>
                        )}
                    </div>
                    {/* CTA */}
                    {suggestedProblem && (
                        <Link
                            href="/classroom"
                            className="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
                            style={{ background: 'var(--accent)' }}
                        >
                            Practice
                        </Link>
                    )}
                </div>
                {/* Progress bar */}
                <div className="px-4 pb-3">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                        <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                                width: `${classroomPct}%`,
                                background: classroomPct === 100 ? 'var(--success)' : 'var(--accent)',
                            }}
                        />
                    </div>
                </div>
            </motion.div>

            {/* ── 5. Recommendations ── */}
            {visibleRecs.length > 0 && (
                <motion.section className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Suggested for you</h2>
                    <div className="space-y-2">
                        {recommendations.map((rec, i) => {
                            if (dismissedRecs.has(i)) return null;
                            const isWeak = rec.type === 'weak-unit';
                            const isReady = rec.type === 'ready-for-challenge';
                            const Icon = isWeak ? AlertTriangle : isReady ? Target : RefreshCw;
                            const iconColor = isWeak ? 'var(--warning)' : isReady ? 'var(--accent)' : 'var(--text-muted)';
                            const href = isWeak
                                ? `/quiz/weak-area?topicId=${rec.topicId}${rec.unitId ? `&unitId=${rec.unitId}` : ''}`
                                : `/topics/${rec.topicId}`;
                            const actionLabel = isWeak ? 'Review →' : isReady ? 'Challenge →' : 'Revisit →';

                            return (
                                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border group" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                    <Icon className="w-4 h-4 shrink-0" style={{ color: iconColor }} />
                                    <span className="text-sm font-medium flex-1 min-w-0 truncate">
                                        {rec.unitName ? `${rec.unitName} · ${rec.topicName}` : rec.topicName}
                                    </span>
                                    <Link href={href} className="text-xs font-bold shrink-0 transition-colors hover:opacity-80" style={{ color: 'var(--accent)' }}>
                                        {actionLabel}
                                    </Link>
                                    <button
                                        onClick={() => setDismissedRecs(prev => new Set(prev).add(i))}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--bg-raised)] shrink-0"
                                    >
                                        <XIcon className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </motion.section>
            )}

            {/* ── 6. Your Topics ── */}
            {hasTopics && (
                <motion.section className="space-y-3" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.25 }}>
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
            )}
        </div>
    );
}