'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, XCircle, AlertTriangle, Lightbulb } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AIGeneratedQuestion } from '@/src/types/ai';
import { runJavaScript, runPython, RunResult } from '@/src/lib/code-runner';
import { getPyodide } from '@/src/lib/pyodide-loader';

interface CodingCanvasProps {
    question: AIGeneratedQuestion;
    onAnswer: (isCorrect: boolean) => void;
}

type Language = 'javascript' | 'python';

function highlightCode(code: string): React.ReactNode[] {
    const lines = code.split('\n');
    return lines.map((line, i) => {
        // Simple regex-based syntax highlighter
        const tokens = line.split(/(\s+|[(){}[\]=+\-*/.,:;<>!&|]+|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|#.*|\d+)/g).filter(Boolean);
        
        return (
            <div key={i} className="min-h-[1.7em]">
                {tokens.map((token, j) => {
                    const t = token;
                    let color = 'inherit';
                    
                    if (t.match(/^(function|def|class|return|if|else|for|while|const|let|var|import|from|int|void|true|false|None|and|or|not|in)$/)) {
                        color = '#9B8AE8'; // keywords - purple
                    } else if (t.match(/^["'`].*["'`]$/)) {
                        color = '#7EC8A0'; // strings - green
                    } else if (t.match(/^(\/\/|#).*$/)) {
                        color = '#4D4A6E'; // comments - muted
                    } else if (t.match(/^\d+$/)) {
                        color = '#E8B96C'; // numbers - amber
                    }

                    return <span key={j} style={{ color }}>{t}</span>;
                })}
            </div>
        );
    });
}

export function CodingCanvas({ question, onAnswer }: CodingCanvasProps) {
    const [language, setLanguage] = useState<Language>(question.language || 'javascript');
    const [code, setCode] = useState(question.starterCode || '');
    const [isRunning, setIsRunning] = useState(false);
    const [result, setResult] = useState<RunResult | null>(null);
    const [pyodideReady, setPyodideReady] = useState(language !== 'python');
    const [hintsShown, setHintsShown] = useState<number>(0);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Reset state when new question loads
    useEffect(() => {
        setLanguage(question.language || 'javascript');
        setCode(question.starterCode || '');
        setResult(null);
        setHintsShown(0);
        setIsRunning(false);
    }, [question.id, question.starterCode, question.language]);

    // Initialize code properly over language switch
    const changeLanguage = (newLang: Language) => {
        if (code !== question.starterCode && !window.confirm('Switching languages will reset your code. Continue?')) {
            return;
        }
        setLanguage(newLang);
        setCode(question.starterCode || '');
        setResult(null);
    };

    // Load pyodide if python
    useEffect(() => {
        if (language === 'python') {
            getPyodide().then(() => setPyodideReady(true)).catch(console.error);
        }
    }, [language]);

    // Tab support
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const target = e.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;
            const val = target.value;
            setCode(val.substring(0, start) + '  ' + val.substring(end));
            
            // Put caret at right position again
            requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2;
            });
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [code]);

    const isInvalid = !question.starterCode || 
                      !question.testCases || 
                      question.testCases.length === 0 || 
                      question.testCases.some(tc => tc.expectedOutput === undefined || tc.expectedOutput === null || tc.expectedOutput === '');

    if (isInvalid) {
        return (
            <div className="w-full flex justify-center pb-10">
                <div className="w-full max-w-[800px] flex flex-col gap-6 items-center justify-center p-12 rounded-xl border border-dashed text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    <AlertTriangle className="w-10 h-10 text-[var(--danger)] opacity-80" />
                    <div className="space-y-1">
                        <div className="text-lg font-bold">Unable to load this challenge.</div>
                        <div className="text-sm font-medium opacity-70" style={{ color: 'var(--text-muted)' }}>The generated code template or test cases are invalid.</div>
                    </div>
                    <button
                        onClick={() => onAnswer(false)}
                        className="mt-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-colors hover:bg-bg-raised flex items-center gap-2"
                        style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)' }}
                    >
                        Skip Question &rarr;
                    </button>
                </div>
            </div>
        );
    }

    const handleRun = async () => {
        setIsRunning(true);
        setResult(null);
        
        try {
            const testCases = question.testCases || [];
            let res: RunResult;
            
            if (language === 'javascript') {
                res = runJavaScript(code, testCases);
            } else {
                res = await runPython(code, testCases);
            }
            setResult(res);
        } catch (e: any) {
            setResult({ output: e.message || 'Execution error', passed: new Array(question.testCases?.length || 0).fill(false), error: e.message });
        } finally {
            setIsRunning(false);
        }
    };

    const isAllCorePass = result?.passed.every((p, i) => question.testCases?.[i].isHidden ? true : p) ?? false;
    const isAllPass = result?.passed.every(p => p) ?? false;

    return (
        <div className="w-full flex justify-center pb-10">
            <div className="w-full max-w-[800px] flex flex-col gap-6">
                
                {/* Instruction Header */}
                <div className="space-y-3">
                    <div className="p-4 rounded-xl border" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                        <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>📝 Your task</div>
                        <p className="text-[15px] font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>{question.question}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                        ℹ Write your code in the editor below. Your function must be named <code className="font-mono font-bold" style={{ color: 'var(--accent)' }}>solution</code> and return a value — not print it.
                    </div>
                </div>

                {/* Header (Language Tabs) */}
                <div className="flex items-center justify-between">
                    <div className="flex bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border)]">
                        <button
                            className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", language === 'javascript' ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
                            onClick={() => changeLanguage('javascript')}
                        >
                            JavaScript
                        </button>
                        <button
                            className={cn("px-4 py-1.5 rounded-md text-sm font-bold transition-all", language === 'python' ? 'bg-[var(--bg-raised)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}
                            onClick={() => changeLanguage('python')}
                        >
                            Python
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="relative rounded-xl overflow-hidden border border-[#1E1D30] font-mono text-[13px] leading-[1.7] flex shadow-2xl" style={{ background: '#0E0E16' }}>
                    {/* Line Numbers */}
                    <div className="w-[38px] shrink-0 text-right pr-3 py-4 select-none border-r border-[#1E1D30] text-[#3D3B5A] bg-[#0A0A10]">
                        {code.split('\n').map((_, i) => (
                            <div key={i} className="min-h-[1.7em]">{i + 1}</div>
                        ))}
                    </div>

                    {/* Textarea & Highlighter overlay */}
                    <div className="relative flex-1">
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none overflow-hidden whitespace-pre font-mono text-[13px] leading-[1.7] z-10"
                        />
                        <pre className="absolute inset-0 w-full h-full p-4 pointer-events-none whitespace-pre-wrap word-break m-0 font-mono text-[13px] leading-[1.7] text-[#c8c5d9]" aria-hidden="true">
                            {highlightCode(code)}
                        </pre>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {question.hints && question.hints.map((hint, i) => (
                            <button
                                key={i}
                                onClick={() => setHintsShown(Math.max(hintsShown, i + 1))}
                                disabled={hintsShown > i}
                                className={cn(
                                    "px-3 py-1.5 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5",
                                    hintsShown > i 
                                        ? "opacity-50 line-through border-[var(--border)] text-[var(--text-muted)] bg-[var(--bg-surface)]" 
                                        : "border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning)]/10"
                                )}
                            >
                                <Lightbulb className="w-3.5 h-3.5" />
                                Hint {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleRun}
                        disabled={isRunning || (language === 'python' && !pyodideReady)}
                        className="px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-2"
                        style={{ background: 'var(--accent)' }}
                    >
                        {isRunning ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</> 
                        : (language === 'python' && !pyodideReady) ? 'Loading Python runtime...' 
                        : <><Play className="w-4 h-4 fill-current" /> Run Code</>}
                    </button>
                </div>

                {/* Hints Display */}
                <AnimatePresence>
                    {hintsShown > 0 && question.hints && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="overflow-hidden">
                            <div className="p-4 rounded-xl border border-[var(--warning)] bg-[var(--warning)]/5 space-y-3">
                                {question.hints.slice(0, hintsShown).map((hint, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <Lightbulb className="w-4 h-4 shrink-0 text-[var(--warning)] mt-0.5" />
                                        <p className="leading-relaxed font-medium">{hint}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Output & Result */}
                {result && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                        {/* Console Output */}
                        <div className="rounded-xl overflow-hidden border border-[#1E1D30] font-mono shadow-md" style={{ background: '#0E0E16' }}>
                            <div className="px-4 py-2 bg-[#14141E] border-b border-[#1E1D30] flex items-center">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[#8B8B9B]">Output</span>
                            </div>
                            <div className={cn("p-4 text-[13px] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-y-auto", result.error ? "text-[#FF6B6B]" : "text-[#c8c5d9]")}>
                                {result.output}
                            </div>
                        </div>

                        {/* Result Feedback & Submit */}
                        {!result.error && (
                            <div className="flex flex-col gap-4 mt-4">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    {isAllCorePass ? (
                                        <>
                                            <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--success)' }} />
                                            <span style={{ color: 'var(--success)' }}>✓ Correct! All test cases passed.</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5" style={{ color: 'var(--danger)' }} />
                                            <span style={{ color: 'var(--danger)' }}>✗ Not quite — check your output and try again</span>
                                        </>
                                    )}
                                </div>
                                <button
                                    onClick={() => onAnswer(isAllCorePass)}
                                    className="w-full py-3.5 rounded-lg text-[15px] font-black tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-[1px]"
                                    style={{ 
                                        background: 'var(--accent)', 
                                        color: '#ffffff'
                                    }}
                                >
                                    Submit Answer
                                </button>
                            </div>
                        )}

                    </motion.div>
                )}
            </div>
        </div>
    );
}
