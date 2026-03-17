'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Lightbulb, CheckCircle2, ChevronRight, Check, X, Frown, Meh, Smile, Loader2 } from 'lucide-react';
import { useDeepDiveSession } from '@/src/features/deepdive/hooks/useDeepDiveSession';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { CodeBlock } from '@/src/features/deepdive/components/CodeBlock';

export function DeepDiveLearnSession() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <SkeletonFull />
            </div>
        }>
            <SessionContent />
        </Suspense>
    );
}

function SkeletonFull() {
    return (
        <div className="max-w-2xl w-full mx-auto px-6 py-8 space-y-6 animate-pulse">
            <div className="h-4 rounded bg-[var(--bg-raised)] w-32" />
            <div className="h-6 rounded bg-[var(--bg-raised)] w-48" />
            <div className="h-3 rounded bg-[var(--bg-raised)] w-24" />
            <div className="h-1.5 rounded-full bg-[var(--bg-raised)] w-full" />
            <div className="space-y-4 pt-8">
                <div className="h-5 rounded bg-[var(--bg-raised)] w-3/4" />
                <div className="h-4 rounded bg-[var(--bg-raised)] w-full" />
                <div className="h-4 rounded bg-[var(--bg-raised)] w-5/6" />
                <div className="h-4 rounded bg-[var(--bg-raised)] w-2/3" />
            </div>
        </div>
    );
}

function SkeletonContent() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-5 rounded bg-[var(--bg-raised)] w-3/5" />
            <div className="h-4 rounded bg-[var(--bg-raised)] w-full" />
            <div className="h-4 rounded bg-[var(--bg-raised)] w-4/5" />
            <div className="h-4 rounded bg-[var(--bg-raised)] w-2/3" />
            <div className="h-32 rounded-lg bg-[var(--bg-raised)] w-full" />
            <div className="h-4 rounded bg-[var(--bg-raised)] w-1/3" />
        </div>
    );
}

function SessionContent() {
    const searchParams = useSearchParams();
    const topicId = searchParams.get('topicId');
    const unitId = searchParams.get('unitId');
    const router = useRouter();
    const session = useDeepDiveSession(topicId, unitId);

    if (!topicId || !unitId) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="text-center space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Missing parameters.</p>
                    <Link href="/deep-dive" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>← Back to Deep Dive</Link>
                </div>
            </div>
        );
    }

    if (!session.topicName) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
                <div className="text-center space-y-3">
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Topic not found.</p>
                    <Link href="/deep-dive" className="text-sm font-bold" style={{ color: 'var(--accent)' }}>← Back to Deep Dive</Link>
                </div>
            </div>
        );
    }

    const stepPercent = session.step * 25;

    return (
        <div className="min-h-screen font-display pb-20" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col min-h-[calc(100vh-40px)]">
                <button onClick={() => router.push('/deep-dive')} className="text-sm font-bold flex items-center gap-2 mb-6 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                    <ArrowLeft className="w-4 h-4" /> Back to Deep Dive
                </button>

                <div className="mb-8">
                    <div className="flex items-end justify-between mb-3">
                        <div className="min-w-0">
                            <h1 className="text-xl font-bold truncate">{session.unitName}</h1>
                            <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{session.topicName}</p>
                        </div>
                        <div className="text-right shrink-0 ml-4">
                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Step {session.step} of 4</div>
                            <div className="text-xs font-bold mt-0.5">{stepPercent}% Complete</div>
                        </div>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                        <motion.div className="h-full rounded-full" style={{ background: 'var(--accent)' }} animate={{ width: `${stepPercent}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col">
                    <AnimatePresence mode="wait">
                        {session.step === 1 && <Step1 key="s1" session={session} />}
                        {session.step === 2 && <Step2 key="s2" session={session} />}
                        {session.step === 3 && <Step3 key="s3" session={session} />}
                        {session.step === 4 && <Step4 key="s4" session={session} />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// ─── Step 1 — Key Idea ───────────────────────
function Step1({ session }: { session: ReturnType<typeof useDeepDiveSession> }) {
    // Error check FIRST — otherwise stepReady=false keeps the skeleton forever
    if (session.stepErrors.keyIdea && !session.keyIdea) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl" style={{ borderColor: 'var(--border)' }}>
                <p className="font-bold text-sm mb-4" style={{ color: 'var(--danger)' }}>Couldn&apos;t load this step.</p>
                <div className="flex gap-3">
                    <button onClick={() => session.retryStep('keyIdea')} className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors">Retry</button>
                    <button onClick={() => window.history.back()} className="px-4 py-2 rounded-lg text-sm font-bold" style={{ background: 'var(--bg-raised)' }}>Exit Session</button>
                </div>
            </motion.div>
        );
    }

    if (!session.stepReady.keyIdea) {
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1"><SkeletonContent /></motion.div>;
    }

    const kd = session.keyIdea;
    if (!kd) return null;

    const isNextExample = kd.codeSnippet !== null;
    const nextReady = isNextExample ? (session.stepReady.example || !!session.stepErrors.example) : (session.stepReady.miniCheck || !!session.stepErrors.miniCheck);
    const nextHasError = isNextExample ? !!session.stepErrors.example : !!session.stepErrors.miniCheck;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col flex-1">
            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 leading-tight">
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                </div>
                {kd.title}
            </h2>
            <p className="text-[15px] leading-[1.7] mb-8">{kd.explanation}</p>

            {kd.codeSnippet && (
                <div className="mb-8">
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Example Snippet</div>
                    <CodeBlock code={kd.codeSnippet.code} />
                    {kd.codeSnippet.resultLine && (
                        <div className="text-xs font-mono mt-2">
                            <span style={{ color: 'var(--accent)' }}>Result:</span>{' '}
                            <span style={{ color: 'var(--text-muted)' }}>{kd.codeSnippet.resultLine}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="mt-auto pt-8">
                <button
                    onClick={session.advanceToStep2}
                    disabled={!nextReady}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}
                >
                    {!nextReady ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> 
                     : nextHasError ? <>Skip &rarr;</> 
                     : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 2 — Example Breakdown ───────────────
function Step2({ session }: { session: ReturnType<typeof useDeepDiveSession> }) {
    if (session.stepErrors.example && !session.example) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl mt-8" style={{ borderColor: 'var(--border)' }}>
                <p className="font-bold text-sm mb-4" style={{ color: 'var(--danger)' }}>Couldn&apos;t load the code breakdown.</p>
                <div className="flex gap-3">
                    <button onClick={() => session.retryStep('example')} className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors hover:bg-bg-raised">Retry</button>
                    <button onClick={session.advanceToStep3} className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>Skip &rarr;</button>
                </div>
            </motion.div>
        );
    }

    if (!session.stepReady.example || !session.example) {
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1"><SkeletonContent /></motion.div>;
    }

    const nextReady = session.stepReady.miniCheck || !!session.stepErrors.miniCheck;
    const nextHasError = !!session.stepErrors.miniCheck;

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col flex-1">
            <h2 className="text-xl font-bold mb-6">Let&apos;s break this down</h2>
            <div className="space-y-1 mb-8">
                {session.example.map((line, i) => (
                    <div key={i} className="border-l-2 pl-4" style={{ borderColor: 'var(--accent)' }}>
                        <pre className="text-[13px] rounded-md px-3 py-2 mb-1 overflow-x-auto" style={{ background: '#0E0E16', color: '#c8c5d9', fontFamily: "Consolas, 'Courier New', monospace" }}>
                            {line.code}
                        </pre>
                        <p className="text-xs pb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{line.explanation}</p>
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-8">
                <button
                    onClick={session.advanceToStep3}
                    disabled={!nextReady}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] disabled:opacity-50"
                    style={{ background: 'var(--accent)' }}
                >
                    {!nextReady ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</> 
                     : nextHasError ? <>Skip &rarr;</> 
                     : <>Continue <ChevronRight className="w-4 h-4" /></>}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 3 — Mini Check ──────────────────────
function Step3({ session }: { session: ReturnType<typeof useDeepDiveSession> }) {
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    if (session.stepErrors.miniCheck && !session.miniCheck) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col items-center justify-center text-center p-8 border border-dashed rounded-xl mt-8" style={{ borderColor: 'var(--border)' }}>
                <p className="font-bold text-sm mb-4" style={{ color: 'var(--danger)' }}>Couldn&apos;t load the mini quiz.</p>
                <div className="flex gap-3">
                    <button onClick={() => session.retryStep('miniCheck')} className="px-4 py-2 rounded-lg text-sm font-bold border transition-colors hover:bg-bg-raised">Retry</button>
                    <button onClick={session.advanceToStep4} className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90" style={{ background: 'var(--accent)' }}>Skip &rarr;</button>
                </div>
            </motion.div>
        );
    }

    if (!session.stepReady.miniCheck || !session.miniCheck) {
        return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1"><SkeletonContent /></motion.div>;
    }

    const qIdx = session.currentMiniQ;
    const isComplete = qIdx >= session.miniCheck.length;

    if (isComplete) {
        const total = session.miniCheck.length;
        const correct = Object.entries(session.miniCheckAnswers).filter(([i, a]) => session.miniCheck![Number(i)].correctIndex === a).length;
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center flex-1 space-y-6 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'var(--success)', color: '#fff' }}>
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Quick Check</div>
                    <p className="text-2xl font-bold">{correct} / {total} correct</p>
                </div>
                <button onClick={session.advanceToStep4} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white hover:scale-[1.01]" style={{ background: 'var(--accent)' }}>
                    Continue <ChevronRight className="w-4 h-4" />
                </button>
            </motion.div>
        );
    }

    const q = session.miniCheck[qIdx];
    const isLast = qIdx === session.miniCheck.length - 1;

    const handleSelect = (idx: number) => {
        if (isAnswered) return;
        setSelectedOption(idx);
        setIsAnswered(true);
        session.recordMiniCheckAnswer(qIdx, idx);
    };

    const handleNext = () => {
        session.advanceMiniQ();
        setSelectedOption(null);
        setIsAnswered(false);
    };

    return (
        <motion.div key={qIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col flex-1">
            {/* Fix 3: same row */}
            <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Quick Check</div>
                <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Question {qIdx + 1} of {session.miniCheck!.length}</div>
            </div>

            <h2 className="text-[15px] font-medium mb-8 leading-relaxed">{q.question}</h2>

            <div className="space-y-3 mb-8">
                {q.options.map((opt, i) => {
                    let bg = 'var(--bg-surface)';
                    let border = 'var(--border)';
                    if (isAnswered) {
                        if (i === q.correctIndex) { bg = 'color-mix(in srgb, var(--success) 15%, transparent)'; border = 'var(--success)'; }
                        else if (i === selectedOption) { bg = 'color-mix(in srgb, var(--danger) 15%, transparent)'; border = 'var(--danger)'; }
                    }
                    return (
                        <button key={i} onClick={() => handleSelect(i)} disabled={isAnswered}
                            className="w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between"
                            style={{ background: bg, borderColor: border }}>
                            <span className="text-sm leading-relaxed">{opt}</span>
                            {isAnswered && i === q.correctIndex && <Check className="w-4 h-4 shrink-0" style={{ color: 'var(--success)' }} />}
                            {isAnswered && i === selectedOption && i !== q.correctIndex && <X className="w-4 h-4 shrink-0" style={{ color: 'var(--danger)' }} />}
                        </button>
                    );
                })}
            </div>

            {/* Fix 1: explanation card color based on correctness */}
            {isAnswered && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                    className="p-4 border rounded-xl"
                    style={{
                        background: selectedOption === q.correctIndex ? 'color-mix(in srgb, var(--success) 10%, transparent)' : 'color-mix(in srgb, var(--danger) 10%, transparent)',
                        borderColor: selectedOption === q.correctIndex ? 'var(--success)' : 'var(--danger)'
                    }}>
                    <p className="text-sm leading-relaxed">{q.explanation}</p>
                </motion.div>
            )}

            {/* Fix 2: inline Next Question / See Results button */}
            {isAnswered && (
                <div className="pt-4">
                    <button onClick={handleNext} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white hover:scale-[1.01] transition-transform" style={{ background: 'var(--accent)' }}>
                        {isLast ? 'See Results' : 'Next Question'} <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </motion.div>
    );
}

// ─── Step 4 — Concept Reinforced ──────────────
function Step4({ session }: { session: ReturnType<typeof useDeepDiveSession> }) {
    const { startQuiz } = useQuizSession();
    const [confidence, setConfidence] = useState<'confused' | 'somewhat' | 'clear' | null>(null);
    const [altExplanation, setAltExplanation] = useState<string | null>(null);
    const [altLoading, setAltLoading] = useState(false);

    const handleConfidence = async (val: 'confused' | 'somewhat' | 'clear') => {
        setConfidence(val);
        if (val === 'confused') {
            setAltLoading(true);
            const result = await session.fetchAlternateExplanation();
            setAltExplanation(result || 'Unable to generate alternate explanation. Try reviewing the example again.');
            setAltLoading(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col flex-1 space-y-8">
            <div className="p-8 rounded-2xl text-white text-center shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, var(--danger)) 100%)' }}>
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold mb-3">Concept Reinforced</h2>
                <p className="text-white/90 text-[15px] max-w-sm mx-auto mb-8 font-medium leading-relaxed">
                    You&apos;ve worked through {session.unitName}. Ready to test yourself?
                </p>
                <button onClick={() => startQuiz({ type: 'unit-test', topicId: session.topicId, targetUnitId: session.unitId })}
                    className="w-full py-3.5 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02]"
                    style={{ background: '#fff', color: 'var(--accent)' }}>
                    Start Unit Test <ChevronRight className="w-4 h-4 inline" />
                </button>
            </div>

            <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-center mb-4" style={{ color: 'var(--text-muted)' }}>How well do you understand this?</div>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { val: 'confused' as const, Icon: Frown, label: 'Still confused', color: 'var(--danger)' },
                        { val: 'somewhat' as const, Icon: Meh, label: 'Somewhat', color: 'var(--warning)' },
                        { val: 'clear' as const, Icon: Smile, label: 'Clear', color: 'var(--success)' },
                    ].map(({ val, Icon, label, color }) => (
                        <button key={val} onClick={() => handleConfidence(val)} disabled={confidence !== null}
                            className="py-3 px-2 rounded-xl border flex flex-col items-center gap-2 transition-all disabled:opacity-70"
                            style={{
                                background: confidence === val ? `color-mix(in srgb, ${color} 15%, transparent)` : 'var(--bg-surface)',
                                borderColor: confidence === val ? color : 'var(--border)',
                            }}>
                            <Icon className="w-5 h-5" style={{ color: confidence === val ? color : 'var(--text-muted)' }} />
                            <span className="text-xs font-bold" style={{ color: confidence === val ? color : 'var(--text-muted)' }}>{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {altLoading && (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--accent)' }} />
                </div>
            )}

            {altExplanation && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="p-5 rounded-xl border shadow-sm"
                    style={{ background: 'var(--bg-surface)', borderColor: 'var(--accent)' }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Different angle</div>
                    <p className="text-sm leading-relaxed">{altExplanation}</p>
                </motion.div>
            )}
        </motion.div>
    );
}
