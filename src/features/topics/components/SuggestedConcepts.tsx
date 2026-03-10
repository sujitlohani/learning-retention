'use client';

import { PlusCircle, Compass } from 'lucide-react';
import { Concept } from '@/src/types';
import { useMastery } from '@/src/features/scoring/hooks/useMastery';

interface SuggestedConceptRowProps {
    concept: Concept;
}

function SuggestedConceptRow({ concept }: SuggestedConceptRowProps) {
    const { record } = useMastery(concept.id);

    // Only show concepts that are "new" (locked / not started)
    if (record.state !== 'new') return null;

    return (
        <div
            className="flex items-center gap-3 p-3 transition-colors"
            style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
            }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}
            >
                <Compass className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{concept.text}</p>
            </div>
            <button
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                title="Unlock concept"
            >
                <PlusCircle className="w-4 h-4" />
            </button>
        </div>
    );
}

interface SuggestedConceptsProps {
    concepts: Concept[];
}

export function SuggestedConcepts({ concepts }: SuggestedConceptsProps) {
    // Filter to new/locked concepts only (max 3)
    const suggestions = concepts.filter(c => c.status === 'neutral' || c.status === 'weak').slice(0, 3);

    if (suggestions.length === 0 && concepts.length > 0) {
        // Fallback: show first 2 concepts if none match the filter
        return null;
    }

    return (
        <div className="space-y-3">
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Suggested For You</h3>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Expand your knowledge base</p>
            </div>

            <div className="space-y-2">
                {suggestions.map((concept) => (
                    <SuggestedConceptRow key={concept.id} concept={concept} />
                ))}
            </div>
        </div>
    );
}
