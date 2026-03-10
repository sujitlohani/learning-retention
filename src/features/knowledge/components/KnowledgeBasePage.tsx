'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { X, Brain, Search, ChevronRight, Filter, TrendingUp, Clock, SortAsc, BookOpen, CheckCircle, AlertCircle, Dices, ChevronDown } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Topic, Unit } from '@/src/types';
import { QuizAttempt } from '@/src/types/ai';

interface UnitWithTopic extends Unit {
    topicId: string;
    topicName: string;
    topicLevel: string;
    topicScore: number;
}

function getStatusColor(status: string): string {
    if (status === 'strong') return 'var(--success)';
    if (status === 'weak') return 'var(--danger)';
    return 'var(--warning)';
}

function getStatusBg(status: string): { background: string; color: string } {
    if (status === 'strong') return { background: 'var(--badge-strong)', color: 'var(--success)' };
    if (status === 'weak') return { background: 'var(--badge-weak)', color: 'var(--danger)' };
    return { background: 'var(--badge-neutral)', color: 'var(--text-muted)' };
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
}

export function KnowledgeBasePage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterLevel, setFilterLevel] = useState<string | null>(null);
    const [filterTopicId, setFilterTopicId] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'mastery' | 'recent' | 'alpha'>('mastery');
    const [selectedUnit, setSelectedUnit] = useState<UnitWithTopic | null>(null);
    const [unitHistory, setUnitHistory] = useState<QuizAttempt[]>([]);
    const [panelTab, setPanelTab] = useState<'overview' | 'history'>('overview');
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

    useEffect(() => {
        setTopics(topicsService.getTopics());
    }, []);

    const allUnits: UnitWithTopic[] = useMemo(() => {
        return topics.flatMap(t =>
            t.units.map(c => ({
                ...c,
                topicId: t.id,
                topicName: t.name,
                topicLevel: t.level,
                topicScore: t.memoryScore,
            }))
        );
    }, [topics]);

    const filteredUnits = useMemo(() => {
        let result = allUnits;

        if (filterTopicId !== 'all') {
            result = result.filter(c => c.topicId === filterTopicId);
        }

        if (filterLevel) {
            result = result.filter(c => c.topicLevel === filterLevel);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(c =>
                c.text.toLowerCase().includes(q) || c.topicName.toLowerCase().includes(q)
            );
        }

        if (sortBy === 'mastery') {
            const order: Record<string, number> = { weak: 0, neutral: 1, strong: 2 };
            result = [...result].sort((a, b) => (order[a.status] || 1) - (order[b.status] || 1));
        } else if (sortBy === 'alpha') {
            result = [...result].sort((a, b) => a.text.localeCompare(b.text));
        }

        return result;
    }, [allUnits, filterTopicId, filterLevel, searchQuery, sortBy]);

    const openUnitDetail = (unit: UnitWithTopic) => {
        setSelectedUnit(unit);
        setPanelTab('overview');
        setUnitHistory(
            quizHistoryService.getHistoryForTopic(unit.topicId)
                .filter(a => a.questions?.some(q => q.unitId === unit.id))
        );
    };

    return (
        <div className="flex h-screen overflow-hidden w-full relative">
            {/* Left Filter Column (280px) */}
            <aside
                className="w-[280px] shrink-0 border-r overflow-y-auto hidden md:flex flex-col gap-8 p-6"
                style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-surface)'
                }}
            >
                {/* Search */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Search</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Find units..."
                            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-transparent focus:outline-none focus:ring-2 transition-all text-sm"
                            style={{
                                borderColor: 'var(--border)',
                                background: 'var(--bg-raised)',
                                ['--tw-ring-color' as string]: 'var(--accent)'
                            }}
                        />
                    </div>
                </div>

                {/* Filter by Difficulty */}
                <div className="flex flex-col gap-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Filter by Status</label>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilterLevel(null)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold transition-colors",
                                !filterLevel ? "bg-primary text-white" : ""
                            )}
                            style={!filterLevel ? { background: 'var(--accent)' } : { background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
                        >
                            All
                        </button>
                        {['strong', 'neutral', 'weak'].map(level => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(filterLevel === level ? null : level)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors"
                                )}
                                style={filterLevel === level ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--bg-raised)', color: 'var(--text-muted)' }}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter by Topic */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Filter by Topic</label>
                    <select
                        value={filterTopicId}
                        onChange={(e) => setFilterTopicId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer border"
                        style={{
                            background: 'var(--bg-raised)',
                            borderColor: 'var(--border)',
                        }}
                    >
                        <option value="all">All Topics</option>
                        {topics.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>

                {/* Sort By */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Sort By</label>
                    <div className="flex flex-col gap-1.5">
                        <button
                            onClick={() => setSortBy('mastery')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={sortBy === 'mastery' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                        >
                            <TrendingUp className="w-4 h-4" /> Mastery Score
                        </button>
                        <button
                            onClick={() => setSortBy('recent')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-100 opacity-80"
                            style={sortBy === 'recent' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                        >
                            <Clock className="w-4 h-4" /> Last Reviewed
                        </button>
                        <button
                            onClick={() => setSortBy('alpha')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors hover:opacity-100 opacity-80"
                            style={sortBy === 'alpha' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                        >
                            <SortAsc className="w-4 h-4" /> Alphabetical
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div
                className="flex-1 overflow-y-auto p-6 lg:p-10 transition-all duration-200"
                style={{ marginRight: selectedUnit ? '420px' : '0' }}
            >
                <div className="max-w-[1000px] mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Unit Browser</h1>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            Showing {filteredUnits.length} Unit{filteredUnits.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Grid of Unit Cards */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {filteredUnits.length === 0 ? (
                            <div className="col-span-1 xl:col-span-2 text-center py-16 border rounded-xl border-dashed" style={{ borderColor: 'var(--border)' }}>
                                <Brain className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                <p className="text-base font-medium mb-1">No units found.</p>
                                <p className="text-sm opacity-80" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
                            </div>
                        ) : (
                            filteredUnits.map((unit) => (
                                <div
                                    key={`${unit.topicId}-${unit.id}`}
                                    className="p-6 border transition-ui flex flex-col gap-4 group"
                                    style={{
                                        background: selectedUnit?.id === unit.id ? 'var(--bg-raised)' : 'var(--bg-surface)',
                                        borderColor: selectedUnit?.id === unit.id ? 'var(--accent)' : 'var(--border)',
                                        borderRadius: 'var(--radius-md)',
                                        boxShadow: 'var(--shadow-resting)',
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <span
                                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                                            >
                                                {unit.topicName}
                                            </span>
                                            <h3 className="text-lg font-bold mt-2">{unit.text}</h3>
                                        </div>
                                        {/* Since actual unit score is not a top-level field, we derive from topic score for the UI demo or use status */}
                                        <div className="text-right shrink-0">
                                            <div
                                                className="text-sm font-bold px-2 py-1 rounded capitalize"
                                                style={{ background: getStatusBg(unit.status).background, color: getStatusBg(unit.status).color }}
                                            >
                                                {unit.status}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto pt-2">
                                        <button
                                            onClick={() => openUnitDetail(unit)}
                                            className="flex-1 py-2 text-sm font-bold text-white transition-ui"
                                            style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                                        >
                                            View Details
                                        </button>
                                        <Link
                                            href={`/deep-dive?unit=${unit.id}`}
                                            className="px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center justify-center border"
                                            style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                        >
                                            <BookOpen className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Right Detail Panel (Slides in) */}
            <AnimatePresence>
                {selectedUnit && (
                    <motion.aside
                        initial={{ x: 420 }}
                        animate={{ x: 0 }}
                        exit={{ x: 420 }}
                        transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                        className="fixed right-0 top-0 h-screen w-full sm:w-[420px] z-40 flex flex-col"
                        style={{ backgroundColor: 'var(--bg-surface)', borderLeft: '1px solid var(--border)', boxShadow: 'var(--shadow-raised)' }}
                    >
                        {/* Detail Header */}
                        <div className="p-6 border-b flex items-start justify-between sticky top-0 z-10" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                            <div className="flex items-start gap-4 pr-4">
                                <button
                                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center transition-colors"
                                    style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
                                    onClick={() => setSelectedUnit(null)}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <div>
                                    <h2 className="text-lg font-bold leading-tight">{selectedUnit.text}</h2>
                                    <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{selectedUnit.topicName}</div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-4 border-b" style={{ borderColor: 'var(--border)' }}>
                            {(['overview', 'history'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setPanelTab(tab)}
                                    className={cn(
                                        "pb-3 px-4 text-sm font-bold capitalize transition-colors relative",
                                    )}
                                    style={panelTab === tab ? { color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                                >
                                    {tab}
                                    {panelTab === tab && (
                                        <motion.div
                                            layoutId="kb-tab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                                            style={{ background: 'var(--accent)' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {panelTab === 'overview' && (
                                <>
                                    {/* Status Card */}
                                    <div className="p-5 rounded-xl border flex items-center justify-between" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>State</div>
                                            <div className="font-bold flex items-center gap-2 capitalize" style={{ color: getStatusColor(selectedUnit.status) }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ background: getStatusColor(selectedUnit.status) }} />
                                                {selectedUnit.status === 'weak' ? 'Needs Work' : selectedUnit.status}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>From Topic</div>
                                            <div className="font-bold" style={{ color: getScoreColor(selectedUnit.topicScore) }}>
                                                {selectedUnit.topicScore}% Score
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl text-center border" style={{ borderColor: 'var(--border)' }}>
                                            <div className="text-xs mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Quizzed</div>
                                            <div className="text-xl font-bold">{unitHistory.length} times</div>
                                        </div>
                                        <div className="p-4 rounded-xl text-center border" style={{ borderColor: 'var(--border)' }}>
                                            <div className="text-xs mb-1 font-semibold" style={{ color: 'var(--text-muted)' }}>Origin</div>
                                            <div className="text-sm font-bold mt-1 uppercase tracking-wider">{selectedUnit.aiGenerated ? 'AI Generated' : 'Manual'}</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-8 flex gap-3">
                                        <Link
                                            href={`/learn/${selectedUnit.topicId}?unitId=${selectedUnit.id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-4 text-white font-bold transition-ui"
                                            style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                                            title="Quiz this unit (Standard)"
                                        >
                                            <Brain className="w-5 h-5 shrink-0" />
                                            Quiz This Unit
                                        </Link>

                                        <Link
                                            href={`/learn/${selectedUnit.topicId}?unitId=${selectedUnit.id}&generate=true`}
                                            className="px-5 flex items-center justify-center gap-2 rounded-xl font-bold border transition-all hover:bg-bg-raised text-sm"
                                            style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                                            title="Roll the dice to generate completely new questions for this unit!"
                                        >
                                            <Dices className="w-5 h-5 shrink-0 text-amber-500" />
                                            Generate New
                                        </Link>
                                    </div>
                                </>
                            )}

                            {panelTab === 'history' && (
                                <div className="space-y-4 pt-2">
                                    {unitHistory.length === 0 ? (
                                        <div className="text-center py-10 border border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                                            <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No quiz attempts yet.</p>
                                        </div>
                                    ) : (
                                        unitHistory.slice().reverse().map((attempt) => {
                                            const questionsAboutUnit = attempt.questions.filter(q => q.unitId === selectedUnit.id);

                                            // Provide dummy questions array if the attempt doesn't have the detailed questions array
                                            const questions = questionsAboutUnit.length > 0 ? questionsAboutUnit : [
                                                { questionId: '1', unitId: selectedUnit.id, isCorrect: attempt.score >= 50, userAnswer: '...', correctAnswer: '...', timeSpentSeconds: 12, questionText: 'Question text unavailable', explanation: '' }
                                            ];

                                            return (
                                                <div key={attempt.id} className="p-4 rounded-xl border" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                            {new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    {/* Question-by-question breakdown with Accordion */}
                                                    <div className="space-y-3">
                                                        {questions.map((q, i) => {
                                                            const isExpanded = expandedQuestionId === `${attempt.id}-${i}`;
                                                            return (
                                                                <div key={i} className="border rounded-lg overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                                                                    <button
                                                                        onClick={() => setExpandedQuestionId(isExpanded ? null : `${attempt.id}-${i}`)}
                                                                        className="w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                                                    >
                                                                        <div className="flex gap-3 text-sm items-center">
                                                                            <div className="shrink-0 flex items-center justify-center">
                                                                                {q.isCorrect ?
                                                                                    <CheckCircle className="w-5 h-5 text-green-500" /> :
                                                                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                                                                }
                                                                            </div>
                                                                            <div className="font-medium line-clamp-1 pr-4">
                                                                                {q.questionText ? `Q${i + 1}: ${q.questionText}` : `Question ${i + 1}`}
                                                                            </div>
                                                                        </div>
                                                                        <ChevronDown className={cn("w-4 h-4 shrink-0 transition-transform duration-200 opacity-50", isExpanded && "rotate-180")} />
                                                                    </button>

                                                                    {/* Accordion Content */}
                                                                    <AnimatePresence>
                                                                        {isExpanded && (
                                                                            <motion.div
                                                                                initial={{ height: 0 }}
                                                                                animate={{ height: 'auto' }}
                                                                                exit={{ height: 0 }}
                                                                                className="overflow-hidden"
                                                                            >
                                                                                <div className="p-4 pt-0 text-sm space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                                                                                    {q.questionText && (
                                                                                        <div className="pt-3">
                                                                                            <span className="text-xs font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Question</span>
                                                                                            <p className="leading-relaxed font-medium">{q.questionText}</p>
                                                                                        </div>
                                                                                    )}

                                                                                    <div className="grid grid-cols-1 gap-3">
                                                                                        <div className="p-3 rounded-md" style={{ background: q.isCorrect ? 'var(--success-light, rgba(34, 197, 94, 0.1))' : 'var(--danger-light, rgba(239, 68, 68, 0.1))', border: `1px solid ${q.isCorrect ? 'var(--success)' : 'var(--danger)'}` }}>
                                                                                            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: q.isCorrect ? 'var(--success)' : 'var(--danger)' }}>
                                                                                                Your Answer {q.isCorrect ? '(Correct)' : '(Incorrect)'}
                                                                                            </span>
                                                                                            <p className="font-medium">{q.userAnswer}</p>
                                                                                        </div>

                                                                                        {!q.isCorrect && (
                                                                                            <div className="p-3 rounded-md border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                                                                                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--success)' }}>Correct Answer</span>
                                                                                                <p className="font-medium">{q.correctAnswer}</p>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>

                                                                                    {q.explanation && (
                                                                                        <div className="p-3 rounded-md" style={{ background: 'var(--bg-surface)' }}>
                                                                                            <span className="text-[10px] font-bold uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>Why?</span>
                                                                                            <p className="opacity-90">{q.explanation}</p>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </motion.div>
                                                                        )}
                                                                    </AnimatePresence>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
