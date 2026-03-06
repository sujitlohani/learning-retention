'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Lightbulb, Sparkles, Calendar, Clock, CheckCircle2, Loader2, BookOpen, FileText, Video, Users, Globe } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useTopicWizard, sources, timeframeOptions, commitmentOptions } from '@/src/features/topics/hooks/useTopicWizard';
import { MemoraMark } from '@/src/components/MemoraLogo';
import { timeframeToDays } from '@/src/lib/schedule-calculator';

const sourceIcons: Record<string, typeof BookOpen> = {
    book: BookOpen,
    article: FileText,
    video: Video,
    course: Users,
    web: Globe,
    other: Lightbulb,
};

export function AddTopicPage() {
    const w = useTopicWizard();

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
    };

    const renderStep = () => {
        switch (w.currentStep) {
            case 'capture':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Lightbulb className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                What did you just learn?
                            </h1>
                            <p className="text-xl text-muted-foreground font-light">
                                Short phrases work best. You can expand later.
                            </p>
                        </div>
                        <div className="w-full max-w-md space-y-6">
                            <input
                                autoFocus
                                value={w.topicName}
                                onChange={(e) => w.setTopicName(e.target.value)}
                                placeholder="e.g., Closures in JavaScript"
                                className="w-full h-16 text-xl px-6 rounded-md border-2 border-border bg-bg-surface focus:border-accent focus:outline-none transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && w.topicName.trim() && w.handleCaptureContinue()}
                            />
                            <button
                                disabled={!w.topicName.trim()}
                                className="w-full h-14 text-lg rounded-full font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                                style={{ background: 'var(--accent)', color: '#fff' }}
                                onClick={w.handleCaptureContinue}
                            >
                                Continue <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                );

            case 'level':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Sparkles className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Rate yourself in <span style={{ color: 'var(--accent)' }}>{w.topicName}</span>
                            </h2>
                            <p className="text-xl text-muted-foreground font-light">
                                {w.isLoadingPreviews ? 'AI is generating concepts for each level...' : 'Pick a level to see its concepts.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full max-w-4xl">
                            {[
                                { id: 'beginner' as const, label: 'Beginner', desc: '"I\'m new to this topic"' },
                                { id: 'intermediate' as const, label: 'Intermediate', desc: '"I know the basics"' },
                                { id: 'expert' as const, label: 'Expert', desc: '"I\'m experienced with this topic"' },
                            ].map((lvl) => {
                                const isExpanded = w.level === lvl.id;

                                return (
                                    <div key={lvl.id} className="w-full">
                                        <button
                                            onClick={() => w.toggleLevelSelect(lvl.id)}
                                            disabled={w.isLoadingPreviews}
                                            className={cn(
                                                "w-full p-6 rounded-md border-2 transition-all text-left flex items-center justify-between",
                                                "hover:border-border",
                                                isExpanded ? "border-border" : "border-border/30",
                                                w.isLoadingPreviews && "opacity-80 cursor-wait"
                                            )}
                                            style={{ background: isExpanded ? 'var(--bg-raised)' : 'var(--bg-surface)' }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={cn(
                                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                                    isExpanded ? "border-transparent" : "border-muted-foreground/30"
                                                )} style={isExpanded ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                                                    {isExpanded && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                                                </div>
                                                <div>
                                                    <div className="text-xl font-bold">{lvl.label}</div>
                                                    <div className="text-sm text-muted-foreground">{lvl.desc}</div>
                                                </div>
                                            </div>
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={cn("transition-transform duration-200", isExpanded ? "rotate-180" : "")} style={{ color: 'var(--accent)' }}>
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-6 border-2 border-t-0 border-border rounded-b-md space-y-6" style={{ background: 'var(--bg-surface)' }}>
                                                        <div className="space-y-4">
                                                            <div className="flex items-center justify-between px-1">
                                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Review Concepts</h3>
                                                                <span className="text-xs text-muted-foreground">{w.subConcepts.length} concepts</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {w.isLoadingPreviews ? (
                                                                    <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground p-4">
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        <span>Generating concepts...</span>
                                                                    </div>
                                                                ) : w.subConcepts.length > 0 ? (
                                                                    w.subConcepts.map((sc) => (
                                                                        <div
                                                                            key={sc.id}
                                                                            className={cn(
                                                                                "flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer",
                                                                                sc.checked ? "border-border" : "border-border/30"
                                                                            )}
                                                                            style={sc.checked ? { background: 'var(--accent-light)' } : { background: 'var(--bg-surface)' }}
                                                                            onClick={() => w.toggleSubConcept(sc.id)}
                                                                        >
                                                                            <div className="mt-0.5 flex-shrink-0">
                                                                                <div className={cn(
                                                                                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                                                                                    sc.checked ? "border-transparent" : "border-border"
                                                                                )} style={sc.checked ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                                                                                    {sc.checked && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                                                </div>
                                                                            </div>
                                                                            <span className={cn(
                                                                                "text-sm leading-tight",
                                                                                sc.checked ? "font-medium" : "text-muted-foreground"
                                                                            )}>
                                                                                {sc.name}
                                                                            </span>
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="col-span-full text-sm text-muted-foreground p-4">No concepts matched.</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {w.subConcepts.length > 0 && !w.isLoadingPreviews && (
                                                            <div className="flex gap-2 max-w-md pt-2">
                                                                <input
                                                                    value={w.newConceptInput}
                                                                    onChange={(e) => w.setNewConceptInput(e.target.value)}
                                                                    placeholder="Missing something? Add a concept..."
                                                                    className="flex-1 h-10 text-sm px-3 rounded-md border border-border bg-bg-surface focus:border-border focus:outline-none"
                                                                    onKeyDown={(e) => e.key === 'Enter' && w.addSubConcept()}
                                                                />
                                                                <button
                                                                    className="h-10 px-4 rounded-md text-sm font-medium"
                                                                    style={{ background: 'var(--bg-raised)' }}
                                                                    onClick={w.addSubConcept}
                                                                >
                                                                    Add
                                                                </button>
                                                            </div>
                                                        )}

                                                        <div className="pt-4 flex justify-end">
                                                            <button
                                                                onClick={w.handleContinueFromLevel}
                                                                className="rounded-full px-8 py-2.5 font-semibold flex items-center gap-2"
                                                                style={{ background: 'var(--accent)', color: '#fff' }}
                                                            >
                                                                Continue <ArrowRight className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'timeframe':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Calendar className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">When do you want to master this?</h2>
                            <p className="text-xl text-muted-foreground font-light">We'll create a spaced repetition schedule to fit your timeline.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                            {timeframeOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => w.handleTimeframeSelect(option.value)}
                                    className={cn(
                                        "group p-5 rounded-md border-2 transition-all text-left hover:border-border",
                                        w.selectedTimeframe === option.value ? "border-border" : "border-border/30"
                                    )}
                                    style={{ background: w.selectedTimeframe === option.value ? 'var(--bg-raised)' : 'var(--bg-surface)' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'commitment':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Clock className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Daily time commitment?</h2>
                            <p className="text-xl text-muted-foreground font-light">Even small consistent effort compounds over time.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                            {commitmentOptions.map((option) => (
                                <button
                                    key={option.value}
                                    onClick={() => w.handleCommitmentSelect(option.value)}
                                    className={cn(
                                        "group p-5 rounded-md border-2 transition-all text-left hover:border-border",
                                        w.dailyCommitment === option.value ? "border-border" : "border-border/30"
                                    )}
                                    style={{ background: w.dailyCommitment === option.value ? 'var(--bg-raised)' : 'var(--bg-surface)' }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-lg font-bold">{option.label}</div>
                                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'source':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Lightbulb className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Where did you learn this?</h2>
                            <p className="text-xl text-muted-foreground font-light">Optional, but helps track your learning sources.</p>
                        </div>
                        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                            {sources.map((src) => {
                                const Icon = sourceIcons[src.id] || Lightbulb;
                                return (
                                    <button
                                        key={src.id}
                                        onClick={() => w.handleSourceSelect(src.id)}
                                        className={cn(
                                            "p-6 rounded-md border-2 transition-all hover:border-border",
                                            w.source === src.id ? "border-border" : "border-border/30"
                                        )}
                                        style={{ background: w.source === src.id ? 'var(--bg-raised)' : 'var(--bg-surface)' }}
                                    >
                                        <Icon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent)' }} />
                                        <div className="text-xs font-medium">{src.label}</div>
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
                            onClick={() => w.goToStep('confirmation')}
                        >
                            Skip this step
                        </button>
                    </div>
                );

            case 'confirmation': {
                const selectedCount = w.subConcepts.filter(sc => sc.checked).length || w.subConcepts.length;
                const targetDate = w.selectedTimeframe ? new Date(Date.now() + timeframeToDays(w.selectedTimeframe) * 24 * 60 * 60 * 1000) : new Date();

                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Sparkles className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Your Learning Plan</h2>
                            <p className="text-xl text-muted-foreground font-light">AI will generate your personalized schedule and quiz questions.</p>
                        </div>
                        <div className="w-full max-w-md space-y-4">
                            {[
                                { label: 'Topic', value: w.topicName },
                                { label: 'Level', value: w.level ? w.level.charAt(0).toUpperCase() + w.level.slice(1) : '' },
                                { label: 'Concepts', value: `${selectedCount} selected` },
                                { label: 'Timeframe', value: w.selectedTimeframe || '' },
                                { label: 'Daily Commitment', value: `${w.dailyCommitment} minutes` },
                                { label: 'Target Date', value: targetDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
                            ].map((item, idx) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="flex items-center justify-between p-4 rounded-md border-l-4"
                                    style={{ borderLeftColor: 'var(--accent)', background: 'var(--bg-raised)' }}
                                >
                                    <span className="text-sm text-muted-foreground font-medium">{item.label}</span>
                                    <span className="font-semibold">{item.value}</span>
                                </motion.div>
                            ))}
                        </div>
                        <button
                            className="w-full max-w-xs h-14 text-lg rounded-full font-semibold flex items-center justify-center gap-2"
                            style={{ background: 'var(--accent)', color: '#fff' }}
                            onClick={w.submitTopic}
                        >
                            Generate & Save <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                );
            }

            case 'generating':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <div className="animate-spin" style={{ animationDuration: '3s' }}>
                                    <MemoraMark size={48} />
                                </div>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Building Your Learning System</h2>
                            <p className="text-lg text-muted-foreground font-light">{w.generationStatus}</p>
                        </div>
                        <div className="w-full max-w-md space-y-3">
                            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                                <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: 'var(--accent)' }}
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${w.generationProgress}%` }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground">{w.generationProgress}% complete</p>
                        </div>
                    </div>
                );

            case 'exit':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
                                style={{ background: 'color-mix(in srgb, var(--success) 15%, transparent)' }}
                            >
                                <CheckCircle2 className="w-10 h-10" style={{ color: 'var(--success)' }} />
                            </motion.div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">You're all set!</h2>
                            <p className="text-xl text-muted-foreground font-light">Your AI-powered study plan is ready. Start your first quiz now!</p>
                        </div>
                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button
                                className="w-full h-14 text-lg rounded-full font-semibold flex items-center justify-center gap-2"
                                style={{ background: 'var(--accent)', color: '#fff' }}
                                onClick={w.handleStartQuiz}
                            >
                                Start Quiz <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                className="w-full h-14 text-lg rounded-full font-semibold border-2 border-border hover:bg-bg-raised transition-colors"
                                onClick={w.handleGoHome}
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-base)' }}>
            {/* Exit button */}
            <div className="absolute top-6 right-6 z-50">
                <button
                    className="h-10 w-10 rounded-full flex items-center justify-center border backdrop-blur-sm text-muted-foreground hover:text-foreground transition-colors"
                    style={{ background: 'var(--bg-surface)' }}
                    onClick={w.handleGoHome}
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Step progress dots */}
            {!['generating', 'exit'].includes(w.currentStep) && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-2">
                    {['capture', 'level', 'timeframe', 'commitment', 'source', 'confirmation'].map((step) => (
                        <div
                            key={step}
                            className="w-2 h-2 rounded-full transition-all"
                            style={{
                                background: step === w.currentStep ? 'var(--accent)' : 'var(--border)',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Animated step content */}
            <div className="w-full px-6">
                <AnimatePresence custom={w.direction} mode="wait">
                    <motion.div
                        key={w.currentStep}
                        custom={w.direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: 'tween', duration: 0.25 }}
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Duplicate dialog */}
            {w.showDuplicateDialog && w.duplicateTopic && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="rounded-md p-6 max-w-md w-full space-y-4" style={{ background: 'var(--bg-surface)' }}>
                        <h3 className="text-lg font-bold">Topic Already Exists</h3>
                        <p className="text-sm text-muted-foreground">
                            "{w.duplicateTopic.name}" already exists with {w.duplicateTopic.concepts.length} concepts.
                        </p>
                        <div className="flex flex-col gap-2">
                            <button
                                className="w-full py-2.5 rounded-md font-medium"
                                style={{ background: 'var(--accent)', color: '#fff' }}
                                onClick={w.handleContinueExisting}
                            >
                                Continue with existing
                            </button>
                            <button
                                className="w-full py-2.5 rounded-md font-medium border border-border hover:bg-bg-raised transition-colors"
                                onClick={w.handleStartFresh}
                            >
                                Delete & start fresh
                            </button>
                            <button
                                className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => w.setShowDuplicateDialog(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
