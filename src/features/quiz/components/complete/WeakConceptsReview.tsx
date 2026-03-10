import React from 'react';
import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

interface WeakConcept {
    id: string;
    name: string;
}

export function WeakConceptsReview({ concepts }: { concepts: WeakConcept[] }) {
    return (
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="text-lg font-bold">Needs Review</h2>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-300">
                We noticed you struggled a bit with these concepts. Focus your next session here to boost your score.
            </p>

            <div className="space-y-3 pt-2">
                {concepts.map((concept) => (
                    <div key={concept.id} className="flex items-center justify-between bg-background/60 p-3 rounded-lg border border-orange-200/50 dark:border-orange-500/10">
                        <span className="font-semibold">{concept.name}</span>
                        <Link
                            href={`/concepts/${concept.id}`}
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            Review Concept <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}
