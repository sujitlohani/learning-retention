'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Check, X, Zap, BookOpen, Target } from 'lucide-react';
import { QuizAttempt } from '@/src/types/ai';
import { topicsService } from '@/src/features/topics/services/topics.service';

interface QuizSessionCardProps {
    attempt: QuizAttempt;
    onRetry?: (type: 'unit-test' | 'topic-challenge', topicId: string, targetUnitId?: string) => void;
}

export function QuizSessionCard({ attempt, onRetry }: QuizSessionCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const topicName = topicsService.getTopicById(attempt.topicId)?.name || 'Unknown Topic';
    const TypeIcon = attempt.type === 'unit-test' ? Target : attempt.type === 'topic-challenge' ? BookOpen : Zap;
    
    let mainLabel = topicName;
    let subLabel = `${attempt.totalCount} questions`;

    if (attempt.type === 'unit-test') {
        const topic = topicsService.getTopicById(attempt.topicId);
        const unitName = topic?.units.find(u => u.id === attempt.targetUnitId)?.text;
        mainLabel = unitName ? `${unitName} · Unit Test · ${topicName}` : `Unit Test · ${topicName}`;
    } else if (attempt.type === 'topic-challenge') {
        mainLabel = `${topicName} · Topic Challenge`;
    } else if (attempt.type === 'daily') {
        mainLabel = `Daily Quiz · ${topicName}`;
    } else if (attempt.type === 'weak-area') {
        const topic = topicsService.getTopicById(attempt.topicId);
        const unitName = topic?.units.find(u => u.id === attempt.targetUnitId)?.text;
        mainLabel = unitName ? `${unitName} · Weak Area · ${topicName}` : `Weak Area · ${topicName}`;
    }
    
    let scoreColor = 'var(--danger)';
    if (attempt.score >= 75) scoreColor = 'var(--success)';
    else if (attempt.score >= 50) scoreColor = 'var(--warning)';
    
    const incorrectCount = attempt.questions.filter(q => !q.isCorrect).length;

    return (
        <div className="border rounded-lg overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-resting)' }}>
            {/* Collapsed header */}
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-[var(--bg-raised)] transition-colors">
                <div className="flex items-center gap-3">
                    <TypeIcon className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                    <div>
                        <div className="text-sm font-bold tracking-tight text-[var(--text-primary)]">{mainLabel}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-0.5">{subLabel}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-sm font-black" style={{ color: scoreColor }}>{attempt.score}%</div>
                        <div className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                            {new Date(attempt.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
                </div>
            </button>
            {/* Progress bar */}
            <div className="h-1 w-full bg-[var(--bg-raised)]">
                <div className="h-full rounded-r-full transition-all duration-500" style={{ width: `${Math.max(2, attempt.score)}%`, background: scoreColor }} />
            </div>

            {/* Expanded */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-5 border-t space-y-5" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
                                    Correct: <span style={{ color: 'var(--text-primary)' }}>{attempt.correctCount} / {attempt.totalCount}</span>
                                </span>
                                {incorrectCount > 0 && onRetry && (
                                    <button 
                                        onClick={() => {
                                            if (attempt.targetUnitId) {
                                                onRetry('unit-test', attempt.topicId, attempt.targetUnitId);
                                            } else {
                                                onRetry('topic-challenge', attempt.topicId);
                                            }
                                        }} 
                                        className="text-xs font-bold px-3 py-1.5 rounded-md border transition-all hover:-translate-y-0.5" 
                                        style={{ borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--bg-surface)' }}
                                    >
                                        ↻ Retry Weak Questions
                                    </button>
                                )}
                            </div>
                            <div className="space-y-4">
                                {attempt.questions.map((q, i) => (
                                    <div key={i} className="text-sm space-y-1">
                                        <div className="flex items-start gap-3 p-3 rounded-md border border-[var(--border)] bg-[var(--bg-raised)]">
                                            {q.isCorrect ? (
                                                <div className="shrink-0 p-1 rounded-full bg-green-500/10 mt-0.5">
                                                    <Check className="w-3.5 h-3.5" style={{ color: 'var(--success)' }} />
                                                </div>
                                            ) : (
                                                <div className="shrink-0 p-1 rounded-full bg-red-500/10 mt-0.5">
                                                    <X className="w-3.5 h-3.5" style={{ color: 'var(--danger)' }} />
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-[13px] leading-snug tracking-tight text-[var(--text-primary)]">
                                                    {q.questionText || `Question ${i + 1}`}
                                                </div>
                                                {q.isCorrect ? (
                                                    <div className="text-xs font-medium text-[var(--text-muted)] mt-1">Answered: {q.userAnswer}</div>
                                                ) : (
                                                    <div className="mt-2 space-y-1.5 border-t border-[var(--border)] pt-2">
                                                        <div className="text-xs font-medium" style={{ color: 'var(--danger)' }}>
                                                            Your answer: <span className="opacity-80">{q.userAnswer}</span>
                                                        </div>
                                                        <div className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                                                            Correct: <span className="opacity-80">{q.correctAnswer}</span>
                                                        </div>
                                                        {q.unitName && (
                                                            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border)]">
                                                                {q.unitName}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
