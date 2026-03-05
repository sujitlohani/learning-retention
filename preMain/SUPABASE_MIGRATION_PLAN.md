# SUPABASE_MIGRATION_PLAN.md — Memora

> **Goal:** Migrate from 4 disparate `localStorage` keys to a proper Supabase database with auth, RLS, and real-time capabilities.  
> **Date:** March 2026

---

## 1. Current Data Model

All data currently lives in browser localStorage. Below is the complete data map:

### `learning-retention-mvp-data` → `Topic[]`

Each topic is the top-level learning unit.

```typescript
{
  id: string;               // crypto.randomUUID()
  name: string;             // "React Hooks"
  level: 'beginner' | 'intermediate' | 'expert';
  memoryScore: number;       // 0-100 weighted average of quiz scores
  retentionScore?: number;   // typed but never computed (time-decayed) — DROP or implement
  lastPracticed: Date;
  nextReviewDate: Date;      // legacy field — superseded by schedule sessions
  totalAttempts: number;
  scheduleId?: string;       // FK reference to a StudySchedule
  industry?: string;         // unused
  focusArea?: string;        // unused
  studyPlan?: {
    selectedTimeframe: string;    // "3 weeks"
    timeframeDays: number;        // 21
    dailyMinutes: number;         // 10
    targetDate: string;           // ISO date
    questionsPerSession: number;  // 5
  };
  concepts: Concept[];            // embedded array — needs its own table
}
```

### `learning-retention-mvp-data` → `Concept[]` (embedded inside Topic)

```typescript
{
  id: string;
  text: string;             // "Using the useEffect hook"
  status: 'strong' | 'weak' | 'neutral';
  familiar?: boolean;       // user-marked at onboarding
  aiGenerated?: boolean;
  retentionScore?: number;  // typed, never computed
}
```

### `learning-retention-schedules` → `StudySchedule[]`

```typescript
{
  id: string;
  topicId: string;          // FK → Topic
  createdAt: string;        // ISO
  sessions: ScheduleSession[];  // embedded array — needs its own table
}
```

### `learning-retention-schedules` → `ScheduleSession[]` (embedded in StudySchedule)

```typescript
{
  id: string;
  date: string;             // YYYY-MM-DD
  conceptIds: string[];     // array of Concept IDs (junction) 
  type: 'initial' | 'reinforcement' | 'mixed-review' | 'final-review';
  questionCount: number;
  estimatedMinutes: number;
  completed: boolean;
  result: {
    score: number;
    correctCount: number;
    totalCount: number;
    completedAt: string;
  } | null;
}
```

### `learning-retention-questions` → `AIGeneratedQuestion[]`

```typescript
{
  id: string;
  topicId: string;          // FK → Topic
  conceptId: string;        // FK → Concept
  conceptName?: string;     // denormalized
  type: 'mcq' | 'short-answer';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  question: string;
  options?: string[];       // MCQ only, exactly 4 items
  correctAnswer: string;
  explanation: string;
  keywords: string[];
  acceptableAnswers?: string[];  // short-answer only (not yet implemented)
  validationScore: number;
  aiGenerated: boolean;
  createdAt: string;
}
```

### `learning_loop_quiz_history` → `QuizAttempt[]`

```typescript
{
  id: string;
  topicId: string;
  sessionId?: string;           // FK → ScheduleSession
  type: 'topic' | 'concept';
  targetConceptId?: string;     // FK → Concept (for concept-specific quizzes)
  score: number;                // 0-100
  correctCount: number;
  totalCount: number;
  completedAt: string;
  durationSeconds?: number;
  questions: {                  // embedded — needs own table in Supabase
    questionId: string;
    conceptId: string;
    conceptName?: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    timeSpentSeconds?: number;
  }[];
  conceptBreakdown: {           // computed summary — can be derived or stored
    conceptId: string;
    conceptName?: string;
    correctCount: number;
    totalCount: number;
    score: number;
  }[];
}
```

---

## 2. Proposed Supabase Schema

### SQL Table Definitions

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === USERS (managed by Supabase Auth, extended via profiles) ===
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- === TOPICS ===
CREATE TABLE topics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  level             TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'expert')),
  memory_score      SMALLINT NOT NULL DEFAULT 0 CHECK (memory_score BETWEEN 0 AND 100),
  last_practiced    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  next_review_date  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_attempts    INTEGER NOT NULL DEFAULT 0,
  -- Study plan (embedded as JSONB — simple enough to not warrant own table)
  study_plan        JSONB,               -- { selectedTimeframe, timeframeDays, dailyMinutes, targetDate, questionsPerSession }
  schedule_id       UUID,               -- FK to schedules, set after schedule creation
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_topics_user_id ON topics(user_id);
CREATE INDEX idx_topics_next_review ON topics(next_review_date);

-- === CONCEPTS (extracted from embedded array) ===
CREATE TABLE concepts (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id      UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text          TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'neutral' CHECK (status IN ('strong', 'weak', 'neutral')),
  familiar      BOOLEAN DEFAULT FALSE,
  ai_generated  BOOLEAN DEFAULT TRUE,
  retention_score SMALLINT CHECK (retention_score BETWEEN 0 AND 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_concepts_topic_id ON concepts(topic_id);
CREATE INDEX idx_concepts_user_id ON concepts(user_id);

-- === STUDY SCHEDULES ===
CREATE TABLE schedules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id    UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_schedules_topic_id ON schedules(topic_id);
CREATE INDEX idx_schedules_user_id ON schedules(user_id);

-- === SCHEDULE SESSIONS ===
CREATE TABLE schedule_sessions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id         UUID NOT NULL REFERENCES schedules(id) ON DELETE CASCADE,
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_date        DATE NOT NULL,
  session_type        TEXT NOT NULL CHECK (session_type IN ('initial', 'reinforcement', 'mixed-review', 'final-review')),
  question_count      SMALLINT NOT NULL,
  estimated_minutes   SMALLINT NOT NULL,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  -- Result stored as JSONB (nullable until completed)
  result              JSONB,  -- { score, correctCount, totalCount, completedAt }
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_schedule_id ON schedule_sessions(schedule_id);
CREATE INDEX idx_sessions_date ON schedule_sessions(session_date);
CREATE INDEX idx_sessions_user_id ON schedule_sessions(user_id);
CREATE INDEX idx_sessions_completed ON schedule_sessions(completed);

-- === SESSION ↔ CONCEPT JUNCTION (replaces conceptIds[] array) ===
CREATE TABLE session_concepts (
  session_id  UUID NOT NULL REFERENCES schedule_sessions(id) ON DELETE CASCADE,
  concept_id  UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  PRIMARY KEY (session_id, concept_id)
);

-- === QUESTIONS (AI-generated question bank) ===
CREATE TABLE questions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id          UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  concept_id        UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('mcq', 'short-answer')),
  difficulty        TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'expert')),
  question          TEXT NOT NULL,
  options           TEXT[],           -- MCQ only, exactly 4 items
  correct_answer    TEXT NOT NULL,
  explanation       TEXT NOT NULL,
  keywords          TEXT[] NOT NULL DEFAULT '{}',
  acceptable_answers TEXT[],         -- short-answer only
  validation_score  SMALLINT DEFAULT 100,
  ai_generated      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_topic_id ON questions(topic_id);
CREATE INDEX idx_questions_concept_id ON questions(concept_id);
CREATE INDEX idx_questions_user_id ON questions(user_id);

-- === QUIZ ATTEMPTS ===
CREATE TABLE quiz_attempts (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  topic_id            UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  session_id          UUID REFERENCES schedule_sessions(id) ON DELETE SET NULL,
  target_concept_id   UUID REFERENCES concepts(id) ON DELETE SET NULL,
  attempt_type        TEXT NOT NULL CHECK (attempt_type IN ('topic', 'concept')),
  score               SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  correct_count       SMALLINT NOT NULL,
  total_count         SMALLINT NOT NULL,
  duration_seconds    INTEGER,
  completed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_attempts_topic_id ON quiz_attempts(topic_id);
CREATE INDEX idx_attempts_completed_at ON quiz_attempts(completed_at);

-- === QUIZ ATTEMPT QUESTION DETAIL (extracted from embedded array) ===
CREATE TABLE quiz_attempt_questions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id        UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  question_id       UUID REFERENCES questions(id) ON DELETE SET NULL,
  concept_id        UUID REFERENCES concepts(id) ON DELETE SET NULL,
  is_correct        BOOLEAN NOT NULL,
  user_answer       TEXT NOT NULL,
  correct_answer    TEXT NOT NULL,
  time_spent_secs   INTEGER
);

CREATE INDEX idx_aqd_attempt_id ON quiz_attempt_questions(attempt_id);
CREATE INDEX idx_aqd_question_id ON quiz_attempt_questions(question_id);
CREATE INDEX idx_aqd_concept_id ON quiz_attempt_questions(concept_id);

-- === CONCEPT PERFORMANCE BREAKDOWN (per attempt) ===
CREATE TABLE concept_performance (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  attempt_id      UUID NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
  concept_id      UUID NOT NULL REFERENCES concepts(id) ON DELETE CASCADE,
  correct_count   SMALLINT NOT NULL,
  total_count     SMALLINT NOT NULL,
  score           SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100)
);

CREATE INDEX idx_perf_attempt_id ON concept_performance(attempt_id);
CREATE INDEX idx_perf_concept_id ON concept_performance(concept_id);

-- Add FK from topics to schedules (deferred to avoid circular ref)
ALTER TABLE topics
  ADD CONSTRAINT fk_topics_schedule 
  FOREIGN KEY (schedule_id) REFERENCES schedules(id) ON DELETE SET NULL;
```

---

## 3. RLS Strategy

Enable RLS on every table. All data is user-owned — a user can only see and modify their own records.

```sql
-- Enable RLS
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics                ENABLE ROW LEVEL SECURITY;
ALTER TABLE concepts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules             ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_concepts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions             ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempt_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE concept_performance   ENABLE ROW LEVEL SECURITY;

-- Profiles: user can only read/update their own profile
CREATE POLICY "profiles_own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Topics: user owns their topics
CREATE POLICY "topics_own" ON topics
  FOR ALL USING (auth.uid() = user_id);

-- Concepts: user owns their concepts
CREATE POLICY "concepts_own" ON concepts
  FOR ALL USING (auth.uid() = user_id);

-- Schedules: user owns their schedules
CREATE POLICY "schedules_own" ON schedules
  FOR ALL USING (auth.uid() = user_id);

-- Schedule sessions: user owns their sessions
CREATE POLICY "sessions_own" ON schedule_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Session concepts: accessible if user owns the session
CREATE POLICY "session_concepts_own" ON session_concepts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM schedule_sessions ss
      WHERE ss.id = session_concepts.session_id
      AND ss.user_id = auth.uid()
    )
  );

-- Questions: user owns their generated questions
CREATE POLICY "questions_own" ON questions
  FOR ALL USING (auth.uid() = user_id);

-- Quiz attempts: user owns their attempts
CREATE POLICY "attempts_own" ON quiz_attempts
  FOR ALL USING (auth.uid() = user_id);

-- Attempt question detail: accessible if user owns parent attempt
CREATE POLICY "aqd_own" ON quiz_attempt_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      WHERE qa.id = quiz_attempt_questions.attempt_id
      AND qa.user_id = auth.uid()
    )
  );

-- Concept performance: accessible if user owns parent attempt
CREATE POLICY "perf_own" ON concept_performance
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts qa
      WHERE qa.id = concept_performance.attempt_id
      AND qa.user_id = auth.uid()
    )
  );
```

---

## 4. Auth Migration

| Current | Supabase Target |
|---|---|
| `useState<boolean>` — resets on refresh | Supabase Auth session (JWT in cookie) — persists across refreshes |
| No real user identity | Supabase `auth.users` table with `id: UUID` |
| No login logic — just `setIsAuthenticated(true)` | Email/password OR magic link via `supabase.auth.signInWithPassword()` or `supabase.auth.signInWithOtp()` |
| Onboarding flag in localStorage | `profiles.onboarding_completed` boolean column |
| `useAuth()` hook returns `{ isAuthenticated, login, logout }` | Replace with `useSession()` from Supabase; keep same hook interface for minimal page-level refactor |

**Recommended auth approach:** Email magic link (no password required — fits the low-friction app persona).

```typescript
// New auth service (drop-in for auth-provider.tsx)
const { data, error } = await supabase.auth.signInWithOtp({ email });
// User clicks link in email → session is established automatically
```

**Session handling in Next.js:**
- Use `@supabase/ssr` package with cookie-based sessions
- `middleware.ts` to refresh sessions on each request
- `createServerClient()` for server components / API routes
- `createBrowserClient()` for client components

---

## 5. API Layer Changes

### Storage functions to rewrite

All `localStorage` storage modules become Supabase client calls:

#### `lib/storage.ts` → `lib/services/topics.ts`

```typescript
// OLD
storage.getTopics() → localStorage.getItem(KEY)

// NEW
async function getTopics(userId: string): Promise<Topic[]> {
  const { data } = await supabase
    .from('topics')
    .select('*, concepts(*)')
    .eq('user_id', userId)
    .order('last_practiced', { ascending: false });
  return data ?? [];
}
```

#### `lib/storage/schedules-storage.ts` → `lib/services/schedules.ts`

```typescript
// getTodaysSessions() — OLD: scan all schedules in localStorage
// NEW: single query with date filter
async function getTodaysSessions() {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('schedule_sessions')
    .select('*, schedules(topic_id), session_concepts(concept_id)')
    .eq('session_date', today)
    .eq('completed', false);
  return data ?? [];
}
```

#### `lib/storage/questions-storage.ts` → `lib/services/questions.ts`

```typescript
// getQuestionsForSession() — OLD: filter in memory with shuffle
// NEW: query with concept_id filter + random ordering
async function getQuestionsForSession(topicId: string, conceptIds: string[], count: number) {
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('topic_id', topicId)
    .in('concept_id', conceptIds)
    .limit(count * 2);  // Overfetch, shuffle client-side
  return shuffle(data ?? []).slice(0, count);
}
```

#### `lib/storage/quiz-history-storage.ts` → `lib/services/quiz-history.ts`

```typescript
// saveAttempt() — now inserts into 3 tables
async function saveAttempt(attempt: QuizAttempt) {
  const { data: insertedAttempt } = await supabase
    .from('quiz_attempts')
    .insert({ ...coreFields })
    .select()
    .single();

  await supabase.from('quiz_attempt_questions').insert(
    attempt.questions.map(q => ({ attempt_id: insertedAttempt.id, ...q }))
  );

  await supabase.from('concept_performance').insert(
    attempt.conceptBreakdown.map(b => ({ attempt_id: insertedAttempt.id, ...b }))
  );
}
```

### API Routes
The 3 AI route handlers (`/api/ai/*`) remain as Next.js server route handlers — only change is reading `topicId`/`userId` and saving results to Supabase instead of returning them for client-side storage.

---

## 6. Real-time Opportunities

| Feature | Supabase Realtime Value |
|---|---|
| **Due Sessions on Home Dashboard** | Subscribe to `schedule_sessions` where `session_date = today AND completed = false`. Sessions mark as complete in one tab and the badge updates in another. |
| **Quiz completion → Cockpit updates** | Subscribe to `quiz_attempts` inserts for the current user. Cockpit stats auto-refresh when any quiz completes. |
| **Topic memory score** | Subscribe to `topics` UPDATE for the current user. Relevant if multi-device sync is added. |
| **Schedule session completion** | Subscribe to `schedule_sessions` UPDATE. Progress bar in Cockpit updates live. |

**Implementation:**
```typescript
// Example: subscribe to today's incomplete sessions
const channel = supabase
  .channel('due-sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'schedule_sessions',
    filter: `session_date=eq.${today}&completed=eq.false`
  }, (payload) => {
    refreshDueSessions();
  })
  .subscribe();
```

---

## 7. Storage Needs

**Currently:** No file/image storage.

**Future considerations for Supabase Storage:**

| Use Case | Bucket | Notes |
|---|---|---|
| User avatar / profile picture | `avatars` | Optional — app currently has a placeholder "U" avatar |
| Topic cover images (if added) | `topic-covers` | Not currently a feature, but likely in a redesign |
| Exported quiz history (PDF) | `exports` | If a "Download my history" feature is desired |
| AI-generated study notes (PDF/MD) | `study-notes` | Planned future feature mentioned in context docs |

**For the immediate migration:** No Supabase Storage buckets are required.

---

## 8. Migration Steps

### Phase 1: Supabase Project Setup
- [ ] Create Supabase project
- [ ] Run all SQL from Section 2 in Supabase SQL editor
- [ ] Enable RLS and apply all policies from Section 3
- [ ] Enable email auth in Supabase Auth settings
- [ ] Create `profiles` trigger: auto-insert into `profiles` on `auth.users` insert
  ```sql
  CREATE OR REPLACE FUNCTION handle_new_user()
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO profiles (id) VALUES (NEW.id);
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
  ```
- [ ] Add environment variables (see Section 9)

### Phase 2: Auth Layer
- [ ] Install `@supabase/ssr` and `@supabase/supabase-js`
- [ ] Create `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client)
- [ ] Add `middleware.ts` for session refresh on every request
- [ ] Replace `components/auth-provider.tsx`:
  - Replace `useState<boolean>` with `supabase.auth.getSession()` + `onAuthStateChange()`
  - Keep the same `useAuth()` hook interface to minimize page changes
  - `login()` → `supabase.auth.signInWithOtp({ email })`
  - `logout()` → `supabase.auth.signOut()`
- [ ] Update `/login/page.tsx` with email OTP form
- [ ] Move `onboarding_completed` flag from localStorage to `profiles.onboarding_completed`

### Phase 3: Service Layer (Storage Replacements)
- [ ] Create `lib/services/` directory
- [ ] Write `topics.ts` — replaces `lib/storage.ts`
- [ ] Write `schedules.ts` — replaces `lib/storage/schedules-storage.ts`
- [ ] Write `questions.ts` — replaces `lib/storage/questions-storage.ts`
- [ ] Write `quiz-history.ts` — replaces `lib/storage/quiz-history-storage.ts`
- [ ] All service functions should be `async` and accept `supabase` client as argument (or use singleton)
- [ ] Add TypeScript types matching Supabase table shapes (consider using `supabase gen types`)

### Phase 4: Data Migration (existing localStorage → Supabase)
- [ ] Write a one-time migration script (`scripts/migrate-localstorage.ts`)
  - On first login after migration, detect if `localStorage` has existing data
  - Prompt user: "We found your existing data. Import it to your account?" 
  - If yes: read all 4 localStorage keys → insert into Supabase tables in correct order (topics → schedules → sessions → session_concepts → questions → quiz_attempts → attempt_questions → concept_performance)
  - After successful import, clear localStorage keys
- [ ] Handle ID conflicts (localStorage uses `crypto.randomUUID()` which is valid UUID format — these can be preserved as Supabase UUIDs)

### Phase 5: Update Pages
- [ ] `app/page.tsx` — replace inline `useEffect` storage reads with `useTopics()`, `useTodaysSessions()` hooks
- [ ] `app/add-topic/page.tsx` — replace 3 client-side storage writes with service calls
- [ ] `app/cockpit/page.tsx` — replace all storage reads with service calls
- [ ] `app/knowledge-base/page.tsx` — replace all storage reads with service calls
- [ ] `app/learn/[topicId]/page.tsx` — replace with async data fetching

### Phase 6: Update API Routes
- [ ] `app/api/ai/generate-schedule/route.ts` — after generating schedule, save directly to Supabase (concepts → schedule → sessions → session_concepts), return the schedule ID
- [ ] `app/api/ai/generate-quiz/route.ts` — after validating questions, save directly to Supabase `questions` table
- [ ] `app/api/ai/generate-concepts/route.ts` — no storage change (still returns concepts for user to select)

### Phase 7: Real-time (Optional Enhancement)
- [ ] Add real-time subscription to `schedule_sessions` on Home dashboard
- [ ] Add real-time subscription to `quiz_attempts` on Cockpit

### Phase 8: Cleanup
- [ ] Delete `lib/storage.ts` (old topics storage)
- [ ] Delete `lib/storage/` directory (old modular storage)
- [ ] Delete root-level `huggingface-client.ts` (duplicate)
- [ ] Delete `test-hf.js`
- [ ] Delete `components/sidebar-demo.tsx`
- [ ] Remove `localStorage.getItem('learning_loop_onboarding_completed')` references

---

## 9. Environment Variables Required

```env
# .env.local

# Supabase — required
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Supabase service role — for server-side admin operations (migration, etc.)
# WARNING: NEVER expose this to the client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# HuggingFace AI — already exists
HF_TOKEN=your-huggingface-token-here
```

**Notes:**
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are safe to expose to the browser (RLS protects the data)
- `SUPABASE_SERVICE_ROLE_KEY` should ONLY be used in server-side code (API routes, middleware) — bypasses RLS
- The existing `HF_TOKEN` remains unchanged — AI calls still run server-side

---

## Quick Reference: Key Function Mappings

| Old (localStorage) | New (Supabase) |
|---|---|
| `storage.getTopics()` | `supabase.from('topics').select('*, concepts(*)')` |
| `storage.saveTopic(topic)` | `supabase.from('topics').upsert(topic)` |
| `storage.createTopic(name, level)` | `supabase.from('topics').insert({...}).select().single()` |
| `storage.deleteTopic(id)` | `supabase.from('topics').delete().eq('id', id)` (cascades to concepts, schedules, questions) |
| `storage.updateTopicAfterQuiz(id, result)` | `supabase.from('topics').update({ memory_score, total_attempts, last_practiced }).eq('id', id)` |
| `schedulesStorage.getTodaysSessions()` | `.from('schedule_sessions').select(...).eq('session_date', today)` |
| `schedulesStorage.saveSchedule(schedule)` | Insert into `schedules` then batch-insert `schedule_sessions` + `session_concepts` |
| `schedulesStorage.markSessionComplete()` | `.from('schedule_sessions').update({ completed: true, result }).eq('id', id)` |
| `questionsStorage.saveQuestions(qs)` | `.from('questions').upsert(qs, { onConflict: 'id' })` |
| `questionsStorage.getQuestionsForSession()` | `.from('questions').select().in('concept_id', ids).limit(count)` |
| `questionsStorage.deleteQuestionsForTopic(id)` | Cascades automatically (FK ON DELETE CASCADE) |
| `quizHistoryStorage.saveAttempt(attempt)` | Multi-table insert: `quiz_attempts` + `quiz_attempt_questions` + `concept_performance` |
| `quizHistoryStorage.getHistoryForTopic(id)` | `.from('quiz_attempts').select('*, quiz_attempt_questions(*), concept_performance(*)').eq('topic_id', id)` |
