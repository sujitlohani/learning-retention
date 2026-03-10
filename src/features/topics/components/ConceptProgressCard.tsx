'use client';

import Link from 'next/link';
import { Lock, CheckCircle, ExternalLink } from 'lucide-react';
import { useMastery } from '@/src/features/scoring/hooks/useMastery';
import { Concept } from '@/src/types';

function getMasteryColor(state: string) {
    if (state === 'mastered') return 'var(--success)';
    if (state === 'almost_mastered') return 'var(--success)';
    if (state === 'strong') return 'var(--warning)';
    if (state === 'weak') return 'var(--danger)';
    if (state === 'learning') return 'var(--accent)';
    return 'var(--text-muted)';
}

function getMasteryBg(state: string) {
    if (state === 'mastered' || state === 'almost_mastered') return 'color-mix(in srgb, var(--success) 12%, transparent)';
    if (state === 'strong') return 'color-mix(in srgb, var(--warning) 12%, transparent)';
    if (state === 'weak') return 'color-mix(in srgb, var(--danger) 12%, transparent)';
    if (state === 'learning') return 'color-mix(in srgb, var(--accent) 12%, transparent)';
    return 'color-mix(in srgb, var(--text-muted) 12%, transparent)';
}

function getStateLabel(state: string) {
    if (state === 'mastered') return 'Mastered';
    if (state === 'almost_mastered') return 'Almost';
    if (state === 'strong') return 'Strong';
    if (state === 'weak') return 'Weak';
    if (state === 'learning') return 'Learning';
    return 'New';
}

interface ConceptProgressCardProps {
    concept: Concept;
    topicId: string;
}

export function ConceptProgressCard({ concept, topicId }: ConceptProgressCardProps) {
    const { record } = useMastery(concept.id);
    const isLocked = record.state === 'new' && record.percentage === 0 && !concept.familiar;
    const isMastered = record.state === 'mastered';

    return (
        <Link
            href={`/concepts/${concept.id}`}
            className="flex flex-col p-5 transition-all group"
            style={{
                background: isLocked ? 'var(--bg-base)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: isMastered ? 'color-mix(in srgb, var(--success) 40%, var(--border))' : 'var(--border)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-resting)',
                opacity: isLocked ? 0.7 : 1,
            }}
        >
            <div className="flex items-start justify-between mb-3">
                <h4 className="text-sm font-bold leading-tight pr-4" style={{ color: isLocked ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {concept.text}
                </h4>
                {isLocked ? (
                    <Lock className="w-4 h-4 shrink-0 opacity-40" />
                ) : (
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-40 transition-opacity" />
                )}
            </div>

            {isLocked ? (
                <p className="text-[11px] mt-auto" style={{ color: 'var(--text-muted)' }}>
                    Complete prerequisites to unlock
                </p>
            ) : (
                <>
                    <div className="flex items-center justify-between mb-1.5">
                        <span
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: getMasteryColor(record.state) }}
                        >
                            {getStateLabel(record.state)}
                        </span>
                        <span className="text-[11px] font-bold" style={{ color: 'var(--text-muted)' }}>
                            {record.percentage}%
                        </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                        <div
                            className="h-full rounded-full"
                            style={{
                                width: `${record.percentage}%`,
                                background: getMasteryColor(record.state),
                                transition: 'width 350ms ease',
                            }}
                        />
                    </div>

                    {isMastered && (
                        <div className="flex items-center gap-1 mt-2">
                            <CheckCircle className="w-3 h-3" style={{ color: 'var(--success)' }} />
                            <span className="text-[10px] font-bold" style={{ color: 'var(--success)' }}>Completed</span>
                        </div>
                    )}
                </>
            )}
        </Link>
    );
}
