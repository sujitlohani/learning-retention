'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/src/lib/utils';

export interface QuizButtonProps {
    onStart: () => void;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
    label?: string;
    className?: string;
}

export function QuizButton({ onStart, onRegenerate, isRegenerating = false, label = 'Start', className }: QuizButtonProps) {
    const [isRolled, setIsRolled] = useState(false);

    const handleRegenerate = async () => {
        if (!onRegenerate) return;
        setIsRolled(false);
        await onRegenerate();
        setIsRolled(true);
    };

    const handleStart = () => {
        onStart();
        setIsRolled(false);
    };

    return (
        <div className={cn("flex items-center gap-1.5 pb-5 mt-5", className)}>
            <button
                onClick={handleStart}
                className={cn(
                    "relative px-5 py-2 font-display text-[13px] font-bold rounded-md border-[1.5px] transition-all duration-150 ease-in-out whitespace-nowrap",
                    isRolled
                        ? "bg-[var(--bg-raised)] border-[var(--accent)] text-[var(--accent)] shadow-none"
                        : "bg-[var(--accent)] border-transparent text-white shadow-[var(--shadow-resting)] hover:brightness-110 hover:shadow-[var(--shadow-raised)] hover:-translate-y-[1px] active:translate-y-0"
                )}
            >
                {label}
                <span 
                    className={cn(
                        "absolute -bottom-[17px] left-1/2 -translate-x-1/2 text-[9px] font-semibold tracking-[0.08em] uppercase whitespace-nowrap pointer-events-none transition-opacity duration-200",
                        isRolled ? "opacity-100 text-[var(--success)]" : "opacity-0"
                    )}
                >
                    ● new set
                </span>
            </button>
            
            {onRegenerate && (
                <div className="relative flex-shrink-0 group">
                    <button
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                        className={cn(
                            "relative w-9 h-9 flex items-center justify-center rounded-md border-[1.5px] transition-all duration-150",
                            isRolled
                                ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--bg-raised)]"
                                : "border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                        )}
                    >
                        <svg 
                            className={cn("w-4 h-4", isRegenerating && "animate-spin")} 
                            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                        >
                            <rect x="2" y="2" width="20" height="20" rx="4"/>
                            <circle cx="8"  cy="8"  r="1.4" fill="currentColor" stroke="none"/>
                            <circle cx="16" cy="8"  r="1.4" fill="currentColor" stroke="none"/>
                            <circle cx="8"  cy="16" r="1.4" fill="currentColor" stroke="none"/>
                            <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none"/>
                        </svg>
                    </button>
                    <div className="absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-medium px-2 py-1 rounded-[var(--radius-sm)] whitespace-nowrap shadow-[var(--shadow-resting)] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        Roll to regen
                    </div>
                </div>
            )}
        </div>
    );
}
