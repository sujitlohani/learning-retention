import React from 'react';
import { TrendingUp, Lock, Network, Database, BrainCircuit, Users } from 'lucide-react';

// TODO: replace with real data hook
const TRENDING_CONCEPTS = [
    {
        id: 'graph-algos',
        topicLabel: 'Algorithms',
        conceptName: 'Graph Algorithms',
        userCount: '1.2k+',
        icon: Network,
        iconColor: 'text-blue-500 dark:text-blue-400',
        iconBg: 'bg-blue-100 dark:bg-blue-500/20'
    },
    {
        id: 'rest-apis',
        topicLabel: 'Web',
        conceptName: 'REST APIs',
        userCount: '850+',
        icon: Database,
        iconColor: 'text-purple-500 dark:text-purple-400',
        iconBg: 'bg-purple-100 dark:bg-purple-500/20'
    },
    {
        id: 'neural-networks',
        topicLabel: 'AI',
        conceptName: 'Neural Networks',
        userCount: '3.4k+',
        icon: BrainCircuit,
        iconColor: 'text-rose-500 dark:text-rose-400',
        iconBg: 'bg-rose-100 dark:bg-rose-500/20'
    }
];

export function TrendingConcepts() {
    return (
        <section className="mb-16">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
                <TrendingUp className="w-6 h-6 text-primary" />
                ↑ Trending Concepts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TRENDING_CONCEPTS.map((concept) => {
                    const Icon = concept.icon;
                    return (
                        <div key={concept.id} className="bg-gradient-to-br from-card to-muted p-6 rounded-xl border flex items-center gap-4 hover:shadow-sm transition-all group cursor-pointer">
                            <div className={`p-3 rounded-lg ${concept.iconBg}`}>
                                <Icon className={`w-6 h-6 ${concept.iconColor}`} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold">{concept.conceptName}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[10px] font-bold text-primary uppercase">{concept.topicLabel}</span>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" /> {concept.userCount}
                                    </span>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-background rounded-lg text-muted-foreground hover:text-primary transition-all">
                                <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
