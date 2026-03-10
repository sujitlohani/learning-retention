'use client';

import React from 'react';
import { LockOpen, Coins } from 'lucide-react';
import { Progress } from '@/src/components/ui/progress';
import { Button } from '@/src/components/ui/button';
import { useXP } from '@/src/features/scoring/hooks/useXP';

interface UnlockCTACardProps {
    required: number;
    current: number;
    prereqs: { status: string }[];
}

export function UnlockCTACard({ required, current, prereqs }: UnlockCTACardProps) {
    const { balance, spend, canAfford } = useXP();

    // In a real app we'd trigger a toast or navigate, but here we just spend
    const handleUnlock = () => {
        if (canAfford(required)) {
            spend(required);
            // Optionally dispatch a local event or allow the parent to handle transition
            window.dispatchEvent(new Event('concept_unlocked'));
        }
    };

    const completedPrereqs = prereqs.filter(p => p.status === 'done').length;
    const totalPrereqs = prereqs.length;

    // Check if the user can afford it based on the live balance
    const canUnlock = completedPrereqs === totalPrereqs && canAfford(required);

    return (
        <section className="p-6 rounded-xl bg-card border text-card-foreground shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                    <LockOpen className="w-6 h-6" />
                </div>

                <h2 className="text-xl font-black mb-2 tracking-tight">Unlock Concept</h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    Complete the final prerequisite and earn enough concept points to master this concept.
                </p>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Prerequisites</span>
                        <span>{completedPrereqs}/{totalPrereqs}</span>
                    </div>
                    <Progress
                        value={(completedPrereqs / totalPrereqs) * 100}
                        className="h-2"
                    />

                    <div className="flex items-center gap-2 text-xs font-bold bg-muted px-3 py-2 rounded-lg border">
                        <Coins className={`w-4 h-4 ${canAfford(required) ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={canAfford(required) ? 'text-primary' : ''}>Points: {balance} / {required} XP</span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        className="w-full font-bold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                        disabled={!canUnlock}
                        onClick={handleUnlock}
                    >
                        Unlock Concept
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full font-bold py-6 rounded-xl transition-all"
                    >
                        Save for Later
                    </Button>
                </div>
            </div>
        </section>
    );
}
