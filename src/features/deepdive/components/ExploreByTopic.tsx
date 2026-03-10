import React from 'react';
import { LayoutGrid, Code2, Database, Network, FileJson, Shield, Cloud } from 'lucide-react';

// TODO: replace with real data hook
const TOPICS = [
    { id: 'python', name: 'Python', count: 42, icon: Code2 },
    { id: 'databases', name: 'Databases', count: 28, icon: Database },
    { id: 'system-design', name: 'System Design', count: 15, icon: Network },
    { id: 'javascript', name: 'JavaScript', count: 36, icon: FileJson },
    { id: 'security', name: 'Security', count: 21, icon: Shield },
    { id: 'cloud', name: 'Cloud Ops', count: 19, icon: Cloud },
];

export function ExploreByTopic() {
    return (
        <section className="mb-16">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
                <LayoutGrid className="w-6 h-6 text-primary" />
                ⊞ Explore by Topic
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {TOPICS.map((topic) => {
                    const Icon = topic.icon;
                    return (
                        <div key={topic.id} className="bg-card p-6 rounded-xl border text-center hover:border-primary cursor-pointer transition-all group">
                            <Icon className="w-8 h-8 mx-auto text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                            <h5 className="font-bold text-sm tracking-tight">{topic.name}</h5>
                            <p className="text-xs text-muted-foreground mt-1">{topic.count} Concepts</p>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
