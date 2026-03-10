# Task 4 — Quiz Completion Screen

> Refer to `brand.md` for all colors, typography, spacing, button variants, and component styles.
>
> **UI Reference**: `docs/ui-inspo/quizcompletionPage/` contains the Stitch-designed HTML and PNG for this page. Use it for layout structure and visual hierarchy inspiration only. Do not lift styles, class names, or markup from it directly — all styling must use Memora's existing design system from `brand.md`. The Stitch file may use a top navbar; Memora uses a left sidebar — follow Memora's actual nav pattern.

---

## Overview
Flow/result page — does NOT appear in sidebar nav. Shown after any quiz type (Daily, Concept, or Topic) is completed.

**Route**: `/quiz/complete` or `/quiz/[id]/complete`

---

## Layout

### Header
- Centered: **"Quiz Completed! 🎉"**
- Subtext: `"Great job, you're making steady progress."`

### Summary Row — Three Stat Cards (side by side)

| Card | Content |
| :--- | :--- |
| Accuracy | Circular donut ring showing % (this is the visual hero — make it largest) |
| Correct Answers | Bold `8/10` |
| XP Earned | Bold `+45 XP` with XP icon |

- Small note below row: e.g. `"You ranked in the top 30% on this quiz."`

### Section — Concept Mastery Impact
- Heading: `Concept Mastery Impact` · right-aligned label: `Scored (%) ↑`
- List of affected concepts, each row:
  - Concept name (bold)
  - Mastery state label (muted, small)
  - Mastery % (right, bold)
  - Thin progress bar — color from `brand.md` mastery tints
- Example rows:
  ```
  Binary Trees       Almost Mastered   84% ████████░░
  Hash Tables        Learning          70% ███████░░░
  Python Generators  Learning          88% ████████░░
  ```

### Section — Needs Review *(only if weak concepts exist)*
- Warning heading: `⚠ Needs Review`
- Subtext: `"You missed questions on these concepts. Your next session will include them."`
- List of weak concepts, each with a `"Review Now →"` link → opens that concept's unlocked page

### Actions
- Primary button: `"Continue Learning →"` → `/cockpit`
- Secondary button: `"Start Another Quiz"`
- Muted note below: `"Your next recommended session is in 2 days."`

---

## Components

```
/app/quiz/complete/page.tsx

/components/quiz/
  QuizCompletionHeader.tsx
  StatSummaryRow.tsx
  AccuracyRing.tsx              ← circular donut chart
  CorrectAnswersStat.tsx
  XPEarnedStat.tsx
  ConceptMasteryImpact.tsx
  MasteryImpactRow.tsx
  WeakConceptsReview.tsx
  QuizCompletionActions.tsx
```

---

## Interactions
- `"Continue Learning →"` → `/cockpit`
- `"Start Another Quiz"` → quiz selection or same quiz type
- `"Review Now →"` per concept → `/concepts/[id]` (unlocked state)
- Mastery impact rows are display only — no interaction

---

## Data
- `quiz.accuracy` — 0–100
- `quiz.correctAnswers`, `quiz.totalQuestions`
- `quiz.xpEarned`
- `quiz.percentileRank` — optional, for the top X% note
- `quiz.conceptImpacts[]`: `conceptId`, `conceptName`, `newMasteryPercent`, `masteryState`
- `quiz.weakConcepts[]` — subset of conceptImpacts where performance was poor
- `quiz.nextSessionDate` — for the footer note

---

## Tone
Screen should feel celebratory but informative. The Needs Review section should be framed as "what's next" — not punishing.