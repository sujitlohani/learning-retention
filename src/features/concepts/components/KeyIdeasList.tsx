import React from 'react';
import { Lightbulb, CheckCircle } from 'lucide-react';

// TODO: replace with real data hook
const KEY_IDEAS = [
    "Uses multiple decision trees (the 'Forest')",
    "Aggregates predictions using majority voting or averaging",
    "Reduces variance significantly compared to single decision trees"
];

export function KeyIdeasList() {
    return (
        <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="text-primary font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Key Ideas
            </h4>
            <ul className="space-y-3">
                {KEY_IDEAS.map((idea, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-foreground">{idea}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
