'use client';

import { motion } from 'framer-motion';
import { SignIn } from '@clerk/nextjs';
import { setUserId } from '@/src/lib/user-store';
import { seedDemoData } from '@/src/lib/demo-seed';
import { MemoraLogo } from '@/src/components/MemoraLogo';

export function LoginPage() {
    const handleDemoLogin = () => {
        // Activate demo mode
        localStorage.setItem('memora-demo-active', 'true');
        setUserId('demo');
        
        // Seed initial data if needed
        seedDemoData();
        
        // Full page reload so AuthProvider re-reads localStorage synchronously
        window.location.href = '/';
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-8" style={{ background: 'var(--bg-base)' }}>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex justify-center"
            >
                <MemoraLogo size={32} />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="w-full max-w-[400px] flex flex-col gap-6"
            >
                {/* Clerk Sign In component */}
                <div className="w-full flex justify-center">
                    <SignIn
                        forceRedirectUrl="/"
                        appearance={{
                            elements: {
                                rootBox: "w-full",
                                card: "w-full shadow-none border max-w-full m-0",
                            }
                        }}
                    />
                </div>

                <div className="flex items-center gap-4 w-full">
                    <div className="h-[1px] flex-1" style={{ background: 'var(--border)' }} />
                    <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>or</span>
                    <div className="h-[1px] flex-1" style={{ background: 'var(--border)' }} />
                </div>

                <button
                    onClick={handleDemoLogin}
                    className="w-full h-11 px-4 text-sm font-semibold transition-all flex items-center justify-center"
                    style={{
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        transitionDuration: 'var(--duration-fast)',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--bg-raised)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }}
                >
                    Try the demo — no account needed
                </button>
            </motion.div>
        </div>
    );
}
