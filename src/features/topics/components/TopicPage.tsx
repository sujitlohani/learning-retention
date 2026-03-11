'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Clock, Flame, Loader2 } from 'lucide-react';

import { topicsService } from '@/src/features/topics/services/topics.service';
import { useQuizSession } from '@/src/features/quiz/hooks/useQuizSession';
import { Topic } from '@/src/types';
import { cn } from '@/src/lib/utils';

import { TopicOverview } from './TopicOverview';
import { TopicUnits } from './TopicUnits';
import { QuizButton } from './QuizButton';

interface TopicPageProps {
    topicId: string;
}

export function TopicPage({ topicId }: TopicPageProps) {
    const router = useRouter();
    const { startQuiz } = useQuizSession();

    const [topic, setTopic] = useState<Topic | null>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'units'>('overview');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const t = topicsService.getTopicById(topicId);
        if (!t) {
            router.push('/knowledge-base');
            return;
        }
        setTopic(t);
        setIsLoading(false);
    }, [topicId, router]);

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
                                    <div className="text-3xl font-black leading-none" style={{ color: masteryColor }}>
                                        {memoryScore}%
                                    </div>
                                    <div className="text-xs uppercase tracking-wider font-bold mt-1" style={{ color: 'var(--text-muted)' }}>
                                        Topic Mastery
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <QuizButton 
                                    onStart={() => startQuiz({ type: 'topic-challenge', topicId })} 
                                    label="Start Topic Challenge" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-6 border-b" style={{ borderColor: 'var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={cn(
                                "pb-3 text-sm font-bold border-b-2 transition-colors",
                                activeTab === 'overview' ? "border-accent text-primary" : "border-transparent text-muted hover:text-primary"
                            )}
                            style={{
                                color: activeTab === 'overview' ? 'var(--text-primary)' : 'var(--text-muted)',
                                borderColor: activeTab === 'overview' ? 'var(--accent)' : 'transparent'
                            }}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('units')}
                            className={cn(
                                "pb-3 text-sm font-bold border-b-2 transition-colors",
                                activeTab === 'units' ? "border-accent text-primary" : "border-transparent text-muted hover:text-primary"
                            )}
                            style={{
                                color: activeTab === 'units' ? 'var(--text-primary)' : 'var(--text-muted)',
                                borderColor: activeTab === 'units' ? 'var(--accent)' : 'transparent'
                            }}
                        >
                            Units
                        </button>
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
                            <TopicOverview topic={topic} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="units"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TopicUnits topic={topic} />
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
