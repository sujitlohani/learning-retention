'use client';

import { cn } from '@/src/lib/utils';

/**
 * Memora Logo Mark — Graph/Node Triangle
 * Three nodes connected in a triangle formation.
 * Uses currentColor so it inherits color from context.
 * 
 * Specs:
 * - Wordmark: Plus Jakarta Sans Bold
 * - Lockup gap: 12px fixed
 * - All strokes/fills use currentColor for theme adaptability
 * - Dark mode: white mark + white wordmark on --bg-base
 * - Light mode: dark mark + dark wordmark on light background
 * - Hover state: mark shifts to --accent color
 */

interface MemoraMarkProps {
    size?: number;
    className?: string;
}

/** The mark only — graph/node triangle */
export function MemoraMark({ size = 24, className }: MemoraMarkProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Edges */}
            <line x1="16" y1="9" x2="8" y2="23" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
            <line x1="16" y1="9" x2="24" y2="23" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.45" strokeLinecap="round" />
            <line x1="8" y1="23" x2="24" y2="23" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.3" strokeLinecap="round" />
            {/* Outer glow ring on top node */}
            <circle cx="16" cy="9" r="6.5" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
            {/* Bottom nodes */}
            <circle cx="8" cy="23" r="3" fill="currentColor" fillOpacity="0.55" />
            <circle cx="24" cy="23" r="3" fill="currentColor" fillOpacity="0.55" />
            {/* Top node (primary) */}
            <circle cx="16" cy="9" r="4.5" fill="currentColor" />
        </svg>
    );
}

interface MemoraLogoProps {
    showWordmark?: boolean;
    size?: number;
    className?: string;
}

/** Full lockup — mark + wordmark with 12px gap */
export function MemoraLogo({ showWordmark = true, size = 28, className }: MemoraLogoProps) {
    return (
        <div
            className={cn(
                'flex items-center group',
                className
            )}
            style={{ gap: '12px' }}
        >
            <MemoraMark
                size={size}
                className="transition-colors duration-150 group-hover:text-[var(--accent)]"
            />
            {showWordmark && (
                <span
                    className="font-bold tracking-tight leading-none"
                    style={{ fontSize: `${Math.round(size * 0.82)}px` }}
                >
                    Memora
                </span>
            )}
        </div>
    );
}
