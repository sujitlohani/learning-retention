import React from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';

interface QuickPracticeProps {
    conceptId: string;
}

export function QuickPracticeCard({ conceptId }: QuickPracticeProps) {
    return (
        <section className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-2">Quick Practice</h3>
                <p className="text-slate-400 text-sm mb-6">Test your knowledge with a focused 5-question MCQ session.</p>

                <Button
                    asChild
                    className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold py-6 rounded-xl transition-colors"
                >
                    <Link href={`/quiz/${conceptId}`}>
                        Start Concept Quiz
                    </Link>
                </Button>
                <p className="text-[10px] text-slate-500 mt-4 text-center uppercase tracking-widest font-bold">
                    Estimated time: 3 mins
                </p>
            </div>

            {/* Abstract decoration */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/30 rounded-full blur-3xl pointer-events-none" />
        </section>
    );
}
