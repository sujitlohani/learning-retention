'use client';

import Link from 'next/link';
import { ArrowRight, Zap, BookOpen, Award } from 'lucide-react';
import { Topic } from '@/src/types';
import { useTopicProgress } from '@/src/features/scoring/hooks/useTopicProgress';
import { useXP } from '@/src/features/scoring/hooks/useXP';

interface TopicHeaderProps {
    topic: Topic;
}

export function TopicHeader({ topic }: TopicHeaderProps) {
    const { percentage, breakdown, xpEarned } = useTopicProgress(topic.id);

    // Find the first non-mastered concept to link CTA to
    const nextConceptId = topic.concepts.find(c => {
        const state = breakdown;
        // Simple heuristic: if concept is not in mastered bucket, it's a candidate
        return c.status !== 'strong';
    })?.id;

    return (
        <div className="space-y-6">
            {/* Category + Status */}
            <div className="flex items-center gap-3">
                <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                    {topic.level}
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
                    <span className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>Active</span>
                </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{topic.name}</h1>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
                {/* Progress */}
                <div
                    className="p-4 flex items-center gap-4"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-resting)',
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
                        <Zap className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Mastery</div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold">{percentage}%</span>
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                                <div className="h-full rounded-full" style={{ width: `${percentage}%`, background: 'var(--accent)', transition: 'width 350ms ease' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Concepts Mastered */}
                <div
                    className="p-4 flex items-center gap-4"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-resting)',
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
                        <Award className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Concepts</div>
                        <span className="text-2xl font-bold">{breakdown.mastered + breakdown.almost_mastered}</span>
                        <span className="text-sm font-medium ml-1" style={{ color: 'var(--text-muted)' }}>/ {breakdown.total}</span>
                    </div>
                </div>

                {/* XP Earned */}
                <div
                    className="p-4 flex items-center gap-4"
                    style={{
                        background: 'var(--bg-surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-resting)',
                    }}
                >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--warning) 12%, transparent)', color: 'var(--warning)' }}>
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>XP Earned</div>
                        <span className="text-2xl font-bold">{xpEarned}</span>
                    </div>
                </div>
            </div>

            {/* CTA */}
            {nextConceptId && (
                <Link
                    href={`/concepts/${nextConceptId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-white transition-all"
                    style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                >
                    Continue Learning <ArrowRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
