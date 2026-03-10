import React from 'react';
import Link from 'next/link';
import { Network, TrendingUp, BarChart3, GitFork } from 'lucide-react';

interface RelatedConceptsProps {
    unlocked?: boolean;
}

interface RelatedConceptItem {
    id: string;
    type: string;
    name: string;
    desc: string;
    icon?: string;
}

// Icon lookup map for dynamic icon rendering
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    schema: GitFork,
    trending_up: TrendingUp,
    bar_chart: BarChart3,
};

// TODO: replace with real data hook
const RELATED_LOCKED: RelatedConceptItem[] = [
    { id: 'gradient-boosting', type: 'Technique', name: 'Gradient Boosting', desc: 'Sequential ensemble method focused on error correction.' },
    { id: 'bagging', type: 'Strategy', name: 'Bagging', desc: 'Bootstrap Aggregating for variance reduction.' },
    { id: 'feature-importance', type: 'Analytics', name: 'Feature Importance', desc: 'Quantifying the impact of input variables.' }
];

const RELATED_UNLOCKED: RelatedConceptItem[] = [
    { id: 'decision-trees', type: 'Model', name: 'Decision Trees', desc: 'The building block of forests.', icon: 'schema' },
    { id: 'gradient-boosting', type: 'Technique', name: 'Gradient Boosting', desc: 'Sequential ensemble optimization.', icon: 'trending_up' },
    { id: 'feature-importance', type: 'Analytics', name: 'Feature Importance', desc: 'How models value variables.', icon: 'bar_chart' }
];

export function RelatedConcepts({ unlocked = false }: RelatedConceptsProps) {
    const data = unlocked ? RELATED_UNLOCKED : RELATED_LOCKED;

    return (
        <section>
            <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                <Network className="w-5 h-5 text-primary" />
                Related Concepts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {data.map((item) => {
                    const IconComponent = item.icon ? ICON_MAP[item.icon] : null;
                    return (
                        <Link href={`/concepts/${item.id}`} key={item.id}>
                            <div className="p-4 rounded-xl bg-card border hover:border-primary/50 transition-all cursor-pointer group h-full">
                                {!unlocked ? (
                                    <>
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{item.type}</p>
                                        <h4 className="font-bold mb-1">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{item.desc}</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                            {IconComponent ? <IconComponent className="w-5 h-5" /> : <Network className="w-5 h-5" />}
                                        </div>
                                        <h4 className="font-bold mb-1">{item.name}</h4>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </>
                                )}
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
