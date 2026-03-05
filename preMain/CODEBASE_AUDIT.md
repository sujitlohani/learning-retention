# CODEBASE_AUDIT.md — Memora

> **Purpose:** Full audit of the existing codebase for use in planning a clean modular refactor.  
> **Date:** March 2026

---

## 1. Folder Structure

```
learning_retention/
├── app/                          # Next.js App Router pages + API
│   ├── add-topic/
│   │   └── page.tsx              # 7-step topic onboarding wizard (883 lines!)
│   ├── api/
│   │   └── ai/
│   │       ├── generate-concepts/route.ts  # POST: AI concept generation
│   │       ├── generate-quiz/route.ts      # POST: AI MCQ generation
│   │       └── generate-schedule/route.ts  # POST: AI schedule generation
│   ├── classroom/
│   │   └── page.tsx              # Placeholder — disabled in sidebar ("Soon")
│   ├── cockpit/
│   │   └── page.tsx              # Progress dashboard (557 lines)
│   ├── content-dump/
│   │   └── page.tsx              # WIP — purpose unclear  
│   ├── knowledge-base/
│   │   └── page.tsx              # Concept browser with filters/sort (739 lines)
│   ├── learn/
│   │   └── [topicId]/
│   │       └── page.tsx          # Quiz experience (dynamic route)
│   │       └── concept/[conceptId]/page.tsx  # Deep-dive concept quiz (if exists)
│   ├── login/
│   │   └── page.tsx              # Stub login page
│   ├── onboarding/
│   │   └── page.tsx              # First-run onboarding
│   ├── globals.css               # Global styles + dot-grid, animations, custom scrollbar
│   ├── icon.png                  # App icon
│   └── layout.tsx                # Root layout: ThemeProvider > AuthProvider > Sidebar + main
│   └── page.tsx                  # Home dashboard (259 lines)
│
├── components/
│   ├── auth-provider.tsx         # React Context for auth state
│   ├── quiz-history-modal.tsx    # Large modal for quiz history (18KB, 500+ lines)
│   ├── sidebar.tsx               # Nav sidebar (desktop sticky + mobile drawer)
│   ├── sidebar-demo.tsx          # Unused demo sidebar component
│   ├── theme-provider.tsx        # next-themes wrapper
│   ├── theme-toggle.tsx          # Dark/Light toggle button
│   └── ui/                       # shadcn/ui generated components (20 files)
│       ├── alert-dialog.tsx
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sidebar.tsx           # shadcn sidebar primitive (NOT the app sidebar)
│       ├── tooltip.tsx
│       └── ... (others)
│
├── context/                      # Planning/design docs (not runtime code)
│   ├── ai_implementation.md
│   ├── ai-usage-overview.md
│   ├── master_prompt.md
│   ├── product-overview.md
│   ├── refinement.md
│   ├── UI_refinement.md
│   └── memora/, progress/        # Sub-docs
│
├── hooks/
│   └── use-mobile.tsx            # Only custom hook — detects mobile breakpoint
│
├── lib/
│   ├── storage.ts                # Primary topics storage (localStorage CRUD)
│   ├── quiz-generator.ts         # Legacy/utility quiz generator (may be deprecated)
│   ├── utils.ts                  # Only exports `cn()` (clsx + tailwind-merge)
│   ├── ai/
│   │   ├── huggingface-client.ts # HTTP client for HuggingFace API + retry logic
│   │   ├── parsers/
│   │   │   ├── concept-parser.ts # Parses AI concept response → string[]
│   │   │   └── quiz-parser.ts    # Parses AI quiz response → AIGeneratedQuestion[]
│   │   ├── prompts/
│   │   │   ├── concept-prompts.ts  # buildConceptPrompt(), getFallbackConcepts(), validate
│   │   │   └── quiz-prompts.ts     # buildQuizPrompt(), validateQuizResponse(), quality score
│   │   └── validators/           # Validation modules (format, fact, quality)
│   ├── data/                     # Static seed/fixture data
│   ├── storage/
│   │   ├── questions-storage.ts  # AI questions CRUD (localStorage)
│   │   ├── quiz-history-storage.ts # Quiz attempt history CRUD (localStorage)
│   │   └── schedules-storage.ts  # Study schedule CRUD + session queries
│   └── utils/
│       ├── schedule-calculator.ts  # timeframeToDays(), session date math
│       └── ... (other utils)
│
├── public/                       # Static assets
├── types/
│   ├── index.ts                  # Topic, Concept, QuizQuestion, QuizResult
│   └── ai.ts                     # All AI-related types (103 lines)
│
├── .env.local                    # HF_TOKEN=...
├── huggingface-client.ts         # ROOT-LEVEL duplicate of lib/ai/huggingface-client.ts ⚠️
├── test-hf.js                    # Root-level test script for HuggingFace API
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vercel.json
```

---

## 2. Core Files

### Pages

| File | What it does | Key imports | Who depends on it |
|---|---|---|---|
| `app/layout.tsx` | Root layout. Wraps all pages in `ThemeProvider > AuthProvider > TooltipProvider > Sidebar + main`. Sets font (Outfit), app title "Memora". | `auth-provider`, `sidebar`, `theme-provider` | All pages |
| `app/page.tsx` | Home dashboard. Shows due sessions (from real schedules + legacy), upcoming sessions (next 7 days), recent topics. Navigates to `/learn/[id]?session=[id]`. | `storage`, `schedulesStorage`, `questionsStorage` | Users land here |
| `app/add-topic/page.tsx` | 7-step topic wizard. Manages all onboarding state locally. Calls 3 AI endpoints on submit. **883 lines — prime refactor target.** | `storage`, `schedulesStorage`, `questionsStorage`, all 3 AI routes | Core conversion flow |
| `app/cockpit/page.tsx` | Progress dashboard. Reads all topics + quiz history. Shows stats grid, priority review, topic cards with modal. | `storage`, `schedulesStorage`, `quizHistoryStorage`, `quiz-history-modal` | Navigation item |
| `app/knowledge-base/page.tsx` | Concept browser. Flattens all concepts across topics, applies real quiz history stats. Filter by tag, topic, sort. Concept detail modal with performance history chart. **739 lines.** | `storage`, all 3 storage modules | Navigation item |

### Storage Layer

| File | What it does | localStorage Key | Used by |
|---|---|---|---|
| `lib/storage.ts` | Topics CRUD: `getTopics()`, `saveTopic()`, `createTopic()`, `deleteTopic()`, `updateTopicAfterQuiz()`, `updateConceptFamiliarity()`, `addCustomConcept()`, `deleteConcept()`. Seeded with one mock "Photosynthesis" topic if empty. | `learning-retention-mvp-data` | All pages |
| `lib/storage/schedules-storage.ts` | Schedules CRUD + temporal queries: `getTodaysSessions()`, `getUpcomingSessions(days)`, `markSessionComplete()`, `getScheduleProgress()`. | `learning-retention-schedules` | Home, Cockpit, add-topic |
| `lib/storage/questions-storage.ts` | Question bank CRUD: `getQuestionsForSession()` (shuffled), `saveQuestions()` (deduped by ID), `deleteQuestionsForTopic/Concept()`, `getQuestionCountByConcept()`. | `learning-retention-questions` | learn page, add-topic, Cockpit, KB |
| `lib/storage/quiz-history-storage.ts` | Quiz attempt history: `saveAttempt()`, `getHistoryForTopic()`, `getHistoryForConcept()`, `getAllHistory()`. Includes per-question detail and concept breakdowns. | `learning_loop_quiz_history` | Cockpit, Knowledge Base, quiz-history-modal |

### AI Layer

| File | What it does |
|---|---|
| `lib/ai/huggingface-client.ts` | `callHuggingFace({prompt, maxTokens, temperature})` → HuggingFace chat completions. `callWithRetry()` wraps with exponential backoff (3 retries). Handles 401, 503 errors specifically. |
| `lib/ai/prompts/concept-prompts.ts` | `buildConceptPrompt(topic, level)` — returns a detailed prompt requesting 8 JSON-array concepts. `getFallbackConcepts()` — hardcoded fallbacks for python/js/react. `validateConceptResponse()` — validates array structure. |
| `lib/ai/prompts/quiz-prompts.ts` | `buildQuizPrompt(topic, concept, level, count)` — extensive MCQ generation prompt with 3 shot examples and quality requirements. `validateQuizResponse()` — validates each question against 7 criteria. `calculateQuestionQuality()` — 0-100 scorer. |
| `lib/ai/parsers/concept-parser.ts` | Strips markdown code fences, `JSON.parse()`. |
| `lib/ai/parsers/quiz-parser.ts` | Strips markdown, parses, maps raw objects to `AIGeneratedQuestion` typed objects. |

### Auth & Layout Components

| File | What it does |
|---|---|
| `components/auth-provider.tsx` | React Context. `isAuthenticated` is plain `useState` (no persistence). Redirect logic: unauthenticated → `/login`, authenticated without onboarding → `/onboarding`, authenticated with onboarding → `/`. |
| `components/sidebar.tsx` | Desktop sticky sidebar (256px) + mobile drawer. Nav items: Home, Cockpit, Knowledge Base, Classroom (disabled). Hidden on `/login`, `/onboarding`, `/add-topic`, and all `/learn/` routes. |
| `components/quiz-history-modal.tsx` | Complex modal showing quiz attempt history as a table/list with score breakdown per concept. Filter by attempt, view question-by-question breakdown. |

---

## 3. Component Map

### Feature: Navigation & Shell
- `components/sidebar.tsx` — main nav
- `components/theme-toggle.tsx` — dark/light button
- `components/theme-provider.tsx` — next-themes wrapper
- `components/auth-provider.tsx` — auth context

### Feature: Topic Onboarding
- `app/add-topic/page.tsx` — all wizard steps (monolithic, no sub-components)
- `components/ui/alert-dialog.tsx` — duplicate topic dialog
- `components/ui/input.tsx`, `button.tsx` — form inputs
- Framer Motion `motion.div`, `AnimatePresence` — step transitions

### Feature: Home Dashboard
- `app/page.tsx` — entire page is self-contained, no sub-components

### Feature: Quiz / Learn
- `app/learn/[topicId]/page.tsx` — quiz rendering

### Feature: Cockpit
- `app/cockpit/page.tsx` — monolithic page
- `components/quiz-history-modal.tsx` — history viewer
- `components/ui/dialog.tsx`, `alert-dialog.tsx`, `tooltip.tsx`

### Feature: Knowledge Base
- `app/knowledge-base/page.tsx` — monolithic page
- Same UI primitives as above

### UI Primitives (shadcn/ui — `components/ui/`)
`alert-dialog`, `badge`, `button`, `card`, `checkbox`, `dialog`, `dropdown-menu`, `input`, `label`, `progress`, `scroll-area`, `separator`, `sidebar` (primitive), `tooltip`

---

## 4. State Management

There is **no global state management library** (no Redux, Zustand, Jotai, etc.).

| Layer | How |
|---|---|
| **Auth state** | `AuthContext` via `useContext`. `isAuthenticated: boolean`. Resets on page refresh. |
| **Page-level state** | `useState` hooks within each page component. |
| **Derived/computed data** | `useMemo` for filtered/sorted concept lists in Knowledge Base. |
| **Shared data** | All shared state is **read from localStorage** fresh on each page mount (no caching layer). |
| **Theme** | `next-themes` library context. |

**The entire data layer is effectively a synchronous localStorage key-value store read on mount.**

---

## 5. API / Data Layer

### API Routes (Server-side, Next.js route handlers)

All live under `app/api/ai/`:

```
POST /api/ai/generate-concepts  → { topic, level } → { concepts: string[], success }
POST /api/ai/generate-quiz      → { topic, concept, conceptId, topicId, level, count } → { questions: AIGeneratedQuestion[], success }
POST /api/ai/generate-schedule  → { topicId, concepts: [{id,name}], timeframeDays, dailyMinutes } → { schedule: StudySchedule, success }
```

All routes call `callHuggingFace()` from `lib/ai/huggingface-client.ts` and use the HF_TOKEN env var.

### Client-side Data Access
All localStorage reads/writes happen **directly in page components** via the storage module singletons:
```typescript
// Typical pattern in every page:
useEffect(() => {
  const topics = storage.getTopics();  // localStorage read
  // ... compute derived state
  setState(derived);
}, []);
```

**No React Query, no SWR, no data fetching library.** Zero server-side data fetching for user data.

### For Supabase migration, these are the data flow change points:
1. Replace `storage.getTopics()` → `supabase.from('topics').select()`
2. Replace `schedulesStorage.*` → `supabase.from('schedules').*`
3. Replace `questionsStorage.*` → `supabase.from('questions').*`
4. Replace `quizHistoryStorage.*` → `supabase.from('quiz_attempts').*`

---

## 6. Routing

| Route | Page | Data needed |
|---|---|---|
| `/` | Home Dashboard | `storage.getTopics()`, `schedulesStorage.getTodaysSessions()`, `schedulesStorage.getUpcomingSessions(7)`, `questionsStorage.getQuestionsForSession()` |
| `/login` | Stub login | None |
| `/onboarding` | Onboarding | `localStorage.getItem('learning_loop_onboarding_completed')` |
| `/add-topic` | Topic Wizard | Reads topics for duplicate check. Writes to all 4 storage modules. Calls 3 AI API routes. |
| `/cockpit` | Progress Dashboard | All 4 storage modules |
| `/knowledge-base` | Concept Browser | All 4 storage modules |
| `/learn/[topicId]` | Quiz Page | `storage.getTopics()`, `questionsStorage.getQuestionsForSession()`, `schedulesStorage.getScheduleById()` |
| `/learn/[topicId]/concept/[conceptId]` | Concept Deep Dive | Same as above, filtered to one concept |
| `/classroom` | Placeholder | None |
| `/content-dump` | WIP | Unknown |

**URL param usage:**
- `/learn/[topicId]?session=[sessionId]` — schedule-based session
- `/learn/[topicId]?conceptId=[conceptId]` — concept-specific drill
- All query params read with `useSearchParams()`

---

## 7. Pain Points / Tech Debt

### Critical
1. **Auth is fake.** `isAuthenticated` resets on every refresh. Every user gets bounced to login on reload. This blocks any real multi-device or multi-user usage.

2. **All data in localStorage.** 4 separate localStorage keys with no cross-referencing integrity. Deleting a topic does not cascade-delete its schedules, questions, or quiz history (must call 3+ separate delete functions manually, and some pages don't do this). Risk of orphaned data.

3. **`add-topic/page.tsx` is 883 lines.** The entire 7-step wizard is one monolithic component with all business logic inlined. No sub-components. Hard to test, hard to modify.

4. **`knowledge-base/page.tsx` is 739 lines** and `cockpit/page.tsx` is 557 lines — same problem.

5. **Root-level `huggingface-client.ts` duplicate.** There's a copy of the HuggingFace client at the root directory AND at `lib/ai/huggingface-client.ts`. These may diverge.

### Significant
6. **No loading/error state management pattern.** Each page/component manages its own `isLoading`, `isError` flags independently with no shared utility.

7. **localStorage reads on every mount with no caching.** Every `useEffect` calls `storage.getTopics()` fresh. For a large dataset, this could be slow. No memoization at the storage layer.

8. **`topic.retentionScore` and `concept.retentionScore`** — these fields are typed and documented but **never computed**. The code uses only the simpler `memoryScore` (weighted average). Time-decay logic is entirely absent.

9. **`topic.industry` and `topic.focusArea`** — typed on `Topic` but never set, read, or displayed anywhere.

10. **`quiz-generator.ts` at `lib/`** — may be a legacy file superseded by the AI route handlers. Unclear if still used.

11. **`sidebar-demo.tsx`** — appears to be a copy/prototype of the sidebar from shadcn's demo. Should be deleted.

12. **`content-dump/page.tsx`** — unknown purpose, not linked from sidebar.

13. **No error boundary.** If any of the 3 AI calls fail during topic creation (the `generating` step), the user sees console errors but no graceful UI feedback beyond silent failure.

14. **`calculateQuestionQuality()` scores questions but the score is never enforced** — the API route stores all passing-format questions regardless of quality score.

15. **Concept checksboxes in add-topic:** If user selects 0 concepts, the code silently falls back to using all concepts (`subConcepts.forEach(sc => sc.checked = true)` is a mutation side-effect, then filtered). This is a bug pattern.

---

## 8. What NOT to Carry Over

| Pattern | Why to drop it |
|---|---|
| Fake auth (`useState` for `isAuthenticated`) | Breaks UX on every refresh; replace with Supabase Auth session |
| Four separate localStorage keys | Replace with a single Supabase DB; eliminates orphaned data and integrity issues |
| Monolithic page components (883-line `add-topic`) | Break into step components, hooks, and service functions |
| Data reads inside `useEffect` on every mount | Replace with proper data fetching hooks (React Query or Supabase realtime) |
| `topic.nextReviewDate` legacy path | The new schedule-based system is more capable; drop the old field |
| Root-level `huggingface-client.ts` and `test-hf.js` | Consolidate to `lib/ai/`, delete root-level copies |
| `sidebar-demo.tsx` | Dead file, delete |
| Inline `useMemo` for complex data transformations in render | Extract to custom hooks or server-side queries |
| `topic.industry`, `topic.focusArea` unused fields | Either implement or remove from schema |
| `topic.retentionScore` (typed but never computed) | Implement or remove — if implementing, it belongs in Supabase as a computed column |
| Synchronous localStorage API in components | Even with Supabase, maintain a clean service layer — components should never touch raw storage |
| No error boundaries | Add global error boundaries and per-route loading/error states |
