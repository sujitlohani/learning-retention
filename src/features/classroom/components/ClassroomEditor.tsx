// src/features/classroom/components/ClassroomEditor.tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, XCircle, Lightbulb, RotateCcw, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ClassroomQuestion, ClassroomLanguage } from '@/src/lib/classroom-question-bank';
import { runJavaScript } from '@/src/lib/code-runner';

interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

interface ClassroomEditorProps {
  question: ClassroomQuestion;
  language: ClassroomLanguage;
  onSubmit: (code: string, passed: boolean) => void;
}

function highlightCode(code: string, language: ClassroomLanguage): React.ReactNode[] {
  const lines = code.split('\n');
  return lines.map((line, i) => {
    const tokens = line.split(/(\s+|[(){}[\]=+\-*/.,:;<>!&|]+|"[^"]*"|'[^']*'|`[^`]*`|\/\/.*|#.*|\d+)/g).filter(Boolean);
    return (
      <div key={i} className="min-h-[1.7em]">
        {tokens.map((token, j) => {
          let color = '#c8c5d9';
          const jsKeywords = /^(function|return|if|else|for|while|const|let|var|import|from|class|new|this|typeof|instanceof|true|false|null|undefined|async|await|export|default|switch|case|break|continue|throw|try|catch|finally|of|in)$/;
          const pyKeywords = /^(def|class|return|if|elif|else|for|while|import|from|as|with|pass|None|True|False|and|or|not|in|is|lambda|yield|global|nonlocal|del|raise|try|except|finally|self)$/;
          const cKeywords = /^(int|float|double|char|void|return|if|else|for|while|struct|typedef|include|define|const|static|long|short|unsigned|signed|bool|true|false|null|NULL|break|continue|switch|case|default)$/;

          if (language === 'python' ? token.match(pyKeywords) : token.match(language === 'c' || language === 'cpp' ? cKeywords : jsKeywords)) {
            color = '#9B8AE8';
          } else if (token.match(/^["'`].*["'`]$/) || (token.startsWith('"') || token.startsWith("'"))) {
            color = '#7EC8A0';
          } else if (token.match(/^(\/\/|#)/) || token.startsWith('//') || token.startsWith('#')) {
            color = '#4D4A6E';
          } else if (token.match(/^\d+(\.\d+)?$/)) {
            color = '#E8B96C';
          } else if (token.match(/^[A-Z][a-zA-Z]+$/)) {
            color = '#6CB8E8';
          }
          return <span key={j} style={{ color }}>{token}</span>;
        })}
      </div>
    );
  });
}

export function ClassroomEditor({ question, language, onSubmit }: ClassroomEditorProps) {
  const [code, setCode] = useState(question.starterCode[language] || '');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [hintsShown, setHintsShown] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [isGettingReview, setIsGettingReview] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef(Date.now());

  // Reset when question or language changes
  useEffect(() => {
    setCode(question.starterCode[language] || '');
    setTestResults(null);
    setOutput('');
    setError('');
    setHintsShown(0);
    setShowSolution(false);
    setAiReview('');
    setHasSubmitted(false);
    startTimeRef.current = Date.now();
  }, [question.id, language]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.max(300, textareaRef.current.scrollHeight) + 'px';
    }
  }, [code]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const indent = (language === 'python') ? '    ' : '  ';
      setCode(code.substring(0, start) + indent + code.substring(end));
      requestAnimationFrame(() => {
        target.selectionStart = target.selectionEnd = start + indent.length;
      });
    }
    // Ctrl+Enter to run
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTestResults(null);
    setOutput('');
    setError('');

    try {
      if (language === 'javascript' || language === 'typescript') {
        // Run JS in-browser
        const results: TestResult[] = [];
        let allOutput = '';

        for (const tc of question.testCases) {
          try {
            const wrappedCode = `${code}\n// test\ntry { JSON.stringify(typeof solution !== 'undefined' ? solution : undefined) } catch(e) {}`;
            // Evaluate code and call the function
            const fn = new Function(`${code}; return typeof solution !== 'undefined' ? solution : (typeof twoSum !== 'undefined' ? twoSum : (typeof search !== 'undefined' ? search : (typeof maxSubArray !== 'undefined' ? maxSubArray : (typeof isPalindrome !== 'undefined' ? isPalindrome : (typeof fib !== 'undefined' ? fib : (typeof reverseString !== 'undefined' ? reverseString : null))))))`);
            const solutionFn = fn();
            if (!solutionFn) throw new Error('No solution function found');

            // Parse the input
            const inputArgs = tc.input ? tc.input.split(',').map(s => {
              try { return JSON.parse(s.trim()); } catch { return s.trim().replace(/^['"]|['"]$/g, ''); }
            }) : [];

            const result = solutionFn(...inputArgs);
            const actual = JSON.stringify(result) ?? String(result);
            const expected = tc.expectedOutput;
            const passed = actual.replace(/\s/g, '') === expected.replace(/\s/g, '') ||
                          String(result) === expected;

            results.push({ input: tc.input, expected, actual: String(result), passed });
            if (results.length === 1) allOutput = String(result);
          } catch (e: any) {
            results.push({ input: tc.input, expected: tc.expectedOutput, actual: 'Error', passed: false });
            setError(e.message);
          }
        }

        setTestResults(results);
        setOutput(allOutput);
      } else {
        // For non-JS languages, AI evaluates the logic
        setOutput('AI is evaluating your code...');
        await getAIReview(true);
      }
    } catch (e: any) {
      setError(e.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const getAIReview = async (isEvaluation = false) => {
    setIsGettingReview(true);
    try {
      const prompt = isEvaluation
        ? `You are a code evaluator. The user is solving this problem:

"${question.title}"

${question.description}

Test cases:
${question.testCases.map((tc, i) => `${i + 1}. Input: ${tc.input} → Expected: ${tc.expectedOutput}`).join('\n')}

User's ${language} code:
\`\`\`${language}
${code}
\`\`\`

Evaluate if this code is correct. Reply in this exact format:
VERDICT: PASS or FAIL
EXPLANATION: (1-2 sentences why)
SUGGESTION: (one improvement if FAIL, empty if PASS)`
        : `You are a helpful coding mentor. Review this ${language} code for the problem "${question.title}":

\`\`\`${language}
${code}
\`\`\`

Give brief, constructive feedback in 2-3 sentences. Focus on: correctness, efficiency, and style. Be encouraging.`;

      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.text || '';
        setAiReview(text);

        if (isEvaluation) {
          const passed = text.includes('VERDICT: PASS');
          const fakeResults: TestResult[] = question.testCases.map(tc => ({
            input: tc.input,
            expected: tc.expectedOutput,
            actual: passed ? tc.expectedOutput : '?',
            passed,
          }));
          setTestResults(fakeResults);
        }
      }
    } catch (e) {
      setAiReview('Unable to get AI review right now.');
    } finally {
      setIsGettingReview(false);
    }
  };

  const allPassed = testResults?.every(r => r.passed) ?? false;

  const handleSubmit = () => {
    setHasSubmitted(true);
    onSubmit(code, allPassed);
  };

  const handleReset = () => {
    if (window.confirm('Reset your code to the starter template?')) {
      setCode(question.starterCode[language] || '');
      setTestResults(null);
      setOutput('');
      setError('');
    }
  };

  return (
    <div className="flex flex-col h-full gap-0">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <span className="text-xs font-mono ml-2" style={{ color: 'var(--text-muted)' }}>
            solution.{language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'python' ? 'py' : language === 'java' ? 'java' : language === 'cpp' ? 'cpp' : language === 'go' ? 'go' : language === 'rust' ? 'rs' : 'c'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-1.5 rounded-md hover:bg-[var(--bg-raised)] transition-colors"
            title="Reset code"
          >
            <RotateCcw className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Code Editor */}
      <div className="relative flex font-mono text-[13px] leading-[1.7] flex-1 min-h-[300px]" style={{ background: '#0E0E16' }}>
        {/* Line Numbers */}
        <div className="w-[42px] shrink-0 text-right pr-3 py-4 select-none border-r border-[#1E1D30] text-[#3D3B5A] bg-[#0A0A10] overflow-hidden">
          {code.split('\n').map((_, i) => (
            <div key={i} className="min-h-[1.7em] text-[11px]">{i + 1}</div>
          ))}
        </div>

        {/* Textarea & Highlight overlay */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-white resize-none outline-none whitespace-pre font-mono text-[13px] leading-[1.7] z-10"
            style={{ minHeight: '300px' }}
          />
          <pre className="absolute inset-0 w-full h-full p-4 pointer-events-none whitespace-pre-wrap m-0 font-mono text-[13px] leading-[1.7]" aria-hidden="true">
            {highlightCode(code, language)}
          </pre>
        </div>
      </div>

      {/* Keyboard shortcut hint */}
      <div className="px-4 py-1.5 border-t flex items-center justify-between" style={{ borderColor: 'var(--border)', background: '#0A0A10' }}>
        <span className="text-[10px] font-mono" style={{ color: '#3D3B5A' }}>
          {navigator?.platform?.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to run
        </span>
        <span className="text-[10px] font-mono" style={{ color: '#3D3B5A' }}>Tab to indent</span>
      </div>

      {/* Hints */}
      {question.hints.length > 0 && (
        <div className="px-4 py-2 border-t flex flex-wrap gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
          {question.hints.map((_, i) => (
            <button
              key={i}
              onClick={() => setHintsShown(Math.max(hintsShown, i + 1))}
              disabled={hintsShown > i}
              className={cn(
                "px-3 py-1 text-xs font-bold rounded-lg border transition-all flex items-center gap-1.5",
                hintsShown > i
                  ? "opacity-40 border-[var(--border)] text-[var(--text-muted)] line-through"
                  : "border-[var(--warning)] text-[var(--warning)] hover:bg-[var(--warning)]/10"
              )}
            >
              <Lightbulb className="w-3 h-3" />
              Hint {i + 1}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {hintsShown > 0 && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 py-3 border-t border-[var(--warning)]/30 bg-[var(--warning)]/5 space-y-2">
              {question.hints.slice(0, hintsShown).map((hint, i) => (
                <div key={i} className="flex gap-2 text-sm">
                  <Lightbulb className="w-4 h-4 shrink-0 text-[var(--warning)] mt-0.5" />
                  <p style={{ color: 'var(--text-primary)' }}>{hint}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Bar */}
      <div className="px-4 py-3 border-t flex items-center gap-2" style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}>
        <button
          onClick={() => setShowSolution(!showSolution)}
          className="px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showSolution ? 'Hide' : 'View'} Solution
        </button>

        <button
          onClick={() => getAIReview(false)}
          disabled={isGettingReview}
          className="px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5"
          style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
        >
          {isGettingReview ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          AI Review
        </button>

        <div className="flex-1" />

        <button
          onClick={handleRun}
          disabled={isRunning}
          className="px-5 py-2 rounded-lg text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          style={{ background: 'var(--accent)' }}
        >
          {isRunning
            ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</>
            : <><Play className="w-4 h-4 fill-current" />Run Code</>}
        </button>
      </div>

      {/* Solution View */}
      <AnimatePresence>
        {showSolution && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#0A0A10' }}>
                <Eye className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span className="text-xs font-bold text-[var(--accent)]">Reference Solution</span>
              </div>
              <pre className="p-4 text-[12px] font-mono leading-[1.7] overflow-x-auto whitespace-pre-wrap" style={{ background: '#0E0E16', color: '#7EC8A0' }}>
                {question.solution[language]}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Review */}
      <AnimatePresence>
        {aiReview && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mx-4 mb-3 p-3 rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/5">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
              <span className="text-xs font-bold text-[var(--accent)]">AI Feedback</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}>{aiReview}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {testResults && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-t" style={{ borderColor: 'var(--border)' }}>
            {/* Output Console */}
            {(output || error) && (
              <div className="border-b font-mono" style={{ borderColor: 'var(--border)', background: '#0A0A10' }}>
                <div className="px-4 py-1.5 border-b border-[#1E1D30] flex items-center">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#8B8B9B]">Console</span>
                </div>
                <div className={cn("px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap", error ? "text-red-400" : "text-[#c8c5d9]")}>
                  {error || output}
                </div>
              </div>
            )}

            {/* Test Cases */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Test Cases — {testResults.filter(r => r.passed).length}/{testResults.length} Passed
                </span>
                {allPassed && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[var(--success)]/15 text-[var(--success)]">
                    ✓ All Passed
                  </span>
                )}
              </div>

              {testResults.map((result, i) => (
                <div
                  key={i}
                  className={cn(
                    "p-3 rounded-lg border text-xs font-mono",
                    result.passed
                      ? "border-[var(--success)]/30 bg-[var(--success)]/5"
                      : "border-[var(--danger)]/30 bg-[var(--danger)]/5"
                  )}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Test {i + 1}
                    </span>
                    {result.passed
                      ? <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                      : <XCircle className="w-4 h-4 text-[var(--danger)]" />}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <div className="text-[var(--text-muted)] mb-0.5">Input</div>
                      <div style={{ color: 'var(--text-primary)' }}>{result.input || '(none)'}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-0.5">Expected</div>
                      <div style={{ color: 'var(--success)' }}>{result.expected}</div>
                    </div>
                    <div>
                      <div className="text-[var(--text-muted)] mb-0.5">Got</div>
                      <div style={{ color: result.passed ? 'var(--success)' : 'var(--danger)' }}>{result.actual}</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit */}
              {!hasSubmitted && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleSubmit}
                  className="w-full mt-3 py-3 rounded-xl text-[15px] font-black tracking-wide transition-all hover:-translate-y-[1px] flex items-center justify-center gap-2"
                  style={{ background: allPassed ? 'var(--success)' : 'var(--accent)', color: '#fff' }}
                >
                  {allPassed ? <><CheckCircle2 className="w-5 h-5" />Submit Solution</> : <>Submit Anyway</>}
                </motion.button>
              )}

              {hasSubmitted && (
                <div className="w-full mt-3 py-3 rounded-xl text-center text-sm font-bold" style={{ background: 'var(--bg-raised)', color: 'var(--text-muted)' }}>
                  ✓ Submitted — pick the next question from the list
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}