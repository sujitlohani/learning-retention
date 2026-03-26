// src/features/classroom/components/ClassroomPage.tsx


'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Play, CheckCircle2, XCircle,
  Lightbulb, Sparkles, RotateCcw, Loader2, ArrowLeft
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { CLASSROOM_LANGUAGES, ClassroomLanguage, ClassroomDifficulty, ClassroomQuestion } from '@/src/lib/classroom-question-bank';
import { useClassroom } from '../hooks/useClassroom';
import { buildReviewPrompt, buildEvaluatePrompt } from '@/src/services/ai/classroom-prompts';
import { TestResult } from '@/src/types/classroom';

// ─── Shared constants matching Memora's design system ────────────────────────

const DIFFICULTY_STYLE: Record<ClassroomDifficulty, string> = {
  easy:   'text-[var(--success)] bg-[var(--success)]/10',
  medium: 'text-[var(--warning)] bg-[var(--warning)]/10',
  hard:   'text-[var(--danger)]  bg-[var(--danger)]/10',
};

// ─── Step 1: Language Selection ───────────────────────────────────────────────

function LanguageStep({ onSelect }: { onSelect: (l: ClassroomLanguage) => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--accent)' }}>
          Classroom
        </p>
        <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Pick a language
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--text-muted)' }}>
          Choose the language you want to practice today
        </p>

        <div className="grid grid-cols-2 gap-3">
          {CLASSROOM_LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(lang.id as ClassroomLanguage)}
              className="flex items-center gap-3 px-4 py-4 rounded-xl border text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] group"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{ background: 'var(--bg-raised)', color: 'var(--accent)' }}>
                {lang.label.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{lang.label}</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>.{lang.extension}</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step 2: Level Selection ──────────────────────────────────────────────────

const LEVELS: { id: ClassroomDifficulty; label: string; desc: string }[] = [
  { id: 'easy',   label: 'Beginner',     desc: 'Build confidence with clear, approachable problems' },
  { id: 'medium', label: 'Intermediate', desc: 'Classic interview problems with real challenge' },
  { id: 'hard',   label: 'Advanced',     desc: 'Push your limits with complex problem-solving' },
];

function LevelStep({
  language,
  onSelect,
  onBack,
}: {
  language: ClassroomLanguage;
  onSelect: (d: ClassroomDifficulty) => void;
  onBack: () => void;
}) {
  const langMeta = CLASSROOM_LANGUAGES.find(l => l.id === language)!;

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-bold mb-8 transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Selected language chip */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-6"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-black"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
            {langMeta.label.slice(0, 2)}
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{langMeta.label}</span>
        </div>

        <h2 className="text-3xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
          Select your level
        </h2>
        <p className="text-sm mb-8" style={{ color: 'var(--text-muted)' }}>
          Questions are matched to your experience
        </p>

        <div className="flex flex-col gap-3">
          {LEVELS.map((level, i) => (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(level.id)}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-light)] group"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{level.label}</span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full capitalize", DIFFICULTY_STYLE[level.id])}>
                    {level.id}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{level.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Syntax highlighter ───────────────────────────────────────────────────────

function highlight(code: string, lang: ClassroomLanguage) {
  return code.split('\n').map((line, i) => {
    const tokens = line.split(/(\s+|[(){}[\]=+\-*/.,:;<>!&|]+|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|#.*|\b\d+\b)/g).filter(Boolean);
    return (
      <div key={i} className="min-h-[1.7em]">
        {tokens.map((tok, j) => {
          let color = '#c8c5d9';
          const kw = lang === 'python'
            ? /^(def|class|return|if|elif|else|for|while|import|from|with|pass|None|True|False|and|or|not|in|is|self|lambda)$/
            : lang === 'c' || lang === 'cpp'
              ? /^(int|float|double|char|void|return|if|else|for|while|struct|const|static|bool|true|false|NULL|break|continue|switch|case|include|using|namespace|class|public|private|vector|string)$/
              : lang === 'java'
                ? /^(public|private|class|void|int|String|boolean|return|if|else|for|while|new|this|static|final|import|true|false|null)$/
                : /^(function|return|if|else|for|while|const|let|var|import|from|class|new|this|true|false|null|undefined|async|await|export|typeof|of|in)$/;
          if (tok.match(kw)) color = 'var(--accent)';
          else if (tok.startsWith('"') || tok.startsWith("'") || tok.startsWith('`')) color = '#7EC8A0';
          else if (tok.startsWith('//') || tok.startsWith('#')) color = 'var(--text-muted)';
          else if (tok.match(/^\d+$/)) color = '#E8B96C';
          return <span key={j} style={{ color }}>{tok}</span>;
        })}
      </div>
    );
  });
}

// ─── Step 3: Coding view ──────────────────────────────────────────────────────

function CodingStep({
  question,
  language,
  questionIdx,
  totalQuestions,
  isSolved,
  onPrev,
  onNext,
  onBack,
  onSubmit,
}: {
  question: ClassroomQuestion;
  language: ClassroomLanguage;
  questionIdx: number;
  totalQuestions: number;
  isSolved: boolean;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (code: string, passed: boolean) => void;
}) {
  const [code, setCode]               = useState(question.starterCode[language] || '');
  const [isRunning, setIsRunning]     = useState(false);
  const [results, setResults]         = useState<TestResult[] | null>(null);
  const [error, setError]             = useState('');
  const [hintsShown, setHintsShown]   = useState(0);
  const [aiReview, setAiReview]       = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitted, setSubmitted]     = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langMeta = CLASSROOM_LANGUAGES.find(l => l.id === language)!;

  useEffect(() => {
    setCode(question.starterCode[language] || '');
    setResults(null); setError(''); setHintsShown(0);
    setAiReview(''); setSubmitted(false);
  }, [question.id, language]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(220, textareaRef.current.scrollHeight) + 'px';
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const t = e.target as HTMLTextAreaElement;
      const s = t.selectionStart, en = t.selectionEnd;
      const ind = language === 'python' ? '    ' : '  ';
      setCode(code.substring(0, s) + ind + code.substring(en));
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + ind.length; });
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); runCode(); }
  };

  const runCode = async () => {
    if (isRunning || isReviewing) return;
    setIsRunning(true); setResults(null); setError(''); setAiReview('');

    try {
      if (language === 'javascript' || language === 'typescript') {
        // Run directly in browser
        const fnNames = ['twoSum','reverseString','fib','isPalindrome','search','maxSubArray','solution'];
        const res: TestResult[] = [];
        for (const tc of question.testCases) {
          try {
            const getter = new Function(`${code};\nreturn ${fnNames.map(n => `typeof ${n}!=='undefined'?${n}`).join(':')}:null`);
            const fn = getter();
            if (!fn) throw new Error('Function not found. Check your function name matches the problem.');
            const args = tc.input
              ? tc.input.split(',').map(s => { try { return JSON.parse(s.trim()); } catch { return s.trim().replace(/^['"]|['"]$/g, ''); } })
              : [];
            const result = fn(...args);
            const actual = JSON.stringify(result) ?? String(result);
            const passed = actual.replace(/\s/g, '') === tc.expectedOutput.replace(/\s/g, '') || String(result) === tc.expectedOutput;
            res.push({ input: tc.input, expected: tc.expectedOutput, actual: String(result), passed });
          } catch (e: any) {
            res.push({ input: tc.input, expected: tc.expectedOutput, actual: 'Error', passed: false });
            setError(e.message);
          }
        }
        setResults(res);
      } else {
        // For compiled languages — AI evaluates
        setIsReviewing(true);
        const prompt = buildEvaluatePrompt(question, language, code);
        const r = await fetch('/api/ai/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
        if (r.ok) {
          const d = await r.json();
          const passed = d.text?.includes('VERDICT: PASS') ?? false;
          const reason = d.text?.split('\n').find((l: string) => l.startsWith('REASON:'))?.replace('REASON: ', '') ?? '';
          setAiReview(reason);
          setResults(question.testCases.map(tc => ({ input: tc.input, expected: tc.expectedOutput, actual: passed ? tc.expectedOutput : '?', passed })));
        }
        setIsReviewing(false);
      }
    } finally { setIsRunning(false); }
  };

  const getAiReview = async () => {
    if (isReviewing) return;
    setIsReviewing(true);
    try {
      const prompt = buildReviewPrompt(question, language, code);
      const r = await fetch('/api/ai/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      if (r.ok) { const d = await r.json(); setAiReview(d.text || ''); }
    } finally { setIsReviewing(false); }
  };

  const handleSubmit = () => {
    const passed = results?.every(r => r.passed) ?? false;
    setSubmitted(true);
    onSubmit(code, passed);
  };

  const allPassed = results?.every(r => r.passed) ?? false;

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-3 px-6 h-12 border-b shrink-0"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-3.5 h-3.5" /> Change level
        </button>

        <div className="h-4 w-px" style={{ background: 'var(--border)' }} />

        {/* Language badge */}
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {langMeta.label}
        </span>

        <div className="flex-1" />

        {isSolved && (
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--success)]">
            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
          </span>
        )}

        {/* Prev / next */}
        <div className="flex items-center gap-1">
          <button onClick={onPrev} disabled={questionIdx === 0}
            className="p-1 rounded-lg hover:bg-[var(--bg-raised)] transition-colors disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
          <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--text-muted)' }}>
            {questionIdx + 1} / {totalQuestions}
          </span>
          <button onClick={onNext} disabled={questionIdx === totalQuestions - 1}
            className="p-1 rounded-lg hover:bg-[var(--bg-raised)] transition-colors disabled:opacity-30">
            <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8 flex flex-col gap-8">

          {/* ── Question block (top) ── */}
          <motion.div key={`q-${question.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-3">
              <span className={cn("text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize", DIFFICULTY_STYLE[question.difficulty])}>
                {question.difficulty}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                {question.category}
              </span>
            </div>

            <h2 className="text-xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              {question.title}
            </h2>

            {/* Description */}
            <div className="space-y-2">
              {question.description.split(/(```[\s\S]*?```)/g).map((block, i) => {
                if (block.startsWith('```') && block.endsWith('```')) {
                  const lines = block.slice(3, -3).split('\n');
                  const codeContent = lines.slice(1).join('\n');
                  return (
                    <pre key={i} className="p-4 rounded-xl font-mono text-[12px] leading-[1.7] overflow-x-auto my-2"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                      {codeContent}
                    </pre>
                  );
                }
                return block.split('\n').filter(l => l.trim()).map((line, j) => {
                  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
                  return (
                    <p key={`${i}-${j}`} className="text-[15px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {parts.map((p, k) => {
                        if (p.startsWith('**') && p.endsWith('**'))
                          return <strong key={k} style={{ color: 'var(--text-primary)' }}>{p.slice(2, -2)}</strong>;
                        if (p.startsWith('`') && p.endsWith('`'))
                          return <code key={k} className="px-1.5 py-0.5 rounded font-mono text-[12px]"
                            style={{ background: 'var(--bg-raised)', color: 'var(--accent)' }}>{p.slice(1, -1)}</code>;
                        return p;
                      })}
                    </p>
                  );
                });
              })}
            </div>
          </motion.div>

          {/* ── Editor (below question) ── */}
          <motion.div key={`e-${question.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>

            {/* Editor chrome */}
            <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between px-4 py-2 border-b"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--danger)' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--warning)' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--success)' }} />
                  </div>
                  <span className="font-mono text-[11px] ml-1" style={{ color: 'var(--text-muted)' }}>
                    solution.{langMeta.extension}
                  </span>
                </div>
                <button onClick={() => { if (window.confirm('Reset to starter code?')) { setCode(question.starterCode[language]); setResults(null); setError(''); } }}
                  className="transition-opacity hover:opacity-60" title="Reset code">
                  <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                </button>
              </div>

              {/* Code area */}
              <div className="relative flex font-mono text-[13px] leading-[1.7]"
                style={{ background: '#0E0E18' }}>
                {/* Line numbers */}
                <div className="w-[40px] shrink-0 py-4 pr-3 text-right select-none border-r text-[11px]"
                  style={{ background: '#0A0A12', borderColor: '#1E1B2E', color: '#3D3B5A' }}>
                  {code.split('\n').map((_, i) => <div key={i} className="min-h-[1.7em]">{i + 1}</div>)}
                </div>
                {/* Editable + highlight overlay */}
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    spellCheck={false}
                    className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre font-mono text-[13px] leading-[1.7] z-10"
                    style={{ minHeight: '220px' }}
                  />
                  <pre className="w-full p-4 pointer-events-none whitespace-pre-wrap m-0 font-mono text-[13px] leading-[1.7]" aria-hidden>
                    {highlight(code, language)}
                  </pre>
                </div>
              </div>

              {/* Shortcut bar */}
              <div className="px-4 py-1.5 flex justify-between border-t"
                style={{ background: '#0A0A12', borderColor: '#1E1B2E' }}>
                <span className="font-mono text-[10px]" style={{ color: '#3D3B5A' }}>⌘+Enter to run</span>
                <span className="font-mono text-[10px]" style={{ color: '#3D3B5A' }}>Tab to indent</span>
              </div>
            </div>

            {/* ── Action row: hints · AI review · Run ── */}
            <div className="flex items-center gap-2 mt-4">
              {/* Hint buttons */}
              {question.hints.map((_, i) => (
                <button key={i}
                  onClick={() => setHintsShown(Math.max(hintsShown, i + 1))}
                  disabled={hintsShown > i}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all",
                    hintsShown > i
                      ? "opacity-40 line-through"
                      : "hover:bg-[var(--bg-raised)]"
                  )}
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <Lightbulb className="w-3 h-3" />
                  Hint {i + 1}
                </button>
              ))}

              <button onClick={getAiReview} disabled={isReviewing}
                className="px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all hover:bg-[var(--bg-raised)]"
                style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                AI Review
              </button>

              <div className="flex-1" />

              <button onClick={runCode} disabled={isRunning || isReviewing}
                className="px-6 py-2 rounded-xl text-sm font-black text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {isRunning || isReviewing
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
                  : <><Play className="w-4 h-4 fill-current" />Run Code</>}
              </button>
            </div>

            {/* ── Hints (revealed progressively) ── */}
            <AnimatePresence>
              {hintsShown > 0 && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="mt-3 p-4 rounded-xl border space-y-2"
                    style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                    {question.hints.slice(0, hintsShown).map((hint, i) => (
                      <div key={i} className="flex gap-2 text-sm">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                        <p style={{ color: 'var(--text-primary)' }}>{hint}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── AI Review ── */}
            <AnimatePresence>
              {aiReview && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="mt-3 p-4 rounded-xl border"
                  style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>AI Feedback</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{aiReview}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Error ── */}
            {error && (
              <div className="mt-3 p-3 rounded-xl border font-mono text-xs"
                style={{ borderColor: 'var(--danger)', background: 'var(--danger)/5', color: 'var(--danger)' }}>
                {error}
              </div>
            )}

            {/* ── Test results ── */}
            <AnimatePresence>
              {results && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {results.filter(r => r.passed).length} / {results.length} tests passed
                    </span>
                    {allPassed && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                        style={{ background: 'var(--success)/15', color: 'var(--success)' }}>
                        ✓ All passed
                      </span>
                    )}
                  </div>

                  {results.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border font-mono text-xs"
                      style={{
                        borderColor: r.passed ? 'var(--success)' : 'var(--danger)',
                        background: r.passed ? 'color-mix(in srgb, var(--success) 5%, transparent)' : 'color-mix(in srgb, var(--danger) 5%, transparent)',
                      }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          Test {i + 1}
                        </span>
                        {r.passed
                          ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} />
                          : <XCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Input</div>
                          <div style={{ color: 'var(--text-primary)' }}>{r.input || '(none)'}</div>
                        </div>
                        <div>
                          <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Expected</div>
                          <div style={{ color: 'var(--success)' }}>{r.expected}</div>
                        </div>
                        <div>
                          <div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Got</div>
                          <div style={{ color: r.passed ? 'var(--success)' : 'var(--danger)' }}>{r.actual}</div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {!submitted ? (
                    <button onClick={handleSubmit}
                      className="w-full py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                      style={{ background: allPassed ? 'var(--success)' : 'var(--accent)' }}>
                      {allPassed ? <><CheckCircle2 className="w-4 h-4" />Submit Solution</> : <>Submit Anyway →</>}
                    </button>
                  ) : (
                    <div className="w-full py-3 rounded-xl text-center text-sm font-bold"
                      style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                      ✓ Submitted — use the arrows to continue
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Root orchestrator ────────────────────────────────────────────────────────

export function ClassroomPage() {
  const {
    step, setStep,
    language, difficulty,
    selectLanguage, selectLevel,
    questions, questionIdx, goToQuestion,
    currentQuestion,
    progress, submitAnswer,
  } = useClassroom();

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <AnimatePresence mode="wait">
        {step === 'language' && (
          <motion.div key="lang" className="flex-1 flex flex-col overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LanguageStep onSelect={selectLanguage} />
          </motion.div>
        )}

        {step === 'level' && (
          <motion.div key="level" className="flex-1 flex flex-col overflow-y-auto"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LevelStep
              language={language}
              onSelect={selectLevel}
              onBack={() => setStep('language')}
            />
          </motion.div>
        )}

        {step === 'coding' && currentQuestion && (
          <motion.div key="coding" className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <CodingStep
              question={currentQuestion}
              language={language}
              questionIdx={questionIdx}
              totalQuestions={questions.length}
              isSolved={progress.solvedIds.includes(currentQuestion.id)}
              onPrev={() => goToQuestion(questionIdx - 1)}
              onNext={() => goToQuestion(questionIdx + 1)}
              onBack={() => setStep('level')}
              onSubmit={submitAnswer}
            />
          </motion.div>
        )}

        {step === 'coding' && !currentQuestion && (
          <motion.div key="empty" className="flex-1 flex flex-col items-center justify-center gap-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="font-bold" style={{ color: 'var(--text-muted)' }}>
              No problems available for this level yet.
            </p>
            <button onClick={() => setStep('level')}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm"
              style={{ background: 'var(--accent)' }}>
              ← Pick another level
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}