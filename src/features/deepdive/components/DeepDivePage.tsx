'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Zap, Loader2, ArrowRight, Microscope } from 'lucide-react';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { QuizAttempt } from '@/src/types/ai';
import { QuizSessionCard } from '@/src/features/quiz/components/QuizSessionCard';
import { NeedsReviewSlider } from '@/src/features/deepdive/components/NeedsReviewSlider';
import { computeUnitScore } from '@/src/lib/retention-calculator';

type DateRange = '7d' | '30d' | 'all';
type QuizTypeFilter = 'all' | 'topic-challenge' | 'unit-test' | 'daily' | 'weak-area';

export function DeepDivePage() {
    const { startQuiz } = useQuizSession();
    const [allAttempts, setAllAttempts] = useState<QuizAttempt[]>([]);
    const [topicFilter, setTopicFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState<QuizTypeFilter>('all');
    const [dateRange, setDateRange] = useState<DateRange>('30d');

    useEffect(() => {
        setAllAttempts(quizHistoryService.getAllAttempts());
    }, []);

    // ── Filters ──────────────────────
    const uniqueTopics = useMemo(() => {
        const map = new Map<string, string>();
        allAttempts.forEach(a => {
            const t = topicsService.getTopicById(a.topicId);
            if (t) map.set(a.topicId, t.name);
        });
        return Array.from(map.entries());
    }, [allAttempts]);

    const uniqueUnits = useMemo(() => {
        const map = new Map<string, string>();
        allAttempts.forEach(a => {
            a.unitBreakdown.forEach(u => { if (u.unitName) map.set(u.unitId, u.unitName); });
        });
        return Array.from(map.entries());
    }, [allAttempts]);

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

    // Empty
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
                    <div className="flex gap-1 bg-[var(--bg-raised)] p-1 rounded-md border border-[var(--border)] hidden md:flex">
                        {(['all', 'unit-test', 'topic-challenge', 'daily', 'weak-area'] as const).map(t => (
                            <button key={t} onClick={() => setTypeFilter(t)} className="px-3 py-1 text-xs font-bold rounded transition-all" style={typeFilter === t ? { background: 'var(--accent)', color: '#fff' } : { color: 'var(--text-muted)' }}>
                                {t === 'all' ? 'All' : t.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
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
                            filtered.map(attempt => (
                                <QuizSessionCard
                                    key={attempt.id}
                                    attempt={attempt}
                                    onRetry={(type, topicId, targetUnitId) => {
                                        if (type === 'unit-test' && targetUnitId) {
                                            startQuiz({ type: 'unit-test', topicId, targetUnitId });
                                        } else {
                                            startQuiz({ type: 'topic-challenge', topicId });
                                        }
                                    }}
                                />
                            ))
                        )}
                    </div>

                    {/* Right Panel */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-6 space-y-4">
                            <NeedsReviewSlider />
                            <AIInsightCard allAttempts={allAttempts} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── AI Insight Card ─────────────────────────
interface InsightResult {
    diagnosis: string;
    confusions: string[];
}

function AIInsightCard({ allAttempts }: { allAttempts: QuizAttempt[] }) {
    const topics = useMemo(() => topicsService.getTopics().sort((a, b) => a.name.localeCompare(b.name)), []);

    const [selectedTopicId, setSelectedTopicId] = useState(topics[0]?.id || '');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<InsightResult | null>(null);
    const [error, setError] = useState(false);

    const selectedTopic = topics.find(t => t.id === selectedTopicId);
    const units = useMemo(() => {
        if (!selectedTopic) return [];
        return [...selectedTopic.units].sort((a, b) => (a.text || '').localeCompare(b.text || ''));
    }, [selectedTopic]);

    // Default unit on topic change
    useEffect(() => {
        if (units.length > 0) setSelectedUnitId(units[0].id);
        else setSelectedUnitId('');
    }, [selectedTopicId, units]);

    const selectedUnit = units.find(u => u.id === selectedUnitId);

    const generateInsight = async () => {
        if (!selectedTopicId || !selectedUnitId || !selectedUnit) return;
        setLoading(true);
        setError(false);

        const accuracy = computeUnitScore(selectedTopicId, selectedUnitId, allAttempts);
        const unitName = selectedUnit.text || '';
        const topicName = selectedTopic?.name || '';

        const prompt = `A student is struggling with the unit '${unitName}' from topic '${topicName}'. Their accuracy on this unit is ${Math.round(accuracy)}%. Return ONLY valid JSON with no markdown: { "diagnosis": string, "confusions": string[] } — diagnosis is one sentence identifying the root cause of their struggle. confusions is an array of 2–3 short phrases describing the specific sub-concepts they are most likely misunderstanding. Be specific to this unit, not generic.`;

        try {
            const res = await fetch('/api/ai/generate-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            if (data.success && data.insight) {
                setResult(data.insight as InsightResult);
            } else {
                setError(true);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const resetCard = () => {
        setResult(null);
        setError(false);
    };

    if (topics.length === 0) return null;

    return (
        <div className="p-5 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)]">
            <h3 className="text-[10px] font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--text-muted)' }}>AI Insight</h3>

            {result ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    <div className="text-sm font-bold">Why you might be struggling with {selectedUnit?.text || 'this unit'}</div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{result.diagnosis}</p>

                    {result.confusions && result.confusions.length > 0 && (
                        <div>
                            <div className="text-xs font-bold mb-2">You&apos;re likely confusing:</div>
                            <ul className="space-y-1.5">
                                {result.confusions.map((c, i) => (
                                    <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>•</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{c}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Link
                        href={`/deep-dive/learn?unitId=${selectedUnitId}&topicId=${selectedTopicId}`}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-xs font-bold text-white transition-transform hover:scale-[1.02]"
                        style={{ background: 'var(--accent)' }}
                    >
                        <Microscope className="w-3.5 h-3.5" /> Deep Dive Concept <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button onClick={resetCard} className="text-xs font-medium w-full text-center transition-colors hover:underline" style={{ color: 'var(--text-muted)' }}>
                        Generate another
                    </button>
                </motion.div>
            ) : error ? (
                <div className="text-center py-4 space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Unable to generate insight. Try again.</p>
                    <button onClick={resetCard} className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Retry</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {/* Topic dropdown */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Topic</label>
                        <select
                            value={selectedTopicId}
                            onChange={e => { setSelectedTopicId(e.target.value); setResult(null); }}
                            className="w-full text-xs font-bold px-3 py-2 rounded-md border"
                            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    {/* Unit dropdown */}
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest block mb-1" style={{ color: 'var(--text-muted)' }}>Unit</label>
                        <select
                            value={selectedUnitId}
                            onChange={e => setSelectedUnitId(e.target.value)}
                            className="w-full text-xs font-bold px-3 py-2 rounded-md border"
                            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        >
                            {units.map(u => <option key={u.id} value={u.id}>{u.text}</option>)}
                        </select>
                    </div>

                    {/* Generate button */}
                    <button
                        onClick={generateInsight}
                        disabled={loading || !selectedUnitId}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-bold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        style={{ background: 'var(--accent)' }}
                    >
                        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                        {loading ? 'Generating...' : 'Generate Insight'}
                    </button>
                </div>
            )}
        </div>
    );
}
