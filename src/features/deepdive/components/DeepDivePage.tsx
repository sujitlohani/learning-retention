'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, X, Zap, BookOpen, Target, Loader2 } from 'lucide-react';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { QuizAttempt } from '@/src/types/ai';

type DateRange = '7d' | '30d' | 'all';
type QuizTypeFilter = 'all' | 'topic' | 'unit';

interface InsightsData {
    insight?: { topicArea: string; accuracyPercent: number };
    commonPattern?: string;
    suggestedFocus?: string[];
    recommendedUnit?: { unitName: string; topicId: string; unitId: string };
    rawText?: string;
}

export function DeepDivePage() {
    const { startQuiz } = useQuizSession();
    const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
    const [topicFilter, setTopicFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<QuizTypeFilter>('all');
    const [dateRange, setDateRange] = useState<DateRange>('30d');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // AI Insights
    const [insights, setInsights] = useState<InsightsData | null>(null);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState(false);

    useEffect(() => {
        const attempts = quizHistoryService.getAllAttempts();
        setAllAttempts(attempts);
    }, []);

    // Unique topics from attempts
    const uniqueTopics = useMemo(() => {
        const map = new Map<string, string>();
        allAttempts.forEach(a => {
            const topic = topicsService.getTopicById(a.topicId);
            if (topic) map.set(a.topicId, topic.name);
        });
        return Array.from(map.entries());
    }, [allAttempts]);

    // Unique units from attempts
    const uniqueUnits = useMemo(() => {
        const map = new Map<string, string>();
        allAttempts.forEach(a => {
            a.unitBreakdown.forEach(u => {
                if (u.unitName) map.set(u.unitId, u.unitName);
            });
        });
        return Array.from(map.entries());
    }, [allAttempts]);

    // Filtered attempts
    const filtered = useMemo(() => {
        let result = [...allAttempts];
        if (topicFilter) result = result.filter(a => a.topicId === topicFilter);
        if (unitFilter) result = result.filter(a => a.unitBreakdown.some(u => u.unitId === unitFilter));
        if (typeFilter !== 'all') result = result.filter(a => a.type === typeFilter);
        if (dateRange !== 'all') {
            const days = dateRange === '7d' ? 7 : 30;
            const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            result = result.filter(a => new Date(a.completedAt) >= cutoff);
        }
        return result.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    }, [allAttempts, topicFilter, unitFilter, typeFilter, dateRange]);

    // AI Insights generation
    useEffect(() => {
        if (allAttempts.length === 0) return;
        setInsightsLoading(true);

        const recent = [...allAttempts]
            .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
            .slice(0, 20);

        // Build summary
        const unitAccuracy: Record<string, { correct: number; total: number; name: string }> = {};
        const topicAttemptCount: Record<string, number> = {};

        recent.forEach(a => {
            topicAttemptCount[a.topicId] = (topicAttemptCount[a.topicId] || 0) + 1;
            a.unitBreakdown.forEach(u => {
                if (!unitAccuracy[u.unitId]) unitAccuracy[u.unitId] = { correct: 0, total: 0, name: u.unitName || 'Unknown' };
                unitAccuracy[u.unitId].correct += u.correctCount;
                unitAccuracy[u.unitId].total += u.totalCount;
            });
        });

        const summaryData = {
            unitAccuracies: Object.entries(unitAccuracy).map(([id, v]) => ({
                unitId: id, unitName: v.name, accuracy: v.total > 0 ? Math.round((v.correct / v.total) * 100) : 0
            })),
            topicAttemptCounts: Object.entries(topicAttemptCount).map(([id, count]) => ({
                topicId: id, topicName: topicsService.getTopicById(id)?.name || 'Unknown', attempts: count
            }))
        };

        fetch('/api/ai/generate-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ summaryData }),
        }).then(res => res.json()).then(data => {
            if (data.success) {
                setInsights(data);
            } else {
                setInsightsError(true);
            }
        }).catch(() => setInsightsError(true))
            .finally(() => setInsightsLoading(false));
    }, [allAttempts]);

    // Empty state
    if (allAttempts.length === 0) {
        return (
            <div className="min-h-screen font-display flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="text-center space-y-4 max-w-md mx-auto px-6">
                    <h1 className="text-2xl font-bold">No quiz history yet.</h1>
                    <p className="text-sm text-[var(--text-muted)]">Complete a quiz to see your review here.</p>
                    <Link href="/knowledge-base" className="inline-flex items-center gap-1 px-5 py-2.5 rounded-md font-bold text-sm text-white transition-all hover:-translate-y-0.5" style={{ background: 'var(--accent)' }}>
                        Go to Knowledge Base →
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen font-display pb-20" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <div className="max-w-screen-xl mx-auto px-6 py-8 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Deep Dive</h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Review your past sessions and mistakes</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <select value={topicFilter} onChange={e => setTopicFilter(e.target.value)} className="text-xs font-bold px-3 py-2 rounded-md border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <option value="">Topic: All</option>
                        {uniqueTopics.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <select value={unitFilter} onChange={e => setUnitFilter(e.target.value)} className="text-xs font-bold px-3 py-2 rounded-md border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <option value="">Unit: All</option>
                        {uniqueUnits.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <div className="flex gap-1 bg-[var(--bg-raised)] p-1 rounded-md border border-[var(--border)]">
                        {(['all', 'unit', 'topic'] as const).map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)} className="px-3 py-1 text-xs font-bold rounded transition-all" style={typeFilter === t ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-muted)' }}>
                                {t === 'all' ? 'All' : t === 'unit' ? 'Unit Test' : 'Topic Challenge'}
                            </button>
                        ))}
                    </div>
                    <select value={dateRange} onChange={e => setDateRange(e.target.value as DateRange)} className="text-xs font-bold px-3 py-2 rounded-md border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                        <option value="7d">Last 7 days</option>
                        <option value="30d">Last 30 days</option>
                        <option value="all">All time</option>
                    </select>
                </div>

                {/* Two-column layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Session List */}
                    <div className="lg:col-span-8 space-y-4">
                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-sm text-[var(--text-muted)]">No sessions match your filters.</div>
                        ) : (
                            filtered.map(attempt => {
                                const isExpanded = expandedId === attempt.id;
                                const topicName = topicsService.getTopicById(attempt.topicId)?.name || 'Unknown Topic';
                                const TypeIcon = attempt.type === 'unit' ? Target : attempt.type === 'topic' ? BookOpen : Zap;
                                const typeLabel = attempt.type === 'unit' ? 'Unit Test' : attempt.type === 'topic' ? 'Topic Challenge' : 'Daily';
                                let scoreColor = 'var(--danger)';
                                if (attempt.score >= 75) scoreColor = 'var(--success)';
                                else if (attempt.score >= 50) scoreColor = 'var(--warning)';
                                const incorrectCount = attempt.questions.filter(q => !q.isCorrect).length;

                                return (
                                    <div key={attempt.id} className="border rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-resting)' }}>
                                        {/* Collapsed header */}
                                        <button onClick={() => setExpandedId(isExpanded ? null : attempt.id)} className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-raised)] transition-colors">
                                            <div className="flex items-center gap-3">
                                                <TypeIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                                                <div>
                                                    <div className="text-sm font-bold">{topicName}</div>
                                                    <div className="text-xs text-[var(--text-muted)]">{typeLabel} • {attempt.totalCount} questions</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <div className="text-sm font-black" style={{ color: scoreColor }}>{attempt.score}%</div>
                                                    <div className="text-[10px] text-[var(--text-muted)]">{new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                                                </div>
                                                {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                                            </div>
                                        </button>
                                        {/* Progress bar */}
                                        <div className="h-1 w-full bg-[var(--bg-raised)]">
                                            <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${attempt.score}%`, background: scoreColor }} />
                                        </div>

                                        {/* Expanded */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                    <div className="p-4 border-t space-y-4" style={{ borderColor: 'var(--border)' }}>
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-bold">Correct: {attempt.correctCount} / {attempt.totalCount}</span>
                                                            {incorrectCount > 0 && (
                                                                <button onClick={() => {
                                                                    if (attempt.targetUnitId) {
                                                                        startQuiz({ type: 'unit-test', topicId: attempt.topicId, targetUnitId: attempt.targetUnitId });
                                                                    } else {
                                                                        startQuiz({ type: 'topic-challenge', topicId: attempt.topicId });
                                                                    }
                                                                }} className="text-xs font-bold px-3 py-1.5 rounded-md border transition-all hover:-translate-y-0.5" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                                                                    Retry Weak Questions
                                                                </button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-3">
                                                            {attempt.questions.map((q, i) => (
                                                                <div key={i} className="text-sm space-y-1">
                                                                    <div className="flex items-start gap-2">
                                                                        {q.isCorrect ? (
                                                                            <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                                                                        ) : (
                                                                            <X className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--danger)' }} />
                                                                        )}
                                                                        <div className="flex-1">
                                                                            <div className="font-medium">{q.questionText || `Question ${i + 1}`}</div>
                                                                            {q.isCorrect ? (
                                                                                <div className="text-xs text-[var(--text-muted)] mt-0.5">Answered: {q.userAnswer}</div>
                                                                            ) : (
                                                                                <div className="mt-2 flex flex-col gap-1.5">
                                                                                    <div className="text-xs" style={{ color: 'var(--danger)' }}>Your answer: {q.userAnswer}</div>
                                                                                    <div className="text-xs" style={{ color: 'var(--success)' }}>Correct: {q.correctAnswer}</div>
                                                                                    {q.unitName && (
                                                                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                                                                            <span className="rounded-full text-[10px] font-bold px-2 py-0.5 bg-[var(--bg-raised)] text-[var(--text-muted)]">Concept: {q.unitName}</span>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Right: AI Insights */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 space-y-4">
                            <div className="p-5 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
                                <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                    Insights
                                    {insightsLoading && <Loader2 className="w-3 h-3 animate-spin" style={{ color: 'var(--accent)' }} />}
                                </h3>

                                {insightsLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="space-y-2">
                                                <div className="h-3 rounded bg-[var(--bg-raised)] animate-pulse w-1/2" />
                                                <div className="h-3 rounded bg-[var(--bg-raised)] animate-pulse w-full" />
                                            </div>
                                        ))}
                                    </div>
                                ) : insightsError ? (
                                    <p className="text-sm text-[var(--text-muted)]">Unable to generate insights</p>
                                ) : insights?.rawText ? (
                                    <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{insights.rawText}</p>
                                ) : insights ? (
                                    <div className="space-y-5">
                                        {/* Performance Insight */}
                                        {insights.insight && (
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>Performance Insight</div>
                                                {insights.insight.topicArea ? (
                                                    <>
                                                        <p className="text-sm font-medium">{insights.insight.topicArea} questions: {insights.insight.accuracyPercent}% accuracy</p>
                                                        {insights.commonPattern && <p className="text-xs text-[var(--text-muted)] mt-1">{insights.commonPattern}</p>}
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-[var(--text-muted)]">Insufficient data to generate insight</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Suggested Focus */}
                                        {insights.suggestedFocus && insights.suggestedFocus.length > 0 && (
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--accent)' }}>Suggested Focus</div>
                                                <ul className="space-y-1">
                                                    {insights.suggestedFocus.map((f, i) => (
                                                        <li key={i} className="text-sm text-[var(--text-muted)]">• {f}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Recommended Action */}
                                        {insights.recommendedUnit && (
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Recommended Action</div>
                                                <button
                                                    onClick={() => startQuiz({ type: 'unit-test', topicId: insights.recommendedUnit!.topicId, targetUnitId: insights.recommendedUnit!.unitId })}
                                                    className="w-full text-xs font-bold px-4 py-2.5 rounded-md text-white transition-all hover:-translate-y-0.5"
                                                    style={{ background: 'var(--accent)' }}
                                                >
                                                    Start Unit Test → {insights.recommendedUnit.unitName}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
