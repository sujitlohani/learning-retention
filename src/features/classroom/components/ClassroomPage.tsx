// src/features/classroom/components/ClassroomPage.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle2, XCircle, Lightbulb, Sparkles,
  Loader2, ArrowLeft, ChevronRight, Dices, RotateCcw
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import {
  CLASSROOM_LANGUAGES, classroomQuestions,
  ClassroomLanguage, ClassroomDifficulty, ClassroomQuestion
} from '@/src/lib/classroom-question-bank';
import { useClassroom } from '../hooks/useClassroom';

// ─── Language config ───────────────────────────────────────────────────────────

const LANG_CONFIG: Record<ClassroomLanguage, { color: string; logo: React.ReactNode }> = {
  javascript: {
    color: '#D4A500',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#F7DF1E"/>
        <path d="M13 36l3.9-2.36c.76 1.35 1.5 2.36 3.02 2.36 1.46 0 2.4-.57 2.4-2.8V19.5h4.8V33.2c0 4.63-2.71 6.74-6.67 6.74-3.57 0-5.65-1.85-6.71-4zM29.1 35.5l3.9-2.26c1.02 1.69 2.34 2.93 4.68 2.93 1.97 0 3.22-.98 3.22-2.34 0-1.62-1.3-2.2-3.46-3.16l-1.19-.5c-3.43-1.46-5.7-3.28-5.7-7.13 0-3.55 2.7-6.25 6.94-6.25 3.01 0 5.17 1.05 6.72 3.79l-3.72 2.39c-.81-1.45-1.69-2.02-3.02-2.02-1.37 0-2.24.86-2.24 2.02 0 1.42.87 1.97 2.88 2.84l1.19.5c4.04 1.73 6.31 3.5 6.31 7.47 0 4.28-3.36 6.59-7.87 6.59-4.41 0-7.26-2.1-8.64-4.87z" fill="#000" transform="scale(0.55) translate(10,10)"/>
      </svg>
    ),
  },
  typescript: {
    color: '#2563EB',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#3178C6"/>
        <path d="M9 27h8.5v2.3H15v10H13V29.3H9L9 27zM22 29.5c0-.9.72-1.6 1.6-1.6.44 0 .8.16 1.08.42l2.1-2.1A4.8 4.8 0 0022 24c-2.65 0-4.8 2.15-4.8 4.8s2.15 4.8 4.8 4.8c1.32 0 2.52-.53 3.39-1.39l-2.1-2.1a1.6 1.6 0 01-2.69-1.11zM30 24h3.2v6.8c0 1.1.9 2 2 2s2-.9 2-2V24H40v6.8a5.2 5.2 0 01-10.4 0V24z" fill="#fff"/>
      </svg>
    ),
  },
  python: {
    color: '#1D4ED8',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#3572A5"/>
        <text x="24" y="32" textAnchor="middle" fill="#FFD43B" fontSize="22" fontWeight="bold" fontFamily="monospace">Py</text>
      </svg>
    ),
  },
  java: {
    color: '#C2410C',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#ED8B00"/>
        <text x="24" y="34" textAnchor="middle" fill="white" fontSize="26" fontWeight="bold" fontFamily="Georgia,serif">J</text>
      </svg>
    ),
  },
  c: {
    color: '#374151',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#555"/>
        <circle cx="24" cy="24" r="12" stroke="white" strokeWidth="3" fill="none"/>
        <path d="M28 18.5A8 8 0 1028 29.5" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
  cpp: {
    color: '#1E40AF',
    logo: (
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="12" fill="#00599C"/>
        <circle cx="20" cy="24" r="9" stroke="white" strokeWidth="2.5" fill="none"/>
        <path d="M24 20A6 6 0 1024 28" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <line x1="31" y1="21" x2="31" y2="27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="28" y1="24" x2="34" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="37" y1="21" x2="37" y2="27" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="34" y1="24" x2="40" y2="24" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
};

const DIFF_CONFIG: Record<ClassroomDifficulty, { label: string; desc: string; color: string }> = {
  easy:   { label: 'Beginner',     desc: 'Build confidence with clear, approachable problems',  color: 'var(--success)' },
  medium: { label: 'Intermediate', desc: 'Classic interview problems that test real skill',      color: 'var(--warning)' },
  hard:   { label: 'Advanced',     desc: 'Complex algorithms that push your limits',             color: 'var(--danger)'  },
};

// ─── Syntax highlighter ────────────────────────────────────────────────────────

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
          if (tok.match(kw)) color = '#9B8AE8';
          else if (tok.startsWith('"') || tok.startsWith("'") || tok.startsWith('`')) color = '#7EC8A0';
          else if (tok.startsWith('//') || tok.startsWith('#')) color = '#4D4A6E';
          else if (tok.match(/^\d+$/)) color = '#E8B96C';
          return <span key={j} style={{ color }}>{tok}</span>;
        })}
      </div>
    );
  });
}

// ─── Step 1: Language selection ────────────────────────────────────────────────

function LanguageStep({ onSelect, progress }: {
  onSelect: (l: ClassroomLanguage) => void;
  progress: ReturnType<typeof useClassroom>['progress'];
}) {
  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
            Classroom
          </h1>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Pick a language to start practicing
          </p>
        </div>
        {progress.solvedIds.length > 0 && (
          <div className="text-right">
            <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{progress.solvedIds.length}</div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Solved</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {CLASSROOM_LANGUAGES.map((lang, i) => {
          const cfg = LANG_CONFIG[lang.id as ClassroomLanguage];
          const total = classroomQuestions.filter(q => !!q.starterCode[lang.id as ClassroomLanguage]).length;
          const solved = progress.solvedIds.filter(id =>
            classroomQuestions.find(q => q.id === id && !!q.starterCode[lang.id as ClassroomLanguage])
          ).length;
          const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => onSelect(lang.id as ClassroomLanguage)}
              className="group flex flex-col items-center gap-3 p-6 rounded-2xl border-2 text-center transition-all duration-200 hover:-translate-y-1"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = cfg.color;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 24px ${cfg.color}22`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {cfg.logo}
              <div>
                <div className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{lang.label}</div>
                <div className="text-[11px] font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>.{lang.extension}</div>
              </div>
              <div className="w-full space-y-1">
                <div className="flex justify-between text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                  <span>{solved}/{total} solved</span>
                  <span>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : cfg.color }} />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 2: Level selection ───────────────────────────────────────────────────

function LevelStep({ language, onSelect, onBack, progress }: {
  language: ClassroomLanguage;
  onSelect: (d: ClassroomDifficulty) => void;
  onBack: () => void;
  progress: ReturnType<typeof useClassroom>['progress'];
}) {
  const langMeta = CLASSROOM_LANGUAGES.find(l => l.id === language)!;
  const cfg = LANG_CONFIG[language];

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <button onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-medium mb-8 transition-opacity hover:opacity-60"
        style={{ color: 'var(--text-muted)' }}>
        <ArrowLeft className="w-4 h-4" /> Back to languages
      </button>

      <div className="flex items-center gap-4 mb-10">
        {cfg.logo}
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{langMeta.label}</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Select your level</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {(['easy', 'medium', 'hard'] as ClassroomDifficulty[]).map((diff, i) => {
          const d = DIFF_CONFIG[diff];
          const qs = classroomQuestions.filter(q => q.difficulty === diff && !!q.starterCode[language]);
          const total = qs.length;
          const solved = qs.filter(q => progress.solvedIds.includes(q.id)).length;
          const pct = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <motion.button key={diff}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => onSelect(diff)}
              disabled={total === 0}
              className="group flex items-center gap-5 px-6 py-5 rounded-2xl border-2 text-left transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
              onMouseEnter={e => { if (total > 0) (e.currentTarget as HTMLElement).style.borderColor = d.color; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${d.color} 12%, transparent)` }}>
                <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{d.label}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ color: d.color, background: `color-mix(in srgb, ${d.color} 12%, transparent)` }}>{diff}</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>{total} problems</span>
                </div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{d.desc}</p>
                {total > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>
                      <span>{solved}/{total} solved</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                    </div>
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" style={{ color: d.color }} />
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 3: Coding view — minimal like Code Challenge ─────────────────────────

function CodingStep({
  question, questions, language, questionIdx, totalQuestions,
  onPrev, onNext, onBack, onSubmit, onRandom, progress,
}: {
  question: ClassroomQuestion;
  questions: ClassroomQuestion[];
  language: ClassroomLanguage;
  questionIdx: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
  onSubmit: (code: string, passed: boolean) => void;
  onRandom: () => void;
  progress: ReturnType<typeof useClassroom>['progress'];
}) {
  const [code, setCode] = useState(question.starterCode[language] || '');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<{ input: string; expected: string; actual: string; passed: boolean }[] | null>(null);
  const [error, setError] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const [aiReview, setAiReview] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const langMeta = CLASSROOM_LANGUAGES.find(l => l.id === language)!;

  useEffect(() => {
    setCode(question.starterCode[language] || '');
    setTestResults(null); setError('');
    setHintsShown(0); setAiReview(''); setSubmitted(false);
  }, [question.id, language]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(140, textareaRef.current.scrollHeight) + 'px';
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
    setIsRunning(true); setTestResults(null); setError(''); setAiReview('');
    try {
      if (language === 'javascript' || language === 'typescript') {
        const res: { input: string; expected: string; actual: string; passed: boolean }[] = [];
        for (const tc of question.testCases) {
          try {
            const fnNames = ['twoSum','reverseString','fib','isPalindrome','search','maxSubArray','solution','two_sum','reverse_string','max_sub_array','is_palindrome'];
            const getter = new Function(`${code};\nreturn ${fnNames.map(n=>`typeof ${n}!=='undefined'?${n}`).join(':')}:null`);
            const fn = getter();
            if (!fn) throw new Error('Function not found — check your function name matches the problem.');
            const args = tc.input ? tc.input.split(',').map(s => { try { return JSON.parse(s.trim()); } catch { return s.trim().replace(/^['"]|['"]$/g,''); } }) : [];
            const result = fn(...args);
            const actual = JSON.stringify(result) ?? String(result);
            const passed = actual.replace(/\s/g,'') === tc.expectedOutput.replace(/\s/g,'') || String(result) === tc.expectedOutput;
            res.push({ input: tc.input, expected: tc.expectedOutput, actual: String(result), passed });
          } catch(e: any) {
            res.push({ input: tc.input, expected: tc.expectedOutput, actual: 'Error', passed: false });
            setError(e.message);
          }
        }
        setTestResults(res);
      } else {
        setIsReviewing(true);
        try {
          const r = await fetch('/api/ai/review', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: `You are a strict code evaluator. Problem: "${question.title}".\nTest cases:\n${question.testCases.map((tc,i)=>`${i+1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`).join('\n')}\nUser's ${language} code:\n\`\`\`${language}\n${code}\n\`\`\`\nReply ONLY:\nVERDICT: PASS\nREASON: one sentence\n\nOr:\nVERDICT: FAIL\nREASON: one sentence explaining the bug` }),
          });
          if (r.ok) {
            const d = await r.json();
            const passed = d.text?.includes('VERDICT: PASS') ?? false;
            const reason = d.text?.split('\n').find((l: string) => l.startsWith('REASON:'))?.replace('REASON: ','') ?? '';
            setAiReview(reason);
            setTestResults(question.testCases.map(tc => ({ input: tc.input, expected: tc.expectedOutput, actual: passed ? tc.expectedOutput : '?', passed })));
          } else setError('AI evaluation failed. Please try again.');
        } catch { setError('Could not reach AI service.'); }
        setIsReviewing(false);
      }
    } finally { setIsRunning(false); }
  };

  const getAiReview = async () => {
    if (isReviewing) return;
    setIsReviewing(true);
    try {
      const r = await fetch('/api/ai/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `You are a friendly coding mentor. Review this ${language} code for "${question.title}" in 2-3 encouraging sentences:\n\`\`\`${language}\n${code}\n\`\`\`` }),
      });
      if (r.ok) { const d = await r.json(); setAiReview(d.text || ''); }
      else setAiReview('AI review is unavailable right now.');
    } catch { setAiReview('Could not reach AI service.'); }
    finally { setIsReviewing(false); }
  };

  const handleSubmit = () => {
    const passed = testResults?.every(r => r.passed) ?? false;
    setSubmitted(true);
    onSubmit(code, passed);
  };

  const allPassed = testResults?.every(r => r.passed) ?? false;
  const isSolved = progress.solvedIds.includes(question.id);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">

      {/* Top bar — matches Code Challenge style */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack}
          className="text-sm font-medium transition-opacity hover:opacity-60 flex items-center gap-1.5"
          style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to level
        </button>
        <div className="flex items-center gap-2">
          {/* Dice */}
          <button onClick={onRandom}
            title="Random question"
            className="p-2 rounded-lg border transition-all hover:bg-[var(--bg-raised)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <Dices className="w-4 h-4" />
          </button>
          {/* Reset */}
          <button onClick={() => { if(window.confirm('Reset to starter code?')){setCode(question.starterCode[language]);setTestResults(null);setError('');setSubmitted(false);}}}
            className="p-2 rounded-lg border transition-all hover:bg-[var(--bg-raised)]"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Question counter dots — exactly like Code Challenge */}
      <div className="mb-1">
        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>
          Code Challenge
        </div>
        <div className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
          Question {questionIdx + 1} of {totalQuestions}
        </div>
        <div className="flex gap-1.5 mb-6">
          {questions.map((q, i) => (
            <div key={q.id} className="w-2.5 h-2.5 rounded-full transition-all"
              style={{
                background: i === questionIdx
                  ? 'var(--accent)'
                  : progress.solvedIds.includes(q.id)
                    ? 'var(--success)'
                    : 'var(--bg-raised)',
                border: i === questionIdx ? 'none' : '1.5px solid var(--border)',
              }} />
          ))}
        </div>
      </div>

      {/* Task card — like Code Challenge YOUR TASK */}
      <motion.div key={`q-${question.id}`} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
        className="p-5 rounded-xl border mb-3" style={{ borderColor:'var(--border)', background:'var(--bg-surface)' }}>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
          style={{ color:'var(--text-muted)' }}>
          📝 Your task
          {isSolved && <span className="ml-auto flex items-center gap-1 text-[var(--success)]"><CheckCircle2 className="w-3 h-3" /> Solved</span>}
        </div>
        <p className="text-[15px] font-medium leading-relaxed" style={{ color:'var(--text-primary)' }}>
          {/* Render first line of description as the task */}
          {question.description.split('\n')[0].replace(/\*\*/g,'').replace(/`/g,'').replace(/^\s+/,'')}
        </p>
      </motion.div>

      {/* Info bar — like Code Challenge */}
      <div className="px-3 py-2 rounded-lg text-xs mb-4" style={{ background:'var(--bg-raised)', color:'var(--text-muted)' }}>
        ℹ Write your code in the editor below. Your function must return a value — not print it.
      </div>

      {/* Language tabs — like Code Challenge */}
      <div className="flex gap-2 mb-4">
        {CLASSROOM_LANGUAGES.slice(0, 2).map(lang => (
          <div key={lang.id}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold border transition-all",
              language === lang.id
                ? "bg-[var(--bg-raised)] text-[var(--text-primary)] border-[var(--border)]"
                : "text-[var(--text-muted)] border-transparent"
            )}>
            {lang.label}
          </div>
        ))}
      </div>

      {/* Code editor */}
      <div className="rounded-xl overflow-hidden border mb-4" style={{ borderColor:'var(--border)' }}>
        <div className="relative flex font-mono text-[13px] leading-[1.7]" style={{ background:'#0E0E18' }}>
          <div className="w-[42px] shrink-0 py-4 pr-3 text-right select-none border-r text-[11px]"
            style={{ background:'#0A0A12', borderColor:'#1E1B2E', color:'#3D3B5A' }}>
            {code.split('\n').map((_,i) => <div key={i} className="min-h-[1.7em]">{i+1}</div>)}
          </div>
          <div className="relative flex-1">
            <textarea ref={textareaRef} value={code} onChange={e=>setCode(e.target.value)} onKeyDown={handleKeyDown}
              spellCheck={false}
              className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre font-mono text-[13px] leading-[1.7] z-10"
              style={{ minHeight:'140px', WebkitTextFillColor:'transparent' }} />
            <pre className="w-full p-4 pointer-events-none whitespace-pre-wrap m-0 font-mono text-[13px] leading-[1.7]" aria-hidden>
              {highlight(code, language)}
            </pre>
          </div>
        </div>
        <div className="px-4 py-1.5 flex justify-between border-t" style={{ background:'#0A0A12', borderColor:'#1E1B2E' }}>
          <span className="font-mono text-[10px]" style={{ color:'#2D2B4E' }}>⌘+Enter to run</span>
          <span className="font-mono text-[10px]" style={{ color:'#2D2B4E' }}>Tab to indent</span>
        </div>
      </div>

      {/* Bottom action bar — Hints · AI Review · Run Code */}
      <div className="flex items-center gap-2 mb-4">
        {question.hints.map((_,i) => (
          <button key={i} onClick={() => setHintsShown(Math.max(hintsShown, i+1))} disabled={hintsShown > i}
            className={cn("px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all",
              hintsShown > i ? "opacity-40 line-through" : "hover:bg-[var(--bg-raised)]")}
            style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
            <Lightbulb className="w-3 h-3" /> Hint {i+1}
          </button>
        ))}
        <button onClick={getAiReview} disabled={isReviewing}
          className="px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all hover:bg-[var(--bg-raised)]"
          style={{ borderColor:'var(--border)', color:'var(--text-muted)' }}>
          {isReviewing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          AI Review
        </button>
        <div className="flex-1" />
        <button onClick={runCode} disabled={isRunning||isReviewing}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
          style={{ background:'var(--accent)' }}>
          {isRunning||isReviewing
            ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
            : <><Play className="w-4 h-4 fill-current" />Run Code</>}
        </button>
      </div>

      {/* Hints — revealed one at a time */}
      <AnimatePresence>
        {hintsShown > 0 && (
          <motion.div initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }} exit={{ height:0,opacity:0 }} className="overflow-hidden mb-3">
            <div className="p-4 rounded-xl border space-y-2" style={{ borderColor:'var(--border)', background:'var(--bg-surface)' }}>
              {question.hints.slice(0, hintsShown).map((hint, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color:'var(--accent)' }} />
                  <p style={{ color:'var(--text-primary)' }}>{hint}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Review */}
      <AnimatePresence>
        {aiReview && (
          <motion.div initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0 }}
            className="mb-3 p-4 rounded-xl border" style={{ borderColor:'var(--border)', background:'var(--bg-surface)' }}>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color:'var(--accent)' }} />
              <span className="text-xs font-bold" style={{ color:'var(--accent)' }}>AI Feedback</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color:'var(--text-primary)' }}>{aiReview}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="mb-3 p-3 rounded-xl border font-mono text-xs"
          style={{ borderColor:'var(--danger)', color:'var(--danger)', background:`color-mix(in srgb, var(--danger) 5%, transparent)` }}>
          {error}
        </div>
      )}

      {/* Test results */}
      <AnimatePresence>
        {testResults && (
          <motion.div initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>
                {testResults.filter(r=>r.passed).length} / {testResults.length} tests passed
              </span>
              {allPassed && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{ background:`color-mix(in srgb, var(--success) 12%, transparent)`, color:'var(--success)' }}>
                  ✓ All passed
                </span>
              )}
            </div>

            {testResults.map((r,i) => (
              <div key={i} className="p-3 rounded-xl border font-mono text-xs"
                style={{
                  borderColor: r.passed?'var(--success)':'var(--danger)',
                  background: r.passed?`color-mix(in srgb, var(--success) 5%, transparent)`:`color-mix(in srgb, var(--danger) 5%, transparent)`
                }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color:'var(--text-muted)' }}>Test {i+1}</span>
                  {r.passed ? <CheckCircle2 className="w-4 h-4" style={{ color:'var(--success)' }} /> : <XCircle className="w-4 h-4" style={{ color:'var(--danger)' }} />}
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div><div className="mb-0.5" style={{ color:'var(--text-muted)' }}>Input</div><div style={{ color:'var(--text-primary)' }}>{r.input||'(none)'}</div></div>
                  <div><div className="mb-0.5" style={{ color:'var(--text-muted)' }}>Expected</div><div style={{ color:'var(--success)' }}>{r.expected}</div></div>
                  <div><div className="mb-0.5" style={{ color:'var(--text-muted)' }}>Got</div><div style={{ color:r.passed?'var(--success)':'var(--danger)' }}>{r.actual}</div></div>
                </div>
              </div>
            ))}

            {/* Submit + Next */}
            {!submitted ? (
              <button onClick={handleSubmit}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ background: allPassed?'var(--success)':'var(--accent)' }}>
                {allPassed ? <><CheckCircle2 className="w-4 h-4"/>Submit Solution</> : <>Submit Anyway →</>}
              </button>
            ) : (
              <div className="space-y-2">
                <div className="w-full py-3 rounded-xl text-center text-sm font-bold flex items-center justify-center gap-2"
                  style={{ background:`color-mix(in srgb, ${allPassed?'var(--success)':'var(--accent)'} 10%, transparent)`, color: allPassed?'var(--success)':'var(--accent)' }}>
                  {allPassed ? <><CheckCircle2 className="w-4 h-4"/>Solution submitted!</> : <>Submitted — keep practicing!</>}
                </div>
                {questionIdx < totalQuestions - 1 ? (
                  <button onClick={onNext}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all hover:bg-[var(--bg-raised)]"
                    style={{ borderColor:'var(--border)', color:'var(--text-primary)' }}>
                    Next Question <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={onBack}
                    className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border transition-all hover:bg-[var(--bg-raised)]"
                    style={{ borderColor:'var(--border)', color:'var(--text-primary)' }}>
                    <ArrowLeft className="w-4 h-4" /> Back to levels
                  </button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export function ClassroomPage() {
  const {
    step, setStep, language,
    selectLanguage, selectLevel,
    questions, questionIdx, goToQuestion,
    currentQuestion, progress, submitAnswer,
  } = useClassroom();

  const handleRandom = () => {
    const randomIdx = Math.floor(Math.random() * questions.length);
    goToQuestion(randomIdx);
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background:'var(--bg-base)' }}>
      <AnimatePresence mode="wait">
        {step === 'language' && (
          <motion.div key="lang" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <LanguageStep onSelect={selectLanguage} progress={progress} />
          </motion.div>
        )}
        {step === 'level' && (
          <motion.div key="level" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <LevelStep language={language} onSelect={selectLevel} onBack={() => setStep('language')} progress={progress} />
          </motion.div>
        )}
        {step === 'coding' && currentQuestion && (
          <motion.div key="coding" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
            <CodingStep
              question={currentQuestion}
              questions={questions}
              language={language}
              questionIdx={questionIdx}
              totalQuestions={questions.length}
              onPrev={() => goToQuestion(questionIdx - 1)}
              onNext={() => goToQuestion(questionIdx + 1)}
              onBack={() => setStep('level')}
              onSubmit={submitAnswer}
              onRandom={handleRandom}
              progress={progress}
            />
          </motion.div>
        )}
        {step === 'coding' && !currentQuestion && (
          <motion.div key="empty" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="max-w-xl mx-auto px-6 py-20 text-center">
            <p className="font-bold mb-4" style={{ color:'var(--text-muted)' }}>No problems for this level yet.</p>
            <button onClick={() => setStep('level')}
              className="px-5 py-2.5 rounded-xl font-bold text-white text-sm" style={{ background:'var(--accent)' }}>
              ← Pick another level
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}