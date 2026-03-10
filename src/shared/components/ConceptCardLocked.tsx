'use client';

import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent } from '@/src/components/ui/card';
import { Lock } from 'lucide-react';
import { Progress } from '@/src/components/ui/progress';
import { useMastery } from '@/src/features/scoring/hooks/useMastery';

interface ConceptCardLockedProps {
    id: string;
    topicLabel: string;
    difficultyLabel: string;
    estimatedTime?: string;
    conceptName: string;
    description: string;
    icon?: React.ReactNode;
}

export function ConceptCardLocked({
    id,
    topicLabel,
    difficultyLabel,
    estimatedTime,
    conceptName,
    description,
    icon,
}: ConceptCardLockedProps) {
    const { record } = useMastery(id);
    // Map difficulty to brand color variants
    // This is a simplified mapping, using standard tw colors that match brand intents if specific tokens aren't immediately available for badges
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'beginner': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
            case 'intermediate': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
            case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
            <div className="h-32 w-full bg-muted flex items-center justify-center relative overflow-hidden shrink-0">
                <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-primary to-transparent" />
                <div className="text-muted-foreground group-hover:scale-110 transition-transform z-10">
                    {icon || <Lock className="w-10 h-10" />}
                </div>
            </div>
            <CardContent className="p-5 flex flex-col flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary" className={getDifficultyColor(difficultyLabel) + ' rounded-sm font-bold uppercase text-[10px]'}>
                        {difficultyLabel}
                    </Badge>
                    <Badge variant="secondary" className="rounded-sm font-bold uppercase text-[10px] bg-secondary text-secondary-foreground">
                        {topicLabel}
                    </Badge>
                    {estimatedTime && (
                        <Badge variant="outline" className="rounded-sm font-medium text-[10px]">
                            {estimatedTime}
                        </Badge>
                    )}
                </div>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold line-clamp-1">{conceptName}</h3>
                    <span className="text-xs font-bold text-muted-foreground">{record.percentage}%</span>
                </div>
                <Progress value={record.percentage} className="h-1.5 mb-3" />
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                    {description}
                </p>
                <Button variant="outline" className="w-full font-bold bg-primary/5 hover:bg-primary hover:text-primary-foreground border-primary/20 transition-all" asChild>
                    <Link href={`/concepts/${id}`}>
                        Explore Concept
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}
