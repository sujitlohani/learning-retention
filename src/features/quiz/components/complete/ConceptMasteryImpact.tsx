import React from 'react';
import { Progress } from '@/src/components/ui/progress';
import { useMastery } from '@/src/features/scoring/hooks/useMastery';

interface Impact {
    id: string;
    name: string;
    pointsAdded: number;
    newPercent?: number;
    state?: string;
}

function ImpactRow({ impact }: { impact: Impact }) {
    const { record } = useMastery(impact.id);
    const formattedState = record.state.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return (
        <div key={impact.id} className="bg-card p-5 rounded-xl border shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold">{impact.name}</h3>
                    <p className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-500/10 px-2 py-0.5 rounded-full inline-block mt-1">
                        State: {formattedState}
                    </p>
                </div>
                <span className="text-sm font-bold">{record.percentage}%</span>
            </div>

            <div className="flex-1">
                <Progress value={record.percentage} className="h-2.5" />
            </div>
        </div>
    );
}

export function ConceptMasteryImpact({ impacts }: { impacts: Impact[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Concept Mastery Impact</h2>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Growth Tracking</span>
            </div>

            <div className="grid gap-4">
                {impacts.map((impact) => (
                    <ImpactRow key={impact.id} impact={impact} />
                ))}
            </div>
        </div>
    );
}
