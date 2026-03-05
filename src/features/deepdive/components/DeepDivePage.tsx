'use client';

import { useState } from 'react';
import { Search, Filter, CheckCircle, Circle, History, Download, ChevronUp, ChevronDown, Activity, Clock, HelpCircle, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/src/lib/utils';
import Link from 'next/link';

// Mock Data for the UI demo
const MOCK_CATEGORIES = [
    {
        name: 'UX Design',
        concepts: [
            { id: '1', name: "Hick's Law", score: 88, active: true },
            { id: '2', name: "Fitts's Law", score: 72, active: false },
            { id: '3', name: "Jakob's Law", score: 91, active: false },
        ]
    },
    {
        name: 'Psychology',
        concepts: [
            { id: '4', name: "Cognitive Load", score: 64, active: false },
            { id: '5', name: "Gestalt Theory", score: 82, active: false },
        ]
    }
];

const MOCK_HISTORY = [
    {
        id: 'h1',
        type: 'Mastery Review',
        date: 'October 24, 2023 • 14:32',
        score: 92,
        icon: Activity,
        colorClass: 'text-emerald-500',
        bgClass: 'bg-emerald-500/10',
        question: "According to Hick's Law, how does decision time increase as the number of choices grows?",
        yourAnswer: "Linearly",
        correctAnswer: "Logarithmically",
        tags: ["ReactionTime", "UserExperience", "DecisionMaking"]
    },
    {
        id: 'h2',
        type: 'Daily Recap',
        date: 'October 22, 2023 • 09:15',
        score: 84,
        icon: HelpCircle,
        colorClass: 'text-[var(--accent)]',
        bgClass: 'bg-[var(--accent-light)]',
        question: "What is the primary benefit of applying Hick's Law to navigation menus?",
        yourAnswer: "It reduces the time users take to make a choice",
        correctAnswer: "It reduces the time users take to make a choice",
        tags: ["Navigation", "UX"]
    },
    {
        id: 'h3',
        type: 'First Exposure',
        date: 'October 15, 2023 • 18:40',
        score: 62,
        icon: Clock,
        colorClass: 'text-slate-500',
        bgClass: 'bg-slate-200 dark:bg-slate-800',
        question: "Who formulated Hick's Law?",
        yourAnswer: "William Hick",
        correctAnswer: "William Edmund Hick and Ray Hyman",
        tags: ["History", "Foundations"]
    }
];

export function DeepDivePage() {
    const [expandedRow, setExpandedRow] = useState<string>('h1');

    return (
        <div className="flex h-screen overflow-hidden font-display w-full">
            {/* Left Column: Concept Sidebar */}
            <aside
                className="w-[260px] shrink-0 border-r flex flex-col hidden md:flex"
                style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            >
                <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
                        <input
                            placeholder="Filter concepts..."
                            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm border-none focus:ring-1 focus:outline-none transition-all"
                            style={{
                                background: 'var(--bg-raised)',
                                ['--tw-ring-color' as string]: 'var(--accent)'
                            }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {MOCK_CATEGORIES.map((category) => (
                        <div key={category.name} className="mb-4">
                            <h3 className="px-3 text-[10px] uppercase tracking-wider font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                                {category.name}
                            </h3>
                            <div className="space-y-1">
                                {category.concepts.map((concept) => (
                                    <div
                                        key={concept.id}
                                        className={cn(
                                            "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                                            concept.active ? "border-l-4" : "hover:bg-bg-raised"
                                        )}
                                        style={{
                                            background: concept.active ? 'var(--accent-light)' : 'transparent',
                                            borderColor: concept.active ? 'var(--accent)' : 'transparent'
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            {concept.active
                                                ? <CheckCircle className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                                                : <Circle className="w-4 h-4 opacity-30" style={{ color: 'var(--text-muted)' }} />
                                            }
                                            <span
                                                className={cn("text-sm", concept.active ? "font-semibold text-foreground" : "font-medium text-muted-foreground")}
                                            >
                                                {concept.name}
                                            </span>
                                        </div>
                                        <span
                                            className={cn("text-[10px] px-1.5 py-0.5 rounded font-bold")}
                                            style={concept.active ? { background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' } : { color: 'var(--text-muted)' }}
                                        >
                                            {concept.score}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Right Column: Deep Dive Content */}
            <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-base)' }}>
                <div className="max-w-[1000px] mx-auto p-8 lg:p-12 space-y-12">

                    {/* Hero/Header Section */}
                    <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>UX Design</span>
                                <span style={{ color: 'var(--text-muted)' }}>•</span>
                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Last session: 2 days ago</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Hick's Law</h1>
                            <p className="mt-4 text-base md:text-lg max-w-2xl leading-relaxed font-medium" style={{ color: 'var(--text-muted)' }}>
                                Describes the time it takes for a person to make a decision as a result of the possible choices: increasing the number of choices will increase the decision time logarithmically.
                            </p>
                        </div>

                        <div className="flex flex-col items-center shrink-0">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                {/* Circular Progress SVG */}
                                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="transparent"
                                        strokeWidth="8"
                                        style={{ stroke: 'var(--border)' }}
                                    />
                                    <circle
                                        cx="50" cy="50" r="45"
                                        fill="transparent"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray="282.7"
                                        strokeDashoffset={282.7 - (282.7 * 0.88)}
                                        style={{ stroke: 'var(--accent)' }}
                                    />
                                </svg>
                                <span className="absolute text-3xl font-black">88</span>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest mt-3" style={{ color: 'var(--text-muted)' }}>Accuracy Score</span>
                        </div>
                    </div>

                    {/* Session History Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--border)' }}>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                                Session History
                            </h2>
                            <button className="text-sm font-semibold flex items-center gap-1 hover:underline" style={{ color: 'var(--accent)' }}>
                                Export Data <Download className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Accordion Rows */}
                        <div className="space-y-4">
                            {MOCK_HISTORY.map((attempt) => {
                                const isExpanded = expandedRow === attempt.id;
                                const isCorrect = attempt.yourAnswer === attempt.correctAnswer;
                                const IconComponent = attempt.icon;

                                return (
                                    <div
                                        key={attempt.id}
                                        className={cn(
                                            "rounded-xl border overflow-hidden transition-all",
                                            !isExpanded && "hover:border-foreground/20 cursor-pointer shadow-sm"
                                        )}
                                        style={{
                                            background: isExpanded ? 'var(--bg-surface)' : 'color-mix(in srgb, var(--bg-surface) 40%, transparent)',
                                            borderColor: 'var(--border)'
                                        }}
                                        onClick={() => setExpandedRow(isExpanded ? '' : attempt.id)}
                                    >
                                        <div className={cn("p-4 flex items-center justify-between transition-colors", !isExpanded && "hover:bg-bg-raised")}>
                                            <div className="flex items-center gap-4">
                                                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", attempt.bgClass, attempt.colorClass)}>
                                                    <IconComponent className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-sm">{attempt.type}</h4>
                                                    <p className="text-xs mt-0.5 opacity-80" style={{ color: 'var(--text-muted)' }}>{attempt.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right hidden sm:block">
                                                    <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Score</p>
                                                    <p className={cn("font-black", attempt.colorClass)}>{attempt.score}%</p>
                                                </div>
                                                {isExpanded ? <ChevronUp className="w-5 h-5 opacity-50" /> : <ChevronDown className="w-5 h-5 opacity-50" />}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-6 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                                                        <div className="rounded-lg p-5 mt-2 space-y-5 border" style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}>

                                                            <div>
                                                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5" style={{ color: 'var(--text-muted)' }}>Question</span>
                                                                <p className="text-sm font-medium leading-relaxed">{attempt.question}</p>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-4 rounded-lg border-2" style={{ borderColor: isCorrect ? 'color-mix(in srgb, var(--success) 30%, transparent)' : 'color-mix(in srgb, var(--danger) 30%, transparent)', background: isCorrect ? 'color-mix(in srgb, var(--success) 5%, transparent)' : 'color-mix(in srgb, var(--danger) 5%, transparent)' }}>
                                                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider block mb-1.5", isCorrect ? "text-green-500" : "text-red-500")}>Your Answer</span>
                                                                    <p className="text-sm font-medium">{attempt.yourAnswer}</p>
                                                                </div>
                                                                <div className="p-4 rounded-lg border-2" style={{ borderColor: 'color-mix(in srgb, var(--success) 30%, transparent)', background: 'color-mix(in srgb, var(--success) 5%, transparent)' }}>
                                                                    <span className="text-[10px] font-bold uppercase tracking-wider block mb-1.5 text-green-500">Correct Answer</span>
                                                                    <p className="text-sm font-medium">{attempt.correctAnswer}</p>
                                                                </div>
                                                            </div>

                                                            <div className="pt-2">
                                                                <span className="text-[10px] font-bold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-muted)' }}>Related Tags</span>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {attempt.tags.map(tag => (
                                                                        <span key={tag} className="text-[10px] px-2 py-1 rounded font-semibold italic border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                                                            #{tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Call to Action */}
                    <div className="mt-16 p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 60%, black) 100%)', color: '#fff' }}>
                        <div className="relative z-10">
                            <h3 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Ready to boost your score?</h3>
                            <p className="font-medium opacity-90 text-sm md:text-base">Custom session available based on your weak points in Hick's Law.</p>
                        </div>
                        <button className="relative z-10 bg-white px-8 py-4 rounded-xl font-black uppercase tracking-wider text-sm transition-transform hover:scale-105 shadow-lg flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                            Start Deep Session <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
