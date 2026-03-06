# Memora — App Brief
> Master reference for the preMain redesign + refactor sprint.  
> Read this before touching any code.

---

## What Memora Is

Memora is a personal spaced-repetition learning tool for self-directed learners — primarily developers and CS students who frequently learn new things and need to retain them long-term.

**The core problem it solves:** You finish a course, book, or video and forget 80% within a week. Memora fixes that.

**What it does, in plain terms:**
1. User logs what they learned — a topic and its sub-concepts.
2. AI generates a personalized study schedule based on their timeline and daily time budget.
3. AI pre-generates a bank of MCQ quiz questions for each concept.
4. The app surfaces what's due for review each day.
5. After each quiz, memory scores update and the next review is scheduled.

**Positioning:** Premium personal learning tool. Warm and intelligent — not a cold dev utility, not a gamified study app.  
**Tagline:** Knowledge that sticks.

---

## Current Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| UI Primitives | shadcn/ui (Radix UI) |
| Animation | Framer Motion |
| AI Model | `meta-llama/Llama-3.1-8B-Instruct` via HuggingFace Router |
| Auth | Stub only — `useState<boolean>`, resets on refresh |
| Database | localStorage (4 separate keys) |
| Deployment | Vercel |

---

## Key User Flows

### Flow 1 — Login & Session Start
1. App loads → checks `isAuthenticated` (React state, resets on refresh — known MVP shortcut).
2. Not authenticated → `/login`.
3. Login sets `isAuthenticated = true`.
4. Checks localStorage for onboarding completion flag.
5. If not done → `/onboarding`. If done → `/` (Home Dashboard).

**Pain point to fix in rebuild:** Auth resets on every refresh. Replace with Supabase Auth session.

---

### Flow 2 — Add Topic (7-Step Wizard at `/add-topic`)

This is the core conversion flow. Currently a monolithic 883-line component — the #1 refactor target.

| Step | What happens |
|---|---|
| `capture` | User types topic name. Duplicate check runs. |
| `level` | User picks Beginner / Intermediate / Expert. AI pre-fetches concepts for all 3 levels in parallel. Level expands to show AI-generated concept checkboxes. |
| `timeframe` | User picks mastery duration: 1 week → 3 months. |
| `commitment` | User picks daily time: 5 → 60 min. |
| `source` | Optional: Book / Article / Video / Course / Other. |
| `confirmation` | Summary of all choices. User confirms. |
| `generating` | Animated progress. 3 API calls run: schedule → quiz questions per concept. |
| `exit` | Success. User jumps to first quiz or goes to dashboard. |

On submit, writes to all 4 storage keys and calls 3 AI endpoints.

---

### Flow 3 — Daily Review (Home Dashboard `/`)
- Scans schedules for today's sessions.
- "Due for Review" widget shows up to 3 sessions with topic name, concept list, question count, memory score.
- Clicking a card → `/learn/[topicId]?session=[sessionId]`.

---

### Flow 4 — Quiz (`/learn/[topicId]`)
- Loads shuffled questions from the question bank for that session.
- Presents MCQs one at a time.
- On completion: updates memory score, marks session complete, saves quiz attempt to history.
- Naive spaced repetition: score > 80 → next review 72h, score > 60 → 24h, else → 4h.

---

### Flow 5 — Cockpit (`/cockpit`)
- Stats: Total Topics, Avg Memory %, Due Count, Total Attempts.
- Priority Review: topics overdue.
- Topic cards with memory score and schedule progress.
- Clicking a topic: concept breakdown modal, quiz history, Redo Quiz / Regenerate Questions actions.

---

### Flow 6 — Knowledge Base (`/knowledge-base`)
- Flattens all concepts across all topics.
- Filter by tag (topic name) and sort by performance.
- Concept detail modal with quiz history chart per concept.
- Can regenerate questions for a specific concept from here.

---

## Feature Inventory

| Feature | Status |
|---|---|
| Multi-step topic wizard | Complete |
| AI concept generation | Complete |
| AI quiz generation (MCQ) | Complete |
| AI schedule generation | Complete |
| Home dashboard with due/upcoming sessions | Complete |
| Cockpit progress dashboard | Complete |
| Quiz history modal | Complete |
| Knowledge base concept browser | Complete |
| Concept-level performance analytics | Complete |
| Regenerate questions (topic or concept level) | Complete |
| Dark / light theme toggle | Complete |
| Mobile-responsive sidebar | Complete |
| Login page | Stub only |
| Onboarding page | Stub only |
| Real auth (Supabase) | Not built — planned |
| Multi-user / cloud sync | Not built — planned |
| Short-answer question type | Not built — planned |
| Retention score time decay | Typed, never computed |
| Classroom page | Disabled ("Soon") |

---

## AI Integration

### Model & Endpoint
- **Model:** `meta-llama/Llama-3.1-8B-Instruct:novita`
- **Endpoint:** `https://router.huggingface.co/v1/chat/completions`
- **Auth:** `HF_TOKEN` env var
- **Client:** `lib/ai/huggingface-client.ts` — includes exponential backoff retry (3 attempts)

### 3 AI Calls (all fire during the `generating` step of Add Topic)

**A. Concept Generation** (`POST /api/ai/generate-concepts`)
- Input: `{ topic, level }`
- Output: 8 concepts as a JSON string array
- Pre-fetched for all 3 levels in parallel when user reaches the Level step
- Falls back to hardcoded concepts for Python/JS/React if AI fails

**B. Schedule Generation** (`POST /api/ai/generate-schedule`)
- Input: `{ topicId, concepts, timeframeDays, dailyMinutes }`
- Output: A `StudySchedule` with dated `ScheduleSession` objects
- Session types: `initial`, `reinforcement`, `mixed-review`, `final-review`

**C. Quiz Generation** (`POST /api/ai/generate-quiz`)
- Input: `{ topic, concept, conceptId, topicId, level, count: 10 }`
- Output: 10 MCQ objects per concept
- Runs once per concept sequentially during topic creation
- Each question validated against 7 criteria (format, length, option count, explanation quality)
- Users can trigger regeneration later from Cockpit or Knowledge Base

### Key rule: AI runs once at topic creation, not on every quiz attempt. Questions are stored and reused.

---

## Data Model (Current — localStorage)

Four localStorage keys:

**`learning-retention-mvp-data`** → `Topic[]`  
Each topic has: `id, name, level, memoryScore, lastPracticed, nextReviewDate, totalAttempts, studyPlan, scheduleId, concepts[]`

**`learning-retention-schedules`** → `StudySchedule[]`  
Each schedule has: `id, topicId, createdAt, sessions[]`  
Each session has: `id, date, conceptIds[], type, questionCount, estimatedMinutes, completed, result`

**`learning-retention-questions`** → `AIGeneratedQuestion[]`  
Each question has: `id, topicId, conceptId, type, difficulty, question, options[], correctAnswer, explanation, keywords[], validationScore`

**`learning_loop_quiz_history`** → `QuizAttempt[]`  
Each attempt has: `id, topicId, sessionId, score, correctCount, totalCount, completedAt, questions[], conceptBreakdown[]`

---

## Known Pain Points (Do Not Repeat in Rebuild)

| Problem | Fix |
|---|---|
| Auth resets on every refresh | Supabase Auth with persistent session |
| 4 separate localStorage keys with no integrity | Supabase DB with foreign keys and cascade deletes |
| `add-topic/page.tsx` is 883 lines | Split into step components + a custom hook for wizard state |
| Every page re-reads localStorage on every mount | React Query or Supabase data hooks |
| No error boundaries or global loading state pattern | Add per-route error/loading states |
| Root-level `huggingface-client.ts` duplicate | Delete — canonical version lives in `lib/ai/` |
| `sidebar-demo.tsx` dead file | Delete |
| `topic.retentionScore` typed but never computed | Implement properly or remove from schema |
| `topic.industry`, `topic.focusArea` never used | Remove from schema |
| No cascade delete — orphaned data on topic delete | Supabase FK cascade handles this automatically |
