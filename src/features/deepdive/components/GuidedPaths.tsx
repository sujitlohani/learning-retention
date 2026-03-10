import React from 'react';
import { Layers, Terminal, List } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Progress } from '@/src/components/ui/progress';
import Link from 'next/link';

// TODO: replace with real data hook
const GUIDED_PATHS = [
    {
        id: 'path-ds',
        name: 'Data Structures Foundations',
        description: 'A complete map from arrays to complex graph theory.',
        icon: Layers,
        conceptCount: 12,
        progressPercent: 45,
        firstUnlockedConceptId: 'binary-trees'
    },
    {
        id: 'path-python',
        name: 'Advanced Python Techniques',
        description: 'Deep dive into metaclasses, concurrency, and async architectures.',
        icon: Terminal,
        conceptCount: 8,
        progressPercent: 0,
        firstUnlockedConceptId: 'decorators'
    }
];

export function GuidedPaths() {
    return (
        <section className="mb-16">
            <h2 className="text-2xl font-bold flex items-center gap-3 mb-8">
                <span className="text-primary text-xl font-black">⟶</span>
                Guided Concept Paths
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {GUIDED_PATHS.map((path) => {
                    const Icon = path.icon;
                    const isStarted = path.progressPercent > 0;
                    return (
                        <div key={path.id} className="bg-card rounded-xl p-6 border flex flex-col sm:flex-row gap-6 hover:border-primary/50 transition-all">
                            <div className="sm:w-32 h-32 rounded-lg bg-primary/5 flex items-center justify-center shrink-0">
                                <Icon className={isStarted ? "w-12 h-12 text-primary" : "w-12 h-12 text-muted-foreground"} />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-xl font-bold mb-1">{path.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">{path.description}</p>

                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                            <List className="w-3.5 h-3.5" /> {path.conceptCount} Concepts
                                        </span>
                                        <div className="flex-1">
                                            <Progress value={path.progressPercent} className="h-1.5" />
                                        </div>
                                        <span className={`text-xs font-bold ${isStarted ? 'text-primary' : 'text-muted-foreground'}`}>
                                            {path.progressPercent}%
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    asChild
                                    variant={isStarted ? "default" : "secondary"}
                                    className={isStarted ? "self-start font-bold shadow-lg shadow-primary/20" : "self-start font-bold"}
                                >
                                    <Link href={`/concepts/${path.firstUnlockedConceptId}`}>
                                        {isStarted ? "Continue Path" : "Start Path"}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
