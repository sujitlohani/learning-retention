'use client';
// src/features/classroom/hooks/useClassroom.ts
// OWNER: Suv

import { useState, useCallback, useEffect } from 'react';
import { ClassroomLanguage, ClassroomDifficulty, ClassroomQuestion } from '@/src/types/classroom';
import { classroomQuestions as staticQuestions } from '@/src/lib/classroom-question-bank';
import { classroomService } from '../services/classroom.service';

export type ClassroomStep = 'language' | 'level' | 'coding';
export type QuestionsState = 'idle' | 'loading' | 'ready' | 'error';

export function useClassroom() {
  // ── Load progress into state properly (fixes reload bug) ─────────────────
  const [progress, setProgress] = useState(() => classroomService.getProgress());
  const [step, setStep]             = useState<ClassroomStep>('language');
  const [language, setLanguage]     = useState<ClassroomLanguage>(() => classroomService.getProgress().preferredLanguage);
  const [difficulty, setDifficulty] = useState<ClassroomDifficulty>(() => classroomService.getProgress().preferredDifficulty);
  const [questionIdx, setQuestionIdx] = useState(0);

  // ── AI question state ─────────────────────────────────────────────────────
  const [questions, setQuestions]           = useState<ClassroomQuestion[]>([]);
  const [questionsState, setQuestionsState] = useState<QuestionsState>('idle');
  const [questionsError, setQuestionsError] = useState('');

  // Reload from localStorage on mount so progress survives page refresh
  useEffect(() => {
    setProgress(classroomService.getProgress());
  }, []);

  // ── AI question generation ────────────────────────────────────────────────
  const generateQuestions = useCallback(async (lang: ClassroomLanguage, diff: ClassroomDifficulty) => {
    setQuestionsState('loading');
    setQuestionsError('');
    setQuestions([]);
    setQuestionIdx(0);

    const langSyntax: Record<ClassroomLanguage, string> = {
      javascript: 'function functionName(params) { // your solution }',
      typescript: 'function functionName(params): returnType { // your solution }',
      python: 'def function_name(params):\n    pass',
      java: 'public returnType methodName(params) { // your solution }',
      c: 'returnType function_name(params) { // your solution }',
      cpp: 'returnType functionName(params) { // your solution }',
    };

    const prompt = `You are a coding challenge generator. Generate exactly 3 unique ${diff} level coding problems for ${lang}.

Reply ONLY with a valid JSON array. No explanation, no markdown, no backticks. Just the raw JSON array:
[
  {
    "id": "unique-kebab-case-id",
    "title": "Problem Title",
    "description": "Clear description of what the function should do with one example.",
    "difficulty": "${diff}",
    "category": "Topic",
    "tags": ["tag1"],
    "starterCode": "${langSyntax[lang].replace(/"/g, '\\"')}",
    "solution": "complete working solution in ${lang}",
    "testCases": [
      {"input": "param1, param2", "expectedOutput": "returnValue"},
      {"input": "param1, param2", "expectedOutput": "returnValue"},
      {"input": "param1, param2", "expectedOutput": "returnValue"}
    ],
    "hints": ["gentle hint", "specific hint"],
    "explanation": "one sentence approach"
  }
]
Rules: all 3 must be different topics. starterCode and solution must be valid ${lang}. testCase inputs must match function params. expectedOutput must be exact return value as string.`;

    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, maxTokens: 2000 }),
      });

      if (!response.ok) throw new Error('API failed');

      const data = await response.json();
      const text: string = data.text ?? '';

      // Extract the JSON array from AI response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error('No JSON found');

      const parsed = JSON.parse(jsonMatch[0]) as ClassroomQuestion[];
      if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty response');

      // Normalize to ensure all fields exist
      const normalized: ClassroomQuestion[] = parsed.map((q, i) => ({
        id: q.id || `ai-${lang}-${diff}-${i}-${Date.now()}`,
        title: q.title || `Problem ${i + 1}`,
        description: q.description || '',
        difficulty: diff,
        category: q.category || 'General',
        tags: Array.isArray(q.tags) ? q.tags : [],
        starterCode: {
          javascript: lang === 'javascript' ? String(q.starterCode) : `// Open in JavaScript to solve`,
          typescript: lang === 'typescript' ? String(q.starterCode) : `// Open in TypeScript to solve`,
          python:     lang === 'python'     ? String(q.starterCode) : `# Open in Python to solve`,
          java:       lang === 'java'       ? String(q.starterCode) : `// Open in Java to solve`,
          c:          lang === 'c'          ? String(q.starterCode) : `// Open in C to solve`,
          cpp:        lang === 'cpp'        ? String(q.starterCode) : `// Open in C++ to solve`,
        },
        solution: {
          javascript: lang === 'javascript' ? String(q.solution ?? '') : '',
          typescript: lang === 'typescript' ? String(q.solution ?? '') : '',
          python:     lang === 'python'     ? String(q.solution ?? '') : '',
          java:       lang === 'java'       ? String(q.solution ?? '') : '',
          c:          lang === 'c'          ? String(q.solution ?? '') : '',
          cpp:        lang === 'cpp'        ? String(q.solution ?? '') : '',
        },
        testCases: (Array.isArray(q.testCases) ? q.testCases : []).map((tc: any) => ({
          input: String(tc.input ?? ''),
          expectedOutput: String(tc.expectedOutput ?? tc.expected ?? ''),
        })),
        hints: Array.isArray(q.hints) ? q.hints : ['Think step by step.', 'Consider edge cases.'],
        explanation: q.explanation || '',
      }));

      setQuestions(normalized);
      setQuestionsState('ready');

    } catch (err) {
      console.error('AI generation failed, falling back to static:', err);
      const fallback = staticQuestions.filter(
        q => q.difficulty === diff && !!q.starterCode[lang]
      );
      setQuestions(fallback);
      setQuestionsState('error');
      setQuestionsError('AI questions unavailable. Using practice questions instead.');
    }
  }, []);

  const selectLanguage = useCallback((lang: ClassroomLanguage) => {
    setLanguage(lang);
    setStep('level');
  }, []);

  const selectLevel = useCallback((diff: ClassroomDifficulty) => {
    setDifficulty(diff);
    setStep('coding');
    classroomService.setPreferences(language, diff);
    generateQuestions(language, diff);
  }, [language, generateQuestions]);

  const submitAnswer = useCallback((code: string, passed: boolean) => {
    const q = questions[questionIdx];
    if (!q) return;
    classroomService.saveSubmission({
      questionId: q.id,
      language,
      code,
      passed,
      submittedAt: new Date().toISOString(),
    });
    setProgress(classroomService.getProgress());
  }, [questions, questionIdx, language]);

  const goToQuestion = useCallback((idx: number) => {
    setQuestionIdx(Math.max(0, Math.min(idx, questions.length - 1)));
  }, [questions.length]);

  return {
    step, setStep,
    language, difficulty,
    selectLanguage, selectLevel,
    questions,
    questionsState,
    questionsError,
    questionIdx, goToQuestion,
    currentQuestion: questions[questionIdx] ?? null,
    progress,
    submitAnswer,
    totalSolved: progress.solvedIds.length,
  };
}