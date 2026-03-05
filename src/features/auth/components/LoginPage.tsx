'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/src/features/auth/hooks/useAuth';
import { MemoraLogo } from '@/src/components/MemoraLogo';

export function LoginPage() {
    const { login } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
            <motion.div
                className="max-w-sm w-full text-center space-y-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="space-y-6">
                    <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        className="flex justify-center"
                    >
                        <MemoraLogo size={40} />
                    </motion.div>
                    <div>
                        <p className="text-muted-foreground text-lg font-light">
                            AI-powered spaced repetition for lasting knowledge.
                        </p>
                    </div>
                </div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                    <button
                        onClick={login}
                        className="w-full h-14 rounded-full font-semibold text-lg flex items-center justify-center gap-2"
                        style={{ background: 'var(--accent)', color: '#fff' }}
                    >
                        Get Started <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-xs text-muted-foreground mt-3">No account needed. Your data stays local.</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
