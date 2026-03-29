export type { ClassroomProgress } from '@/src/types/classroom';

import type { ClassroomProgress, ClassroomSubmission, ClassroomLanguage, ClassroomDifficulty } from '@/src/types/classroom';
import { getUserId } from '@/src/lib/user-store';

// ─── Defaults ────────────────────────────────────────────────────────────────

const defaultProgress = (): ClassroomProgress => ({
  solvedIds: [],
  attemptedIds: [],
  submissions: [],
  preferredLanguage: 'javascript',
  preferredDifficulty: 'easy',
});

// ─── Storage Key ─────────────────────────────────────────────────────────────

const getKey = (): string => `classroom-progress-${getUserId()}`;

// ─── Helpers ───────────────────────────────────