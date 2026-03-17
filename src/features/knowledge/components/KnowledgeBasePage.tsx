'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Brain, Search, TrendingUp, Clock, SortAsc } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Topic } from '@/src/types';

type StatusFilter = 'all' | 'strong' | 'weak' | 'unstarted';
type LevelFilter = 'all' | 'beginner' | 'intermediate' | 'expert';
type SortOption = 'mastery' | 'recent' | 'alpha';

function getScoreColor(score: number): string {
    if (score >= 75) return 'var(--success)';
    if (score >= 50) return 'var(--warning)';
    return 'var(--danger)';
}

function getLevelColor(level: string): string {
    if (level === 'beginner') return 'var(--success)';
    if (level === 'intermediate') return 'var(--warning)';
    return 'var(--danger)';
}

interface UnitHealthData {
    accuracy: number;
    attempted: boolean;
}

export function KnowledgeBasePage() {
    const [topics, setTopics] = useState<Topic[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('mastery');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

    // topicId → attempt count
    const [topicAttemptCounts, setTopicAttemptCounts] = useState<Record<string, number>>({});
    // topicId → unitId → { accuracy, attempted }
    const [unitHealth, setUnitHealth] = useState<Record<string, Record<string, UnitHealthData>>>({});

    useEffect(() => {
        const allTopics = topicsService.getTopics();
        setTopics(allTopics);

        const counts: Record<string, number> = {};
        const health: Record<string, Record<string, UnitHealthData>> = {};

        for (const topic of allTopics) {
            const attempts = quizHistoryService.getAttemptsByTopicId(topic.id);
            counts[topic.id] = attempts.length;

            // Build set of unit IDs that have been attempted
            const attemptedUnitIds = new Set<string>();
            for (const attempt of attempts) {
                if (attempt.targetUnitId) attemptedUnitIds.add(attempt.targetUnitId);
                for (const b of attempt.unitBreakdown) {
                    attemptedUnitIds.add(b.unitId);
                }
            }

            const unitMap: Record<string, UnitHealthData> = {};
            for (const unit of topic.units) {
                const accuracy = quizHistoryService.computeUnitAccuracy(topic.id, unit.id);
                unitMap[unit.id] = {
                    accuracy,
                    attempted: attemptedUnitIds.has(unit.id),
                };
            }
            health[topic.id] = unitMap;
        }

        setTopicAttemptCounts(counts);
        setUnitHealth(health);
    }, []);

    const filteredTopics = useMemo(() => {
        let result = [...topics];

        // Search: topic name only
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(t => t.name.toLowerCase().includes(q));
        }

        // Status filter
        if (statusFilter === 'strong') {
            result = result.filter(t => t.memoryScore >= 75);
        } else if (statusFilter === 'weak') {
            result = result.filter(t => t.memoryScore < 50);
        } else if (statusFilter === 'unstarted') {
            result = result.filter(t => (topicAttemptCounts[t.id] ?? 0) === 0);
        }

        // Level filter
        if (levelFilter !== 'all') {
            result = result.filter(t => t.level === levelFilter);
        }

        // Sort
        if (sortBy === 'mastery') {
            result.sort((a, b) => b.memoryScore - a.memoryScore);
        } else if (sortBy === 'recent') {
            result.sort((a, b) => {
                const aDate = a.lastPracticed ? new Date(a.lastPracticed).getTime() : 0;
                const bDate = b.lastPracticed ? new Date(b.lastPracticed).getTime() : 0;
                return bDate - aDate;
            });
        } else if (sortBy === 'alpha') {
            result.sort((a, b) => a.name.localeCompare(b.name));
        }

        return result;
    }, [topics, searchQuery, sortBy, statusFilter, levelFilter, topicAttemptCounts]);

    return (
        <div className="flex h-screen overflow-hidden w-full relative">
            {/* Left Filter Column */}
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
                            placeholder="Find topics..."
                            className="w-full h-11 pl-10 pr-4 rounded-lg border bg-transparent focus:outline-none focus:ring-2 transition-all text-sm"
                            style={{
                                borderColor: 'var(--border)',
                                background: 'var(--bg-raised)',
                                ['--tw-ring-color' as string]: 'var(--accent)'
                            }}
                        />
                    </div>
                </div>

                {/* Status Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Status</label>
                    <div className="flex flex-wrap gap-1.5">
                        {(['all', 'strong', 'weak', 'unstarted'] as StatusFilter[]).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize"
                                style={statusFilter === s
                                    ? { background: 'var(--accent-light)', color: 'var(--accent)' }
                                    : { background: 'var(--bg-raised)', color: 'var(--text-muted)' }
                                }
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Level Filter */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>Level</label>
                    <div className="flex flex-wrap gap-1.5">
                        {(['all', 'beginner', 'intermediate', 'expert'] as LevelFilter[]).map(l => (
                            <button
                                key={l}
                                onClick={() => setLevelFilter(l)}
                                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors capitalize"
                                style={levelFilter === l
                                    ? { background: 'var(--accent-light)', color: 'var(--accent)' }
                                    : { background: 'var(--bg-raised)', color: 'var(--text-muted)' }
                                }
                            >
                                {l}
                            </button>
                        ))}
                    </div>
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
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={sortBy === 'recent' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                        >
                            <Clock className="w-4 h-4" /> Last Reviewed
                        </button>
                        <button
                            onClick={() => setSortBy('alpha')}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
                            style={sortBy === 'alpha' ? { background: 'var(--accent-light)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                        >
                            <SortAsc className="w-4 h-4" /> Alphabetical
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                <div className="max-w-[1000px] mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                            {filteredTopics.length} Topic{filteredTopics.length !== 1 ? 's' : ''}
                        </span>
                    </div>

                    {/* Topics Grid */}
                    {filteredTopics.length === 0 ? (
                        <div className="text-center py-16 border rounded-xl border-dashed" style={{ borderColor: 'var(--border)' }}>
                            <Brain className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-base font-medium mb-1">No topics found.</p>
                            <p className="text-sm opacity-80" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {filteredTopics.map(topic => {
                                const scoreColor = getScoreColor(topic.memoryScore);
                                const topicUnits = unitHealth[topic.id] || {};
                                const unitEntries = topic.units.map(u => ({
                                    id: u.id,
                                    ...topicUnits[u.id] || { accuracy: 0, attempted: false },
                                }));

                                let strongCount = 0;
                                let weakCount = 0;

                                const dots = unitEntries.map(entry => {
                                    let color = 'var(--border)'; // unattempted
                                    if (entry.attempted) {
                                        if (entry.accuracy >= 75) {
                                            color = 'var(--success)';
                                            strongCount++;
                                        } else if (entry.accuracy < 50) {
                                            color = 'var(--danger)';
                                            weakCount++;
                                        } else {
                                            color = 'var(--warning)';
                                        }
                                    }
                                    return { id: entry.id, color };
                                });

                                const visibleDots = dots.slice(0, 8);
                                const overflowCount = dots.length - 8;

                                return (
                                    <Link key={topic.id} href={`/topics/${topic.id}`} className="flex flex-col group">
                                        <div
                                            className="p-4 border flex flex-col gap-3 h-full cursor-pointer transition-all"
                                            style={{
                                                background: 'var(--bg-surface)',
                                                borderColor: 'var(--border)',
                                                borderRadius: 'var(--radius-md)',
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
                                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                                        >
                                            {/* Top row */}
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="min-w-0">
                                                    <span
                                                        className="text-[10px] font-semibold uppercase tracking-widest"
                                                        style={{ color: getLevelColor(topic.level) }}
                                                    >
                                                        {topic.level}
                                                    </span>
                                                    <h3 className="text-[15px] font-bold mt-1 leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                                                        {topic.name}
                                                    </h3>
                                                    <span className="text-xs font-medium mt-1 block" style={{ color: 'var(--text-muted)' }}>
                                                        {topic.units.length} unit{topic.units.length !== 1 ? 's' : ''}
                                                        {topic.lastPracticed && (
                                                            <> · last {new Date(topic.lastPracticed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</>
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-[22px] font-[800] leading-none" style={{ color: scoreColor }}>
                                                        {topic.memoryScore}%
                                                    </div>
                                                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>
                                                        Mastery
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Mastery bar */}
                                            <div className="w-full rounded-full" style={{ height: '3px', background: 'var(--bg-raised)' }}>
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.max(2, topic.memoryScore)}%`,
                                                        background: scoreColor,
                                                        transition: 'width 350ms ease',
                                                    }}
                                                />
                                            </div>

                                            {/* Bottom row */}
                                            <div
                                                className="flex items-center gap-3 pt-2"
                                                style={{ borderTop: '1px solid var(--border)', paddingTop: '8px' }}
                                            >
                                                {/* Unit health dots */}
                                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                                    {visibleDots.map(dot => (
                                                        <div
                                                            key={dot.id}
                                                            className="rounded-full shrink-0"
                                                            style={{ width: '7px', height: '7px', background: dot.color }}
                                                        />
                                                    ))}
                                                    {overflowCount > 0 && (
                                                        <span className="text-[10px] font-bold ml-0.5 shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                            +{overflowCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Strong / weak counts */}
                                                <span className="text-[11px] font-medium shrink-0" style={{ color: 'var(--text-muted)' }}>
                                                    {strongCount} strong · {weakCount} weak
                                                </span>

                                                {/* Arrow */}
                                                <span className="text-sm font-bold shrink-0" style={{ color: 'var(--text-muted)' }}>→</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
