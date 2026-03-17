'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { codeChallengeStore } from '@/src/features/quiz/store/code-challenge-store';
import { CodingCanvas } from '@/src/features/quiz/components/CodingCanvas';
import { AIGeneratedQuestion } from '@/src/types/ai';
import { Loader2 } from 'lucide-react';

export default function CodeChallengePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: topicId } = use(params);
    const router = useRouter();
    const [questions, setQuestions] = useState<AIGeneratedQuestion[] | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [results, setResults] = useState<boolean[]>([]);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const stored = codeChallengeStore.getQuestions();
        if (!stored || stored.length === 0) {
            router.push(`/topics/${topicId}`);
            return;
        }
        setQuestions(stored as AIGeneratedQuestion[]);
    }, [topicId, router]);

    if (!questions) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    const handleAnswer = (isCorrect: boolean) => {
        const updated = [...results, isCorrect];
        setResults(updated);
        if (currentIndex + 1 >= questions.length) {
            setFinished(true);
            codeChallengeStore.clear();
        } else {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (finished) {
        const correct = results.filter(Boolean).length;
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--bg-base)' }}>
                <div style={{ fontSize: 48 }}>🎯</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>
                    {correct} / {questions.length} Correct
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {correct === questions.length ? 'Perfect score!' : correct >= questions.length / 2 ? 'Good effort!' : 'Keep practicing!'}
                </div>
                <button
                    onClick={() => router.push(`/topics/${topicId}`)}
                    style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                >
                    Back to Topic
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px' }}>
                <button
                    onClick={() => router.push(`/topics/${topicId}`)}
                    style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    ← Back to Topic
                </button>
                <div style={{ marginBottom: 8, fontSize: 11, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    Code Challenge
                </div>
                <div style={{ marginBottom: 4, fontSize: 13, color: 'var(--text-muted)' }}>
                    Question {currentIndex + 1} of {questions.length}
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                    {questions.map((_, i) => (
                        <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: i < results.length
                                ? (results[i] ? 'var(--success)' : 'var(--danger)')
                                : i === currentIndex ? 'var(--accent)' : 'var(--border)'
                        }} />
                    ))}
                </div>
                <CodingCanvas question={questions[currentIndex]} onAnswer={handleAnswer} />
            </div>
        </div>
    );
}