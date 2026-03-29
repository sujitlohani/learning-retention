// ============================================================
// FILE: src/types/classroom.ts
//        
// ============================================================

/** Supported programming languages in the Classroom. */
export type ClassroomLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'c' | 'cpp';

/** Question difficulty tiers. */
export type ClassroomDifficulty = 'easy' | 'medium' | 'hard';

/** Backwards-compatible alias for ClassroomDifficulty. */
export type Difficulty = ClassroomDifficulty;

/** A single test case for a coding question. */
export interface ClassroomTestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
}

/** A full coding question with starter code and solutions in all 6 languages. */
export interface ClassroomQuestion {
  id: string;
  title: string;
  description: string;        // Markdown — supports **bold**, `code`, ```blocks```
  difficulty: ClassroomDifficulty;
  category: string;           // e.g. "Arrays & Hashing", "Dynamic Programming"
  tags: string[];
  starterCode: Record<ClassroomLanguage, string>;
  solution: Record<ClassroomLanguage, string>;
  testCases: ClassroomTestCase[];
  hints: string[];            // Progressive — hint[0] is the gentlest
  explanation: string;        // One-sentence approach summary shown after solving
}

/** A record of one submission attempt by the user. */
export interface ClassroomSubmission {
  questionId: string;
  language: ClassroomLanguage;
  code: string;
  passed: boolean;
  submittedAt: string;        // ISO 8601 timestamp
}

/** Per-user progress stored in localStorage. */
export interface ClassroomProgress {
  solvedIds: string[];
  attemptedIds: string[];
  submissions: ClassroomSubmission[];
  preferredLanguage: ClassroomLanguage;
  preferredDifficulty: ClassroomDifficulty;
}

/** Metadata for displaying a language option in the UI. */
export interface ClassroomLanguageMeta {
  id: ClassroomLanguage;
  label: string;              // Display name e.g. "JavaScript"
  extension: string;          // File extension e.g. "js"
}

/** Result of running one test case against the user's code. */
export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}