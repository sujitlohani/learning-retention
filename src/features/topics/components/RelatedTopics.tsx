'use client';

import Link from 'next/link';
import { Topic } from '@/src/types';

interface RelatedTopicsProps {
    currentTopicId: string;
    allTopics: Topic[];
}

export function RelatedTopics({ currentTopicId, allTopics }: RelatedTopicsProps) {
    const related = allTopics.filter(t => t.id !== currentTopicId).slice(0, 6);

    if (related.length === 0) return null;

    return (
        <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Related Topics</h3>
            <div className="flex flex-wrap gap-2">
                {related.map((topic) => (
                    <Link
                        key={topic.id}
                        href={`/topics/${topic.id}`}
                        className="px-3 py-1.5 text-xs font-semibold transition-colors"
                        style={{
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border)',
                            borderRadius: '9999px',
                            color: 'var(--text-primary)',
                        }}
                    >
                        {topic.name}
                    </Link>
                ))}
            </div>
        </div>
    );
}
