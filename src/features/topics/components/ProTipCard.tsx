'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';

const TIPS = [
    'Interleaving different topics in your study sessions can increase long-term retention by up to 40%.',
    'Testing yourself before reviewing material strengthens memory more than re-reading alone.',
    'Spacing your review sessions over days is more effective than cramming in one sitting.',
    'Explaining a concept in your own words activates deeper processing than passive reading.',
    'Taking short breaks between study blocks improves focus and encoding of new information.',
];

interface ProTipCardProps {
    topicId: string;
}

export function ProTipCard({ topicId }: ProTipCardProps) {
    const storageKey = `protip_dismissed_${topicId}`;
    const [dismissed, setDismissed] = useState(true); // default hidden until checked

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const val = localStorage.getItem(storageKey);
        setDismissed(val === 'true');
    }, [storageKey]);

    if (dismissed) return null;

    // Deterministic tip based on topicId hash
    const tipIndex = topicId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % TIPS.length;

    const handleDismiss = () => {
        setDismissed(true);
        localStorage.setItem(storageKey, 'true');
    };

    return (
        <div
            className="p-5 relative overflow-hidden"
            style={{
                background: 'var(--accent)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
            }}
        >
            {/* Decorative circle */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-15" style={{ background: '#fff' }} />

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Pro Tip</span>
                </div>
                <p className="text-sm leading-relaxed opacity-90 mb-4">{TIPS[tipIndex]}</p>
                <button
                    onClick={handleDismiss}
                    className="text-xs font-bold uppercase tracking-wider opacity-70 hover:opacity-100 transition-opacity"
                >
                    Dismiss
                </button>
            </div>
        </div>
    );
}
