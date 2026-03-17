'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Lightbulb, Sparkles, Calendar, Clock, CheckCircle2, Loader2, BookOpen, FileText, Video, Users, Globe } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/src/lib/utils';
import { useTopicWizard } from '@/src/features/topics/hooks/useTopicWizard';
import { MemoraMark } from '@/src/components/MemoraLogo';

export function AddTopicPage() {
    const searchParams = useSearchParams();
    const initialName = searchParams.get('name') || '';
    const w = useTopicWizard(initialName);

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
                            <div className="space-y-2">
                                <input
                                    autoFocus
                                    value={w.topicName}
                                    onChange={(e) => w.setTopicName(e.target.value)}
                                    placeholder="e.g., Closures in JavaScript"
                                    className="w-full h-16 text-xl px-6 rounded-md border-2 border-border bg-bg-surface focus:border-accent focus:outline-none transition-colors"
                                    onKeyDown={(e) => e.key === 'Enter' && w.topicName.trim() && w.handleCaptureContinue()}
                                />
                                {w.correctedName && (
                                    <p className="text-sm font-medium px-1" style={{ color: 'var(--accent)' }}>
                                        Corrected to: {w.correctedName}
                                    </p>
                                )}
                            </div>
                            <button
                                disabled={!w.topicName.trim() || w.isCorrectingName}
                                className="w-full h-14 text-lg rounded-full font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                                style={{ background: 'var(--accent)', color: '#fff' }}
                                onClick={w.handleCaptureContinue}
                            >
                                {w.isCorrectingName ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
                                ) : (
                                    <>Continue <ArrowRight className="w-5 h-5" /></>
                                )}
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
                                {w.isLoadingPreviews ? 'AI is generating units for each level...' : 'Pick a level to see its units.'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full max-w-4xl">
                            {[
                                { id: 'beginner' as const, label: 'Beginner', desc: '"I\'m new to this topic"' },
                                { id: 'intermediate' as const, label: 'Intermediate', desc: '"I know the basics"' },
                                { id: 'expert' as const, label: 'Expert', desc: '"I\'m experienced with this topic"' },
                            ].map((lvl) => {
                                const isExpanded = w.level === lvl.id;
                                const isDisabled = w.existingLevels.includes(lvl.id);

                                return (
                                    <div key={lvl.id} className="w-full">
                                        <button
                                            onClick={() => !isDisabled && w.toggleLevelSelect(lvl.id)}
                                            disabled={w.isLoadingPreviews || isDisabled}
                                            className={cn(
                                                "w-full p-6 rounded-md border-2 transition-all text-left flex items-center justify-between",
                                                "hover:border-border",
                                                isExpanded ? "border-border" : "border-border/30",
                                                (w.isLoadingPreviews || isDisabled) && "opacity-50 cursor-not-allowed"
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
                                                    <div className="text-xl font-bold flex items-center gap-2">
                                                        {lvl.label}
                                                        {isDisabled && (
                                                            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>Already exists</span>
                                                        )}
                                                    </div>
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
                                                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Review Units</h3>
                                                                <span className="text-xs text-muted-foreground">{w.subUnits.length} units</span>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                {w.isLoadingPreviews ? (
                                                                    <div className="col-span-full flex items-center gap-2 text-sm text-muted-foreground p-4">
                                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                                        <span>Generating units...</span>
                                                                    </div>
                                                                ) : w.subUnits.length > 0 ? (
                                                                    w.subUnits.map((sc) => (
                                                                        <div
                                                                            key={sc.id}
                                                                            className="flex flex-col gap-1 p-3 rounded-md border border-border/50 text-left transition-all"
                                                                            style={{ background: 'var(--bg-surface)' }}
                                                                        >
                                                                            <span className="text-sm font-medium leading-tight text-foreground">
                                                                                {sc.name}
                                                                            </span>
                                                                            {sc.description && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {sc.description}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="col-span-full text-sm text-muted-foreground p-4">No units matched.</div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {w.subUnits.length > 0 && !w.isLoadingPreviews && (
                                                            <div className="flex gap-2 max-w-md pt-2">
                                                                <input
                                                                    value={w.newUnitInput}
                                                                    onChange={(e) => w.setNewUnitInput(e.target.value)}
                                                                    placeholder="Missing something? Add a unit..."
                                                                    className="flex-1 h-10 text-sm px-3 rounded-md border border-border bg-bg-surface focus:border-border focus:outline-none"
                                                                    onKeyDown={(e) => e.key === 'Enter' && w.addSubUnit()}
                                                                />
                                                                <button
                                                                    className="h-10 px-4 rounded-md text-sm font-medium"
                                                                    style={{ background: 'var(--bg-raised)' }}
                                                                    onClick={w.addSubUnit}
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



            case 'familiarity':
                return (
                    <div className="flex flex-col items-center text-center space-y-12 max-w-xl mx-auto">
                        <div className="space-y-6">
                            <div className="mx-auto w-16 h-16 rounded-md flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                                <Sparkles className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Which of these do you already understand?</h2>
                            <p className="text-xl text-muted-foreground font-light">Select all that apply to calibrate your starting level.</p>
                        </div>

                        <div className="w-full max-w-xl space-y-4 text-left">
                            {w.isLoadingFamiliarity ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Generating knowledge check...</p>
                                </div>
                            ) : (
                                w.familiarityStatements.map((stmt, idx) => {
                                    const isChecked = w.checkedStatements.includes(stmt);
                                    return (
                                        <div
                                            key={idx}
                                            className={cn(
                                                "flex items-start gap-4 p-4 rounded-md border transition-all cursor-pointer",
                                                isChecked ? "border-border" : "border-border/30"
                                            )}
                                            style={isChecked ? { background: 'var(--accent-light)' } : { background: 'var(--bg-surface)' }}
                                            onClick={() => w.toggleFamiliarityStatement(stmt)}
                                        >
                                            <div className="mt-0.5 flex-shrink-0">
                                                <div className={cn(
                                                    "w-6 h-6 rounded border flex items-center justify-center transition-colors",
                                                    isChecked ? "border-transparent" : "border-border"
                                                )} style={isChecked ? { background: 'var(--accent)', borderColor: 'var(--accent)' } : {}}>
                                                    {isChecked && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-base leading-snug",
                                                isChecked ? "font-medium text-foreground" : "text-muted-foreground"
                                            )}>
                                                {stmt}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <button
                            disabled={w.isLoadingFamiliarity}
                            className="w-full h-14 text-lg rounded-full font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                            style={{ background: 'var(--accent)', color: '#fff' }}
                            onClick={w.submitTopic}
                        >
                            Generate & Save <Sparkles className="w-5 h-5" />
                        </button>
                    </div>
                );



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
                    {['capture', 'level', 'familiarity'].map((step) => (
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
                            "{w.duplicateTopic.name}" already exists with {w.duplicateTopic.units.length} units.
                        </p>
                        {w.existingLevels.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                                {w.existingLevels.map(lvl => (
                                    <span key={lvl} className="text-xs font-medium px-2 py-0.5 rounded-full capitalize" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                                        {lvl}
                                    </span>
                                ))}
                                <span className="text-xs text-muted-foreground self-center ml-1">already added</span>
                            </div>
                        )}
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
