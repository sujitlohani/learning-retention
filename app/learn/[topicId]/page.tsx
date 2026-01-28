'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
// import { generateQuiz } from '@/lib/quiz-generator';
import { Topic, Concept, QuizQuestion, QuizResult } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, ArrowRight, RefreshCcw, Home as HomeIcon } from 'lucide-react';
import { loadQuiz } from '@/lib/quiz-generator';
import { Textarea } from '@/components/ui/textarea';



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
    const [answers, setAnswers] = useState<Record<string, string>>({}); // valid for MCQ
    const [showFeedback, setShowFeedback] = useState(false);
    const [correctCount, setCorrectCount] = useState(0);
    const [weakConcepts, setWeakConcepts] = useState<Set<string>>(new Set());



    useEffect(() => {
        const storedTopics = storage.getTopics();
        const foundTopic = storedTopics.find(t => t.id === topicId);

        if (foundTopic) {
            setTopic(foundTopic);
            const loadedQuiz = loadQuiz(foundTopic.name, foundTopic.concepts);
            console.log("Loaded quiz:", loadedQuiz); // debug
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
    }, [topicId, router]);


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
            setScore(prev => prev + 10); // increment score
            setCorrectCount(prev => prev + 1); // increment correct count
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
        // Re-fetch topic to show updated score
        const storedTopics = storage.getTopics();
        const updatedTopic = storedTopics.find(t => t.id === topicId);
        if (updatedTopic) setTopic(updatedTopic);
    };

    if (!topic) return <div className="p-8 text-center">Loading...</div>;

    // --- VIEW: CONCEPT REVIEW ---
    if (phase === 'review') {
        return (
            <div className="max-w-2xl mx-auto p-6 space-y-6">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-sans">Review: {topic.name}</h1>
                    <p className="text-muted-foreground">Refresh your memory before the quiz.</p>
                </div>

                <div className="grid gap-4">
                    {topic.concepts.map((concept) => (
                        <Card key={concept.id}>
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-medium text-lg">{concept.text}</p>
                                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Concept</span>
                                    </div>
                                    {concept.status === 'strong' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Strong</Badge>}
                                    {concept.status === 'weak' && <Badge variant="destructive">Weak</Badge>}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="pt-4 flex justify-end">
                    <Button size="lg" onClick={handleStartQuiz}>
                        I'm Ready to Quiz <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                </div>
            </div>
        );
    }

    // --- VIEW: QUIZ ---
    if (phase === 'quiz') {
        const question = quizQuestions[currentQuestionIndex];
        if (!question) return <div className="p-8 text-center">No quiz questions found for this topic.</div>;
        const progress = ((currentQuestionIndex) / quizQuestions.length) * 100;

        return (
            <div className="max-w-2xl mx-auto p-6 space-y-8 min-h-screen flex flex-col justify-center">
                <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span>Question {currentQuestionIndex + 1} of {quizQuestions.length}</span>
                        <span>{Math.round(progress)}% completed</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                </div>

                <Card className="border-2" key={currentQuestionIndex}>
                    <CardHeader>
                        <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {question.type === 'mcq' && (
                            <div className="grid gap-3">
                                {question.options?.map((option, i) => (
                                    <Button
                                        key={i}
                                        variant={showFeedback
                                            ? (option === question.correctAnswer ? 'default' : (answers[question.id] === option ? 'destructive' : 'outline'))
                                            : 'outline'}
                                        className={`w-full justify-start text-left h-auto py-4 px-6 text-base ${showFeedback && option === question.correctAnswer ? 'bg-green-600 hover:bg-green-700 text-white border-green-600' : ''}`}
                                        onClick={() => !showFeedback && handleAnswer(option)}
                                        disabled={showFeedback}
                                    >
                                        <span className="mr-3 opacity-50">{String.fromCharCode(65 + i)}.</span>
                                        {option}
                                    </Button>
                                ))}
                            </div>
                        )}

                        {question.type === 'card' && (
                            <div className="space-y-4">
                                {!showFeedback ? (
                                    <div className="space-y-4">
                                        <p className="text-muted-foreground italic">Think about the answer, then flip the card.</p>
                                        <Button className="w-full" variant="secondary" onClick={() => setShowFeedback(true)}>Show Answer</Button>
                                    </div>
                                ) : (
                                    <div className="bg-muted p-4 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                        <p className="font-semibold mb-1">Answer:</p>
                                        <p>{question.correctAnswer}</p>

                                        {!answers[question.id] ? (
                                            <div className="flex gap-2 mt-4">
                                                <Button className="flex-1 bg-red-100 text-red-700 hover:bg-red-200" variant="ghost" onClick={() => handleAnswer('incorrect')}>I forgot</Button>
                                                <Button className="flex-1 bg-green-100 text-green-700 hover:bg-green-200" variant="ghost" onClick={() => handleAnswer('correct')}>I remembered</Button>
                                            </div>
                                        ) : (
                                            <div className="mt-4 pt-4 border-t flex justify-end">
                                                <Button onClick={nextQuestion}>
                                                    {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>

                    {showFeedback && question.type === 'mcq' && (
                        <CardFooter className="bg-muted/30 flex justify-between items-center p-4 border-t">
                            <div className="flex items-center gap-2">
                                {answers[question.id] === question.correctAnswer
                                    ? <><CheckCircle2 className="text-green-600 w-5 h-5" /> <span className="font-medium text-green-700">Correct!</span></>
                                    : <><XCircle className="text-red-600 w-5 h-5" /> <span className="font-medium text-red-700">Incorrect</span></>
                                }
                            </div>
                            <Button onClick={nextQuestion}>
                                {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            </Button>
                        </CardFooter>
                    )}
                </Card>
            </div>
        );
    }

    // --- VIEW: RESULT ---
    return (
        <div className="max-w-xl mx-auto p-6 min-h-screen flex flex-col justify-center text-center space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-primary">Session Complete!</h1>
                <p className="text-muted-foreground text-lg">Your brain is stronger now.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-teal-400">
                            {Math.round((correctCount / quizQuestions.length) * 100)}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Quiz Score</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-4xl font-bold text-foreground">
                            {topic.memoryScore}%
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">New Memory Score</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-3">
                <Button size="lg" className="w-full text-lg h-12" onClick={() => router.push('/')}>
                    <HomeIcon className="mr-2 w-4 h-4" /> Return Home
                </Button>
                <Button variant="outline" className="w-full" onClick={() => router.push('/cockpit')}>
                    View Cockpit
                </Button>
            </div>
        </div>
    );
}
