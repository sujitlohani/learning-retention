'use client';

import { BarChart3 } from 'lucide-react';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Concept } from '@/src/types';

interface RecentActivityProps {
    topicId: string;
    concepts: Concept[];
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export function RecentActivity({ topicId, concepts }: RecentActivityProps) {
    const history = quizHistoryService.getHistoryForTopic(topicId).slice(0, 5);

    if (history.length === 0) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <h2 className="text-lg font-semibold">Recent Activity</h2>
                </div>
                <div className="text-center py-10 border border-dashed rounded-lg" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No activity yet. Complete a quiz to see your history.</p>
                </div>
            </div>
        );
    }

    const conceptMap = new Map(concepts.map(c => [c.id, c.text]));

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h2 className="text-lg font-semibold">Recent Activity</h2>
            </div>

            <div
                className="p-5 space-y-0"
                style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-resting)',
                }}
            >
                {history.map((attempt, idx) => {
                    const conceptName = attempt.targetConceptId
                        ? conceptMap.get(attempt.targetConceptId) || 'Unknown'
                        : 'Mixed Review';
                    const score = attempt.score;
                    const isLast = idx === history.length - 1;

                    return (
                        <div key={attempt.id} className="flex items-start gap-3 relative" style={{ paddingBottom: isLast ? 0 : '20px' }}>
                            {/* Timeline dot + line */}
                            <div className="flex flex-col items-center shrink-0">
                                <div className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--accent)' }} />
                                {!isLast && <div className="w-px flex-1 mt-1" style={{ background: 'var(--border)' }} />}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm">
                                    Completed <span className="font-bold">&apos;{conceptName}&apos;</span> Quiz
                                </p>
                                <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                    {formatTimeAgo(attempt.completedAt)} · Scored {score}%
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
