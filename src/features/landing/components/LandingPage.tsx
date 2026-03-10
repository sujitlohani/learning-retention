'use client';

import Link from 'next/link';
import { MemoraLogo } from '@/src/components/MemoraLogo';

/**
 * Landing Page — marketing entry point for unauthenticated users.
 * Based on `landing-page-spec.md` + Stitch hero_ladningpage2 design.
 * Full-width, no sidebar, dark premium feel.
 */
export function LandingPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
            {/* ──── Navbar ──── */}
            <header
                className="flex items-center justify-between whitespace-nowrap px-6 py-4 lg:px-20 sticky top-0 z-50"
                style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border)' }}
            >
                <MemoraLogo size={24} />

                <div className="flex flex-1 justify-end gap-10 items-center">
                    <nav className="hidden md:flex items-center gap-10">
                        {['Product', 'Features', 'Pricing', 'About'].map((label) => (
                            <a
                                key={label}
                                href="#"
                                className="text-sm font-medium transition-colors"
                                style={{ color: 'var(--text-muted)', transitionDuration: 'var(--duration-fast)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                                {label}
                            </a>
                        ))}
                    </nav>
                    <div className="flex gap-3">
                        <Link
                            href="/login"
                            className="hidden sm:flex min-w-[100px] cursor-pointer items-center justify-center h-10 px-5 text-sm font-bold transition-all"
                            style={{
                                background: 'var(--accent-light)',
                                color: 'var(--accent)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--accent)',
                                transitionDuration: 'var(--duration-instant)',
                            }}
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/login"
                            className="flex min-w-[120px] cursor-pointer items-center justify-center h-10 px-5 text-sm font-bold text-white transition-all"
                            style={{
                                background: 'var(--accent)',
                                borderRadius: 'var(--radius-md)',
                                transitionDuration: 'var(--duration-instant)',
                            }}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* ──── Hero Section ──── */}
            <main className="flex-1 flex flex-col justify-center items-center px-6 lg:px-20 py-16 lg:py-24 relative">
                {/* Background abstract elements */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-50">
                    {/* Mathematical formulas */}
                    <div className="absolute top-1/4 right-[10%] blur-[1px] select-none text-2xl font-mono rotate-12" style={{ color: 'var(--accent)', opacity: 0.4 }}>
                        E = mc²
                    </div>
                    <div className="absolute bottom-1/4 left-[5%] blur-[3px] select-none text-4xl font-mono -rotate-6" style={{ color: 'var(--accent)', opacity: 0.2 }}>
                        ∫(x²)dx
                    </div>
                    {/* Question marks */}
                    <div className="absolute top-1/3 right-[30%] blur-[2px] select-none text-7xl font-serif italic" style={{ color: 'var(--accent)', opacity: 0.2 }}>?</div>
                    <div className="absolute bottom-1/3 left-[40%] blur-[1px] select-none text-8xl font-serif italic" style={{ color: 'var(--accent)', opacity: 0.3 }}>?</div>
                    {/* Central glow removed per refinement brief — no glow effects */}
                </div>

                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-[1280px] w-full">
                    {/* Left column — text */}
                    <div className="flex flex-col gap-8 flex-1 text-center lg:text-left">
                        <div className="flex flex-col gap-4">
                            {/* Beta label */}
                            <div
                                className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 text-xs font-bold uppercase tracking-wider"
                                style={{
                                    background: 'var(--accent-light)',
                                    color: 'var(--accent)',
                                    borderRadius: '9999px',
                                    border: '1px solid var(--accent)',
                                }}
                            >
                                <span className="flex h-2 w-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
                                Now in beta
                            </div>

                            {/* Headline */}
                            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight">
                                Knowledge that{' '}
                                <span style={{ color: 'var(--accent)' }}>sticks.</span>
                            </h1>

                            {/* Subheading */}
                            <p className="text-lg md:text-xl font-normal leading-relaxed max-w-[600px]" style={{ color: 'var(--text-muted)' }}>
                                The cognitive-first workspace that turns information into long-term memory using AI-driven active recall and spaced repetition.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                            <Link
                                href="/login"
                                className="flex min-w-[180px] cursor-pointer items-center justify-center h-14 px-8 text-base font-bold text-white transition-all"
                                style={{
                                    background: 'var(--accent)',
                                    borderRadius: '9999px',
                                    transitionDuration: 'var(--duration-instant)',
                                }}
                            >
                                Start Learning
                            </Link>
                            <Link
                                href="#how-it-works"
                                className="flex min-w-[180px] cursor-pointer items-center justify-center h-14 px-8 text-base font-bold transition-all"
                                style={{
                                    background: 'var(--bg-raised)',
                                    color: 'var(--text-primary)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    transitionDuration: 'var(--duration-instant)',
                                }}
                            >
                                View Demo
                            </Link>
                        </div>

                        {/* Social proof */}
                        <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                                        style={{
                                            background: 'var(--bg-raised)',
                                            borderColor: 'var(--bg-base)',
                                            color: 'var(--text-muted)',
                                        }}
                                    >
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                                <div
                                    className="flex w-10 h-10 items-center justify-center rounded-full border-2 text-[10px] font-bold uppercase"
                                    style={{
                                        background: 'var(--bg-raised)',
                                        borderColor: 'var(--bg-base)',
                                        color: 'var(--text-muted)',
                                    }}
                                >
                                    +2k
                                </div>
                            </div>
                            <div className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                Trusted by <span className="font-bold" style={{ color: 'var(--text-primary)' }}>2,400+</span> lifelong learners
                            </div>
                        </div>
                    </div>

                    {/* Right column — abstract visual */}
                    <div className="flex-1 w-full max-w-[600px] aspect-square relative">
                        <div
                            className="absolute inset-0 overflow-hidden flex items-center justify-center"
                            style={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}
                        >
                            <div className="relative w-full h-full">
                                {/* Floating Card 1 — success card */}
                                <div
                                    className="absolute top-[10%] left-[10%] w-48 p-4 backdrop-blur-md z-30"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        opacity: 0.9,
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        boxShadow: 'var(--shadow-raised)',
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74, 222, 128, 0.1)', color: 'var(--success)' }}>
                                            ✓
                                        </div>
                                        <div className="h-2 w-20 rounded-full" style={{ background: 'var(--bg-raised)' }} />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-1.5 w-full rounded-full" style={{ background: 'var(--bg-raised)' }} />
                                        <div className="h-1.5 w-3/4 rounded-full" style={{ background: 'var(--bg-raised)' }} />
                                    </div>
                                </div>

                                {/* Central glow + neural icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-64 h-64 rounded-full" style={{ background: 'var(--accent)', opacity: 0.06 }} />
                                    {/* Concentric circles */}
                                    <div className="absolute inset-0 flex items-center justify-center p-12">
                                        <div className="w-full h-full rounded-full border-dashed" style={{ borderWidth: '0.5px', borderColor: 'var(--accent)', opacity: 0.3, animation: 'spin 20s linear infinite' }} />
                                        <div className="absolute w-80 h-80 rounded-full rotate-45" style={{ borderWidth: '0.5px', borderColor: 'var(--accent)', opacity: 0.2 }} />
                                        <div className="absolute w-40 h-40 rounded-full flex items-center justify-center" style={{ border: '1px solid var(--accent)', opacity: 0.4 }}>
                                            <span style={{ color: 'var(--accent)', fontSize: '2rem' }}>✦</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating Card 2 — retention score */}
                                <div
                                    className="absolute bottom-[15%] right-[10%] w-56 p-4 backdrop-blur-md z-40"
                                    style={{
                                        background: 'var(--bg-surface)',
                                        opacity: 0.9,
                                        borderRadius: 'var(--radius-md)',
                                        border: '1px solid var(--border)',
                                        boxShadow: 'var(--shadow-raised)',
                                    }}
                                >
                                    <div className="flex gap-2 items-center mb-3">
                                        <span style={{ color: 'var(--accent)' }}>📊</span>
                                        <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Topic Score</div>
                                    </div>
                                    <div className="flex items-end gap-1 h-12">
                                        {[40, 60, 100, 70, 50].map((h, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-t"
                                                style={{
                                                    height: `${h}%`,
                                                    background: h === 100 ? 'var(--accent)' : 'var(--bg-raised)',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Deep floating elements */}
                                <div className="absolute top-[15%] right-[20%] text-9xl font-serif italic blur-[8px] select-none" style={{ color: 'var(--text-primary)', opacity: 0.05 }}>?</div>
                                <div className="absolute bottom-[20%] left-[20%] text-6xl font-mono blur-[2px] select-none font-light" style={{ color: 'var(--accent)', opacity: 0.15 }}>Σn</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* ──── How It Works ──── */}
            <section id="how-it-works" className="px-6 lg:px-20 py-24" style={{ background: 'var(--bg-surface)' }}>
                <div className="max-w-[1280px] mx-auto flex flex-col gap-16">
                    <div className="flex flex-col gap-4 text-center items-center">
                        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Process</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">A proven loop for mastery</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { step: '01', icon: '📝', title: 'Log', desc: 'Capture units, thoughts, and complex data naturally. Our editor understands intent and context.' },
                            { step: '02', icon: '✨', title: 'AI Plan', desc: 'Memora analyzes your logs to generate personalized review schedules based on your personal forgetting curve.' },
                            { step: '03', icon: '🔄', title: 'Review', desc: 'Engage in active recall through dynamic quizzes and interactive sessions designed for retention.' },
                        ].map((item) => (
                            <div
                                key={item.step}
                                className="flex flex-col gap-6 p-8 transition-all"
                                style={{
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)',
                                    background: 'var(--bg-base)',
                                    boxShadow: 'var(--shadow-resting)',
                                }}
                            >
                                <div
                                    className="flex items-center justify-center w-14 h-14 text-2xl"
                                    style={{
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--accent-light)',
                                    }}
                                >
                                    {item.icon}
                                </div>
                                <div className="flex flex-col gap-3">
                                    <h3 className="text-xl font-bold">
                                        <span style={{ color: 'var(--accent)' }}>{item.step}.</span> {item.title}
                                    </h3>
                                    <p className="leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ──── Features ──── */}
            <section className="px-6 lg:px-20 py-24" style={{ background: 'var(--bg-base)' }}>
                <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row gap-16">
                    {/* Left — headline + stats */}
                    <div className="flex-1 flex flex-col gap-8">
                        <span className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Features</span>
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Engineered for cognitive depth.</h2>
                        <p className="text-base leading-relaxed max-w-lg" style={{ color: 'var(--text-muted)' }}>
                            Every feature is designed around the science of memory. No gimmicks, no gamification for its own sake — just tools that make knowledge permanent.
                        </p>
                        <div className="flex gap-12 pt-4">
                            <div>
                                <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>98%</div>
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Retention rate reported by active users</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>4x</div>
                                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Faster recall of complex topics</div>
                            </div>
                        </div>
                    </div>

                    {/* Right — 2×2 feature grid */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                            { icon: '🔁', title: 'Spaced Repetition', desc: 'Intelligent intervals that hit the sweet spot of memory consolidation.' },
                            { icon: '✨', title: 'AI Quizzes', desc: 'Dynamic testing generated from your notes to verify true understanding.' },
                            { icon: '🗺️', title: 'Unit Tracking', desc: 'Visualize the neural map of your knowledge and how topics interconnect.' },
                            { icon: '📊', title: 'Topic Score', desc: 'Quantify your mastery level for every single subject in your library.' },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="flex flex-col gap-3 p-5"
                                style={{
                                    background: 'var(--bg-surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 'var(--radius-md)',
                                    boxShadow: 'var(--shadow-resting)',
                                }}
                            >
                                <div className="text-2xl" style={{ color: 'var(--accent)' }}>{f.icon}</div>
                                <h3 className="text-[15px] font-semibold">{f.title}</h3>
                                <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ──── Footer ──── */}
            <footer
                className="flex flex-col gap-6 px-6 lg:px-20 py-12 text-center"
                style={{ background: 'var(--bg-base)', borderTop: '1px solid var(--border)' }}
            >
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-[1280px] mx-auto w-full">
                    <MemoraLogo size={20} />
                    <div className="flex flex-wrap items-center justify-center gap-8">
                        {['Privacy Policy', 'Terms of Service', 'Contact'].map((link) => (
                            <a
                                key={link}
                                href="#"
                                className="text-sm font-medium transition-colors"
                                style={{ color: 'var(--text-muted)', transitionDuration: 'var(--duration-fast)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent)')}
                                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                            >
                                {link}
                            </a>
                        ))}
                    </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>© 2024 Memora Inc. All rights reserved.</p>
            </footer>

            {/* Keyframes for spin animation */}
            <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
