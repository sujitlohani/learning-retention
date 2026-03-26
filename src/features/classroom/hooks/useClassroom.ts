// src/features/classroom/hooks/useClassroom.ts


'use client';
import { useState, useCallback } from 'react';
import { ClassroomLanguage, ClassroomDifficulty } from '@/src/types/classroom';
import { classroomQuestions } from '@/src/lib/classroom-question-bank';
import { classroomService } from '../services/classroom.service';

export type ClassroomStep = 'language' | 'level' | 'coding';

export function useClassroom() {
  const saved = classroomService.getProgress();

  const [step, setStep]         = useState<ClassroomStep>('language');
  const [language, setLanguage] = useState<ClassroomLanguage>(saved.preferredLanguage);
  const [difficulty, setDifficulty] = useState<ClassroomDifficulty>(saved.preferredDifficulty);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [progress, setProgress] = useState(saved);

  const filteredQuestions = classroomQuestions.filter(
    q => q.difficulty === difficulty && !!q.starterCode[language]
  );

  const selectLanguage = useCallback((lang: ClassroomLanguage) => {
    setLanguage(lang);
    setStep('level');
  }, []);

  const selectLevel = useCallback((diff: ClassroomDifficulty) => {
    setDifficulty(diff);
    setQuestionIdx(0);
    setStep('coding');
    classroomService.setPreferences(language, diff);
  }, [language]);

  const submitAnswer = useCallback((code: string, passed: boolean) => {
    const q = filteredQuestions[questionIdx];
    if (!q) return;
    classroomService.saveSubmission({ questionId: q.id, language, code, passed, submittedAt: new Date().toISOString() });
    setProgress(classroomService.getProgress());
  }, [filteredQuestions, questionIdx, language]);

  const goToQuestion = useCallback((idx: number) => {
    setQuestionIdx(Math.max(0, Math.min(idx, filteredQuestions.length - 1)));
  }, [filteredQuestions.length]);

  return {
    step, setStep,
    language, difficulty,
    selectLanguage, selectLevel,
    questions: filteredQuestions,
    questionIdx, goToQuestion,
    currentQuestion: filteredQuestions[questionIdx] ?? null,
    progress,
    submitAnswer,
    totalSolved: progress.solvedIds.length,
  };
}