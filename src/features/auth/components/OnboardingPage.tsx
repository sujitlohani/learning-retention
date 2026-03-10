'use client';

import { motion } from 'framer-motion';
import { Brain, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authService } from '@/src/features/auth/services/auth.service';

export function OnboardingPage() {
    const router = useRouter();

    const completeOnboarding = () => {
        authService.completeOnboarding();
        router.push('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
            <motion.div
                className="max-w-md w-full text-center space-y-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="space-y-6">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="mx-auto w-20 h-20 rounded-md flex items-center justify-center"
                        style={{ background: 'var(--accent-light)' }}
                    >
                        <Sparkles className="w-10 h-10" style={{ color: 'var(--accent)' }} />
                    </motion.div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to Memora</h1>
                    <p className="text-muted-foreground text-lg font-light leading-relaxed">
                        Memora uses AI-powered spaced repetition to help you retain what you learn — forever.
                    </p>
                </div>

                <div className="space-y-4 text-left">
                    {[
                        { icon: '📝', title: 'Add a topic', desc: 'Tell us what you just learned' },
                        { icon: '🤖', title: 'AI generates your plan', desc: 'Units, schedule, and quiz questions' },
                        { icon: '🧠', title: 'Practice daily', desc: 'Short quizzes that adapt to your memory' },
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 + i * 0.15 }}
                            className="flex items-start gap-4 p-4 rounded-md"
                            style={{ background: 'var(--bg-surface)' }}
                        >
                            <span className="text-2xl">{item.icon}</span>
                            <div>
                                <div className="font-semibold">{item.title}</div>
                                <div className="text-sm text-muted-foreground">{item.desc}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <button
                    onClick={completeOnboarding}
                    className="w-full h-14 rounded-full font-semibold text-lg flex items-center justify-center gap-2"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                >
                    Let's Go <ArrowRight className="w-5 h-5" />
                </button>
            </motion.div>
        </div>
    );
}
