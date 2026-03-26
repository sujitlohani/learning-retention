// src/features/classroom/services/classroom.service.ts


import { ClassroomProgress, ClassroomSubmission, ClassroomLanguage, ClassroomDifficulty } from '@/src/types/classroom';
import { getUserId } from '@/src/lib/user-store';

const getKey = () => `classroom-progress-${getUserId()}`;

const defaults = (): ClassroomProgress => ({
  solvedIds: [],
  attemptedIds: [],
  submissions: [],
  preferredLanguage: 'javascript',
  preferredDifficulty: 'easy',
});

export const classroomService = {
  getProgress(): ClassroomProgress {
    if (typeof window === 'undefined') return defaults();
    try {
      const d = localStorage.getItem(getKey());
      return d ? { ...defaults(), ...JSON.parse(d) } : defaults();
    } catch { return defaults(); }
  },

  saveSubmission(sub: ClassroomSubmission): void {
    if (typeof window === 'undefined') return;
    const p = this.getProgress();
    p.submissions.push(sub);
    if (!p.attemptedIds.includes(sub.questionId)) p.attemptedIds.push(sub.questionId);
    if (sub.passed && !p.solvedIds.includes(sub.questionId)) p.solvedIds.push(sub.questionId);
    localStorage.setItem(getKey(), JSON.stringify(p));
  },

  setPreferences(lang: ClassroomLanguage, difficulty: ClassroomDifficulty): void {
    if (typeof window === 'undefined') return;
    const p = this.getProgress();
    p.preferredLanguage = lang;
    p.preferredDifficulty = difficulty;
    localStorage.setItem(getKey(), JSON.stringify(p));
  },

  isSolved(id: string): boolean {
    return this.getProgress().solvedIds.includes(id);
  },
};