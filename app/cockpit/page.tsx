'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, Clock, AlertCircle } from 'lucide-react';
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
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Strong</Badge>;
        if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none">Average</Badge>;
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Weak</Badge>;
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-sans flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-primary" /> Cockpit
                    </h1>
                    <p className="text-muted-foreground">Your learning retention status at a glance.</p>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalTopics}</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Active Topics</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className={`text-2xl font-bold ${getScoreColor(stats.averageMemory)}`}>
                            {stats.averageMemory}%
                        </div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Avg. Memory</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-primary">{stats.dueCount}</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Due to Review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{stats.totalAttempts}</div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Quiz Sessions</p>
                    </CardContent>
                </Card>
            </div>

            <Separator />

            {/* Main Content Area */}
            <div className="grid md:grid-cols-2 gap-8">

                {/* Left Column: Alerts & Due */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5" /> Priority Review
                    </h2>

                    {stats.dueCount === 0 ? (
                        <Card className="bg-muted/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-2">
                                <Brain className="w-12 h-12 text-muted-foreground/30" />
                                <p className="text-muted-foreground font-medium">All caught up!</p>
                                <p className="text-sm text-muted-foreground">Great job retaining your knowledge.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {topics
                                .filter(t => new Date(t.nextReviewDate) <= new Date())
                                .map(topic => (
                                    <Card key={topic.id} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="space-y-1">
                                                <div className="font-semibold text-lg">{topic.name}</div>
                                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                    <AlertCircle className="w-3 h-3 text-red-500" />
                                                    Review Due
                                                </div>
                                            </div>
                                            <Button size="sm" onClick={() => router.push(`/learn/${topic.id}`)}>
                                                Review Now
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                        </div>
                    )}
                </div>

                {/* Right Column: All Topics List */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Brain className="w-5 h-5" /> Knowledge Base
                    </h2>
                    <div className="space-y-3">
                        {topics.length === 0 ? (
                            <div className="text-center p-8 text-muted-foreground text-sm">
                                No topics learned yet. Start a session on the Home page.
                            </div>
                        ) : (
                            topics
                                .sort((a, b) => b.lastPracticed.getTime() - a.lastPracticed.getTime())
                                .map(topic => (
                                    <div key={topic.id} className="group flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${topic.memoryScore >= 80 ? 'bg-green-500' : topic.memoryScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                            <div>
                                                <div className="font-medium">{topic.name}</div>
                                                <div className="text-xs text-muted-foreground">Last practiced: {new Date(topic.lastPracticed).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {getScoreBadge(topic.memoryScore)}
                                            <Button variant="ghost" size="sm" onClick={() => router.push(`/learn/${topic.id}`)}>
                                                Practice
                                            </Button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
