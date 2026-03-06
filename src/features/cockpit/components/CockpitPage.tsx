'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { X, Brain, Calendar, ChevronRight, BarChart3, ArrowRight, Clock, Plus, Trash2, ChevronDown, ChevronUp, CheckCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { scheduleService } from '@/src/features/schedule/services/schedule.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Topic, Concept } from '@/src/types';
import { QuizAttempt, StudySchedule } from '@/src/types/ai';

function getScoreColor(score: number): string {
    if (score >= 80) return 'var(--success)';
    if (score >= 60) return 'var(--warning)';
    return 'var(--danger)';
}

function getScoreColorClass(score: number): string {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
}

function getScoreBgClass(score: number): string {
    if (score >= 80) return 'bg-green-500/10 text-green-500';
    if (score >= 60) return 'bg-amber-500/10 text-amber-500';
    return 'bg-red-500/10 text-red-500';
}

export function CockpitPage() {
    const searchParams = useSearchParams();
    const selectedTopicId = searchParams.get('topic');

    const [topics, setTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [schedule, setSchedule] = useState<StudySchedule | null>(null);
    const [history, setHistory] = useState<QuizAttempt[]>([]);
    const [panelTab, setPanelTab] = useState<'overview' | 'history' | 'insights'>('overview');
    const [expandedAttempt, setExpandedAttempt] = useState<string | null>(null);

    useEffect(() => {
        const t = topicsService.getTopics();
        setTopics(t);
        if (selectedTopicId) {
            const found = t.find(tp => tp.id === selectedTopicId);
            if (found) openDetail(found);
        }
    }, [selectedTopicId]);

    const openDetail = (topic: Topic) => {
        setSelectedTopic(topic);
        setPanelTab('overview');
        setSchedule(scheduleService.getScheduleForTopic(topic.id));
        setHistory(quizHistoryService.getHistoryForTopic(topic.id));
        setExpandedAttempt(null);
    };

    const closeDetail = () => setSelectedTopic(null);

    const handleDeleteTopic = (topicId: string) => {
        topicsService.deleteTopic(topicId);
        scheduleService.deleteSchedule(topicId);
        setTopics(topicsService.getTopics());
        if (selectedTopic?.id === topicId) closeDetail();
    };

    // Stats
    const totalTopics = topics.length;
    const avgMemory = topics.length > 0 ? Math.round(topics.reduce((a, t) => a + (t.memoryScore || 0), 0) / topics.length) : 0;

    // Find due today
    const dueTodayCount = topics.reduce((acc, t) => {
        const s = scheduleService.getScheduleForTopic(t.id);
        const todayStr = new Date().toISOString().split('T')[0];
        const isDue = s?.sessions.some(sess => sess.date === todayStr && !sess.completed);
        return acc + (isDue ? 1 : 0);
    }, 0);

    const totalSessions = topics.reduce((acc, t) => {
        const s = scheduleService.getScheduleForTopic(t.id);
        return acc + (s?.sessions.filter(sess => sess.completed).length || 0);
    }, 0);

    return (
        <div className="flex h-screen overflow-hidden w-full relative">
            {/* Main content — shifts left when panel opens */}
            <div
                className="flex-1 overflow-y-auto p-6 lg:p-10 transition-all duration-200 ease-out"
                style={{
                    marginRight: selectedTopic ? '420px' : '0'
                }}
            >
                <div className="max-w-[1200px] mx-auto space-y-10">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">Cockpit</h1>
                            <p className="text-base" style={{ color: 'var(--text-muted)' }}>Performance overview and actionability.</p>
                        </motion.div>
                        <div className="flex gap-3">
                            <Link
                                href="/knowledge-base"
                                className="hidden sm:flex items-center justify-center h-10 px-5 text-sm font-bold transition-all"
                                style={{
                                    background: 'var(--bg-raised)',
                                    color: 'var(--text-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                }}
                            >
                                Filters
                            </Link>
                            <Link
                                href="/add-topic"
                                className="flex items-center justify-center h-10 px-5 text-sm font-bold text-white transition-all"
                                style={{
                                    background: 'var(--accent)',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add New Topic
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            { label: 'Total Topics', value: totalTopics, icon: BookOpen },
                            { label: 'Avg Score', value: `${avgMemory}`, isScore: true, icon: Brain },
                            { label: 'Due Today', value: dueTodayCount, icon: Clock },
                            { label: 'Total Sessions', value: totalSessions, icon: Calendar },
                        ].map((stat, i) => (
                            <div
                                key={stat.label}
                                className="p-5 flex flex-col gap-3"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-resting)',
                                }}
                            >
                                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                    {stat.label}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div
                                        className="text-3xl font-bold leading-none"
                                        style={stat.isScore ? { color: getScoreColor(avgMemory) } : stat.label === 'Due Today' ? { color: 'var(--warning)' } : {}}
                                    >
                                        {stat.value}
                                    </div>
                                    <stat.icon className="w-5 h-5 opacity-20" />
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    {/* Priority Review (if any due today) */}
                    {dueTodayCount > 0 && (
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="p-6 flex items-center justify-between"
                            style={{
                                background: 'color-mix(in srgb, var(--warning) 8%, var(--bg-surface))',
                                borderLeft: '3px solid var(--warning)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid color-mix(in srgb, var(--warning) 20%, var(--border))',
                                borderLeftWidth: '3px',
                                borderLeftColor: 'var(--warning)',
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--warning) 15%, transparent)' }}>
                                    <AlertTriangle className="w-5 h-5" style={{ color: 'var(--warning)' }} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Priority Review</h3>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>You have {dueTodayCount} topic{dueTodayCount !== 1 ? 's' : ''} requiring immediate attention to prevent memory decay.</p>
                                </div>
                            </div>
                            <Link
                                href="/"
                                className="px-5 py-2.5 text-sm font-bold transition-ui"
                                style={{
                                    background: 'var(--accent)',
                                    color: '#fff',
                                    borderRadius: '9999px',
                                }}
                            >
                                Go to Dashboard
                            </Link>
                        </motion.section>
                    )}

                    {/* Active Topics Grid */}
                    <motion.section
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold">Active Topics</h2>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{topics.length} topics</span>
                        </div>

                        {topics.length === 0 ? (
                            <div className="text-center py-16 p-8 border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
                                <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                <p className="text-base font-medium mb-1">No topics yet.</p>
                                <p className="text-sm px-4" style={{ color: 'var(--text-muted)' }}>Start by adding a topic to build your knowledge base.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {topics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => openDetail(topic)}
                                        className={cn(
                                            "w-full text-left flex flex-col p-6 transition-all group",
                                        )}
                                        style={{
                                            background: selectedTopic?.id === topic.id ? 'var(--bg-raised)' : 'var(--bg-surface)',
                                            border: '1px solid',
                                            borderColor: 'var(--border)',
                                            borderRadius: 'var(--radius-md)',
                                            boxShadow: 'var(--shadow-resting)',
                                        }}
                                    >
                                        <div className="flex items-start justify-between w-full mb-4">
                                            <div>
                                                <span
                                                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                                                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                                                >
                                                    {topic.level}
                                                </span>
                                                <h3 className="text-lg font-bold mt-2">{topic.name}</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold leading-none" style={{ color: getScoreColor(topic.memoryScore || 0) }}>
                                                    {topic.memoryScore || 0}
                                                </div>
                                                <div className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Score</div>
                                            </div>
                                        </div>

                                        {/* Progress bar */}
                                        <div className="w-full h-[3px] rounded-full overflow-hidden mb-4" style={{ background: 'var(--bg-raised)' }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${topic.memoryScore}%`,
                                                    background: getScoreColor(topic.memoryScore),
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 mt-auto">
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-sm" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                                                {topic.concepts.length} Concept{topic.concepts.length !== 1 ? 's' : ''}
                                            </span>
                                            <span className="flex-1"></span>
                                            <span
                                                className="text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                style={{ color: 'var(--accent)' }}
                                            >
                                                Details <ChevronRight className="w-3.5 h-3.5" />
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </motion.section>
                </div>
            </div>

            {/* Right-side Sheet Panel */}
            <AnimatePresence>
                {selectedTopic && (
                    <motion.aside
                        initial={{ x: 420 }}
                        animate={{ x: 0 }}
                        exit={{ x: 420 }}
                        transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }}
                        className="fixed right-0 top-0 h-screen w-full sm:w-[420px] z-40 flex flex-col"
                        style={{
                            background: 'var(--bg-surface)',
                            borderLeft: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-raised)',
                        }}
                    >
                        {/* Detail Header */}
                        <div className="p-6 flex items-center justify-between sticky top-0 z-10" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                            <div className="flex items-center gap-3">
                                <button
                                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                                    style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
                                    onClick={closeDetail}
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                                <h2 className="text-lg font-bold truncate max-w-[200px]">{selectedTopic.name}</h2>
                            </div>
                            <span
                                className="px-2 py-1 rounded text-[10px] font-bold uppercase"
                                style={{ background: getScoreBgClass(selectedTopic.memoryScore).split(' ')[0], color: getScoreColor(selectedTopic.memoryScore) }}
                            >
                                {selectedTopic.memoryScore >= 80 ? 'Mastered' : selectedTopic.memoryScore >= 60 ? 'Learning' : 'Needs Review'}
                            </span>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 pt-4" style={{ borderBottom: '1px solid var(--border)' }}>
                            {(['overview', 'history', 'insights'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setPanelTab(tab)}
                                    className={cn(
                                        "pb-3 px-4 text-sm font-bold capitalize transition-colors relative",
                                        panelTab === tab ? "text-primary" : "text-muted-foreground hover:text-primary"
                                    )}
                                    style={panelTab === tab ? { color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                                >
                                    {tab}
                                    {panelTab === tab && (
                                        <motion.div
                                            layoutId="cockpit-tab"
                                            className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                                            style={{ background: 'var(--accent)' }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Panel content (scrollable area) */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {panelTab === 'overview' && (
                                <>
                                    {/* Current Performance */}
                                    <div className="rounded-xl p-5" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                                        <label className="text-[10px] font-bold uppercase block mb-4" style={{ color: 'var(--text-muted)' }}>Current Performance</label>
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="h-2 flex-1 rounded-full"
                                                    style={{
                                                        background: i < Math.floor(selectedTopic.memoryScore / 20)
                                                            ? getScoreColor(selectedTopic.memoryScore)
                                                            : 'var(--border)'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-3xl font-bold" style={{ color: getScoreColor(selectedTopic.memoryScore) }}>
                                                {selectedTopic.memoryScore}%
                                            </span>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-xl text-center" style={{ border: '1px solid var(--border)' }}>
                                            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Total Reviews</div>
                                            <div className="text-xl font-bold">{history.length}</div>
                                        </div>
                                        <div className="p-4 rounded-xl text-center" style={{ border: '1px solid var(--border)' }}>
                                            <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Concepts</div>
                                            <div className="text-xl font-bold">{selectedTopic.concepts.length}</div>
                                        </div>
                                    </div>

                                    {/* Key Concepts list */}
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-sm font-bold">Concept Status</h4>
                                        <div className="space-y-2">
                                            {selectedTopic.concepts.slice(0, 5).map(c => (
                                                <div key={c.id} className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: 'var(--bg-raised)' }}>
                                                    <div className="flex justify-between items-start">
                                                        <span className="text-sm font-medium">{c.text}</span>
                                                        <span className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", c.status === 'strong' ? 'bg-green-500' : c.status === 'weak' ? 'bg-red-500' : 'bg-amber-500')} />
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedTopic.concepts.length > 5 && (
                                                <div className="text-center text-xs font-semibold py-2" style={{ color: 'var(--text-muted)' }}>
                                                    + {selectedTopic.concepts.length - 5} more concepts
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}

                            {panelTab === 'history' && (
                                <div className="space-y-4">
                                    {history.length === 0 ? (
                                        <div className="text-center py-12 border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
                                            <Clock className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                            <p className="text-sm font-medium">No session history.</p>
                                        </div>
                                    ) : (
                                        history.slice().reverse().map((attempt) => {
                                            const isExpanded = expandedAttempt === attempt.id;

                                            // Provide dummy data for UI display if missing from real data model
                                            const sessionType = attempt.score >= 80 ? 'Mastery Review' : attempt.score >= 60 ? 'Daily Recap' : 'First Exposure';
                                            const icon = attempt.score >= 80 ? <CheckCircle className="w-5 h-5" /> : attempt.score >= 60 ? <Brain className="w-5 h-5" /> : <Clock className="w-5 h-5" />;

                                            return (
                                                <div
                                                    key={attempt.id}
                                                    className="rounded-xl overflow-hidden transition-all"
                                                    style={{
                                                        background: 'var(--bg-raised)',
                                                        border: '1px solid var(--border)',
                                                    }}
                                                >
                                                    {/* Accordion Header */}
                                                    <div
                                                        className="p-4 flex items-center justify-between cursor-pointer"
                                                        onClick={() => setExpandedAttempt(isExpanded ? null : attempt.id)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", getScoreBgClass(attempt.score))}>
                                                                {icon}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-bold text-sm">{sessionType}</h4>
                                                                <p className="text-[11px] mt-0.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                                                                    {new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-right">
                                                                <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Score</p>
                                                                <p className={cn("font-black", getScoreColorClass(attempt.score))}>{attempt.score}%</p>
                                                            </div>
                                                            {isExpanded ?
                                                                <ChevronUp className="w-5 h-5 opacity-50" /> :
                                                                <ChevronDown className="w-5 h-5 opacity-50" />
                                                            }
                                                        </div>
                                                    </div>

                                                    {/* Accordion Content */}
                                                    <AnimatePresence>
                                                        {isExpanded && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="px-4 pb-4 overflow-hidden"
                                                            >
                                                                <div className="pt-3 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
                                                                    <div className="flex justify-between text-xs">
                                                                        <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                                                                        <span className="font-semibold">{Math.floor((attempt.durationSeconds || 0) / 60)}m {(attempt.durationSeconds || 0) % 60}s</span>
                                                                    </div>
                                                                    <div className="flex justify-between text-xs">
                                                                        <span style={{ color: 'var(--text-muted)' }}>Accuracy:</span>
                                                                        <span className="font-semibold">{attempt.correctCount} / {attempt.totalCount} correct</span>
                                                                    </div>
                                                                    {(() => {
                                                                        const weakConcepts = attempt.conceptBreakdown?.filter(cb => cb.score < 60).map(cb => cb.conceptName || cb.conceptId) || [];
                                                                        if (weakConcepts.length === 0) return null;
                                                                        return (
                                                                            <div className="pt-2">
                                                                                <span className="text-[10px] font-bold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-muted)' }}>Weak Concepts</span>
                                                                                <div className="flex flex-wrap gap-1.5">
                                                                                    {weakConcepts.map(wc => (
                                                                                        <span key={wc} className="text-[10px] px-2 py-1 rounded-sm bg-red-500/10 text-red-500 font-semibold truncate max-w-full">
                                                                                            {wc}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}

                            {panelTab === 'insights' && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Brain className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                        <p className="text-sm font-semibold">Derived from quiz history</p>
                                    </div>

                                    {/* Categorize concepts based on status */}
                                    {['weak', 'neutral', 'strong'].map(status => {
                                        const concepts = selectedTopic.concepts.filter(c => c.status === status);
                                        if (concepts.length === 0) return null;

                                        const title = status === 'weak' ? 'Requires Attention' : status === 'strong' ? 'Mastered' : 'Developing';
                                        const colorClass = status === 'weak' ? 'text-red-500 bg-red-500/10' : status === 'strong' ? 'text-green-500 bg-green-500/10' : 'text-amber-500 bg-amber-500/10';

                                        return (
                                            <div key={status} className="space-y-2">
                                                <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</h4>
                                                {concepts.map(c => (
                                                    <div key={c.id} className="p-3 rounded-lg border" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>
                                                        <div className="flex gap-2">
                                                            <div className={cn("px-1.5 py-0.5 rounded text-[10px] font-bold uppercase self-start", colorClass)}>
                                                                {status}
                                                            </div>
                                                            <div className="text-sm font-medium">{c.text}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Pinned Action Buttons */}
                        <div className="p-6 border-t mt-auto" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                            <Link
                                href={`/learn/${selectedTopic.id}`}
                                className="w-full flex items-center justify-center gap-3 py-3.5 text-white font-bold transition-ui"
                                style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                            >
                                <Brain className="w-4 h-4" />
                                Start Review Session
                            </Link>
                            <div className="flex gap-3 mt-3">
                                <Link
                                    href={`/deep-dive?concept=${selectedTopic.concepts[0]?.id || ''}`}
                                    className="flex-1 py-3 border text-center text-sm font-bold transition-ui"
                                    style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                                >
                                    Deep Dive
                                </Link>
                                <button
                                    className="px-4 py-3 border flex items-center justify-center transition-ui bg-red-500/5 hover:bg-red-500/10 border-red-500/20"
                                    style={{ borderRadius: 'var(--radius-md)' }}
                                    onClick={() => {
                                        if (confirm(`Delete "${selectedTopic.name}" and all its data?`)) {
                                            handleDeleteTopic(selectedTopic.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    );
}
