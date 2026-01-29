'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, AlertCircle, Target, BookOpen, ArrowRight } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function CockpitPage() {
    const router = useRouter();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [stats, setStats] = useState({
        totalTopics: 0,
        averageMemory: 0,
        dueCount: 0,
        totalAttempts: 0
    });

    useEffect(() => {
        const allTopics = storage.getTopics();
        const now = new Date();

        const due = allTopics.filter(t => new Date(t.nextReviewDate) <= now);
        const totalMemory = allTopics.reduce((acc, t) => acc + t.memoryScore, 0);
        const totalAttempts = allTopics.reduce((acc, t) => acc + t.totalAttempts, 0);

        setTopics(allTopics);
        setStats({
            totalTopics: allTopics.length,
            averageMemory: allTopics.length > 0 ? Math.round(totalMemory / allTopics.length) : 0,
            dueCount: due.length,
            totalAttempts
        });
    }, []);

    const getScoreColor = (score: number) => {
        if (score >= 80) return "text-green-600 dark:text-green-400";
        if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return <Badge variant="outline" className="text-green-600 border-green-300">Strong</Badge>;
        if (score >= 60) return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Average</Badge>;
        return <Badge variant="outline" className="text-red-600 border-red-300">Weak</Badge>;
    };

    return (
        <div className="min-h-screen bg-background dot-grid">
            <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="animate-fade-in">
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-primary" />
                        Cockpit
                    </h1>
                    <p className="text-muted-foreground mt-1">Your learning progress at a glance</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up delay-100">
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalTopics}</p>
                                    <p className="text-xs text-muted-foreground">Topics</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Brain className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${getScoreColor(stats.averageMemory)}`}>
                                        {stats.averageMemory}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Avg. Memory</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${stats.dueCount > 0 ? 'bg-destructive/10' : 'bg-primary/10'}`}>
                                    <Clock className={`w-4 h-4 ${stats.dueCount > 0 ? 'text-destructive' : 'text-primary'}`} />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${stats.dueCount > 0 ? 'text-destructive' : ''}`}>
                                        {stats.dueCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Due</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Target className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                                    <p className="text-xs text-muted-foreground">Sessions</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="grid lg:grid-cols-2 gap-6 animate-slide-up delay-200">
                    {/* Priority Review */}
                    <Card className="border">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-4 h-4 text-destructive" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Priority Review</span>
                            </div>

                            {stats.dueCount === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Brain className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="font-medium">All caught up!</p>
                                    <p className="text-sm">Great job retaining your knowledge.</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {topics
                                        .filter(t => new Date(t.nextReviewDate) <= new Date())
                                        .slice(0, 5)
                                        .map(topic => (
                                            <div
                                                key={topic.id}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group"
                                            >
                                                <div>
                                                    <p className="font-medium">{topic.name}</p>
                                                    <p className="text-xs text-destructive">Review overdue</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => router.push(`/learn/${topic.id}`)}
                                                >
                                                    Review
                                                    <ArrowRight className="ml-1 w-3 h-3" />
                                                </Button>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Knowledge Base */}
                    <Card className="border">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-2 mb-4">
                                <Brain className="w-4 h-4 text-primary" />
                                <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Knowledge Base</span>
                            </div>

                            {topics.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">
                                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">No topics yet. Start learning!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {topics
                                        .sort((a, b) => new Date(b.lastPracticed).getTime() - new Date(a.lastPracticed).getTime())
                                        .slice(0, 5)
                                        .map(topic => (
                                            <div
                                                key={topic.id}
                                                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group cursor-pointer"
                                                onClick={() => router.push(`/learn/${topic.id}`)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${topic.memoryScore >= 80 ? 'bg-green-500' :
                                                            topic.memoryScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`} />
                                                    <div>
                                                        <p className="font-medium">{topic.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(topic.lastPracticed).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                {getScoreBadge(topic.memoryScore)}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
