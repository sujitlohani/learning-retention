'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Topic } from '@/src/types';
import { topicsService } from '@/src/features/topics/services/topics.service';
import { TopicHeader } from './TopicHeader';
import { TopicOverview } from './TopicOverview';
import { ConceptProgressGrid } from './ConceptProgressGrid';
import { RecentActivity } from './RecentActivity';
import { SuggestedConcepts } from './SuggestedConcepts';
import { RelatedTopics } from './RelatedTopics';
import { ProTipCard } from './ProTipCard';

interface TopicPageProps {
    topicId: string;
}

export function TopicPage({ topicId }: TopicPageProps) {
    const [topic, setTopic] = useState<Topic | null>(null);
    const [allTopics, setAllTopics] = useState<Topic[]>([]);

    useEffect(() => {
        const topics = topicsService.getTopics();
        setAllTopics(topics);
        const found = topics.find(t => t.id === topicId);
        if (found) setTopic(found);
    }, [topicId]);

    if (!topic) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <h2 className="text-xl font-bold">Topic not found</h2>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>The topic you&apos;re looking for doesn&apos;t exist.</p>
                    <Link
                        href="/cockpit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white"
                        style={{ background: 'var(--accent)', borderRadius: '9999px' }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Cockpit
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 lg:py-12">
                {/* Back Link */}
                <Link
                    href="/cockpit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold mb-8 transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Cockpit
                </Link>

                {/* Header */}
                <TopicHeader topic={topic} />

                {/* Two‑column layout */}
                <div className="flex flex-col lg:flex-row gap-10 mt-10">
                    {/* Left Column (wider) */}
                    <div className="flex-1 min-w-0 space-y-10">
                        <TopicOverview topic={topic} />
                        <ConceptProgressGrid concepts={topic.concepts} topicId={topic.id} />
                        <RecentActivity topicId={topic.id} concepts={topic.concepts} />
                    </div>

                    {/* Right Column (narrower) */}
                    <div className="w-full lg:w-[320px] shrink-0 space-y-8">
                        <SuggestedConcepts concepts={topic.concepts} />
                        <RelatedTopics currentTopicId={topic.id} allTopics={allTopics} />
                        <ProTipCard topicId={topic.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}
