'use client';

import { useState, useMemo } from 'react';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { QuizSessionCard } from '@/src/features/quiz/components/QuizSessionCard';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';

interface TopicHistoryProps {
    topicId: string;
}

type HistoryFilter = 'all' | 'unit-test' | 'topic-challenge';

export function TopicHistory({ topicId }: TopicHistoryProps) {
    const { startQuiz } = useQuizSession();
    const [filter, setFilter] = useState<HistoryFilter>('all');

    const attempts = useMemo(() => {
        let history = quizHistoryService.getAttemptsByTopicId(topicId);
        if (filter !== 'all') {
            history = history.filter(a => a.type === filter);
        }
        return history;
    }, [topicId, filter]);

    const handleRetry = (type: 'unit-test' | 'topic-challenge', tId: string, targetUnitId?: string) => {
        if (type === 'unit-test' && targetUnitId) {
            startQuiz({ type: 'unit-test', topicId: tId, targetUnitId });
        } else {
            startQuiz({ type: 'topic-challenge', topicId: tId });
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mr-2">Filter</span>
                <div className="flex bg-[var(--bg-raised)] p-1 rounded-md border border-[var(--border)]">
                    {(['all', 'unit-test', 'topic-challenge'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 text-xs font-bold rounded capitalize transition-all ${filter === f ? 'bg-[var(--bg-surface)] text-[var(--accent)] shadow-[var(--shadow-resting)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                        >
                            {f === 'all' ? 'All' : f === 'unit-test' ? 'Unit Test' : 'Topic Challenge'}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {attempts.length === 0 ? (
                    <div className="p-12 text-center border border-dashed border-[var(--border)] rounded-xl bg-[var(--bg-surface)]">
                        <p className="text-sm font-medium text-[var(--text-muted)]">
                            No quiz history for this topic yet.<br/>
                            <span className="opacity-70 text-xs mt-1 block">Start a test to see your sessions here.</span>
                        </p>
                    </div>
                ) : (
                    attempts.map(attempt => (
                        <QuizSessionCard 
                            key={attempt.id} 
                            attempt={attempt} 
                            onRetry={handleRetry} 
                        />
                    ))
                )}
            </div>

        </div>
    );
}
