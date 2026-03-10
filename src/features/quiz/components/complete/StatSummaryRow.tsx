import React from 'react';
import { Verified } from 'lucide-react';

interface StatSummaryRowProps {
    accuracy: number;
    correctAnswers: number;
    totalQuestions: number;
    xpEarned: number;
    rankPercentile: number;
}

export function StatSummaryRow({ accuracy, correctAnswers, totalQuestions, xpEarned, rankPercentile }: StatSummaryRowProps) {
    const dashoffset = 263.89 - (263.89 * accuracy) / 100;

    return (
        <div className="bg-card rounded-xl shadow-lg border p-8 flex flex-col md:flex-row items-center gap-10">

            {/* Circular Progress Bar */}
            <div className="relative w-40 h-40 shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-muted stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8" />
                    <circle
                        className="text-primary stroke-current transition-all duration-1000 ease-in-out"
                        cx="50" cy="50" fill="transparent" r="42"
                        strokeDasharray="263.89"
                        strokeDashoffset={dashoffset}
                        strokeLinecap="round" strokeWidth="8"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black">{accuracy}%</span>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Accuracy</span>
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-6 flex-1 text-center md:text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-lg bg-muted/50 border">
                        <p className="text-sm font-medium text-muted-foreground">Correct Answers</p>
                        <p className="text-2xl font-bold">
                            {correctAnswers} <span className="text-muted-foreground text-lg font-normal">/ {totalQuestions}</span>
                        </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                        <p className="text-sm font-medium text-primary">XP Earned</p>
                        <p className="text-2xl font-bold text-primary">+{xpEarned} XP</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center md:justify-start">
                    <Verified className="text-green-500 w-5 h-5" />
                    <span>You ranked in the top {rankPercentile}% for this quiz!</span>
                </div>
            </div>
        </div>
    );
}
