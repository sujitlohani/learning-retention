'use client';

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Concept } from '@/src/types';
import { ConceptProgressCard } from './ConceptProgressCard';

interface ConceptProgressGridProps {
    concepts: Concept[];
    topicId: string;
}

export function ConceptProgressGrid({ concepts, topicId }: ConceptProgressGridProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Concepts</h2>
                <Link
                    href="/knowledge-base"
                    className="text-xs font-bold"
                    style={{ color: 'var(--accent)' }}
                >
                    View All
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {concepts.map((concept) => (
                    <ConceptProgressCard
                        key={concept.id}
                        concept={concept}
                        topicId={topicId}
                    />
                ))}

                {/* + New Concept card → navigates to /deep-dive (placeholder until Quick Capture Task 9) */}
                <Link
                    href="/deep-dive"
                    className="flex flex-col items-center justify-center gap-2 p-5 transition-all border border-dashed hover:border-solid"
                    style={{
                        borderColor: 'var(--border)',
                        borderRadius: 'var(--radius-md)',
                        color: 'var(--text-muted)',
                        minHeight: '120px',
                    }}
                >
                    <Plus className="w-6 h-6 opacity-40" />
                    <span className="text-xs font-bold uppercase tracking-wider">New Concept</span>
                </Link>
            </div>
        </div>
    );
}
