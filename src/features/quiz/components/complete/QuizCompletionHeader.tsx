import React from 'react';

export function QuizCompletionHeader() {
    return (
        <div className="text-center space-y-2 relative">
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle,var(--primary)_0%,transparent_70%)]" style={{ opacity: 0.1 }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">Quiz Completed! 🎉</h1>
            <p className="text-muted-foreground text-lg">Great job! You're making steady progress.</p>
        </div>
    );
}
