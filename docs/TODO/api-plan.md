# API Parallelisation + Question Pool System

Read `brand.md` and `api-context-reference.md` before touching any files. Run `npm run build` after — zero TypeScript errors.

---

## Part 1 — Question Pool and Dice Redesign

### Current Problem
The dice button calls the AI per unit sequentially. Every quiz session draws from whatever questions exist in the pool. This means sessions can repeat if the pool is small.

### New Model

**One pool per topic.** Questions live in localStorage under `learning-retention-questions`, keyed by `topicId`. A session draws randomly from this pool — so every session feels different without needing new AI calls.

**One dice button per topic** (on the Topic Page header), not per unit. Clicking it regenerates the entire question pool for that topic across all units simultaneously.

**Remove per-unit dice buttons** from unit cards in the Units tab. Unit tests still work — they just draw from the existing pool filtered by `unitId`.

### Dice Button Behaviour

**File:** `src/features/topics/components/TopicPage.tsx`

On dice click:
1. Show loading state on the button — "Regenerating..."
2. Fire `generate-quiz` calls for all units in parallel using `Promise.all` — one call per unit, each requesting 5 questions
3. On all resolve: replace the existing pool for this topic in `questionsService` — call `questionsService.replaceQuestionsForTopic(topicId, newQuestions)`
4. Show a brief success toast — "Question pool refreshed"
5. Reset button state

**File:** `src/features/quiz/services/questions.service.ts`

Add `replaceQuestionsForTopic(topicId, questions)` — deletes all existing questions for this topicId then saves the new set. This is the only place the pool is fully replaced.

### No Scheduling API Needed
Spaced repetition intervals are pure math computed in `retention-calculator.ts`. No API, no library. `nextReviewDate = lastPracticed + interval` where interval grows based on score. This already exists — do not add a dependency.

---

## Part 2 — Onboarding Parallelisation

**File:** wherever the onboarding orchestrates API calls (onboarding wizard or hook)

### Current flow (sequential, slow)
```
generate-units → generate-description → generate-familiarity → generate-quiz (initial pool)
```

### New flow
```
generate-units
      ↓ (units resolved)
      ├── generate-description       ┐
      ├── generate-familiarity       ├── all three in parallel via Promise.all
      └── generate-quiz (all units)  ┘
```

After `generate-units` resolves, fire the other three simultaneously. Do not await one before starting the next.

**UI during parallel phase:** Show a single "Setting up your topic..." loading state. The user does not need to see individual call progress. Once all three resolve, advance to the next onboarding step.

**If one call fails:** Don't block the whole flow. Description and familiarity can retry silently later (description generates on first topic page visit if missing, familiarity check can fallback to generic statements). Initial question bank failure is more serious — retry once, then proceed with an empty pool that fills on first quiz.

---

## Part 3 — Dice Parallelisation (Already Partially Covered Above)

**File:** `src/features/quiz/hooks/useQuizSession.ts` or wherever dice currently fires per-unit

Replace any sequential loop that calls `generate-quiz` per unit with `Promise.all`. Each unit call is independent — there is no reason they run one after another.

---

## Verification

1. Dice button on Topic Page header regenerates questions for all units simultaneously — check network tab shows parallel requests not sequential
2. Per-unit dice buttons are gone from the Units tab
3. Unit tests still work correctly drawing from the pool filtered by unitId
4. Onboarding fires description + familiarity + question bank in parallel after units resolve — check server logs show three simultaneous POST requests
5. Replacing the question pool via dice does not leave orphaned questions from the old pool
6. `npm run build` — zero TypeScript errors



Context:

# API Routes — Context Reference

Read this before modifying any API route. Do not create new routes without checking this document first — the functionality may already exist.

All routes live in `app/api/`. All call HuggingFace via `src/services/ai/huggingface-client.ts` using `callWithRetry`. All return `{ success: boolean, ...data }`.

---

## Route Map

### `POST /api/ai/generate-units`
**Purpose:** Generate a list of units for a new topic.
**Input:** `{ topic: string, level: string }`
**Output:** `{ units: Unit[] }`
**Called by:** Onboarding wizard, step where units are displayed for confirmation.
**Notes:** Must complete before any other generation can start — everything depends on the unit list.

---

### `POST /api/ai/generate-description`
**Purpose:** Generate topic description and use cases.
**Input:** `{ topic: string, level: string, units: Unit[] }`
**Output:** `{ description: string, useCases: { title: string, description: string }[] }`
**Called by:** `TopicOverview` on first render if `topic.description` is missing.
**Notes:** Can run in parallel with familiarity check and initial question bank after units exist. Result cached on `topic.description` and `topic.useCases` in localStorage.

---

### `POST /api/ai/generate-quiz`
**Purpose:** Generate quiz questions. Handles multiple question types via `type` field.
**Input variants:**

| type | Required fields | Returns |
|---|---|---|
| `(default/omitted)` | `topic, unit, unitId, topicId, level, count` | MCQ/short-answer questions for one unit |
| `'synthesis'` | `topic, topicId, units[]` | 1 cross-unit applied reasoning question |
| `'coding'` | `topic, topicId, language, units[]` | Coding questions with starterCode + testCases |

**Output:** `{ questions: AIGeneratedQuestion[], success: boolean, fallback: boolean }`
**Called by:** `useQuizSession` (default), daily quiz builder (synthesis), TopicPage code challenge button (coding).
**Notes:** Coding path has full sanitisation + fallback templates. Default path has `validateAndFilterQuestions` + `generateFallbackQuestions`.

---

### `POST /api/ai/generate-familiarity`
**Purpose:** Generate familiarity check statements for onboarding.
**Input:** `{ topic: string, level: string, units: Unit[] }`
**Output:** `{ statements: string[] }`
**Called by:** Onboarding wizard familiarity check step.
**Notes:** Can run in parallel with description and question bank after units exist.

---

### `POST /api/ai/learn`
**Purpose:** Powers the Deep Dive 4-step learning module. Single route handling all steps.
**Input:** `{ step: 'key-idea' | 'example' | 'mini-check' | 'alternate', unitName: string, topicName: string, code?: string, title?: string }`
**Output per step:**
- `key-idea`: `{ title: string, explanation: string, codeSnippet: { language, code, resultLine } | null }`
- `example`: `{ lines: { code: string, explanation: string }[] }`
- `mini-check`: `{ questions: { question, options, correctIndex, explanation }[] }`
- `alternate`: `{ explanation: string }`

**Called by:** `useDeepDiveSession` hook.
**Notes:** Uses multi-strategy JSON extraction. key-idea fires first, then example + mini-check fire in parallel using key-idea output. alternate is on-demand only.

---

### `POST /api/ai/fix-topic-name` *(to be created — see micro-fixes.md)*
**Purpose:** Correct typos in user-entered topic names before saving.
**Input:** `{ name: string }`
**Output:** `{ corrected: string }`
**Called by:** Onboarding wizard after user confirms topic name.

---

## Shared Utilities

**`src/services/ai/huggingface-client.ts`** — `callWithRetry({ prompt, maxTokens, temperature })` — handles retries and returns `{ success: boolean, text: string }`.

**`src/services/ai/parsers/quiz-parser.ts`** — `parseQuizResponse(text, topicId, unitId, level, unitName)` — multi-strategy JSON extraction for quiz questions.

**`src/services/ai/validators/quality-scorer.ts`** — `validateAndFilterQuestions(questions)` — filters low quality questions.

**`src/lib/coding-templates.ts`** — `getCodingFallbackTemplates(topicId, language)` — returns hardcoded fallback coding questions when AI fails.

---

## What Does Not Exist (Do Not Assume)

- No scheduling API route — spaced repetition intervals are computed client-side in `src/lib/retention-calculator.ts`
- No separate route for onboarding quiz — uses `generate-quiz` with default type
- No route for weak area quiz generation — uses `generate-quiz` with default type per weak unit