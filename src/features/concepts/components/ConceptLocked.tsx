import React from 'react';
import Link from 'next/link';
import { Bookmark, Share2, Layers, Signal, Clock, Info, TreePine, Sparkles, CheckCircle, BarChart3 } from 'lucide-react';
import { RelatedConcepts } from '@/src/shared/components/RelatedConcepts';
import { ConceptBreadcrumb } from './ConceptBreadcrumb';
import { PrerequisiteList } from './PrerequisiteList';
import { UnlockCTACard } from './UnlockCTACard';

export function ConceptLocked({ id }: { id: string }) {
    // TODO: replace with real data hook
    const concept = {
        id,
        name: "Random Forest",
        topic: "Machine Learning",
        difficulty: "Intermediate",
        time: "10 min",
        prerequisites: [
            { id: 'decision-trees', name: 'Decision Trees', status: 'done' as const },
            { id: 'overfitting', name: 'Overfitting', status: 'done' as const },
            { id: 'ensemble-learning', name: 'Ensemble Learning', status: 'locked' as const }
        ],
        pointsRequired: 200,
        currentPoints: 120
    };

    return (
        <div className="max-w-5xl mx-auto w-full px-4 py-8 lg:py-12 pl-0 md:pl-20">
            <div className="mb-8">
                <ConceptBreadcrumb topic={concept.topic} conceptName={concept.name} />

                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 mt-6">
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight">{concept.name}</h1>
                    <div className="flex gap-2">
                        <button className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-all">
                            <Bookmark className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-primary transition-all">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    <div className="flex h-9 items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 text-primary">
                        <Layers className="w-4 h-4" />
                        <p className="text-sm font-bold">{concept.topic}</p>
                    </div>
                    <div className="flex h-9 items-center justify-center gap-2 rounded-xl bg-amber-100/50 dark:bg-amber-900/30 px-4 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        <Signal className="w-4 h-4" />
                        <p className="text-sm font-bold">{concept.difficulty}</p>
                    </div>
                    <div className="flex h-9 items-center justify-center gap-2 rounded-xl bg-muted px-4 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <p className="text-sm font-bold">{concept.time}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    <section>
                        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            Concept Overview
                        </h2>
                        <div className="group relative overflow-hidden rounded-xl bg-card border shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="aspect-video w-full bg-muted relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-indigo-500/20 mix-blend-multiply" />
                                <TreePine className="w-12 h-12 text-muted-foreground/50 z-10" />
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold mb-2">Understanding {concept.name}</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    A Random Forest is an ensemble learning method that operates by constructing a multitude of decision trees at training time. It outputs the class that is the mode of the classes (classification) or mean prediction (regression) of the individual trees, effectively reducing overfitting.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-extrabold mb-4 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary" />
                            Why It Matters
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border bg-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed pt-0.5">Exceptional accuracy across diverse datasets without complex tuning.</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border bg-card">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center shrink-0">
                                        <BarChart3 className="w-5 h-5" />
                                    </div>
                                    <p className="text-sm font-medium leading-relaxed pt-0.5">Naturally handles missing values and maintains accuracy for large data volumes.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <RelatedConcepts unlocked={false} />
                </div>

                {/* Sidebar Content */}
                <div className="flex flex-col gap-8">
                    <PrerequisiteList prerequisites={concept.prerequisites} />
                    <UnlockCTACard required={concept.pointsRequired} current={concept.currentPoints} prereqs={concept.prerequisites} />
                </div>
            </div>
        </div>
    );
}
