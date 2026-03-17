'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Brain, Trophy, Loader2, Lightbulb, X, Shuffle } from 'lucide-react';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { questionsService } from '@/src/features/quiz/services/questions.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { scoreTopicPriority, computeUnitScore } from '@/src/lib/retention-calculator';
import { Topic, QuizQuestion, QuizResult } from '@/src/types';
import { AIGeneratedQuestion, QuizAttempt } from '@/src/types/ai';

function aiQToQuizQ(q: AIGeneratedQuestion): QuizQuestion & { topicId: string } {
    return {
        id: q.id,
        unitId: q.unitId,
        unitName: q.unitName,
        level: q.difficulty === 'beginner' ? 'basic' : q.difficulty === 'expert' ? 'pitfall' : 'advanced',
        question: q.question,
        type: q.type === 'short-answer' ? 'short-answer' : 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        keywords: q.keywords,
        acceptableAnswers: q.acceptableAnswers,
        topicId: q.topicId,
    };
}

function evaluateShortAnswer(answer: string, question: QuizQuestion): boolean {
    const lowerAnswer = answer.toLowerCase().trim();
    if (question.acceptableAnswers) {
        const match = question.acceptableAnswers.some(aa => lowerAnswer.includes(aa.toLowerCase()));
        if (match) return true;
    }
    if (question.keywords && question.keywords.length > 0) {
        const matchCount = question.keywords.filter(k => lowerAnswer.includes(k.toLowerCase())).length;
        return matchCount >= Math.ceil(question.keywords.length * 0.5);
    }
    const correctWords = question.correctAnswer.toLowerCase().split(' ').filter(w => w.length > 3);
    const matchCount = correctWords.filter(w => lowerAnswer.includes(w)).length;
    return matchCount >= Math.ceil(correctWords.length * 0.4);
}

type DailyQuizQuestion = QuizQuestion & { topicId: string };

export default function DailyQuizPage() {
    const router = useRouter();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [quizQuestions, setQuizQuestions] = useState<DailyQuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [correctCount, setCorrectCount] = useState(0);
    const [weakUnits, setWeakUnits] = useState<Set<string>>(new Set());
    const [showFeedback, setShowFeedback] = useState(false);
    const [shortAnswer, setShortAnswer] = useState('');
    const [phase, setPhase] = useState<'quiz' | 'result'>('quiz');
    const [isLoading, setIsLoading] = useState(true);
    const [quizStartTime] = useState(Date.now());

    useEffect(() => {
        const initQuiz = async () => {
            const allTopics = topicsService.getTopics();
            setTopics(allTopics);

            if (allTopics.length === 0) {
                setIsLoading(false);
                return;
            }

            const allAttempts = quizHistoryService.getAllAttempts();

            // 4. Select primary topic
            let primaryTopic = allTopics[0];
            let maxPriority = -Infinity;
            for (const t of allTopics) {
                const priority = scoreTopicPriority(t, allAttempts);
                if (priority > maxPriority) {
                    maxPriority = priority;
                    primaryTopic = t;
                }
            }

            // 5. Build review questions (target 5)
            const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
            const recentAttempts = allAttempts.filter(a => new Date(a.completedAt).getTime() >= sevenDaysAgo);
            const wrongQuestions = recentAttempts.flatMap(a => a.questions.filter(q => !q.isCorrect));

            const uniqueWrongMap = new Map<string, any>();
            wrongQuestions.forEach(q => uniqueWrongMap.set(q.questionId, q));
            const uniqueWrongVals = Array.from(uniqueWrongMap.values());

            const allQ = questionsService.getQuestions();
            const allQMap = new Map(allQ.map(q => [q.id, q]));

            const reviewPool = uniqueWrongVals
                .map(wq => allQMap.get(wq.questionId))
                .filter(q => q && q.type !== 'coding') as AIGeneratedQuestion[];

            const shuffledReview = reviewPool.sort(() => Math.random() - 0.5);
            const selectedReviewAI = shuffledReview.slice(0, 5);
            const selectedReview = selectedReviewAI.map(aiQToQuizQ);

            const reviewShortfall = 5 - selectedReview.length;

            // 6. Build unit questions (target 14 + shortfall)
            const unitTarget = 14 + reviewShortfall;
            const primaryQuestionsAI = allQ.filter(q => q.topicId === primaryTopic.id);
            const reviewIds = new Set(selectedReview.map(q => q.id));
            const availableUnitQuestionsAI = primaryQuestionsAI.filter(q => !reviewIds.has(q.id));

            const unitScores = primaryTopic.units.map(u => ({
                unit: u,
                score: computeUnitScore(primaryTopic.id, u.id, allAttempts)
            })).sort((a, b) => a.score - b.score);

            const selectedUnitQuestions: DailyQuizQuestion[] = [];
            const qsByUnit: Record<string, AIGeneratedQuestion[]> = {};
            availableUnitQuestionsAI.forEach(q => {
               if(!qsByUnit[q.unitId]) qsByUnit[q.unitId] = [];
               qsByUnit[q.unitId].push(q);
            });
            Object.values(qsByUnit).forEach(arr => arr.sort(() => Math.random() - 0.5));

            let addedFound = true;
            while (selectedUnitQuestions.length < unitTarget && addedFound) {
                addedFound = false;
                for (const us of unitScores) {
                    if (selectedUnitQuestions.length >= unitTarget) break;
                    const qArr = qsByUnit[us.unit.id]; 
                    if (qArr && qArr.length > 0) {
                        selectedUnitQuestions.push(aiQToQuizQ(qArr.pop()!));
                        addedFound = true;
                    }
                }
            }

            // 7. Synthesis
            let synthesisQuestion: DailyQuizQuestion | null = null;
            if (primaryTopic.units.length >= 2) {
                try {
                    const res = await fetch('/api/ai/generate-quiz', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            topic: primaryTopic.name,
                            topicId: primaryTopic.id,
                            type: 'synthesis',
                            units: primaryTopic.units,
                            count: 1,
                            level: primaryTopic.level,
                            unit: 'Synthesis',
                            unitId: 'synthesis'
                        })
                    });
                    const data = await res.json();
                    if (data.success && data.questions && data.questions.length > 0) {
                        synthesisQuestion = aiQToQuizQ(data.questions[0]);
                    }
                } catch (e) {
                    console.error('Failed to generate synthesis question', e);
                }
            }

            // 8. Combine
            const finalPool = [...selectedUnitQuestions, ...selectedReview, ...(synthesisQuestion ? [synthesisQuestion] : [])];
            const finalShuffled = finalPool.sort(() => Math.random() - 0.5).slice(0, 20);

            setQuizQuestions(finalShuffled);
            setIsLoading(false);
        };
        
        initQuiz();
    }, []);

    const currentQuestion = quizQuestions[currentIndex] || null;

    const handleAnswer = useCallback((answer: string) => {
        const question = quizQuestions[currentIndex];
        if (!question) return;

        let isCorrect = false;
        if (question.type === 'mcq') {
            isCorrect = answer === question.correctAnswer;
        } else if (question.type === 'short-answer') {
            isCorrect = evaluateShortAnswer(answer, question);
        }

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        } else {
            setWeakUnits(prev => { const next = new Set(prev); next.add(question.unitId); return next; });
        }

        setAnswers(prev => ({ ...prev, [question.id]: answer }));
        setShowFeedback(true);
    }, [currentIndex, quizQuestions]);

    const handleShortAnswerSubmit = useCallback(() => {
        const question = quizQuestions[currentIndex];
        if (!question || !shortAnswer.trim()) return;
        const isCorrect = evaluateShortAnswer(shortAnswer, question);
        handleAnswer(isCorrect ? '__correct__' : shortAnswer);
    }, [shortAnswer, currentIndex, quizQuestions, handleAnswer]);

    const nextQuestion = useCallback(() => {
        if (currentIndex < quizQuestions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowFeedback(false);
            setShortAnswer('');
        } else {
            // Finish — group results by topicId
            const finalScore = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;
            const durationSeconds = Math.round((Date.now() - quizStartTime) / 1000);

            // Group questions by topicId
            const byTopic: Record<string, DailyQuizQuestion[]> = {};
            quizQuestions.forEach(q => {
                if (!byTopic[q.topicId]) byTopic[q.topicId] = [];
                byTopic[q.topicId].push(q);
            });

            // For each topic, save attempt and update topic
            for (const [topicId, topicQuestions] of Object.entries(byTopic)) {
                const topicCorrect = topicQuestions.filter(q => {
                    const ans = answers[q.id];
                    if (q.type === 'mcq') return ans === q.correctAnswer;
                    if (q.type === 'short-answer') return ans === '__correct__';
                    return false;
                }).length;

                const topicScore = Math.round((topicCorrect / topicQuestions.length) * 100);

                const detailedQuestions = topicQuestions.map(q => {
                    const ans = answers[q.id] || '';
                    let isCorrect = false;
                    if (q.type === 'mcq') isCorrect = ans === q.correctAnswer;
                    else if (q.type === 'short-answer') isCorrect = ans === '__correct__';
                    return {
                        questionId: q.id,
                        unitId: q.unitId,
                        unitName: q.unitName,
                        questionText: q.question,
                        explanation: q.explanation,
                        isCorrect,
                        userAnswer: ans,
                        correctAnswer: q.correctAnswer,
                    };
                });

                const unitStats: Record<string, { correct: number; total: number; name?: string }> = {};
                detailedQuestions.forEach(dq => {
                    if (!unitStats[dq.unitId]) unitStats[dq.unitId] = { correct: 0, total: 0, name: dq.unitName };
                    unitStats[dq.unitId].total += 1;
                    if (dq.isCorrect) unitStats[dq.unitId].correct += 1;
                });

                const unitBreakdown = Object.keys(unitStats).map(uId => ({
                    unitId: uId,
                    unitName: unitStats[uId].name,
                    totalCount: unitStats[uId].total,
                    correctCount: unitStats[uId].correct,
                    score: Math.round((unitStats[uId].correct / unitStats[uId].total) * 100),
                }));

                const topicWeakUnits = topicQuestions
                    .filter(q => weakUnits.has(q.unitId))
                    .map(q => q.unitId);

                const testedUnitIds = [...new Set(topicQuestions.map(q => q.unitId))];

                const historyAttempt: QuizAttempt = {
                    id: `attempt-daily-${topicId}-${Date.now()}`,
                    topicId,
                    type: 'daily',
                    score: topicScore,
                    correctCount: topicCorrect,
                    totalCount: topicQuestions.length,
                    completedAt: new Date().toISOString(),
                    durationSeconds,
                    questions: detailedQuestions,
                    unitBreakdown,
                };
                quizHistoryService.saveAttempt(historyAttempt);

                const result: QuizResult = {
                    topicId,
                    score: topicScore,
                    correctCount: topicCorrect,
                    totalCount: topicQuestions.length,
                    weakUnits: [...new Set(topicWeakUnits)],
                    testedUnitIds,
                };
                topicsService.updateTopicAfterQuiz(topicId, result);
            }

            setPhase('result');
        }
    }, [currentIndex, quizQuestions, correctCount, answers, weakUnits, quizStartTime]);

    const finalPercentage = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

    // Topic name lookup
    const topicNameMap = useMemo(() => {
        const map: Record<string, string> = {};
        topics.forEach(t => { map[t.id] = t.name; });
        return map;
    }, [topics]);

    // Loading
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display" style={{ background: 'var(--bg-base)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    // No topics
    if (topics.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-display p-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <Brain className="w-12 h-12 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>Add a topic first to start your daily quiz</p>
                <Link
                    href="/knowledge-base"
                    className="px-6 py-2.5 font-bold flex items-center gap-2 transition-all hover:opacity-90 mt-2 text-white"
                    style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                >
                    Go to Knowledge Base <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    // No questions available
    if (quizQuestions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-display p-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <Brain className="w-12 h-12 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No questions generated yet. Practice a topic first to build your question bank.</p>
                <Link
                    href="/knowledge-base"
                    className="px-6 py-2.5 font-bold flex items-center gap-2 transition-all hover:opacity-90 mt-2 text-white"
                    style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                >
                    Go to Knowledge Base <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        );
    }

    // --- RESULT PHASE ---
    if (phase === 'result') {
        const isExcellent = finalPercentage >= 80;
        return (
            <div className="min-h-screen flex items-center justify-center font-display p-6" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
                <motion.div
                    className="w-full max-w-md space-y-8 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                        {isExcellent ? (
                            <Trophy className="w-20 h-20 mx-auto" style={{ color: 'var(--warning)' }} />
                        ) : (
                            <Brain className="w-20 h-20 mx-auto" style={{ color: 'var(--accent)' }} />
                        )}
                    </motion.div>

                    <div>
                        <h1 className="text-3xl font-bold">{isExcellent ? 'Great job!' : 'Keep going!'}</h1>
                        <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Daily Quiz Complete</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 border flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quiz Score</div>
                            <div className="text-4xl font-black" style={{ color: 'var(--accent)' }}>{finalPercentage}%</div>
                        </div>
                        <div className="p-6 border flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}>
                            <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Questions</div>
                            <div className="text-4xl font-black">{correctCount}/{quizQuestions.length}</div>
                        </div>
                    </div>

                    {/* Topics covered */}
                    <div className="text-left p-4 border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}>
                        <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Topics Covered</div>
                        <div className="space-y-1">
                            {[...new Set(quizQuestions.map(q => q.topicId))].map(tid => (
                                <div key={tid} className="text-sm font-medium">{topicNameMap[tid] || 'Unknown'}</div>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <button
                            className="w-full h-14 font-bold flex items-center justify-center gap-3 transition-all text-white"
                            style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                            onClick={() => router.push('/')}
                        >
                            Back to Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // --- QUIZ PHASE ---
    const question = currentQuestion!;
    const hasAnswered = answers[question.id] !== undefined;
    const userAnswer = answers[question.id];
    const isCorrectAnswer = question.type === 'mcq'
        ? userAnswer === question.correctAnswer
        : userAnswer === '__correct__';
    const topicName = topicNameMap[question.topicId] || 'Unknown';

    return (
        <div className="min-h-screen flex flex-col font-display" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-3">
                    <Shuffle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <span className="font-bold text-sm">Daily Quiz</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>{topicName}</span>
                </div>
                <button onClick={() => router.push('/')} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-4 h-4" /> Exit
                </button>
            </div>

            {/* Progress */}
            <div className="px-6 pt-4">
                <div className="flex items-center justify-between text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                    <span>Question {currentIndex + 1} of {quizQuestions.length}</span>
                    <span>{correctCount} correct</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'var(--accent)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentIndex + (hasAnswered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
            </div>

            {/* Question */}
            <div className="flex-1 flex items-center justify-center p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={question.id}
                        className="w-full max-w-xl space-y-8"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h2 className="text-xl font-bold leading-snug">{question.question}</h2>

                        {question.type === 'mcq' && question.options && (
                            <div className="space-y-3">
                                {question.options.map((option, idx) => {
                                    const isSelected = userAnswer === option;
                                    const isCorrect = option === question.correctAnswer;
                                    let borderColor = 'var(--border)';
                                    let bg = 'var(--bg-surface)';
                                    if (hasAnswered && isCorrect) { borderColor = 'var(--success)'; bg = 'color-mix(in srgb, var(--success) 8%, var(--bg-surface))'; }
                                    else if (hasAnswered && isSelected && !isCorrect) { borderColor = 'var(--danger)'; bg = 'color-mix(in srgb, var(--danger) 8%, var(--bg-surface))'; }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => !hasAnswered && handleAnswer(option)}
                                            disabled={hasAnswered}
                                            className="w-full text-left p-4 border font-medium text-sm transition-all flex items-center gap-3"
                                            style={{ borderColor, background: bg, borderRadius: 'var(--radius-md)', opacity: hasAnswered && !isSelected && !isCorrect ? 0.5 : 1 }}
                                        >
                                            <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold shrink-0"
                                                style={{ borderColor: hasAnswered && isCorrect ? 'var(--success)' : hasAnswered && isSelected ? 'var(--danger)' : 'var(--border)' }}>
                                                {hasAnswered && isCorrect ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} /> :
                                                    hasAnswered && isSelected ? <XCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} /> :
                                                        String.fromCharCode(65 + idx)}
                                            </span>
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {question.type === 'short-answer' && !hasAnswered && (
                            <div className="space-y-3">
                                <textarea
                                    value={shortAnswer}
                                    onChange={e => setShortAnswer(e.target.value)}
                                    placeholder="Type your answer..."
                                    className="w-full p-4 border text-sm font-medium resize-none focus:outline-none"
                                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', minHeight: '120px' }}
                                />
                                <button
                                    onClick={handleShortAnswerSubmit}
                                    disabled={!shortAnswer.trim()}
                                    className="px-6 py-2.5 font-bold text-sm text-white disabled:opacity-40"
                                    style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                                >
                                    Submit Answer
                                </button>
                            </div>
                        )}

                        {/* Feedback */}
                        {showFeedback && hasAnswered && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border"
                                style={{
                                    borderColor: isCorrectAnswer ? 'var(--success)' : 'var(--danger)',
                                    background: isCorrectAnswer ? 'color-mix(in srgb, var(--success) 6%, var(--bg-surface))' : 'color-mix(in srgb, var(--danger) 6%, var(--bg-surface))',
                                    borderRadius: 'var(--radius-md)',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    {isCorrectAnswer ? <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} /> : <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />}
                                    <span className="font-bold text-sm">{isCorrectAnswer ? 'Correct' : 'Incorrect'}</span>
                                </div>
                                {!isCorrectAnswer && <p className="text-sm mt-1"><span className="font-bold">Answer:</span> {question.correctAnswer}</p>}
                                {question.explanation && (
                                    <div className="flex items-start gap-2 mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--warning)' }} />
                                        {question.explanation}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Next button */}
                        {hasAnswered && (
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={nextQuestion}
                                className="w-full h-14 font-bold flex items-center justify-center gap-2 text-white"
                                style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                            >
                                {currentIndex < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
