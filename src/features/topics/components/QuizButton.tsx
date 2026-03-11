'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

export interface QuizButtonProps {
    onStart: () => void;
    label?: string;
    className?: string;
}

export function QuizButton({ onStart, label = 'Start', className }: QuizButtonProps) {
    const [isRolling, setIsRolling] = useState(false);
    const [isRolled, setIsRolled] = useState(false);

    const handleDiceClick = () => {
        if (isRolling) return;
        setIsRolling(true);
        // Remove rolled state briefly if it was already rolled
        setIsRolled(false);

        // Match the animation duration from the reference (580ms approx)
        setTimeout(() => {
            setIsRolling(false);
            setIsRolled(true);
        }, 580);
    };

    const handleStartClick = () => {
        if (isRolled) {
            setIsRolled(false);
        }
        onStart();
    };

    return (
        <div className={cn("flex items-center gap-1.5 pb-5", className)}>
            <button
                onClick={handleStartClick}
                className={cn(
                    "relative px-5 py-2 font-display text-[13px] font-bold rounded-md border-[1.5px] transition-all duration-150 ease-in-out whitespace-nowrap",
                    isRolled
                        ? "bg-[var(--bg-raised)] border-[var(--accent)] text-[var(--accent)] shadow-none"
                        : "bg-[var(--accent)] border-transparent text-white shadow-[var(--shadow-resting)] hover:brightness-110 hover:shadow-[var(--shadow-raised)] hover:-translate-y-[1px] active:translate-y-0"
                )}
            >
                {label}
                
                {/* New Tag */}
                <span
                    className={cn(
                        "absolute -bottom-[17px] left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-wider uppercase whitespace-nowrap pointer-events-none transition-opacity duration-200",
                        isRolled ? "opacity-100 text-[var(--success)]" : "opacity-0"
                    )}
                >
                    ● new set
                </span>
            </button>

            <div className="relative flex-shrink-0 group">
                <button
                    onClick={handleDiceClick}
                    className={cn(
                        "w-9 h-9 rounded-[8px] border-[1.5px] flex items-center justify-center transition-all duration-150 ease-in-out",
                        isRolled
                            ? "bg-[var(--bg-raised)] border-[var(--accent)] text-[var(--accent)]"
                            : "bg-[var(--bg-raised)] border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]"
                    )}
                >
                    <svg
                        className={cn("block w-4 h-4", isRolling && "animate-[spin_0.55s_cubic-bezier(0.36,0.07,0.19,0.97)_infinite]")}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="2" y="2" width="20" height="20" rx="4" />
                        <circle cx="8" cy="8" r="1.4" fill="currentColor" stroke="none" />
                        <circle cx="16" cy="8" r="1.4" fill="currentColor" stroke="none" />
                        <circle cx="8" cy="16" r="1.4" fill="currentColor" stroke="none" />
                        <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
                    </svg>
                </button>

                {/* Hover Tooltip via CSS pseudo-element logic translated to a span */}
                {!isRolling && !isRolled && (
                    <div
                        className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-medium px-2 py-1 rounded-[6px] whitespace-nowrap shadow-[var(--shadow-resting)] pointer-events-none z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    >
                        Roll to regen
                    </div>
                )}
            </div>
        </div>
    );
}
