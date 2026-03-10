'use client';

import React from 'react';
import { Compass } from 'lucide-react';
import { RecommendedConcepts } from './RecommendedConcepts';
import { GuidedPaths } from './GuidedPaths';
import { TrendingConcepts } from './TrendingConcepts';
import { ExploreByTopic } from './ExploreByTopic';

export function DeepDivePage() {
    return (
        <div className="flex h-screen overflow-y-auto w-full bg-background font-display pl-0 md:pl-20">
            <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
                <header className="mb-12">
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <Compass className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-widest">Discovery Engine</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Deep Dive</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Discover new concepts and expand your knowledge with our adaptive exploration engine.
                    </p>
                </header>

                <RecommendedConcepts />
                <GuidedPaths />
                <TrendingConcepts />
                <ExploreByTopic />
            </main>
        </div>
    );
}
