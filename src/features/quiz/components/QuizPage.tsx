'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckCircle2, XCircle, Brain, Trophy, Plus, LogOut, Loader2, Lightbulb, X, BookOpen } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { useParams, useSearchParams } from 'next/navigation';

export function QuizPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const topicId = params.topicId as string;
    const sessionId = searchParams.get('session');
    const conceptId = searchParams.get('conceptId');

    const q = useQuizSession(topicId, sessionId, conceptId);

    if (q.isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display" style={{ background: 'var(--bg-base)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    if (!q.topic || q.quizQuestions.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 font-display p-6" style={{ background: 'var(--bg-base)' }}>
                <Brain className="w-12 h-12 opacity-30" style={{ color: 'var(--text-muted)' }} />
                <p className="font-medium" style={{ color: 'var(--text-muted)' }}>No questions available for this topic.</p>
                <button
                    onClick={q.goHome}
                    className="px-6 py-2.5 font-bold flex items-center gap-2 transition-ui hover:opacity-90 mt-2"
                    style={{ background: 'var(--accent)', color: '#fff', borderRadius: '9999px' }}
                >
                    <X className="w-4 h-4" /> Exit Quiz
                </button>
            </div>
        );
    }

    // --- RESULT PHASE ---
    if (q.phase === 'result') {
        const isExcellent = q.finalPercentage >= 80;
        return (
            <div className="min-h-screen flex flex-col font-display" style={{ background: 'var(--bg-base)' }}>
                {/* Minimal Header */}
                <header className="w-full h-16 flex items-center justify-between px-6 border-b sticky top-0 bg-background/80 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                        <h2 className="text-sm md:text-base font-bold text-muted-foreground">Session Complete</h2>
                    </div>
                    <button
                        onClick={q.goHome}
                        className="p-2 rounded-lg hover:bg-bg-raised transition-colors"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-6">
                    <motion.div
                        className="max-w-[480px] w-full text-center space-y-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="mx-auto w-24 h-24 flex items-center justify-center"
                            style={{
                                background: isExcellent ? 'var(--accent)' : 'var(--bg-raised)',
                                color: isExcellent ? '#fff' : 'var(--text-muted)',
                                borderRadius: 'var(--radius-md)',
                            }}
                        >
                            {isExcellent
                                ? <Trophy className="w-12 h-12" />
                                : <Brain className="w-12 h-12" />
                            }
                        </motion.div>

                        {/* Title */}
                        <div className="space-y-3">
                            <h1 className="text-3xl md:text-4xl font-bold">Quiz Complete!</h1>
                            <p className="text-base" style={{ color: 'var(--text-muted)' }}>
                                {isExcellent
                                    ? 'Incredible work. You demonstrated strong mastery of the material.'
                                    : 'Solid practice. Regular review strengthens long-term retention.'}
                            </p>
                        </div>

                        {/* Score cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 border flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}>
                                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Quiz Score</div>
                                <div className="text-4xl font-black" style={{ color: 'var(--accent)' }}>{q.finalPercentage}%</div>
                            </div>
                            <div className="p-6 border flex flex-col items-center justify-center gap-2" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}>
                                <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Topic Memory</div>
                                <div className="text-4xl font-black">{q.topic?.memoryScore ?? 0}%</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-3 pt-4">
                            <button
                                className="w-full h-14 font-bold flex items-center justify-center gap-3 transition-ui"
                                style={{ background: 'var(--accent)', color: '#fff', borderRadius: '9999px' }}
                                onClick={q.handleRegenerate}
                                disabled={q.isRegenerating}
                            >
                                <Brain className={cn("w-5 h-5", q.isRegenerating && "animate-spin")} />
                                {q.isRegenerating ? 'Generating New Set...' : 'Review Again (New Questions)'}
                            </button>
                            <button
                                className="w-full h-14 font-bold border-2 transition-ui flex items-center justify-center gap-3 hover:bg-bg-raised"
                                style={{ borderColor: 'var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)' }}
                                onClick={q.goHome}
                            >
                                <LogOut className="w-5 h-5" /> Back to Dashboard
                            </button>
                        </div>
                    </motion.div>
                </main>
            </div>
        );
    }

    // --- QUIZ PHASE ---
    const question = q.currentQuestion;
    if (!question) return null;

    const userAnswer = q.answers[question.id];
    const hasAnswered = !!userAnswer;
    const progressPercent = ((q.currentQuestionIndex) / q.quizQuestions.length) * 100;

    return (
        <div className="min-h-screen flex flex-col font-display" style={{ background: 'var(--bg-base)' }}>
            {/* Top Navigation Bar */}
            <header className="w-full border-b sticky top-0 z-50 bg-background/90 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between relative">
                    <div className="flex items-center gap-3 max-w-[40%]">
                        <BookOpen className="w-5 h-5 shrink-0 hidden md:block" style={{ color: 'var(--accent)' }} />
                        <h2 className="text-sm md:text-base font-bold truncate">
                            <span className="opacity-60 hidden md:inline">[{q.topic?.name}] · </span>
                            <span>{question.conceptName || 'General'}</span>
                        </h2>
                    </div>

                    {/* Centered Progress Text */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <span className="text-sm font-bold tracking-wider uppercase opacity-80" style={{ color: 'var(--text-muted)' }}>
                            Q{q.currentQuestionIndex + 1} of {q.quizQuestions.length}
                        </span>
                    </div>

                    <button
                        onClick={q.goHome}
                        className="p-2 rounded-lg transition-colors hover:bg-bg-raised"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar Line */}
                <div className="w-full h-1" style={{ background: 'var(--bg-raised)' }}>
                    <motion.div
                        className="h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ background: 'var(--accent)' }}
                    />
                </div>
            </header>

            {/* Quiz Content */}
            <main className="flex-1 flex flex-col items-center justify-start pt-12 md:pt-20 px-6 pb-32 overflow-y-auto">
                <div className="w-full max-w-[640px] flex flex-col gap-10">

                    {/* Question Text */}
                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            <motion.h1
                                key={q.currentQuestionIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-2xl md:text-3xl font-bold leading-tight text-center md:text-left"
                            >
                                {question.question}
                            </motion.h1>
                        </AnimatePresence>
                    </div>

                    {/* Answer Area */}
                    <div className="space-y-6">
                        {/* MCQ */}
                        {question.type === 'mcq' && (
                            <div className="grid grid-cols-1 gap-3">
                                {question.options?.map((option, i) => {
                                    const isCorrect = option === question.correctAnswer;
                                    const isSelected = userAnswer === option;

                                    let borderColor = 'var(--border)';
                                    let bgColor = 'var(--bg-surface)';
                                    let textColor = 'var(--text-primary)';
                                    let icon = null;

                                    if (q.showFeedback) {
                                        if (isCorrect) {
                                            borderColor = 'var(--success)';
                                            bgColor = 'color-mix(in srgb, var(--success) 10%, transparent)';
                                            icon = <CheckCircle2 className="w-5 h-5 text-success" />;
                                        } else if (isSelected) {
                                            borderColor = 'var(--danger)';
                                            bgColor = 'color-mix(in srgb, var(--danger) 10%, transparent)';
                                            icon = <XCircle className="w-5 h-5 text-danger" />;
                                        } else {
                                            /* Unselected, incorrect option dim */
                                            borderColor = 'var(--border)';
                                            bgColor = 'transparent';
                                            textColor = 'var(--text-muted)';
                                        }
                                    } else if (isSelected) {
                                        // Selected state before submission (if not auto-submitted immediately)
                                        borderColor = 'var(--accent)';
                                        bgColor = 'color-mix(in srgb, var(--accent) 5%, transparent)';
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => !q.showFeedback && q.handleAnswer(option)}
                                            disabled={q.showFeedback}
                                            className={cn(
                                                "group relative flex items-center justify-between p-5 rounded-xl border-2 transition-all text-left w-full",
                                                !q.showFeedback && "hover:border-accent hover:bg-accent/5 cursor-pointer"
                                            )}
                                            style={{
                                                borderColor,
                                                background: bgColor,
                                                color: textColor
                                            }}
                                        >
                                            <span className="text-base font-bold leading-snug pr-4">{option}</span>
                                            {icon}
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Short Answer */}
                        {question.type === 'short-answer' && (
                            <div className="space-y-4">
                                {!q.showFeedback ? (
                                    <>
                                        <textarea
                                            value={q.shortAnswer}
                                            onChange={(e) => q.setShortAnswer(e.target.value)}
                                            placeholder="Type your answer here..."
                                            className="w-full min-h-[140px] p-5 text-base rounded-xl border-2 resize-y focus:outline-none transition-all placeholder:opacity-50 font-medium leading-relaxed bg-transparent"
                                            style={{ borderColor: 'var(--border)', ['--tw-ring-color' as string]: 'var(--accent)' }}
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && q.shortAnswer.trim() && (e.preventDefault(), q.handleShortAnswerSubmit())}
                                        />
                                        <button
                                            disabled={!q.shortAnswer.trim()}
                                            className="w-full py-4 rounded-xl font-bold text-white transition-opacity disabled:opacity-50"
                                            style={{ background: 'var(--accent)' }}
                                            onClick={q.handleShortAnswerSubmit}
                                        >
                                            Submit Answer
                                        </button>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="p-5 rounded-xl border-2" style={{ borderColor: userAnswer === '__correct__' ? 'var(--success)' : 'var(--danger)', background: userAnswer === '__correct__' ? 'color-mix(in srgb, var(--success) 5%, transparent)' : 'color-mix(in srgb, var(--danger) 5%, transparent)' }}>
                                            <p className="text-xs uppercase font-bold tracking-wider mb-2 opacity-80" style={{ color: userAnswer === '__correct__' ? 'var(--success)' : 'var(--danger)' }}>
                                                Your Answer
                                            </p>
                                            <p className="text-base font-medium">{userAnswer === '__correct__' ? q.shortAnswer : userAnswer}</p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2" style={{ borderColor: 'var(--success)', background: 'color-mix(in srgb, var(--success) 5%, transparent)' }}>
                                            <p className="text-xs uppercase font-bold tracking-wider mb-2 opacity-80" style={{ color: 'var(--success)' }}>
                                                Ideal Answer
                                            </p>
                                            <p className="text-base font-medium">{question.correctAnswer}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Card (Recall) */}
                        {question.type === 'card' && (
                            <div className="space-y-4">
                                {!q.showFeedback ? (
                                    <button
                                        className="w-full py-5 rounded-xl border-2 font-bold text-lg hover:bg-bg-raised transition-colors flex items-center justify-center gap-3"
                                        style={{ borderColor: 'var(--border)' }}
                                        onClick={() => q.handleAnswer('')}
                                    >
                                        Reveal Answer
                                    </button>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-8 rounded-xl border-2 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                                            <p className="text-xs uppercase font-bold tracking-widest mb-4 opacity-50">Answer</p>
                                            <p className="text-xl md:text-2xl font-bold">{question.correctAnswer}</p>
                                        </div>
                                        {!hasAnswered && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button
                                                    className="py-4 rounded-xl font-bold border-2 transition-all hover:bg-red-500/10"
                                                    style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                    onClick={() => q.handleAnswer('incorrect')}
                                                >
                                                    Needs Review
                                                </button>
                                                <button
                                                    className="py-4 rounded-xl font-bold border-2 transition-all hover:bg-green-500/10"
                                                    style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                                                    onClick={() => q.handleAnswer('correct')}
                                                >
                                                    Got It
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inline Feedback Panel */}
                        {q.showFeedback && hasAnswered && question.explanation && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-6 border flex flex-col gap-3"
                                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', borderRadius: 'var(--radius-md)' }}
                            >
                                <div className="flex items-center gap-2">
                                    <Lightbulb className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                    <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Why?</h3>
                                </div>
                                <p className="leading-relaxed text-base font-medium" style={{ color: 'var(--text-primary)' }}>
                                    {question.explanation}
                                </p>
                            </motion.div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Action (Sticky) */}
            {q.showFeedback && hasAnswered && (
                <footer className="fixed bottom-0 left-0 right-0 p-6 border-t flex justify-center z-40 bg-background/90 backdrop-blur" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-full max-w-[640px] flex justify-end">
                        <button
                            className="flex items-center justify-center gap-3 px-8 py-4 font-bold text-white transition-ui"
                            style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                            onClick={q.nextQuestion}
                        >
                            {q.currentQuestionIndex < q.quizQuestions.length - 1 ? 'Next Question' : 'View Results'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </footer>
            )}
        </div>
    );
}
