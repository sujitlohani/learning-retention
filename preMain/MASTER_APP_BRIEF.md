# Memora — Master App Brief

> **Purpose:** Reference document for a full redesign + refactor sprint.  
> **App Name:** Memora  
> **Stack:** Next.js 16 (App Router), React 19, TypeScript, TailwindCSS v4, shadcn/ui, Framer Motion  
> **AI Model:** `meta-llama/Llama-3.1-8B-Instruct` via HuggingFace Router (`router.huggingface.co/v1/chat/completions`)

---

## 1. What the App Does

**Memora** is a personal spaced-repetition learning tool for self-directed learners (students, developers, hobbyists). It solves the core problem of **knowledge decay** — you learn something from a book/course/video and forget 80% of it within a week.

**Problem it solves:** "I just learned X, but I'll forget it unless I actively review it."

**What it does:**
1. User logs what they learned (a topic + sub-concepts).
2. AI generates a personalized spaced-repetition study schedule based on timeline and daily time commitment.
3. AI pre-generates a bank of MCQ quiz questions for each concept.
4. The app reminds users what's due for review each day.
5. After each quiz, memory scores are updated and the next review is scheduled.

**Target users:** Self-directed learners — primarily developers and CS students who frequently learn new technologies and want to retain them long-term.

---

## 2. Key User Flows

### Flow 1: Login / Session Start
1. App loads → `AuthProvider` checks `isAuthenticated` state (React state only, resets on refresh).
2. If not authenticated → redirect to `/login`.
3. Login page presents a simple login action — sets `isAuthenticated = true`.
4. After login, checks `localStorage.getItem('learning_loop_onboarding_completed')`.
5. If not done → redirects to `/onboarding`.
6. If done → redirects to `/` (Home Dashboard).

**Pain point:** Auth resets on every browser refresh — no persistence.

---

### Flow 2: Add Topic (Core Onboarding — Multi-Step Wizard)
This is the most complex flow. Lives at `/add-topic`. 7 steps rendered via `AnimatePresence`:

| Step | What Happens |
|---|---|
| `capture` | User types topic name (e.g. "React Hooks"). Duplicate check runs on Continue. |
| `level` | User selects Beginner / Intermediate / Expert. AI pre-fetches concept lists for all 3 levels in parallel at this point. Level expands to show AI-generated concepts as checkboxes. |
| `timeframe` | User picks mastery duration: 1 week / 2 weeks / 3 weeks / 1 month / 3 months. |
| `commitment` | User picks daily time: 5 / 10 / 15 / 30 / 60 min. |
| `source` | Optional: Book / Article / Video / Course / Web / Other. |
| `confirmation` | Summary card of all choices. User confirms. |
| `generating` | Animated progress bar. Three API calls run sequentially: (1) `POST /api/ai/generate-schedule`, (2) `POST /api/ai/generate-quiz` for each concept. |
| `exit` | Success screen. User can jump to first quiz or go to dashboard. |

**On submit, the app:**
1. Creates a topic object in `localStorage` (`learning-retention-mvp-data`).
2. Fetches a study schedule from AI → saves to `learning-retention-schedules`.
3. Sequentially generates 10 MCQs per concept → saves to `learning-retention-questions`.

---

### Flow 3: Daily Review (Home Dashboard)
1. On load, `schedulesStorage.getTodaysSessions()` scans all stored schedules for today's date.
2. Also checks legacy `nextReviewDate` field for backward compatibility.
3. "Due for Review" widget shows up to 3 sessions. Each card shows topic name, concepts being tested, question count, and memory score.
4. Clicking a card navigates to `/learn/[topicId]?session=[sessionId]`.

---

### Flow 4: Taking a Quiz (`/learn/[topicId]`)
- Loads questions from `questionsStorage.getQuestionsForSession()` — shuffled subset.
- Presents MCQs one at a time.
- On completion: updates `topic.memoryScore` (weighted average), `totalAttempts`, marks session as completed in schedule, saves `QuizAttempt` to quiz history.
- Naive spaced repetition: score > 80 → next review in 72h, score > 60 → 24h, else → 4h.

---

### Flow 5: Cockpit (Progress Dashboard at `/cockpit`)
- Top stats: Total Topics, Avg Memory %, Due Count, Total Attempts.
- "Priority Review" section shows topics with overdue `nextReviewDate`.
- Active Topics grid (clickable cards with memory score + schedule progress).
- Clicking a topic opens a modal: concept-level breakdown, quiz history access, "Redo Quiz" or "Regenerate Questions" actions.

---

## 3. Feature Inventory

| Feature | Status | Location |
|---|---|---|
| Multi-step Topic Wizard | ✅ Complete | `/add-topic/page.tsx` |
| AI Concept Generation (8 concepts per level) | ✅ Complete | `/api/ai/generate-concepts` |
| AI Quiz Generation (MCQ, 10 per concept) | ✅ Complete | `/api/ai/generate-quiz` |
| AI Schedule Generation (spaced repetition) | ✅ Complete | `/api/ai/generate-schedule` |
| Duplicate topic detection | ✅ Complete | `add-topic/page.tsx` |
| Home dashboard with due/upcoming sessions | ✅ Complete | `/page.tsx` |
| Sidebar navigation | ✅ Complete | `components/sidebar.tsx` |
| Cockpit (progress dashboard) | ✅ Complete | `/cockpit/page.tsx` |
| Quiz History modal | ✅ Complete | `components/quiz-history-modal.tsx` |
| Knowledge Base (concept browser) | ✅ Complete | `/knowledge-base/page.tsx` |
| Knowledge Base tag filtering | ✅ Complete | Dynamic from topic names |
| Concept-level performance analytics | ✅ Complete | From `quiz-history-storage` |
| Regenerate quiz questions (topic or concept) | ✅ Complete | Cockpit + Knowledge Base |
| Dark/light theme toggle | ✅ Complete | `components/theme-toggle.tsx` |
| Mobile-responsive sidebar | ✅ Complete | `components/sidebar.tsx` |
| Login page (stub) | ✅ Present | `/login/page.tsx` |
| Onboarding page | ✅ Present | `/onboarding/page.tsx` |
| Content Dump page | ⚠️ WIP/Unclear | `/content-dump/page.tsx` |
| Classroom page | 🚫 Disabled (shows "Soon") | `/classroom/page.tsx` |
 

---

## 4. AI Integration

### Model & Endpoint
- **Model:** `meta-llama/Llama-3.1-8B-Instruct:novita`
- **API Endpoint:** `https://router.huggingface.co/v1/chat/completions`
- **Auth:** `HF_TOKEN` environment variable (Bearer token)
- **Client:** `lib/ai/huggingface-client.ts` — `callHuggingFace()` + `callWithRetry()` (exponential backoff, 3 retries)

### AI Pipeline (3 uses)

#### A. Concept Generation
- **Route:** `POST /api/ai/generate-concepts`
- **Trigger:** When user enters a topic and the Level step loads (all 3 levels pre-fetched in parallel)
- **Prompt source:** `lib/ai/prompts/concept-prompts.ts` → `buildConceptPrompt(topic, level)`
- **Prompt asks for:** Exactly 8 concepts as a JSON array `["concept 1", ..., "concept 8"]`
- **Validation:** `validateConceptResponse()` — checks JSON array, exactly 8 strings, 2-10 words each
- **Fallback:** `getFallbackConcepts()` — hardcoded concepts for Python/JavaScript/React; generic templates for other topics
- **Settings:** `maxTokens: 500, temperature: 0.7`

#### B. Schedule Generation
- **Route:** `POST /api/ai/generate-schedule`
- **Trigger:** Immediately after topic creation, during the `generating` step
- **Prompt source:** `lib/ai/prompts/` (schedule prompts)
- **Input:** `{ topicId, concepts: [{id, name}], timeframeDays, dailyMinutes }`
- **Output:** `StudySchedule` — list of `ScheduleSession` objects with `date (YYYY-MM-DD)`, `conceptIds[]`, `type` (`initial` | `reinforcement` | `mixed-review` | `final-review`), `questionCount`, `estimatedMinutes`
- **Storage:** `schedulesStorage.saveSchedule()` → `localStorage` key `learning-retention-schedules`

#### C. Quiz Generation
- **Route:** `POST /api/ai/generate-quiz`
- **Trigger:** After schedule generation, one API call per concept (sequential loop)
- **Prompt source:** `lib/ai/prompts/quiz-prompts.ts` → `buildQuizPrompt(topic, concept, level, count=10)`
- **Output format:** JSON array of MCQ objects:
  ```json
  { "type": "mcq", "question": "...", "options": ["A","B","C","D"], "correctAnswer": "...", "explanation": "...", "keywords": ["..."] }
  ```
- **Validation:** `validateQuizResponse()` — must have exactly 4 options, correctAnswer must match one option exactly, keywords 3-7, explanation ≥ 30 chars, question 10-300 chars
- **Quality scoring:** `calculateQuestionQuality()` — scores 0-100 based on option length variance, explanation detail, problematic patterns
- **Storage:** `questionsStorage.saveQuestions()` → `localStorage` key `learning-retention-questions`
- **Settings:** `maxTokens: 2000, temperature: 0.7`

### Where AI sits in UX
- AI runs **once at topic creation time** — not on every quiz attempt.
- Users see a progress bar during generation ("Creating your study plan... Generating questions for X... 78% complete").
- Questions are stored and reused indefinitely until explicitly regenerated.
- Users can regenerate questions for a specific topic (Cockpit) or specific concept (Knowledge Base), which calls `POST /api/ai/generate-quiz` again.

---

## 5. Data Model

All data lives in **browser `localStorage`** under 4 keys:

### Key: `learning-retention-mvp-data` → `Topic[]`
```typescript
Topic {
  id: string;               // crypto.randomUUID()
  name: string;             // "React Hooks"
  concepts: Concept[];
  level: 'beginner' | 'intermediate' | 'expert';
  industry?: string;        // unused
  focusArea?: string;       // unused
  memoryScore: number;      // 0-100, weighted average of quiz scores
  retentionScore?: number;  // time-decayed score — typed but not yet computed
  lastPracticed: Date;
  nextReviewDate: Date;     // legacy spaced repetition field
  totalAttempts: number;
  studyPlan?: StudyPlan;    // set during add-topic wizard
  scheduleId?: string;      // links to a StudySchedule
}

Concept {
  id: string;
  text: string;             // "Using useEffect hook"
  status: 'strong' | 'weak' | 'neutral';
  retentionScore?: number;  // typed, not computed
  familiar?: boolean;       // user-marked at onboarding
  aiGenerated?: boolean;
}
```

### Key: `learning-retention-schedules` → `StudySchedule[]`
```typescript
StudySchedule {
  id: string;
  topicId: string;
  sessions: ScheduleSession[];
  createdAt: string;        // ISO date string
}

ScheduleSession {
  id: string;
  date: string;             // YYYY-MM-DD
  conceptIds: string[];     // which concepts this session covers
  type: 'initial' | 'reinforcement' | 'mixed-review' | 'final-review';
  questionCount: number;
  estimatedMinutes: number;
  completed: boolean;
  result: SessionResult | null;
}

SessionResult {
  score: number;
  correctCount: number;
  totalCount: number;
  completedAt: string;
}
```

### Key: `learning-retention-questions` → `AIGeneratedQuestion[]`
```typescript
AIGeneratedQuestion {
  id: string;
  topicId: string;
  conceptId: string;
  conceptName?: string;
  type: 'mcq' | 'short-answer';
  difficulty: 'beginner' | 'intermediate' | 'expert';
  question: string;
  options?: string[];         // MCQ only, exactly 4
  correctAnswer: string;
  explanation: string;
  keywords: string[];
  acceptableAnswers?: string[];  // short-answer only (not currently generated)
  validationScore: number;
  aiGenerated: boolean;
  createdAt: string;
}
```

### Key: `learning_loop_quiz_history` → `QuizAttempt[]`
```typescript
QuizAttempt {
  id: string;
  topicId: string;
  sessionId?: string;           // links to ScheduleSession
  type: 'topic' | 'concept';
  targetConceptId?: string;
  score: number;                // 0-100
  correctCount: number;
  totalCount: number;
  completedAt: string;
  durationSeconds?: number;
  questions: {
    questionId: string;
    conceptId: string;
    conceptName?: string;
    isCorrect: boolean;
    userAnswer: string;
    correctAnswer: string;
    timeSpentSeconds?: number;
  }[];
  conceptBreakdown: {
    conceptId: string;
    conceptName?: string;
    correctCount: number;
    totalCount: number;
    score: number;
  }[];
}
```

### Key: `learning_loop_onboarding_completed` → `"true"` (string)

---

## 6. Auth & User State

**Current state: Stub auth only.**

- `AuthProvider` (`components/auth-provider.tsx`) wraps the entire app.
- Auth state is `useState<boolean>` — **resets to `false` on every page refresh**.
- `login()` function simply calls `setIsAuthenticated(true)`.
- Navigation guards redirect to `/login` when `isAuthenticated === false`.
- No real identity — no user ID, no server-side session, no tokens.
- There are no roles. It's a single-user app.
- Onboarding completion is tracked via a `localStorage` string flag.

**Side effect:** Because auth resets on refresh, all the `localStorage` data (topics, schedules, questions) persists, but the user gets kicked to `/login` on every hard refresh. This is a **known MVP shortcut** acknowledged in code comments.

---

## 7. External Dependencies

| Dependency | Purpose |
|---|---|
| **Next.js 16** (App Router) | Framework. `app/` directory routing, API routes under `app/api/`. |
| **React 19** | UI rendering. |
| **TypeScript 5** | Type safety throughout. |
| **TailwindCSS v4** | Utility-first styling. |
| **shadcn/ui** (Radix UI) | UI component library: Button, Card, Dialog, AlertDialog, Badge, Input, Tooltip, ScrollArea, Progress. |
| **Framer Motion / Motion** | Animations in add-topic wizard (slide transitions, progress bars). |
| **next-themes** | Dark/light mode via `ThemeProvider`. |
| **Lucide React** | All icons throughout the UI. |
| **@tabler/icons-react** | Secondary icon set (less common usage). |
| **date-fns** | Date utilities (imported but may be underused). |
| **HuggingFace Router API** | AI inference. Model: `meta-llama/Llama-3.1-8B-Instruct:novita`. Free tier (~1000 req/day). |
| **`crypto.randomUUID()`** | ID generation for topics & concepts. Browser native. |
| **localStorage** | All data persistence. No database. |
| **Vercel** | Deployment target (`vercel.json` present). |
| **Outfit (Google Font)** | Typography — loaded via `next/font`. |
