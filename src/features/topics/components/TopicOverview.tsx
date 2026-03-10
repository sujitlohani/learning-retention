'use client';

import { Layers, Unlock, Lock } from 'lucide-react';
import { Topic } from '@/src/types';
import { useTopicProgress } from '@/src/features/scoring/hooks/useTopicProgress';

interface TopicOverviewProps {
    topic: Topic;
}

export function TopicOverview({ topic }: TopicOverviewProps) {
    const { breakdown } = useTopicProgress(topic.id);
    const totalConcepts = breakdown.total;
    const unlockedCount = totalConcepts - breakdown.new;
    const lockedCount = breakdown.new;

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold">Topic Overview</h2>

            {/* Description placeholder */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                A collection of {totalConcepts} concept{totalConcepts !== 1 ? 's' : ''} covering key areas of {topic.name}. Track your mastery progress and unlock new concepts as you learn.
            </p>

            {/* Three stat boxes */}
            <div className="grid grid-cols-3 gap-3">
                <div
                    className="p-4 text-center"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    <Layers className="w-5 h-5 mx-auto mb-2 opacity-40" />
                    <div className="text-2xl font-bold">{totalConcepts}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Total</div>
                </div>
                <div
                    className="p-4 text-center"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    <Unlock className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                    <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{unlockedCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Unlocked</div>
                </div>
                <div
                    className="p-4 text-center"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                    }}
                >
                    <Lock className="w-5 h-5 mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <div className="text-2xl font-bold">{lockedCount}</div>
                    <div className="text-[10px] font-bold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>Locked</div>
                </div>
            </div>
        </div>
    );
}
