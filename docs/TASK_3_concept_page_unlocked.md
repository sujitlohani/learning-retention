# Task 3 — Concept Page (Unlocked State)

> Refer to `brand.md` for all colors, typography, spacing, button variants, and component styles.
>
> **UI Reference**: `docs/ui-inspo/unlockedconceptPage/` contains the Stitch-designed HTML and PNG for this page. Use it for layout structure and visual hierarchy inspiration only. Do not lift styles, class names, or markup from it directly — all styling must use Memora's existing design system from `brand.md`. The Stitch file may use a top navbar; Memora uses a left sidebar — follow Memora's actual nav pattern.

---

## Overview
Detail/flow page — does NOT appear in sidebar nav. Renders when the user has already unlocked this concept. This is the core learning unit of Memora.

**Route**: `/concepts/[id]`
*(Shared route with locked — conditional render based on `concept.isUnlocked`)*

---

## Layout

### Header
- Breadcrumb: `Knowledge Base > Machine Learning > Random Forest`
- Concept name: large, bold
- Mastery badge (right): pill showing current mastery state label, e.g. `Almost Mastered` — color from `brand.md` mastery tints
- Stats sub-row: `⏱ 30 questions done` · `📊 24 questions tomorrow`

### Main — Two Column

#### Left Column (wider)
- **Detailed Explanation**: full concept content, well-structured with subheadings and paragraphs
- Concept diagram below explanation (with caption)
- **Key Ideas block**: 3–4 bullet points, each with a short bold label + one-line explanation

- **Related Concepts**: row of concept cards — shows mastery % if user has unlocked them, lock icon if not. Each card: concept name + short tagline.

#### Right Column (narrower)
- **Mastery Overview card**:
  - Large mastery % (circular progress ring)
  - Mastery state label below
  - `questions done` + `questions scheduled` stat rows
- **Quick Practice card**:
  - Heading: `Quick Practice`
  - Subtext: `"Test your knowledge with a focused 5-question MCQ session."`
  - Primary button: `"Start Concept Quiz"`

---

## Components

```
/app/concepts/[id]/page.tsx           ← conditional: locked or unlocked

/components/concept/
  ConceptUnlocked.tsx
  ConceptHeader.tsx                   ← shared with locked
  ConceptBreadcrumb.tsx               ← shared with locked
  DetailedExplanation.tsx
  KeyIdeasList.tsx
  ConceptDiagram.tsx
  MasteryOverviewCard.tsx
  QuickPracticeCard.tsx
  RelatedConcepts.tsx                 ← shared, adapts per concept lock/mastery state
```

---

## Interactions
- `"Start Concept Quiz"` → launches 5-question MCQ for this concept → `/quiz/[id]`
- After quiz → navigates to `/quiz/complete` with results
- Mastery % updates after quiz results are processed
- Related concept cards → navigate to that concept's page
- Breadcrumb → back to KB or topic view

---

## Data
- `concept.explanation` — full content (not teaser)
- `concept.keyIdeas[]`
- `concept.diagram` — image URL or component
- `concept.masteryPercent` — 0–100
- `concept.masteryState` — derived from percent, maps to `brand.md` mastery tints
- `concept.questionsCompleted`
- `concept.questionsScheduled`
- `concept.relatedConcepts[]` — each with their own lock/mastery state