'use client';

import { cn } from '@/src/lib/utils';

/**
 * Memora Logo Mark — "Abstract Spark" (#07)
 * A scattered dot pattern that resembles the Material Symbols `blur_on` icon.
 * Uses currentColor so it inherits color from context.
 * 
 * Specs from logo guide:
 * - Wordmark: Plus Jakarta Sans Bold
 * - Lockup gap: 12px fixed
 * - Alignment: center baseline cap
 * - Icon style: optical weight 400
 * - Dark mode: white mark + white wordmark on --bg-base
 * - Light mode: dark mark + dark wordmark on light background
 * - Hover state: mark shifts to --accent color
 */

interface MemoraMarkProps {
    size?: number;
    className?: string;
}

/** The mark only — Abstract Spark dot pattern */
export function MemoraMark({ size = 24, className }: MemoraMarkProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            aria-hidden="true"
        >
            {/* Center cluster — dense dots */}
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="9" cy="12" r="1.4" />
            <circle cx="15" cy="12" r="1.4" />
            <circle cx="12" cy="9" r="1.4" />
            <circle cx="12" cy="15" r="1.4" />

            {/* Mid ring — medium dots */}
            <circle cx="9" cy="9" r="1.1" />
            <circle cx="15" cy="9" r="1.1" />
            <circle cx="9" cy="15" r="1.1" />
            <circle cx="15" cy="15" r="1.1" />

            {/* Outer ring — smaller dots */}
            <circle cx="6" cy="12" r="0.9" />
            <circle cx="18" cy="12" r="0.9" />
            <circle cx="12" cy="6" r="0.9" />
            <circle cx="12" cy="18" r="0.9" />

            {/* Far outer — scattered small dots */}
            <circle cx="6.5" cy="8.5" r="0.7" />
            <circle cx="17.5" cy="8.5" r="0.7" />
            <circle cx="6.5" cy="15.5" r="0.7" />
            <circle cx="17.5" cy="15.5" r="0.7" />

            {/* Corner accents — tiny dots */}
            <circle cx="4.5" cy="10" r="0.5" />
            <circle cx="19.5" cy="10" r="0.5" />
            <circle cx="4.5" cy="14" r="0.5" />
            <circle cx="19.5" cy="14" r="0.5" />
            <circle cx="10" cy="4.5" r="0.5" />
            <circle cx="14" cy="4.5" r="0.5" />
            <circle cx="10" cy="19.5" r="0.5" />
            <circle cx="14" cy="19.5" r="0.5" />
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
