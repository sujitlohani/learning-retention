'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Brain, Clock } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [topicName, setTopicName] = useState('');
  const [dueTopics, setDueTopics] = useState<Topic[]>([]);

  useEffect(() => {
    // Load topics and filter for those due for review or just general recent ones for MVP
    const allTopics = storage.getTopics();
    const now = new Date();
    // Simple filter: topics where nextReviewDate < now, or just show all for MVP visibility
    const due = allTopics.filter(t => new Date(t.nextReviewDate) <= now);
    // If no due topics, maybe show recent ones to populate the UI?
    // Let's rely on the explicit "Due" logic but fall back to showing everything if strictly needed.
    // Master prompt says: "Cockpit shows all... Home is action".
    // But spaced repetition flow says: "Cockpit shows due... click... navigates to Home".
    // AND "Home... Student enters topic... OR Spaced Repetition Flow... Navigates to Home with pre-loaded topic".

    // Actually, let's show "Up Next" on Home too, for easy access.
    setDueTopics(due.length > 0 ? due : allTopics.slice(0, 3));
  }, []);

  const handleStartLearning = () => {
    if (!topicName.trim()) return;
    // Create new topic and redirect to quiz/learning flow
    const newTopic = storage.createTopic(topicName);
    router.push(`/learn/${newTopic.id}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Brain className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold font-sans tracking-tight text-foreground">
            What do you want to <span className="text-primary">retain</span> today?
          </h1>
          <p className="text-muted-foreground text-lg">
            Stop forgetting. Start retrieving. The active recall engine for your brain.
          </p>
        </div>

        {/* Input Section */}
        <Card className="border-2 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Photosynthesis, React Hooks, World War II..."
                className="text-lg h-12"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStartLearning()}
              />
              <Button size="lg" className="h-12 px-6" onClick={handleStartLearning}>
                Start <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Due for Review Section */}
        {dueTopics.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium uppercase tracking-wider">Due for Review</span>
            </div>

            <div className="grid gap-3">
              {dueTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className="hover:bg-accent/50 transition-colors cursor-pointer group border-l-4 border-l-primary"
                  onClick={() => router.push(`/learn/${topic.id}`)}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">{topic.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.concepts.length} concepts • Score: {topic.memoryScore}%
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                      <BookOpen className="w-5 h-5 text-muted-foreground" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
