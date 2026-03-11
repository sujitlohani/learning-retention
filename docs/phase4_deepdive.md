# Phase 4 — Deep Dive Implementation
> Prerequisite: Phase 3 complete. Cockpit working. `npm run build` passing. Read `brand.md` before writing any code.

---

## Context

Deep Dive is a **Mistake Review Workspace**. Its single job is to help users understand what they got wrong and fix it. Everything on this page orbits that purpose.

Keep the name "Deep Dive" — do not rename the page, route, or sidebar nav item.

The Stitch mockup under `deepdive` (HTML + PNG) is a strong visual reference for layout. Use it for structural inspiration. Do not copy code from it. Adapt to the existing codebase and brand tokens.

No new localStorage keys. AI insights are generated on page load and cached in component state only — never persisted to localStorage.

---

## Check Before Building

- Confirm `quizHistoryService.getAllAttempts()` returns `QuizAttempt[]` with `questions[]` and `unitBreakdown[]` nested
- Confirm `topicsService.getTopicById(id)` exists for resolving topic names from `attempt.topicId`
- Confirm `useQuizSession` exposes `startQuiz({ type, topicId, targetUnitId? })` — this is needed for Retry Weak Questions
- Check what HuggingFace client is used in the project (same one used for unit/quiz generation) — use it for AI insights, do not introduce a new client

---

## Page Layout

Two-column on desktop. Single column on mobile.

```
┌─────────────────────────────────────────────────────┐
│ Page heading: "Deep Dive"                           │
│ Subtext: "Review your past sessions and mistakes"   │
├─────────────────────────────────────────────────────┤
│ Filters row (full width)                            │
├───────────────────────────────────┬─────────────────┤
│ LEFT: Session list (~65% width)   │ RIGHT: AI       │
│                                   │ Insights panel  │
│ Collapsible session cards         │ (~35% width)    │
│                                   │                 │
│                                   │ Sticky on       │
│                                   │ desktop         │
└───────────────────────────────────┴─────────────────┘
```

---

## Filters Row

Four controls in a horizontal row, full width:

```
[Topic: All ▾]  [Unit: All ▾]  [All] [Unit Test] [Topic Challenge] [Daily]  [Last 30 days ▾]
```

- Topic dropdown: unique topic names from attempts, resolved via `topicsService.getTopicById()`
- Unit dropdown: unique unit names from `attempt.unitBreakdown[]` across all attempts
- Quiz type pills: `All` `Unit Test` `Topic Challenge` `Daily` — active pill gets `var(--accent)` filled background
- Date range dropdown: `Last 7 days` `Last 30 days` `All time`

All filtering is **client-side in-memory** over the full `QuizAttempt[]` array. No API calls.

Filter logic:
```typescript
let filtered = allAttempts
if (topicFilter) filtered = filtered.filter(a => a.topicId === topicFilter)
if (unitFilter) filtered = filtered.filter(a =>
  a.unitBreakdown.some(u => u.unitId === unitFilter))
if (typeFilter !== 'all') filtered = filtered.filter(a => a.type === typeFilter)
if (dateRange) filtered = filtered.filter(a => isWithinRange(a.completedAt, dateRange))
```

---

## Session Cards (Left Column)

Each session is a collapsible card. Default state: collapsed.

### Collapsed State

```
[type icon]  [Topic Name]                    [82%]  [Oct 28]
             [Quiz type label] • [X attempts]  ████████░░  [▶]
```

- Progress bar below the top row: height 4px, `var(--radius-sm)`, color follows mastery tints
- Score color: danger < 50%, warning 50–74%, success ≥ 75%
- Collapse/expand chevron right-aligned
- Card background `var(--bg-surface)`, border `var(--border)`, `var(--radius-md)`

### Expanded State

```
Correct Count: 16 / 20                    [ Retry Weak Questions ]

✓ What is the time complexity of binary search on a sorted array?
  Answered: O(log n)

✗ Which data structure uses LIFO?
  Your answer: Queue    Correct: Stack
  [Concept: Stack & Queue]  [Difficulty: Medium]

✓ A hash table with chaining solves which problem?
  Answered: Collision
```

**Correct questions (✓):**
- Green checkmark `var(--success)`, question text, user's answer in muted text
- No pills needed

**Incorrect questions (✗):**
- Red X `var(--danger)`, question text
- "Your answer: X" in danger color, "Correct: Y" in success color
- Two pills below if data exists:
  - `Concept: [question.unitName]` — only if `unitName` is defined
  - `Difficulty: [question.difficulty]` — only if `difficulty` is defined
  - Style: `rounded-full text-xs px-2 py-0.5`, `var(--bg-raised)` background, `var(--text-muted)` text
  - Do not render empty pills

**Retry Weak Questions button:**
- Outline style, `var(--accent)` border and text
- Collects all `questions` from this attempt where `isCorrect === false`
- Calls `startQuiz({ type: 'unit-test', topicId: attempt.topicId, targetUnitId: attempt.targetUnitId })` via `useQuizSession`
- If `targetUnitId` is null (topic-level attempt), pass only `topicId` and let the quiz session handle it
- If no incorrect questions exist in this attempt: hide the button

---

## AI Insights Panel (Right Column)

Sticky on desktop — stays visible while user scrolls the session list.

Label: "INSIGHTS" small caps, with a small "AI Analyzing..." spinner shown while generating.

On page load:
1. Take the last 20 attempts from `quizHistoryService.getAllAttempts()`
2. Build a summary object: per-unit accuracy, days since last practiced per unit, total attempts per topic
3. Call HuggingFace with this prompt:

```
"You are analyzing a student's quiz performance in a memory retention app.
Based on the following data, return ONLY valid JSON with no markdown, no explanation, no code fences:
{
  "insight": { "topicArea": string, "accuracyPercent": number },
  "commonPattern": string,
  "suggestedFocus": string[],
  "recommendedUnit": { "unitName": string, "topicId": string, "unitId": string }
}
Data: [JSON.stringify(summaryObject)]
Base everything strictly on the provided data. suggestedFocus should be 2-3 unit names."
```

4. Parse the JSON response. If parsing fails for any reason, fall back to displaying the raw text string in a plain muted text block — do not crash.

Render three sub-sections from the parsed response:

**Performance Insight**
```
PERFORMANCE INSIGHT
[insight.topicArea] questions: [insight.accuracyPercent]% accuracy
[commonPattern — one sentence]
```

**Suggested Focus**
```
SUGGESTED FOCUS
• [suggestedFocus[0]]
• [suggestedFocus[1]]
• [suggestedFocus[2]]
```

**Recommended Action**
```
RECOMMENDED ACTION
[ Start Unit Test → [recommendedUnit.unitName] ]
```
Button calls `startQuiz({ type: 'unit-test', topicId: recommendedUnit.topicId, targetUnitId: recommendedUnit.unitId })` from `useQuizSession`. Do not use raw `router.push`.

Loading state: show skeleton lines in each sub-section while generating.
Error state: show "Unable to generate insights" in muted text. Do not show an error boundary crash.
Cache: store in component state only — regenerate on every page visit.

---

## Empty State

If `quizHistoryService.getAllAttempts()` returns an empty array:
- Hide the filters row
- Hide the session list
- Hide the AI insights panel
- Show a full-width centered empty state:
  ```
  No quiz history yet.
  Complete a quiz to see your review here.
  [Go to Knowledge Base →]
  ```
  "Go to Knowledge Base" navigates to `/knowledge-base`.

---

## What NOT To Build

- Do not rename the page, route, or sidebar label — it stays "Deep Dive"
- Do not store AI insights in localStorage
- Do not build new quiz logic — all quiz triggers go through existing `useQuizSession`
- Do not add new localStorage keys
- Do not add topic navigation links — the only navigation from this page is Retry (quiz trigger) and the empty state link

---

## Verification

1. `npm run build` — zero TypeScript errors
2. Page heading shows "Deep Dive", sidebar nav shows "Deep Dive"
3. All past attempts appear in session list
4. Filters work — topic, unit, type, date all filter correctly
5. Expanding a session shows question breakdown with correct/incorrect styling
6. Incorrect questions show Concept and Difficulty pills when data exists
7. Pills are absent when `unitName` or `difficulty` is undefined
8. Progress bar on collapsed cards is color-coded correctly
9. Retry Weak Questions button appears only when incorrect questions exist
10. Retry Weak Questions launches a quiz session (navigates to quiz, not a no-op)
11. AI Insights panel generates on page load, shows loading state during generation
12. AI Insights handles JSON parse failure gracefully — no crash
13. Recommended Action button triggers quiz correctly via `useQuizSession`
14. Empty state renders correctly in incognito
15. Right panel is sticky on desktop scroll