import React from 'react';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ConceptBreadcrumb } from './ConceptBreadcrumb';
import { RelatedConcepts } from '@/src/shared/components/RelatedConcepts';
import { DetailedExplanation } from './DetailedExplanation';
import { KeyIdeasList } from './KeyIdeasList';
import { MasteryOverviewCard } from './MasteryOverviewCard';
import { QuickPracticeCard } from './QuickPracticeCard';
import { ConceptDiagram } from './ConceptDiagram';

export function ConceptUnlocked({ id }: { id: string }) {
    // TODO: replace with real data hook
    const concept = {
        id,
        name: "Random Forest",
        topic: "Machine Learning",
        difficulty: "Intermediate",
        masteryPercent: 63,
        masteryState: "Learning",
    };

    return (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 pl-0 md:pl-20">
            <ConceptBreadcrumb topic={concept.topic} conceptName={concept.name} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area (8 cols) */}
                <div className="lg:col-span-8 space-y-8">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex gap-2 mb-3">
                                <Badge variant="secondary" className="bg-primary/10 text-primary uppercase font-bold text-xs tracking-wider rounded-sm">
                                    {concept.topic}
                                </Badge>
                                <Badge variant="secondary" className="bg-muted text-muted-foreground uppercase font-bold text-xs tracking-wider rounded-sm">
                                    {concept.difficulty}
                                </Badge>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">{concept.name}</h2>
                        </div>

                        <Button className="flex items-center gap-2 font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform" size="lg">
                            <PlayCircle className="w-5 h-5" />
                            Resume Session
                        </Button>
                    </div>

                    <section className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
                        <h3 className="text-xl font-bold mb-4">Detailed Explanation</h3>

                        <DetailedExplanation />
                        <ConceptDiagram />

                        <div className="mt-6 text-muted-foreground leading-relaxed">
                            <p>The strength of Random Forest lies in its "randomness". By introducing variability through bagging (Bootstrap Aggregating) and feature randomness, it ensures that individual trees don't overfit to specific noise in the training set.</p>
                        </div>

                        <KeyIdeasList />
                    </section>

                    <RelatedConcepts unlocked={true} />
                </div>

                {/* Sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <MasteryOverviewCard conceptId={concept.id} />
                    <QuickPracticeCard conceptId={concept.id} />
                </div>
            </div>
        </div>
    );
}
