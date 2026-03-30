// src/features/classroom/components/DiceQuestion.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dices, Loader2, X, Play, CheckCircle2, XCircle, Lightbulb } from 'lucide-react';
import { ClassroomLanguage, ClassroomDifficulty } from '@/src/types/classroom';

interface GeneratedQuestion {
  title: string;
  description: string;
  functionName: string;
  starterCode: string;
  testCases: { input: string; expected: string }[];
  hints: string[];
  explanation: string;
}

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

function highlight(code: string) {
  return code.split('\n').map((line, i) => {
    const tokens = line.split(/(\s+|[(){}[\]=+\-*/.,:;<>!&|]+|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|\b\d+\b)/g).filter(Boolean);
    return (
      <div key={i} className="min-h-[1.7em]">
        {tokens.map((tok, j) => {
          let color = '#c8c5d9';
          const kw = /^(function|return|if|else|for|while|const|let|var|new|true|false|null|undefined|typeof|of|in)$/;
          if (tok.match(kw)) color = '#9B8AE8';
          else if (tok.startsWith('"') || tok.startsWith("'") || tok.startsWith('`')) color = '#7EC8A0';
          else if (tok.startsWith('//')) color = '#4D4A6E';
          else if (tok.match(/^\d+$/)) color = '#E8B96C';
          return <span key={j} style={{ color }}>{tok}</span>;
        })}
      </div>
    );
  });
}

export function DiceQuestion({ language, difficulty, onClose }: {
  language: ClassroomLanguage;
  difficulty: ClassroomDifficulty;
  onClose: () => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [question, setQuestion] = useState<GeneratedQuestion | null>(null);
  const [code, setCode] = useState('');
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [generated, setGenerated] = useState(false);

  const generateQuestion = async () => {
    setIsGenerating(true);
    setQuestion(null);
    setCode('');
    setTestResults(null);
    setError('');
    setHintsShown(0);

    const diffLabel = difficulty === 'easy' ? 'beginner' : difficulty === 'medium' ? 'intermediate' : 'advanced';

    const prompt = `Generate a ${diffLabel} ${language} coding challenge. Reply ONLY with valid JSON, no markdown, no explanation.

Format:
{
  "title": "Problem Name",
  "description": "Clear one-paragraph description of what the function should do. Include 1-2 examples with Input/Output.",
  "functionName": "camelCaseFunctionName",
  "starterCode": "function camelCaseFunctionName(param) {\\n  // your solution\\n}",
  "testCases": [
    {"input": "param1, param2", "expected": "expectedOutput"},
    {"input": "param1, param2", "expected": "expectedOutput"},
    {"input": "param1, param2", "expected": "expectedOutput"}
  ],
  "hints": [
    "First hint that doesn't give away the answer",
    "Second hint that's more specific"
  ],
  "explanation": "One sentence describing the optimal approach"
}

Rules:
- testCases inputs must be valid JSON values separated by commas
- expected must be the JSON.stringify of the return value
- starterCode must use the exact functionName
- Make it a realistic coding interview problem
- difficulty: ${diffLabel}`;

    try {
      const r = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 800 }),
      });

      if (!r.ok) throw new Error('API failed');
      const d = await r.json();
      const text = d.text || '';

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not parse question');

      const parsed: GeneratedQuestion = JSON.parse(jsonMatch[0]);
      if (!parsed.title || !parsed.functionName || !parsed.testCases) throw new Error('Invalid question format');

      setQuestion(parsed);
      setCode(parsed.starterCode);
      setGenerated(true);
    } catch (e: any) {
      setError('Could not generate question. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const runCode = () => {
    if (!question || isRunning) return;
    setIsRunning(true);
    setTestResults(null);
    setError('');

    const res: TestResult[] = [];
    for (const tc of question.testCases) {
      try {
        const getter = new Function(`${code};\nreturn typeof ${question.functionName}!=='undefined'?${question.functionName}:null`);
        const fn = getter();
        if (!fn) throw new Error(`Function "${question.functionName}" not found.`);
        const args = tc.input ? tc.input.split(',').map(s => { try { return JSON.parse(s.trim()); } catch { return s.trim().replace(/^['"]|['"]$/g,''); } }) : [];
        const result = fn(...args);
        const actual = JSON.stringify(result) ?? String(result);
        const passed = actual.replace(/\s/g,'') === tc.expected.replace(/\s/g,'') || String(result) === tc.expected;
        res.push({ input: tc.input, expected: tc.expected, actual: String(result), passed });
      } catch(e: any) {
        res.push({ input: tc.input, expected: tc.expected, actual: 'Error', passed: false });
        setError(e.message);
      }
    }
    setTestResults(res);
    setIsRunning(false);
  };

  const allPassed = testResults?.every(r => r.passed) ?? false;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-2xl rounded-2xl border overflow-hidden"
        style={{ background: 'var(--bg-base)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>AI Challenge</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full capitalize"
              style={{ background: 'color-mix(in srgb, var(--accent) 12%, transparent)', color: 'var(--accent)' }}>
              {language} · {difficulty}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--bg-raised)] transition-colors">
            <X className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Generate button */}
          {!generated && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }}>
                <Dices className="w-8 h-8" style={{ color: 'var(--accent)' }} />
              </div>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Roll the dice to get a fresh AI-generated {difficulty} challenge in {language}
              </p>
              <button
                onClick={generateQuestion}
                disabled={isGenerating}
                className="px-8 py-3 rounded-xl text-sm font-bold text-white flex items-center gap-2 mx-auto transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'var(--accent)' }}
              >
                {isGenerating
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Generating...</>
                  : <><Dices className="w-4 h-4" />Roll the Dice</>}
              </button>
            </div>
          )}

          {/* Error state */}
          {error && !question && (
            <div className="p-3 rounded-xl border text-xs font-mono"
              style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 5%, transparent)' }}>
              {error}
              <button onClick={generateQuestion} className="ml-2 underline">Try again</button>
            </div>
          )}

          {/* Generated question */}
          {question && (
            <>
              {/* Question card */}
              <div className="p-5 rounded-xl border" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                  📝 Your task
                </div>
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{question.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{question.description}</p>
                <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Approach</div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{question.explanation}</p>
                </div>
              </div>

              {/* Info bar */}
              <div className="px-3 py-2 rounded-lg text-xs" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                ℹ Your function must be named <code className="font-mono" style={{ color: 'var(--accent)' }}>{question.functionName}</code> and return a value.
              </div>

              {/* Editor */}
              <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
                <div className="relative flex font-mono text-[13px] leading-[1.7]" style={{ background: '#0E0E18' }}>
                  <div className="w-[42px] shrink-0 py-4 pr-3 text-right select-none border-r text-[11px]"
                    style={{ background: '#0A0A12', borderColor: '#1E1B2E', color: '#3D3B5A' }}>
                    {code.split('\n').map((_, i) => <div key={i} className="min-h-[1.7em]">{i + 1}</div>)}
                  </div>
                  <div className="relative flex-1">
                    <textarea
                      value={code}
                      onChange={e => setCode(e.target.value)}
                      spellCheck={false}
                      className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre font-mono text-[13px] leading-[1.7] z-10"
                      style={{ minHeight: '140px', WebkitTextFillColor: 'transparent' }}
                    />
                    <pre className="w-full p-4 pointer-events-none whitespace-pre-wrap m-0 font-mono text-[13px] leading-[1.7]" aria-hidden>
                      {highlight(code)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Hints */}
                {question.hints.map((_, i) => (
                  <button key={i}
                    onClick={() => setHintsShown(Math.max(hintsShown, i + 1))}
                    disabled={hintsShown > i}
                    className="px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all hover:bg-[var(--bg-raised)] disabled:opacity-40 disabled:line-through"
                    style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                    <Lightbulb className="w-3 h-3" /> Hint {i + 1}
                  </button>
                ))}
                <div className="flex-1" />
                {/* Roll again */}
                <button onClick={generateQuestion} disabled={isGenerating}
                  className="px-3 py-2 rounded-lg text-xs font-bold border flex items-center gap-1.5 transition-all hover:bg-[var(--bg-raised)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                  <Dices className="w-3 h-3" /> New question
                </button>
                <button onClick={runCode} disabled={isRunning}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--accent)' }}>
                  {isRunning ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</> : <><Play className="w-4 h-4 fill-current" />Run Code</>}
                </button>
              </div>

              {/* Hints */}
              {hintsShown > 0 && (
                <div className="p-4 rounded-xl border space-y-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
                  {question.hints.slice(0, hintsShown).map((hint, i) => (
                    <div key={i} className="flex gap-2 text-sm">
                      <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                      <p style={{ color: 'var(--text-primary)' }}>{hint}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Runtime error */}
              {error && (
                <div className="p-3 rounded-xl border font-mono text-xs"
                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 5%, transparent)' }}>
                  {error}
                </div>
              )}

              {/* Test results */}
              {testResults && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      {testResults.filter(r => r.passed).length} / {testResults.length} tests passed
                    </span>
                    {allPassed && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                        style={{ background: 'color-mix(in srgb, var(--success) 12%, transparent)', color: 'var(--success)' }}>
                        ✓ All passed!
                      </span>
                    )}
                  </div>
                  {testResults.map((r, i) => (
                    <div key={i} className="p-3 rounded-xl border font-mono text-xs"
                      style={{
                        borderColor: r.passed ? 'var(--success)' : 'var(--danger)',
                        background: r.passed ? 'color-mix(in srgb, var(--success) 5%, transparent)' : 'color-mix(in srgb, var(--danger) 5%, transparent)',
                      }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Test {i + 1}</span>
                        {r.passed ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--success)' }} /> : <XCircle className="w-4 h-4" style={{ color: 'var(--danger)' }} />}
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        <div><div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Input</div><div style={{ color: 'var(--text-primary)' }}>{r.input || '(none)'}</div></div>
                        <div><div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Expected</div><div style={{ color: 'var(--success)' }}>{r.expected}</div></div>
                        <div><div className="mb-0.5" style={{ color: 'var(--text-muted)' }}>Got</div><div style={{ color: r.passed ? 'var(--success)' : 'var(--danger)' }}>{r.actual}</div></div>
                      </div>
                    </div>
                  ))}
                  {allPassed && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="w-full py-4 rounded-xl text-center font-bold"
                      style={{ background: 'color-mix(in srgb, var(--success) 10%, transparent)', color: 'var(--success)' }}>
                      🎉 Challenge complete! Great work.
                    </motion.div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}