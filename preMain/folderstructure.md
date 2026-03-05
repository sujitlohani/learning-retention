# Memora — New Folder Structure
> Target architecture for the `preMain` branch.  
> This is the blueprint. Follow it exactly. Do not improvise structure.

---

## Core Philosophy

**One rule above all:** `app/` is for routing only. Zero logic, zero state, zero business code lives in `app/`.

Every `app/[route]/page.tsx` is a thin wrapper — it imports a feature component and renders it. That's it.

All logic, state, components, and data access live in `src/features/[feature]/`. This makes every feature self-contained, testable, and replaceable — especially important for the upcoming localStorage → Supabase migration.

---

## Full Directory Tree

```
memora/
├── app/                              # Next.js App Router — routing shell ONLY
│   ├── layout.tsx                    # Root layout: providers + sidebar wrapper
│   ├── page.tsx                      # Renders <HomeDashboard /> from features/dashboard
│   ├── add-topic/
│   │   └── page.tsx                  # Renders <AddTopicPage /> from features/topics
│   ├── cockpit/
│   │   └── page.tsx                  # Renders <CockpitPage /> from features/cockpit
│   ├── knowledge-base/
│   │   └── page.tsx                  # Renders <KnowledgeBasePage /> from features/knowledge
│   ├── learn/
│   │   └── [topicId]/
│   │       └── page.tsx              # Renders <QuizPage /> from features/quiz
│   ├── login/
│   │   └── page.tsx                  # Renders <LoginPage /> from features/auth
│   ├── onboarding/
│   │   └── page.tsx                  # Renders <OnboardingPage /> from features/auth
│   ├── classroom/
│   │   └── page.tsx                  # Placeholder — keep stub
│   ├── globals.css                   # CSS variables, base reset, dot-grid background
│   └── api/
│       └── ai/
│           ├── generate-concepts/
│           │   └── route.ts
│           ├── generate-quiz/
│           │   └── route.ts
│           └── generate-schedule/
│               └── route.ts
│
├── src/
│   ├── features/                     # One folder per product feature
│   │   │
│   │   ├── topics/                   # Everything related to adding + managing topics
│   │   │   ├── components/
│   │   │   │   ├── AddTopicPage.tsx          # Top-level page component (used by app/add-topic)
│   │   │   │   ├── wizard/
│   │   │   │   │   ├── WizardShell.tsx       # Step layout, AnimatePresence, nav buttons
│   │   │   │   │   ├── steps/
│   │   │   │   │   │   ├── CaptureStep.tsx   # Step 1: topic name input
│   │   │   │   │   │   ├── LevelStep.tsx     # Step 2: level + concept selection
│   │   │   │   │   │   ├── TimeframeStep.tsx # Step 3: mastery duration
│   │   │   │   │   │   ├── CommitmentStep.tsx# Step 4: daily time
│   │   │   │   │   │   ├── SourceStep.tsx    # Step 5: learning source
│   │   │   │   │   │   ├── ConfirmStep.tsx   # Step 6: summary + confirm
│   │   │   │   │   │   ├── GeneratingStep.tsx# Step 7: animated progress + AI calls
│   │   │   │   │   │   └── ExitStep.tsx      # Step 8: success + next action
│   │   │   │   │   └── ConceptCheckbox.tsx   # Reusable concept toggle
│   │   │   ├── hooks/
│   │   │   │   └── useTopicWizard.ts         # All wizard state — step, selections, submission logic
│   │   │   └── services/
│   │   │       └── topics.service.ts         # getTopics, saveTopic, deleteTopic, updateAfterQuiz
│   │   │                                     # Currently wraps localStorage. Swap to Supabase here only.
│   │   │
│   │   ├── quiz/                     # Quiz engine, question rendering, history
│   │   │   ├── components/
│   │   │   │   ├── QuizPage.tsx              # Top-level (used by app/learn/[topicId])
│   │   │   │   ├── QuestionCard.tsx          # Single MCQ question + options
│   │   │   │   ├── AnswerOption.tsx          # Individual option button (default/selected/correct/wrong)
│   │   │   │   ├── QuizResultSummary.tsx     # End-of-quiz score + concept breakdown
│   │   │   │   └── QuizHistoryModal.tsx      # History viewer (moved from components/)
│   │   │   ├── hooks/
│   │   │   │   └── useQuizSession.ts         # Question loading, answer tracking, completion logic
│   │   │   └── services/
│   │   │       ├── questions.service.ts      # getQuestionsForSession, saveQuestions, deleteByTopic
│   │   │       └── quiz-history.service.ts   # saveAttempt, getHistoryForTopic, getHistoryForConcept
│   │   │
│   │   ├── schedule/                 # Study schedule logic
│   │   │   ├── hooks/
│   │   │   │   └── useSchedule.ts            # getTodaysSessions, getUpcoming, markComplete
│   │   │   └── services/
│   │   │       └── schedule.service.ts       # All schedule CRUD + temporal queries
│   │   │                                     # Currently wraps localStorage. Swap to Supabase here only.
│   │   │
│   │   ├── dashboard/                # Home dashboard
│   │   │   └── components/
│   │   │       ├── HomeDashboard.tsx         # Top-level (used by app/page.tsx)
│   │   │       ├── DueSessionCard.tsx        # Single "due for review" card
│   │   │       └── UpcomingSessionsList.tsx  # Next 7 days list
│   │   │
│   │   ├── cockpit/                  # Progress dashboard
│   │   │   └── components/
│   │   │       ├── CockpitPage.tsx           # Top-level (used by app/cockpit)
│   │   │       ├── StatsGrid.tsx             # 4-stat summary row
│   │   │       ├── TopicCard.tsx             # Topic card with memory score + progress
│   │   │       └── TopicDetailModal.tsx      # Concept breakdown + history + actions
│   │   │
│   │   ├── knowledge/                # Knowledge base / concept browser
│   │   │   └── components/
│   │   │       ├── KnowledgeBasePage.tsx     # Top-level (used by app/knowledge-base)
│   │   │       ├── ConceptCard.tsx           # Single concept with performance stats
│   │   │       ├── ConceptFilters.tsx        # Tag filter + sort controls
│   │   │       └── ConceptDetailModal.tsx    # Concept deep-dive with history chart
│   │   │
│   │   └── auth/                     # Auth state + login + onboarding
│   │       ├── components/
│   │       │   ├── LoginPage.tsx
│   │       │   └── OnboardingPage.tsx
│   │       ├── hooks/
│   │       │   └── useAuth.ts                # Exposes: user, login(), logout(), isAuthenticated
│   │       └── services/
│   │           └── auth.service.ts           # Currently: localStorage flag. Later: Supabase Auth.
│   │
│   ├── components/                   # Shared UI — only things used across 3+ features
│   │   ├── sidebar/
│   │   │   └── Sidebar.tsx
│   │   ├── theme/
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── ThemeToggle.tsx
│   │   └── ui/                       # shadcn/ui primitives — do not modify these
│   │       └── [all shadcn files]
│   │
│   ├── services/                     # Cross-feature, non-UI services
│   │   └── ai/
│   │       ├── huggingface-client.ts         # API client + retry logic (canonical, only copy)
│   │       ├── prompts/
│   │       │   ├── concept-prompts.ts
│   │       │   ├── quiz-prompts.ts
│   │       │   └── schedule-prompts.ts
│   │       ├── parsers/
│   │       │   ├── concept-parser.ts
│   │       │   └── quiz-parser.ts
│   │       └── validators/
│   │           └── quiz-validators.ts
│   │
│   ├── hooks/                        # Shared hooks only — used across 3+ features
│   │   └── use-mobile.ts
│   │
│   ├── types/                        # Global TypeScript types
│   │   ├── index.ts                  # Topic, Concept, StudyPlan, StudySchedule, ScheduleSession
│   │   └── ai.ts                     # AIGeneratedQuestion, QuizAttempt, AI response types
│   │
│   └── lib/                          # Pure utilities — no React, no side effects
│       ├── utils.ts                  # cn() helper
│       └── schedule-calculator.ts   # timeframeToDays(), session date math
│
├── .env.local
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

---

## The Service Layer Rule (Critical for Supabase Migration)

Every feature's `services/*.service.ts` file follows this contract:

```
Input:  typed arguments (no raw localStorage calls from components)
Output: typed return values (matching types/ definitions)
Side effects: all storage reads/writes happen HERE and nowhere else
```

When Supabase migration happens, only the service files change. Components and hooks are untouched.

**Example — what changes and what doesn't:**

| File | On localStorage | On Supabase | Changes? |
|---|---|---|---|
| `features/topics/services/topics.service.ts` | Reads/writes localStorage | Calls `supabase.from('topics')` | ✅ Yes — only this file |
| `features/topics/hooks/useTopicWizard.ts` | Calls `topics.service.ts` | Still calls `topics.service.ts` | ❌ No change |
| `features/topics/components/AddTopicPage.tsx` | Uses the hook | Uses the hook | ❌ No change |

---

## What Gets Deleted from the Old Structure

| Old path | Reason |
|---|---|
| `huggingface-client.ts` (root level) | Duplicate — canonical is in `src/services/ai/` |
| `test-hf.js` (root level) | Dev test script — delete |
| `components/sidebar-demo.tsx` | Dead file — delete |
| `app/content-dump/` | Unknown WIP — delete or park |
| `lib/storage.ts` | Replaced by `features/topics/services/topics.service.ts` |
| `lib/storage/` (entire dir) | Replaced by services inside each feature |
| `lib/quiz-generator.ts` | Legacy — superseded by AI route handlers |
| `lib/ai/` (entire dir) | Moved to `src/services/ai/` |

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Page-level components | PascalCase, suffixed with `Page` | `CockpitPage.tsx` |
| Feature components | PascalCase, descriptive | `DueSessionCard.tsx` |
| Hooks | camelCase, prefixed with `use` | `useTopicWizard.ts` |
| Services | camelCase, suffixed with `.service.ts` | `topics.service.ts` |
| Types | PascalCase for types/interfaces | `Topic`, `ScheduleSession` |
| CSS variables | kebab-case with `--` prefix | `--bg-surface`, `--accent` |
| shadcn components | Leave exactly as generated | `button.tsx`, `card.tsx` |

---

## After the Build — Antigravity Must Generate

Once the new structure is built and functional, generate a `GUIDE.md` at the project root that includes:

1. **Map of every file** — what it does in one sentence, what it imports, what depends on it.
2. **Flow walkthroughs** — step-by-step trace of each key user flow through the new file structure (e.g. "User adds a topic" → which files activate in order).
3. **Service layer contracts** — inputs/outputs for every function in every `*.service.ts`.
4. **Where to add new features** — a decision guide: "If I'm adding X, I create files in Y and connect them at Z."
5. **What to change for Supabase** — a precise checklist of exactly which files and functions need updating, in the correct order.

This `GUIDE.md` becomes the handoff document for the next sprint.




