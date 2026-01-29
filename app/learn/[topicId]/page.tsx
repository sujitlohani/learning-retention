'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic, Concept, QuizQuestion, QuizResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, ArrowRight, Home as HomeIcon, Brain, Trophy } from 'lucide-react';
import { loadQuiz } from '@/lib/quiz-generator';


type Phase = 'review' | 'quiz' | 'result';

export default function LearnPage() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.topicId as string;

    const [topic, setTopic] = useState<Topic | null>(null);
    const [phase, setPhase] = useState<Phase>('review');
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);

    // Quiz State
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [weakConcepts, setWeakConcepts] = useState<Set<string>>(new Set());
    const [selectedConceptId, setSelectedConceptId] = useState<string | null>(null);

    useEffect(() => {
        const storedTopics = storage.getTopics();
        const foundTopic = storedTopics.find(t => t.id === topicId);

        if (foundTopic) {
            setTopic(foundTopic);
            const loadedQuiz = loadQuiz(
                foundTopic.name,
                foundTopic.concepts,
                selectedConceptId ?? undefined
            );
            setQuizQuestions(loadedQuiz);

            // Reset state
            setCurrentQuestionIndex(0);
            setScore(0);
            setAnswers({});
            setShowFeedback(false);
            setCorrectCount(0);
            setWeakConcepts(new Set());
            setPhase('review');
        } else {
            router.push('/');
        }
    }, [topicId, router, selectedConceptId]);

    const handleStartQuiz = () => {
        if (!quizQuestions.length) {
            alert("No questions available for this topic.");
            return;
        }
        setPhase('quiz');
    };

    const handleAnswer = (answer: string) => {
        const currentQuestion = quizQuestions[currentQuestionIndex];
        if (!currentQuestion) return;

        const isCorrect = currentQuestion.type === 'mcq'
            ? answer === currentQuestion.correctAnswer
            : answer === 'correct';

        if (isCorrect) {
            setScore(prev => prev + 10);
            setCorrectCount(prev => prev + 1);
        } else {
            setWeakConcepts(prev => {
                const next = new Set(prev);
                next.add(currentQuestion.conceptId);
                return next;
            });
        }

        setAnswers(prev => ({ ...prev, [currentQuestion.id]: answer }));

        if (currentQuestion.type === 'mcq') {
            setShowFeedback(true);
        }
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quizQuestions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setShowFeedback(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = () => {
        if (!topic) return;

        const finalScore = Math.round((correctCount / quizQuestions.length) * 100);

        const result: QuizResult = {
            topicId: topic.id,
            score: finalScore,
            correctCount,
            totalCount: quizQuestions.length,
            weakConcepts: Array.from(weakConcepts)
        };

        storage.updateTopicAfterQuiz(topic.id, result);
        setPhase('result');
        const storedTopics = storage.getTopics();
        const updatedTopic = storedTopics.find(t => t.id === topicId);
        if (updatedTopic) setTopic(updatedTopic);
    };

    if (!topic) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
    );

    // --- VIEW: CONCEPT REVIEW ---
    if (phase === 'review') {
        return (
            <div className="min-h-screen bg-background dot-grid">
                <div className="max-w-2xl mx-auto p-6 lg:p-10 space-y-6">
                    <div className="space-y-2 animate-fade-in">
                        <h1 className="text-2xl lg:text-3xl font-bold">
                            Review: <span className="text-primary">{topic.name}</span>
                        </h1>
                        <p className="text-muted-foreground">
                            Refresh your memory before the quiz.
                        </p>
                    </div>

                    {/* Concept Cards */}
                    <div className="grid gap-3 animate-slide-up delay-100">
                        {topic.concepts.map((concept, index) => {
                            const isSelected = selectedConceptId === concept.id;

                            return (
                                <button
                                    key={concept.id}
                                    onClick={() => setSelectedConceptId(isSelected ? null : concept.id)}
                                    className="text-left"
                                >
                                    <Card className={`transition-all border ${isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
                                        }`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <p className="font-medium">{concept.text}</p>
                                                    <span className="text-xs text-muted-foreground">Concept {index + 1}</span>
                                                </div>
                                                {concept.status !== 'neutral' && (
                                                    <Badge variant="outline" className={
                                                        concept.status === 'strong' ? 'text-green-600 border-green-300' : 'text-red-600 border-red-300'
                                                    }>
                                                        {concept.status}
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </button>
                            );
                        })}
                    </div>

                    {selectedConceptId && (
                        <p className="text-sm text-primary font-medium">
                            ✓ Quiz will focus on the selected concept
                        </p>
                    )}

                    <div className="pt-4 animate-slide-up delay-200">
                        <Button size="lg" className="h-12 px-8" onClick={handleStartQuiz}>
                            Start Quiz
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW: QUIZ ---
    if (phase === 'quiz') {
        const question = quizQuestions[currentQuestionIndex];
        if (!question) return <div className="p-8 text-center">No quiz questions found.</div>;
        const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;

        return (
            <div className="min-h-screen bg-background dot-grid">
                <div className="max-w-2xl mx-auto p-6 lg:p-10 space-y-6 min-h-screen flex flex-col justify-center">
                    {/* Progress */}
                    <div className="space-y-2 animate-fade-in">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    {/* Question Card */}
                    <Card className="border" key={currentQuestionIndex}>
                        <CardHeader className="pb-4">
                            <CardTitle className="text-lg leading-relaxed">{question.question}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {question.type === 'mcq' && (
                                <div className="grid gap-2">
                                    {question.options?.map((option, i) => {
                                        const isCorrect = option === question.correctAnswer;
                                        const isSelected = answers[question.id] === option;

                                        let buttonClass = "w-full justify-start text-left h-auto py-3 px-4 text-sm border";

                                        if (showFeedback) {
                                            if (isCorrect) {
                                                buttonClass += " bg-green-500 text-white border-green-500";
                                            } else if (isSelected) {
                                                buttonClass += " bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:text-red-400";
                                            }
                                        } else {
                                            buttonClass += " hover:border-primary hover:bg-primary/5";
                                        }

                                        return (
                                            <Button
                                                key={i}
                                                variant="outline"
                                                className={buttonClass}
                                                onClick={() => !showFeedback && handleAnswer(option)}
                                                disabled={showFeedback}
                                            >
                                                <span className="mr-3 w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                {option}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}

                            {question.type === 'card' && (
                                <div className="space-y-4">
                                    {!showFeedback ? (
                                        <Button className="w-full" variant="secondary" onClick={() => setShowFeedback(true)}>
                                            Show Answer
                                        </Button>
                                    ) : (
                                        <div className="bg-muted/50 p-4 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Answer:</p>
                                            <p>{question.correctAnswer}</p>

                                            {!answers[question.id] && (
                                                <div className="flex gap-2 mt-4">
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 border-red-300 text-red-600"
                                                        onClick={() => handleAnswer('incorrect')}
                                                    >
                                                        I forgot
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        className="flex-1 border-green-300 text-green-600"
                                                        onClick={() => handleAnswer('correct')}
                                                    >
                                                        I remembered
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>

                        {((showFeedback && question.type === 'mcq') || (showFeedback && answers[question.id] && question.type === 'card')) && (
                            <CardFooter className="bg-muted/30 flex justify-between items-center p-4 border-t">
                                <div className="flex items-center gap-2">
                                    {(question.type === 'mcq' ? answers[question.id] === question.correctAnswer : answers[question.id] === 'correct')
                                        ? <><CheckCircle2 className="text-green-600 w-4 h-4" /> <span className="text-sm font-medium text-green-600">Correct!</span></>
                                        : <><XCircle className="text-red-600 w-4 h-4" /> <span className="text-sm font-medium text-red-600">Incorrect</span></>
                                    }
                                </div>
                                <Button size="sm" onClick={nextQuestion}>
                                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next' : 'Finish'}
                                </Button>
                            </CardFooter>
                        )}
                    </Card>
                </div>
            </div>
        );
    }

    // --- VIEW: RESULT ---
    const finalPercentage = Math.round((correctCount / quizQuestions.length) * 100);
    const isExcellent = finalPercentage >= 80;

    return (
        <div className="min-h-screen bg-background dot-grid">
            <div className="max-w-md mx-auto p-6 lg:p-10 min-h-screen flex flex-col justify-center text-center space-y-6">
                <div className="flex justify-center animate-fade-in">
                    <div className={`p-4 rounded-2xl ${isExcellent ? 'bg-primary/10' : 'bg-muted'}`}>
                        {isExcellent ? (
                            <Trophy className="w-12 h-12 text-primary" />
                        ) : (
                            <Brain className="w-12 h-12 text-muted-foreground" />
                        )}
                    </div>
                </div>

                <div className="space-y-2 animate-slide-up delay-100">
                    <h1 className="text-3xl font-bold">Session Complete!</h1>
                    <p className="text-muted-foreground">
                        {isExcellent ? "Outstanding! Your brain is on fire! 🔥" : "Keep practicing. Every attempt makes you stronger."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 animate-slide-up delay-200">
                    <Card className="border">
                        <CardContent className="pt-6 pb-4">
                            <div className="text-4xl font-bold text-primary">{finalPercentage}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Quiz Score</p>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardContent className="pt-6 pb-4">
                            <div className="text-4xl font-bold">{topic.memoryScore}%</div>
                            <p className="text-xs text-muted-foreground mt-1">Memory Score</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex flex-col gap-2 animate-slide-up delay-300">
                    <Button size="lg" className="h-12" onClick={() => router.push('/')}>
                        <HomeIcon className="mr-2 w-4 h-4" /> Return Home
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/cockpit')}>
                        View Cockpit
                    </Button>
                </div>
            </div>
        </div>
    );
}
