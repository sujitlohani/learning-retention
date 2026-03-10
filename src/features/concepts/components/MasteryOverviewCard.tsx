'use client';

import React from 'react';
import { Sparkles, History, Calendar } from 'lucide-react';
import { Progress } from '@/src/components/ui/progress';
import { useMastery } from '@/src/features/scoring/hooks/useMastery';

interface MasteryOverviewProps {
    conceptId: string;
}

export function MasteryOverviewCard({ conceptId }: MasteryOverviewProps) {
    const { record } = useMastery(conceptId);

    // Format state name (e.g. 'almost_mastered' -> 'Almost Mastered')
    const formattedState = record.state.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return (
        <section className="bg-primary text-primary-foreground rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Background glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <p className="text-primary-foreground/70 text-sm font-medium">Current Mastery</p>
                        <h4 className="text-4xl font-black">{record.percentage}%</h4>
                    </div>
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Progress
                        value={record.percentage}
                        className="h-2.5 bg-white/20 [&>div]:bg-white"
                    />
                    <div className="flex justify-between text-xs font-medium text-white/80">
                        <span className="flex items-center gap-1">
                            <History className="w-3.5 h-3.5" />
                            State: {formattedState}
                        </span>
                        <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            Next Review: Tomorrow
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
