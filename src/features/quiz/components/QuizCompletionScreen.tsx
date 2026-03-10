'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { QuizCompletionHeader } from './complete/QuizCompletionHeader';
import { StatSummaryRow } from './complete/StatSummaryRow';
import { ConceptMasteryImpact } from './complete/ConceptMasteryImpact';
import { WeakConceptsReview } from './complete/WeakConceptsReview';
import { QuizCompletionActions } from './complete/QuizCompletionActions';
import { quizHistoryService } from '../services/quiz-history.service';
import { QuizAttempt } from '@/src/types/ai';
import { useXP } from '@/src/features/scoring/hooks/useXP';

export function QuizCompletionScreen() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const attemptId = searchParams.get('attemptId');
    const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
    const { earn, history } = useXP();
    const [xpAwardedForAttempt, setXpAwardedForAttempt] = useState<string | null>(null);

    useEffect(() => {
        if (attemptId) {
            const all = quizHistoryService.getAllHistory();
            const found = all.find(a => a.id === attemptId);
            if (found) {
                setAttempt(found);

                // Award XP once per attempt viewing (MVP level logic for deduping)
                if (xpAwardedForAttempt !== found.id) {
                    const isPerfect = found.score === 100;
                    earn(isPerfect ? 'perfect_quiz' : 'quiz_completed');
                    setXpAwardedForAttempt(found.id);
                }
            }
        }
    }, [attemptId, earn, xpAwardedForAttempt]);

    const handleRestart = () => {
        if (!attempt) return;
        const url = attempt.targetConceptId
            ? `/learn/${attempt.topicId}?conceptId=${attempt.targetConceptId}&generate=true`
            : `/learn/${attempt.topicId}?generate=true`;
        router.push(url);
    };

    if (!attempt && attemptId) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    const quizResult = attempt ? {
        accuracy: attempt.score,
        correctAnswers: attempt.correctCount,
        totalQuestions: attempt.totalCount,
        xpEarned: attempt.score === 100 ? 40 + (attempt.correctCount * 5) : 20 + (attempt.correctCount * 5),
        rankPercentile: Math.min(99, Math.round(attempt.score * 0.8 + 10)),
        conceptImpacts: attempt.conceptBreakdown?.map(cb => ({
            id: cb.conceptId,
            name: cb.conceptName || cb.conceptId,
            pointsAdded: cb.correctCount * 5,
            newPercent: cb.score,
            state: cb.score >= 80 ? 'Mastered' : cb.score >= 60 ? 'Learning' : 'Needs Review'
        })) || [],
        weakConcepts: attempt.conceptBreakdown?.filter(cb => cb.score < 60).map(cb => ({
            id: cb.conceptId,
            name: cb.conceptName || cb.conceptId
        })) || []
    } : {
        // Fallback or mock data if no attempt
        accuracy: 80,
        correctAnswers: 8,
        totalQuestions: 10,
        xpEarned: 45,
        rankPercentile: 15,
        conceptImpacts: [
            { id: 'binary-trees', name: 'Binary Trees', pointsAdded: 6, newPercent: 64, state: 'Learning' },
        ],
        weakConcepts: [
            { id: 'binary-trees', name: 'Binary Trees' }
        ]
    };

    return (
        <div className="flex flex-1 justify-center py-8 px-4 md:px-10 bg-background font-display min-h-screen">
            <div className="flex flex-col max-w-[800px] flex-1 gap-8">

                <QuizCompletionHeader />

                <StatSummaryRow
                    accuracy={quizResult.accuracy}
                    correctAnswers={quizResult.correctAnswers}
                    totalQuestions={quizResult.totalQuestions}
                    xpEarned={quizResult.xpEarned}
                    rankPercentile={quizResult.rankPercentile}
                />

                <ConceptMasteryImpact impacts={quizResult.conceptImpacts} />

                {quizResult.weakConcepts.length > 0 && (
                    <WeakConceptsReview concepts={quizResult.weakConcepts} />
                )}

                <QuizCompletionActions
                    onRestart={handleRestart}
                    hasWeakConcepts={quizResult.weakConcepts.length > 0}
                    weakestConceptId={quizResult.weakConcepts[0]?.id}
                />

                <footer className="py-10 text-center">
                    <p className="text-muted-foreground text-sm">Keep up the momentum! 12 day streak active.</p>
                    <div className="flex justify-center gap-1 mt-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="w-2 h-2 rounded-full bg-muted" />
                        <div className="w-2 h-2 rounded-full bg-muted" />
                    </div>
                </footer>
            </div>
        </div>
    );
}
