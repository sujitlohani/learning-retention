'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Flame, Loader2, Dices } from 'lucide-react';

import { topicsService } from '@/src/features/topics/services/topics.service';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { Topic } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { getTopicCodingQuestions } from '@/src/lib/coding-question-bank';

import { TopicOverview } from './TopicOverview';
import { TopicUnits } from './TopicUnits';
import { TopicHistory } from './TopicHistory';
import { QuizButton } from './QuizButton';
import { codeChallengeStore } from '@/src/features/quiz/store/code-challenge-store';
import { questionsService } from '@/src/features/quiz/services/questions.service';

interface TopicPageProps {
    topicId: string;
}

export function TopicPage({ topicId }: TopicPageProps) {
    const router = useRouter();
    const { startQuiz } = useQuizSession();

    type TabType = 'overview' | 'units' | 'history';
    type FilterType = 'all' | 'strong' | 'weak' | 'unattempted';

    const [topic, setTopic] = useState<Topic | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [initialUnitFilter, setInitialUnitFilter] = useState<FilterType | null>(null);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const detectLanguage = (t: Topic): 'javascript' | 'python' => {
        const text = [t.name, ...t.units.map(u => u.text)].join(' ').toLowerCase();
        if (text.match(/python|django|flask|pandas|data science/)) return 'python';
        if (text.match(/javascript|typescript|react|node|web|frontend/)) return 'javascript';
        return 'python'; // default
    };

    const handleStartCodingChallenge = async () => {
        if (!topic) return;
        setIsGeneratingCode(true);
        const language = detectLanguage(topic);
        
        // Fast-path: Pre-built standard coding questions
        const unitNames = topic.units.map(u => u.text);
        const bankQuestions = getTopicCodingQuestions(topic.id, unitNames, language);
        if (bankQuestions.length >= 2) {
            codeChallengeStore.setQuestions(bankQuestions);
            router.push(`/topics/${topic.id}/code-challenge`);
            return;
        }

        try {
            const res = await fetch('/api/ai/generate-quiz', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic: topic.name,
                    topicId: topic.id,
                    type: 'coding',
                    language,
                    units: topic.units,
                    count: 5
                })
            });
            const data = await res.json();
            if (data.success && data.questions && data.questions.length > 0) {
                codeChallengeStore.setQuestions(data.questions);
                router.push(`/topics/${topic.id}/code-challenge`);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingCode(false);
        }
    };

    useEffect(() => {
        const t = topicsService.getTopicById(topicId);
        if (!t) {
            router.push('/knowledge-base');
            return;
        }
        setTopic(t);
        setIsLoading(false);
    }, [topicId, router]);

    const handleRegenerateQuestions = async () => {
        if (!topic) return;
        setIsRegenerating(true);
        try {
            const quizPromises = topic.units.map(u =>
                fetch('/api/ai/generate-quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        topic: topic.name,
                        unit: u.text,
                        unitId: u.id,
                        topicId: topic.id,
                        level: topic.level,
                        count: 5,
                    }),
                }).then(r => r.json()).catch(() => null)
            );
            const results = await Promise.all(quizPromises);
            const allNewQuestions = results
                .filter(r => r?.success && r.questions?.length > 0)
                .flatMap(r => r.questions);
            if (allNewQuestions.length > 0) {
                questionsService.replaceQuestionsForTopic(topic.id, allNewQuestions);
            }
        } catch (e) {
            console.error('Regeneration failed:', e);
        } finally {
            setIsRegenerating(false);
        }
    };

    if (isLoading || !topic) {
        return (
            <div className="min-h-screen flex items-center justify-center font-display" style={{ background: 'var(--bg-base)' }}>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--accent)' }} />
            </div>
        );
    }

    const { memoryScore, name } = topic;

    // Determine mastery colors based on brand.md
    let masteryColor = 'var(--danger)';
    if (memoryScore >= 75) masteryColor = 'var(--success)';
    else if (memoryScore >= 50) masteryColor = 'var(--warning)';

    // Donut chart math
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = Math.max(0, circumference - (memoryScore / 100) * circumference);

    // Streak logic (basic implementation, just reading lastPracticed for UI nudges)
    // Detailed streak logic can be elaborated if needed, here just basic UI strings.
    const lastPracticedStr = topic.lastPracticed ? new Date(topic.lastPracticed).toLocaleDateString() : 'Never';

    return (
        <div className="min-h-screen font-display pb-20" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            
            {/* Header */}
            <header className="w-full border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                <div className="max-w-screen-xl mx-auto px-6 py-6 space-y-6">
                    
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                        <Link href="/knowledge-base" className="hover:text-primary transition-colors">
                            Knowledge Base
                        </Link>
                        <span>/</span>
                        <span style={{ color: 'var(--text-primary)' }}>{name}</span>
                    </nav>

                    {/* Main Header Row */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{name}</h1>
                                <LevelPill level={topic.level} />
                            </div>
                            
                            {/* Nudge Row */}
                            <div className="flex items-center gap-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>Last Practiced: {lastPracticedStr}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span>Current Streak: {topic.totalAttempts > 0 ? '1' : '0'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Right side Actions & Mastery */}
                        <div className="flex flex-col items-end gap-4 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="flex justify-end items-center mb-1">
                                        <svg width="88" height="88" viewBox="0 0 88 88" className="-mr-1">
                                            <circle 
                                                cx="44" cy="44" r={radius} 
                                                fill="none" 
                                                stroke="color-mix(in srgb, var(--text-muted) 20%, transparent)" 
                                                strokeWidth="8" 
                                            />
                                            <motion.circle 
                                                cx="44" cy="44" r={radius} 
                                                fill="none" 
                                                stroke={masteryColor} 
                                                strokeWidth="8" 
                                                strokeDasharray={circumference} 
                                                strokeLinecap="round" 
                                                transform="rotate(-90 44 44)"
                                                initial={{ strokeDashoffset: circumference }}
                                                animate={{ strokeDashoffset }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            />
                                            <text x="44" y="44" textAnchor="middle" dominantBaseline="central" className="text-2xl font-black" fill={masteryColor}>
                                                {memoryScore}%
                                            </text>
                                        </svg>
                                    </div>
                                    <div className="text-xs uppercase tracking-wider font-bold" style={{ color: 'var(--text-muted)' }}>
                                        Topic Mastery
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 relative">
                                <QuizButton 
                                    onStart={() => startQuiz({ type: 'topic-challenge', topicId })} 
                                    onRegenerate={handleRegenerateQuestions}
                                    isRegenerating={isRegenerating}
                                    label="Start Topic Challenge" 
                                    className="pb-0 mt-0"
                                />
                                <button
                                    onClick={handleStartCodingChallenge}
                                    disabled={isGeneratingCode}
                                    className="px-4 py-2 border rounded-md font-bold text-sm transition-colors flex items-center gap-2 disabled:opacity-50"
                                    style={{ 
                                        borderColor: 'var(--accent)', 
                                        color: isGeneratingCode ? 'var(--text-muted)' : 'var(--accent)',
                                        background: isGeneratingCode ? 'var(--bg-raised)' : 'transparent',
                                        height: '36px'
                                    }}
                                >
                                    {isGeneratingCode ? (
                                        <><Loader2 className="w-4 h-4 animate-spin"/> Generating...</>
                                    ) : (
                                        <><span style={{ fontFamily: 'monospace' }}>&lt;/&gt;</span> Code Challenge</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        {(['overview', 'units', 'history'] as TabType[]).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "pb-3 text-sm font-bold border-b-2 transition-colors capitalize",
                                    activeTab === tab ? "border-[var(--accent)]" : "border-transparent hover:text-[var(--text-primary)]"
                                )}
                                style={{
                                    color: activeTab === tab ? 'var(--text-primary)' : 'var(--text-muted)',
                                    borderColor: activeTab === tab ? 'var(--accent)' : 'transparent'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-screen-xl mx-auto p-6">
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TopicOverview 
                                topic={topic} 
                                onNavigateToUnits={(filter) => {
                                    setInitialUnitFilter(filter);
                                    setActiveTab('units');
                                }} 
                            />
                        </motion.div>
                    ) : activeTab === 'units' ? (
                        <motion.div
                            key="units"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TopicUnits 
                                topic={topic} 
                                initialFilter={initialUnitFilter}
                                onFilterConsumed={() => setInitialUnitFilter(null)}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TopicHistory topicId={topic.id} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

        </div>
    );
}

function LevelPill({ level }: { level: 'beginner' | 'intermediate' | 'expert' }) {
    const config: Record<string, { bg: string; text: string }> = {
        beginner: { bg: 'color-mix(in srgb, var(--success) 12%, transparent)', text: 'var(--success)' },
        intermediate: { bg: 'color-mix(in srgb, var(--warning) 12%, transparent)', text: 'var(--warning)' },
        expert: { bg: 'color-mix(in srgb, var(--danger) 12%, transparent)', text: 'var(--danger)' },
    };
    const c = config[level] || config.beginner;
    return (
        <span className="rounded-full text-xs px-2 py-0.5 font-bold capitalize inline-block" style={{ background: c.bg, color: c.text }}>
            {level}
        </span>
    );
}
