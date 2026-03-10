# Task 6 — Topic Page

> Read `AGENTS.md` before writing any code.
> Refer to `docs/brand.md` for all colors, typography, spacing, button variants, and component styles.
>
> **UI Reference**: `docs/ui-inspo/topicPage/` contains a Stitch-designed HTML and PNG for this page. Use it for layout and section hierarchy inspiration only — do not copy markup, class names, or styles from it. The Stitch file may show a top navbar; Memora uses a left sidebar. Do not add this page to sidebar nav. All visual decisions must come from `brand.md` and be consistent with the rest of the Memora app.

---

## Overview

Detail/flow page — does NOT appear in sidebar nav. Accessed from Deep Dive topic tiles, Knowledge Base topic filters, Cockpit topic progress cards, and concept breadcrumbs. Acts as a progress dashboard and concept map for a single topic.

**Route**: `/topics/[id]`

All data comes from localStorage via the scoring hooks built in Task 7. No hardcoded values.

---

## Layout

### Page Header
- Topic category tag + active status indicator
- Topic name — large, bold
- Stats row: overall progress % with bar, concepts mastered count, XP earned in topic
- Primary CTA button: `Continue Learning` — navigates to next recommended unlocked concept

### Main — Two Column

#### Left Column (wider)

**Topic Overview**
- Short topic description
- Three stat boxes side by side: total concepts, unlocked count, locked count

**Concept Progress**
- Section heading with `View All` link
- Grid of concept cards, each handling three states:
  - **Mastered** — success color tag, concept name, mastery %, checkmark
  - **Learning** — accent color tag, concept name, mastery % with progress bar
  - **Locked** — muted tag, dimmed name, unlock requirement hint, lock icon
- All cards are clickable and navigate to `/concepts/[id]`
- `+ New Concept` card at the end of the grid as an empty add state

**Recent Activity**
- Chronological list of recent actions within this topic
- Each item: action label, concept name bold, timestamp
- Examples: "Added X to Knowledge Base", "Completed X Quiz · Scored 100%"

#### Right Column (narrower)

**Suggested For You**
- Short list of recommended locked concepts to unlock next
- Each row: concept name, subtopic label, `+` add button

**Related Topics**
- Pill-style tags for related topics — clicking navigates to that topic page

**Pro Tip Card** (accent background)
- A contextual learning tip relevant to this topic
- Dismiss action

---

## Components

```
/app/topics/[id]/page.tsx

/src/features/topics/components/
  TopicPage.tsx
  TopicHeader.tsx
  TopicOverview.tsx
  ConceptProgressGrid.tsx
  ConceptProgressCard.tsx        ← handles mastered/learning/locked states
  RecentActivity.tsx
  SuggestedConcepts.tsx
  RelatedTopics.tsx
  ProTipCard.tsx
```

---

## Data & Hooks

Consume existing hooks from `src/features/scoring/hooks/` — do not duplicate logic.

- `useTopicProgress(topicId)` — progress %, breakdown counts, XP earned
- `useMastery(conceptId)` — per concept card state and percent

Topic metadata (name, description, category, related topics) from `topics_v1` in localStorage.
Concept list for the topic from `topic_concepts_v1` junction.
Recent activity from `quiz_history_v1`.

---

## Interactions

- `Continue Learning` → next unlocked concept in topic → `/concepts/[id]`
- Concept card (any state) → `/concepts/[id]`
- `View All` → full concept list for this topic
- `+` on suggested concept → triggers unlock flow
- Related topic pill → `/topics/[id]`
- Pro Tip dismiss → hides card, persists dismissal in localStorage

---

## Verification

- Progress bar and % reflect real mastery data from `useTopicProgress`
- Concept cards show correct state colors per `brand.md` mastery tints
- Locked cards show unlock hint text, not mastery bar
- Clicking any concept card navigates to correct `/concepts/[id]`
- Page does not appear in sidebar nav
- `npm run build` passes with no TypeScript errors