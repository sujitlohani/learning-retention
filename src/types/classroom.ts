// ============================================================
// FILE: src/types/classroom.ts

export type ClassroomLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'c' | 'cpp';
export type ClassroomDifficulty = 'easy' | 'medium' | 'hard';
export type Difficulty = ClassroomDifficulty;

export interface ClassroomTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

export interface ClassroomQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: ClassroomDifficulty;
  category: string;
  tags: string[];
  starterCode: Record<ClassroomLanguage, string>;
  solution: Record<ClassroomLanguage, string>;
  testCases: ClassroomTestCase[];
  hints: string[];
  explanation: string;
}

export interface ClassroomSubmission {
  questionId: string;
  language: ClassroomLanguage;
  code: string;
  passed: boolean;
  submittedAt: string;
}

export interface ClassroomProgress {
  solvedIds: string[];
  attemptedIds: string[];
  submissions: ClassroomSubmission[];
  preferredLanguage: ClassroomLanguage;
  preferredDifficulty: ClassroomDifficulty;
}

export interface ClassroomLanguageMeta {
  id: ClassroomLanguage;
  label: string;
  extension: string;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}