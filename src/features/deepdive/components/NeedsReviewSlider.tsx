'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { computeUnitScore } from '@/src/lib/retention-calculator';

interface WeakUnit {
    topicId: string;
    topicName: string;
    unitId: string;
    unitName: string;
    score: number;
}

export function NeedsReviewSlider() {
    const { startQuiz } = useQuizSession();
    const [weakUnits, setWeakUnits] = useState<WeakUnit[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchWeakUnits = () => {
            const allTopics = topicsService.getTopics();
            const allAttempts = quizHistoryService.getAllAttempts();

            const units: WeakUnit[] = [];
            allTopics.forEach(topic => {
                topic.units.forEach(u => {
                    const score = Math.round(computeUnitScore(topic.id, u.id, allAttempts));
                    if (score < 60) {
                        units.push({
                            topicId: topic.id,
                            topicName: topic.name,
                            unitId: u.id,
                            unitName: u.text,
                            score
                        });
                    }
                });
            });

            units.sort((a, b) => a.score - b.score);
            setWeakUnits(units.slice(0, 3));
            setIsLoading(false);
        };

        fetchWeakUnits();
    }, []);

    const startTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % weakUnits.length);
        }, 4000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    useEffect(() => {
        if (weakUnits.length > 1) {
            startTimer();
        }
        return stopTimer;
    }, [weakUnits.length]);

    if (isLoading) {
        return (
            <div className="p-5 rounded-lg border bg-[var(--bg-surface)] border-[var(--border)] shadow-[var(--shadow-resting)] flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    if (weakUnits.length === 0) return null;

    const current = weakUnits[currentIndex];

    return (
        <div 
            className="p-5 rounded-lg border shadow-[var(--shadow-resting)] overflow-hidden relative"
            style={{ 
                background: 'var(--bg-surface)', 
                borderColor: 'var(--danger)',
            }}
            onMouseEnter={stopTimer}
            onMouseLeave={() => weakUnits.length > 1 && startTimer()}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--danger)' }}>
                    <AlertCircle className="w-4 h-4" /> Needs Review
                </h3>
                {weakUnits.length > 1 && (
                    <div className="flex gap-1">
                        {weakUnits.map((_, idx) => (
                            <div 
                                key={idx} 
                                className="h-1.5 rounded-full transition-all" 
                                style={{ 
                                    width: idx === currentIndex ? '12px' : '4px',
                                    background: idx === currentIndex ? 'var(--danger)' : 'var(--border)'
                                }} 
                            />
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={current.unitId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                >
                    <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mb-2 inline-block" style={{ background: 'color-mix(in srgb, var(--danger) 15%, transparent)', color: 'var(--danger)' }}>
                            {current.topicName}
                        </span>
                        <h4 className="font-bold text-lg leading-snug">{current.unitName}</h4>
                        <p className="text-sm font-medium mt-1" style={{ color: 'var(--danger)' }}>Score: {current.score}%</p>
                    </div>

                    <button 
                        onClick={() => startQuiz({ type: 'unit-test', topicId: current.topicId, targetUnitId: current.unitId })}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-md text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                        style={{ background: 'var(--danger)' }}
                    >
                        Start <ArrowRight className="w-4 h-4" />
                    </button>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
