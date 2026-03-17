'use client';

import { useState, useEffect } from 'react';
import { Topic } from '@/src/types';
import { QuizButton } from './QuizButton';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { ListFilter, Search } from 'lucide-react';

type FilterType = 'all' | 'weak' | 'strong' | 'unattempted';

interface TopicUnitsProps {
    topic: Topic;
    initialFilter?: FilterType | null;
    onFilterConsumed?: () => void;
}

export function TopicUnits({ topic, initialFilter, onFilterConsumed }: TopicUnitsProps) {
    const { startQuiz } = useQuizSession();
    const [filter, setFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    
    const [computedUnits, setComputedUnits] = useState<(typeof topic.units[0] & { computedStatus: string, computedScore: number, attempts: number })[]>([]);

    useEffect(() => {
        const stats = topic.units.map(u => {
            const historyStats = quizHistoryService.getUnitStats(topic.id, u.id);
            const score = quizHistoryService.computeUnitAccuracy(topic.id, u.id);
            
            let status = 'neutral';
            if (historyStats.attempts > 0) {
                if (score >= 75) status = 'strong';
                else if (score < 50) status = 'weak';
            }

            return {
                ...u,
                computedStatus: status,
                computedScore: score,
                attempts: historyStats.attempts
            };
        });
        setComputedUnits(stats);
    }, [topic]);

    useEffect(() => {
        if (initialFilter) {
            setFilter(initialFilter);
            if (onFilterConsumed) onFilterConsumed();
        }
    }, [initialFilter, onFilterConsumed]);

    const handleStartUnit = (unitId: string) => {
        startQuiz({ type: 'unit-test', topicId: topic.id, targetUnitId: unitId });
    };

    let filteredUnits = computedUnits;
    
    if (filter === 'weak') filteredUnits = filteredUnits.filter(u => u.computedStatus === 'weak');
    if (filter === 'strong') filteredUnits = filteredUnits.filter(u => u.computedStatus === 'strong');
    if (filter === 'unattempted') filteredUnits = filteredUnits.filter(u => u.attempts === 0);

    if (searchQuery.trim() !== '') {
        const lowerQ = searchQuery.toLowerCase();
        filteredUnits = filteredUnits.filter(u => u.text.toLowerCase().includes(lowerQ));
    }

    return (
        <div className="space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <ListFilter className="w-5 h-5 text-[var(--text-muted)]" />
                    <div className="flex bg-[var(--bg-raised)] p-1 rounded-md border border-[var(--border)]">
                        {(['all', 'weak', 'strong', 'unattempted'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-1.5 text-xs font-semibold rounded ${filter === f ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-[var(--shadow-resting)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'} transition-all capitalize`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search units..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-4 py-2 text-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-md outline-none focus:border-[var(--accent)] text-[var(--text-primary)] w-full sm:w-64 transition-ui"
                    />
                </div>
            </div>

            {/* List */}
            <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border)] shadow-[var(--shadow-resting)] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-raised)] text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    <div className="col-span-5">Unit Name</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-3 text-center">Score</div>
                    <div className="col-span-2 text-right pr-4">Action</div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                    {filteredUnits.length === 0 ? (
                        <div className="p-8 text-center text-[var(--text-muted)] text-sm font-medium">
                            No units found.
                        </div>
                    ) : (
                        filteredUnits.map(unit => {
                            const { computedStatus, computedScore: score, attempts } = unit;
                            
                            let statusColor = 'var(--text-muted)';
                            if (computedStatus === 'weak') {
                                statusColor = 'var(--danger)';
                            } else if (computedStatus === 'strong') {
                                statusColor = 'var(--success)';
                            }
                            
                            let scoreColor = 'var(--text-muted)';
                            if (attempts > 0) {
                                if (score >= 75) scoreColor = 'var(--success)';
                                else if (score >= 50) scoreColor = 'var(--warning)';
                                else scoreColor = 'var(--danger)';
                            }

                            return (
                                <div key={unit.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-[var(--bg-raised)] transition-colors">
                                    <div className="col-span-5">
                                        <p className="font-semibold text-[14px] text-[var(--text-primary)]">
                                            {unit.text}
                                        </p>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <span
                                            className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md"
                                            style={{
                                                color: statusColor,
                                                backgroundColor: computedStatus === 'neutral' ? 'var(--bg-raised)' : `${statusColor}20`,
                                                border: `1px solid ${computedStatus === 'neutral' ? 'var(--border)' : statusColor}40`
                                            }}
                                        >
                                            {attempts === 0 ? 'neutral' : computedStatus}
                                        </span>
                                    </div>
                                    <div className="col-span-3 flex justify-center flex-col items-center">
                                        {attempts === 0 ? (
                                            <span style={{ color: 'var(--text-muted)' }}>—</span>
                                        ) : (
                                            <>
                                                <span className="font-bold tracking-tight" style={{ color: scoreColor }}>{score}%</span>
                                                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">{attempts} attempt{attempts !== 1 && 's'}</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <QuizButton onStart={() => handleStartUnit(unit.id)} />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </div>
    );
}
