'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Library, Search, ChevronRight, BarChart3, Clock, Trash2 } from 'lucide-react';
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
        <div className="container mx-auto p-4 md:p-8 max-w-6xl h-[calc(100vh-4rem)] flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-sans flex items-center gap-2">
                        <Library className="w-8 h-8 text-primary" /> Content Dump
                    </h1>
                    <p className="text-muted-foreground">Deep dive into your learning history.</p>
                </div>
            </div>

            <div className="grid md:grid-cols-12 gap-6 flex-1 min-h-0">
                {/* Left Panel: Topic List */}
                <Card className="md:col-span-4 flex flex-col h-full border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
                    <div className="p-4 border-b space-y-4">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Filter topics..."
                                className="pl-8"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {filteredTopics.map((topic) => (
                                <button
                                    key={topic.id}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`w-full text-left px-4 py-3 rounded-md transition-colors flex items-center justify-between group ${selectedTopic?.id === topic.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'hover:bg-muted'
                                        }`}
                                >
                                    <span className="truncate">{topic.name}</span>
                                    <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-50 transition-opacity ${selectedTopic?.id === topic.id ? 'opacity-100 text-primary' : ''}`} />
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
                <div className="md:col-span-8 h-full overflow-y-auto">
                    {selectedTopic ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold mb-2">{selectedTopic.name}</h2>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Learned {new Date(selectedTopic.lastPracticed).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><BarChart3 className="w-4 h-4" /> Attempts: {selectedTopic.totalAttempts}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-4xl font-bold text-primary">{selectedTopic.memoryScore}%</div>
                                        <div className="text-xs text-muted-foreground uppercase">Retention</div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Button onClick={() => router.push(`/learn/${selectedTopic.id}`)}>
                                        Take Quiz Again
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will delete "{selectedTopic.name}" and all associated quiz history. This action cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(selectedTopic.id)}>
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>

                            <Tabs defaultValue="concepts" className="w-full">
                                <TabsList className="w-full justify-start h-auto p-1 bg-transparent border-b rounded-none mb-4">
                                    <TabsTrigger value="concepts" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
                                        Concepts ({selectedTopic.concepts.length})
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="concepts" className="space-y-4">
                                    {selectedTopic.concepts.map((concept) => (
                                        <div key={concept.id} className="p-4 border rounded-lg bg-card flex items-center justify-between">
                                            <div className="font-medium">{concept.text}</div>
                                            {concept.status === 'strong' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none">Strong</Badge>}
                                            {concept.status === 'weak' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Weak</Badge>}
                                            {concept.status === 'neutral' && <Badge variant="outline">Neutral</Badge>}
                                        </div>
                                    ))}
                                </TabsContent>
                            </Tabs>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 border-2 border-dashed rounded-xl bg-muted/30">
                            <Library className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a topic to view details</p>
                            <p className="text-sm">Browse your entire learning history here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
