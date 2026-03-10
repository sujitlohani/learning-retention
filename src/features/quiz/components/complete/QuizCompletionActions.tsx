import React from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { ChevronsRight, PenTool, RefreshCw } from 'lucide-react';

export function QuizCompletionActions({ onRestart, hasWeakConcepts, weakestConceptId }: { onRestart?: () => void, hasWeakConcepts?: boolean, weakestConceptId?: string }) {
    return (
        <div className="flex flex-col gap-4 pt-4">
            <Button asChild size="lg" className="w-full font-bold shadow-lg shadow-primary/20 text-lg py-6 rounded-xl">
                <Link href="/cockpit" className="flex items-center justify-center gap-2">
                    <span>Continue Learning</span>
                    <ChevronsRight className="w-5 h-5" />
                </Link>
            </Button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                    variant="outline"
                    className="font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                    disabled={!hasWeakConcepts}
                    asChild={!!weakestConceptId}
                >
                    {weakestConceptId ? (
                        <Link href={`/concepts/${weakestConceptId}`}>
                            <PenTool className="w-4 h-4 text-muted-foreground" />
                            Review Weak Concepts
                        </Link>
                    ) : (
                        <>
                            <PenTool className="w-4 h-4 text-muted-foreground" />
                            Review Weak Concepts
                        </>
                    )}
                </Button>
                <Button
                    variant="outline"
                    className="font-bold py-6 rounded-xl flex items-center justify-center gap-2"
                    onClick={onRestart}
                >
                    <RefreshCw className="w-4 h-4 text-muted-foreground" />
                    Start Another Quiz
                </Button>
            </div>
        </div>
    );
}
