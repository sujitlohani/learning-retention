'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { codeChallengeStore } from '@/src/features/quiz/store/code-challenge-store';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { scheduleService } from '@/src/features/schedule/services/schedule.service';
import { questionsService } from '@/src/features/quiz/services/questions.service';
import { quizHistoryService } from '@/src/features/quiz/services/quiz-history.service';
import { Topic, QuizQuestion, QuizResult } from '@/src/types';
import { AIGeneratedQuestion, QuizAttempt } from '@/src/types/ai';

export type QuizPhase = 'quiz' | 'result';

export type QuizTriggerParams = 
    | { type: 'topic-challenge'; topicId: string }
    | { type: 'unit-test'; topicId: string; targetUnitId: string };

function aiQToQuizQ(q: AIGeneratedQuestion): QuizQuestion {
    return {
        id: q.id,
        unitId: q.unitId,
        unitName: q.unitName,
        level: q.difficulty === 'beginner' ? 'basic' : q.difficulty === 'expert' ? 'pitfall' : 'advanced',
        question: q.question,
        type: q.type === 'short-answer' ? 'short-answer' : q.type === 'coding' ? 'coding' : 'mcq',
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        keywords: q.keywords,
        acceptableAnswers: q.acceptableAnswers,
        language: q.language,
        starterCode: q.starterCode,
        testCases: q.testCases,
        hints: q.hints,
    };
}

function evaluateShortAnswer(answer: string, question: QuizQuestion): boolean {
    const lowerAnswer = answer.toLowerCase().trim();

    if (question.acceptableAnswers) {
        const match = question.acceptableAnswers.some(aa =>
            lowerAnswer.includes(aa.toLowerCase())
        );
        if (match) return true;
    }

    if (question.keywords && question.keywords.length > 0) {
        const matchCount = question.keywords.filter(k =>
            lowerAnswer.includes(k.toLowerCase())
        ).length;
        return matchCount >= Math.ceil(question.keywords.length * 0.5);
    }

    const correctWords = question.correctAnswer.toLowerCase().split(' ')
        .filter(w => w.length > 3);
    const matchCount = correctWords.filter(w => lowerAnswer.includes(w)).length;
    return matchCount >= Math.ceil(correctWords.length * 0.4);
}

export function useQuizSession(topicId?: string | null, sessionId?: string | null, unitId?: string | null) {
    const router = useRouter();
    const pathname = usePathname();

    const [topic, setTopic] = useState<Topic | null>(null);
    const [phase, setPhase] = useState<QuizPhase>('quiz');
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [weakUnits, setWeakUnits] = useState<Set<string>>(new Set());
    const [shortAnswer, setShortAnswer] = useState('');
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [quizStartTime, setQuizStartTime] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Load topic and questions
    useEffect(() => {
        if (!topicId) {
            setIsLoading(false);
            return;
        }

        const storedTopics = topicsService.getTopics();
        const foundTopic = storedTopics.find(t => t.id === topicId);

        if (!foundTopic) {
            router.push('/');
            return;
        }

        setTopic(foundTopic);
        let loadedQuestions: QuizQuestion[] = [];

        if (pathname?.endsWith('/code-challenge')) {
            const storeQuestions = codeChallengeStore.getQuestions();
            if (storeQuestions && storeQuestions.length > 0) {
                loadedQuestions = storeQuestions.map(aiQToQuizQ);
            }
        } else if (sessionId && sessionId.startsWith('coding-challenge-')) {
            const data = sessionStorage.getItem(sessionId);
            if (data) {
                try {
                    const parsed = JSON.parse(data);
                    loadedQuestions = parsed.map(aiQToQuizQ);
                } catch (e) {
                    console.error('Failed to parse coding challenge data', e);
                }
            }
        } else if (sessionId) {
            const schedule = scheduleService.getScheduleForTopic(foundTopic.id);
            if (schedule) {
                const session = schedule.sessions.find(s => s.id === sessionId);
                if (session) {
                    const aiQuestions = questionsService.getQuestionsForSession(
                        foundTopic.id,
                        session.unitIds,
                        session.questionCount
                    );
                    if (aiQuestions.length > 0) {
                        loadedQuestions = aiQuestions.map(aiQToQuizQ);
                    }
                }
            }
        } else {
            const aiQuestions = unitId
                ? questionsService.getQuestionsForUnit(foundTopic.id, unitId)
                : questionsService.getQuestionsForTopic(foundTopic.id);

            if (aiQuestions.length > 0) {
                const shuffled = [...aiQuestions].sort(() => Math.random() - 0.5);
                loadedQuestions = shuffled.slice(0, 10).map(aiQToQuizQ);
            }
        }

        setQuizQuestions(loadedQuestions);
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers({});
        setShowFeedback(false);
        setCorrectCount(0);
        setWeakUnits(new Set());
        setShortAnswer('');
        setPhase('quiz');
        setQuizStartTime(Date.now());
        setIsLoading(false);
    }, [topicId, sessionId, unitId, router]);

    const currentQuestion = quizQuestions[currentQuestionIndex] || null;

    const handleAnswer = useCallback((answer: string) => {
        const question = quizQuestions[currentQuestionIndex];
        if (!question) return;

        let isCorrect = false;
        if (question.type === 'mcq') {
            isCorrect = answer === question.correctAnswer;
        } else if (question.type === 'short-answer') {
            isCorrect = evaluateShortAnswer(answer, question);
        } else if (question.type === 'card') {
            isCorrect = answer === 'correct';
        } else if (question.type === 'coding') {
            isCorrect = answer === 'passed all tests';
        }

        if (isCorrect) {
            setScore(prev => prev + 10);
            setCorrectCount(prev => prev + 1);
        } else {
            setWeakUnits(prev => {
                const next = new Set(prev);
                next.add(question.unitId);
                return next;
            });
        }

        setAnswers(prev => ({ ...prev, [question.id]: answer }));

        if (question.type === 'mcq' || question.type === 'short-answer') {
            setShowFeedback(true);
        }
    }, [currentQuestionIndex, quizQuestions]);

    const handleShortAnswerSubmit = useCallback(() => {
        const question = quizQuestions[currentQuestionIndex];
        if (!question || !shortAnswer.trim()) return;
        const isCorrect = evaluateShortAnswer(shortAnswer, question);
        handleAnswer(isCorrect ? '__correct__' : shortAnswer);
    }, [shortAnswer, currentQuestionIndex, quizQuestions, handleAnswer]);

    const nextQuestion = useCallback(() => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
            setShortAnswer('');
        } else {
            // Finish quiz
            if (!topic) return;

            const finalScore = Math.round((correctCount / quizQuestions.length) * 100);

            const unitStats: Record<string, { correct: number; total: number; name?: string }> = {};

            const detailedQuestions = quizQuestions.map((q) => {
                let isCorrect = false;
                const ans = answers[q.id];
                if (q.type === 'mcq') isCorrect = ans === q.correctAnswer;
                else if (q.type === 'short-answer') isCorrect = ans === '__correct__';
                else if (q.type === 'card') isCorrect = ans === 'correct';

                if (!unitStats[q.unitId]) {
                    unitStats[q.unitId] = { correct: 0, total: 0, name: q.unitName || topic.units.find(u => u.id === q.unitId)?.text };
                }
                unitStats[q.unitId].total += 1;
                if (isCorrect) unitStats[q.unitId].correct += 1;

                return {
                    questionId: q.id,
                    unitId: q.unitId,
                    unitName: q.unitName,
                    questionText: q.question,
                    explanation: q.explanation,
                    isCorrect,
                    userAnswer: ans || '',
                    correctAnswer: q.correctAnswer,
                };
            });

            const unitBreakdown = Object.keys(unitStats).map(uId => ({
                unitId: uId,
                unitName: unitStats[uId].name,
                totalCount: unitStats[uId].total,
                correctCount: unitStats[uId].correct,
                score: Math.round((unitStats[uId].correct / unitStats[uId].total) * 100),
            }));

            const attemptDurationSeconds = Math.round((Date.now() - quizStartTime) / 1000);

            const historyAttempt: QuizAttempt = {
                id: `attempt-${Date.now()}`,
                topicId: topic.id,
                sessionId: sessionId || undefined,
                type: unitId ? 'unit-test' : 'topic-challenge',
                targetUnitId: unitId || undefined,
                score: finalScore,
                correctCount,
                totalCount: quizQuestions.length,
                completedAt: new Date().toISOString(),
                durationSeconds: attemptDurationSeconds,
                questions: detailedQuestions,
                unitBreakdown,
            };

            quizHistoryService.saveAttempt(historyAttempt);

            const testedUnitIds = [...new Set(quizQuestions.map(q => q.unitId))];

            const result: QuizResult = {
                topicId: topic.id,
                score: finalScore,
                correctCount,
                totalCount: quizQuestions.length,
                weakUnits: Array.from(weakUnits),
                testedUnitIds,
            };

            topicsService.updateTopicAfterQuiz(topic.id, result);

            if (sessionId) {
                const schedule = scheduleService.getScheduleForTopic(topic.id);
                if (schedule) {
                    scheduleService.markSessionComplete(schedule.id, sessionId, {
                        score: finalScore,
                        correctCount,
                        totalCount: quizQuestions.length,
                        completedAt: new Date().toISOString(),
                    });
                }
            }

            setPhase('result');
            const storedTopics = topicsService.getTopics();
            const updatedTopic = storedTopics.find(t => t.id === topicId);
            if (updatedTopic) setTopic(updatedTopic);
        }
    }, [currentQuestionIndex, quizQuestions, topic, correctCount, answers, weakUnits, quizStartTime, sessionId, unitId, topicId]);

    const handleRegenerate = useCallback(async () => {
        if (!topic) return;
        setIsRegenerating(true);
        try {
            const unitsToGen = unitId
                ? topic.units.filter(u => u.id === unitId)
                : topic.units;

            for (const unit of unitsToGen) {
                const response = await fetch('/api/ai/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topic.name,
                        topicId: topic.id,
                        unit: unit.text,
                        unitId: unit.id,
                        level: topic.level,
                        subLevel: topic.subLevel,
                        knowledgeGaps: topic.knowledgeGaps,
                        count: 5,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.questions) {
                        questionsService.saveQuestions(data.questions);
                    }
                }
            }

            // Reload questions from storage and reset quiz state in-memory
            // (avoid window.location.reload() which wipes in-memory auth state)
            const aiQuestions = unitId
                ? questionsService.getQuestionsForUnit(topic.id, unitId)
                : questionsService.getQuestionsForTopic(topic.id);
            const shuffled = [...aiQuestions].sort(() => Math.random() - 0.5);
            setQuizQuestions(shuffled.slice(0, 10).map(aiQToQuizQ));
            setCurrentQuestionIndex(0);
            setScore(0);
            setAnswers({});
            setShowFeedback(false);
            setCorrectCount(0);
            setWeakUnits(new Set());
            setShortAnswer('');
            setPhase('quiz');
            setQuizStartTime(Date.now());
        } catch (error) {
            console.error('Failed to regenerate questions:', error);
        } finally {
            setIsRegenerating(false);
        }
    }, [topic, unitId]);

    const resetQuiz = useCallback(() => {
        setCurrentQuestionIndex(0);
        setScore(0);
        setAnswers({});
        setShowFeedback(false);
        setCorrectCount(0);
        setWeakUnits(new Set());
        setShortAnswer('');
        setPhase('quiz');
        setQuizStartTime(Date.now());
    }, []);

    const startQuiz = useCallback((params: QuizTriggerParams) => {
        if (params.type === 'topic-challenge') {
            router.push(`/learn/${params.topicId}`);
        } else if (params.type === 'unit-test') {
            router.push(`/learn/${params.topicId}?unitId=${params.targetUnitId}`);
        }
    }, [router]);

    const finalPercentage = quizQuestions.length > 0 ? Math.round((correctCount / quizQuestions.length) * 100) : 0;

    return {
        // Data
        topic,
        phase,
        quizQuestions,
        currentQuestion,
        currentQuestionIndex,
        score,
        answers,
        showFeedback,
        correctCount,
        shortAnswer,
        setShortAnswer,
        isRegenerating,
        isLoading,
        finalPercentage,

        // Actions
        handleAnswer,
        handleShortAnswerSubmit,
        nextQuestion,
        handleRegenerate,
        resetQuiz,
        startQuiz,
        evaluateShortAnswer: (answer: string, question: QuizQuestion) => evaluateShortAnswer(answer, question),
        goHome: () => router.push('/'),
    };
}
