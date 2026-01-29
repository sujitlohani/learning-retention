'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Library, Search, ChevronRight, BarChart3, Clock, Trash2, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ContentDumpPage() {
    const router = useRouter();
    const [topics, setTopics] = useState<Topic[]>([]);
    const [search, setSearch] = useState('');
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

    useEffect(() => {
        setTopics(storage.getTopics());
    }, []);

    const filteredTopics = topics.filter(t =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        storage.deleteTopic(id);
        const updated = storage.getTopics();
        setTopics(updated);
        setSelectedTopic(null);
    };

    return (
        <div className="min-h-screen bg-background dot-grid">
            <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="animate-fade-in">
                    <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
                        <Library className="w-6 h-6 text-primary" />
                        Content Dump
                    </h1>
                    <p className="text-muted-foreground mt-1">Your complete learning history</p>
                </div>

                <div className="grid lg:grid-cols-12 gap-6 animate-slide-up delay-100">
                    {/* Left Panel: Topic List */}
                    <Card className="lg:col-span-4 border">
                        <div className="p-4 border-b">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Filter topics..."
                                    className="pl-9 h-10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="p-2 space-y-1">
                                {filteredTopics.map((topic) => (
                                    <button
                                        key={topic.id}
                                        onClick={() => setSelectedTopic(topic)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between group text-sm ${selectedTopic?.id === topic.id
                                                ? 'bg-primary text-primary-foreground'
                                                : 'hover:bg-accent'
                                            }`}
                                    >
                                        <span className="truncate">{topic.name}</span>
                                        <ChevronRight className={`w-4 h-4 transition-opacity ${selectedTopic?.id === topic.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                                            }`} />
                                    </button>
                                ))}
                                {filteredTopics.length === 0 && (
                                    <div className="p-8 text-center text-muted-foreground text-sm">
                                        No topics found.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </Card>

                    {/* Right Panel: Detail View */}
                    <div className="lg:col-span-8">
                        {selectedTopic ? (
                            <div className="space-y-4">
                                <Card className="border">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h2 className="text-2xl font-bold mb-2">{selectedTopic.name}</h2>
                                                <div className="flex gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(selectedTopic.lastPracticed).toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <BarChart3 className="w-4 h-4" />
                                                        {selectedTopic.totalAttempts} attempts
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-primary">{selectedTopic.memoryScore}%</div>
                                                <div className="text-xs text-muted-foreground">Retention</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button onClick={() => router.push(`/learn/${selectedTopic.id}`)}>
                                                <BookOpen className="w-4 h-4 mr-2" />
                                                Take Quiz
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="outline" size="icon">
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will delete "{selectedTopic.name}" and all quiz history. This cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => handleDelete(selectedTopic.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Concepts List */}
                                <Card className="border">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-base">Concepts ({selectedTopic.concepts.length})</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {selectedTopic.concepts.map((concept) => (
                                            <div key={concept.id} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                                                <span className="text-sm">{concept.text}</span>
                                                <Badge variant="outline" className={
                                                    concept.status === 'strong' ? 'text-green-600 border-green-300' :
                                                        concept.status === 'weak' ? 'text-red-600 border-red-300' : ''
                                                }>
                                                    {concept.status}
                                                </Badge>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        ) : (
                            <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                                <Library className="w-12 h-12 mb-4 opacity-30" />
                                <p className="font-medium">Select a topic to view details</p>
                                <p className="text-sm">Browse your learning history here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
