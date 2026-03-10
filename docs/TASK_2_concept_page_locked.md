# Task 2 — Concept Page (Locked State)

> Refer to `brand.md` for all colors, typography, spacing, button variants, and component styles.
>
> **UI Reference**: `docs/ui-inspo/lockedconceptPage/` contains the Stitch-designed HTML and PNG for this page. Use it for layout structure and visual hierarchy inspiration only. Do not lift styles, class names, or markup from it directly — all styling must use Memora's existing design system from `brand.md`. The Stitch file may use a top navbar; Memora uses a left sidebar — follow Memora's actual nav pattern.

---

## Overview
Detail/flow page — does NOT appear in sidebar nav. Renders when the user has not yet unlocked a concept. Entry points: Deep Dive cards, search, quiz results.

**Route**: `/concepts/[id]`
*(Same route as unlocked — conditional render based on `concept.isUnlocked`)*

---

## Layout

### Header
- Breadcrumb: `Knowledge Base > Machine Learning > Random Forest`
- Concept name: large, bold
- Topic pill + difficulty pill (left)
- Bookmark + share icons (right)

### Main — Two Column

#### Left Column (wider)
- **Concept Overview**: 3–4 sentence teaser (not full explanation)
- Diagram/illustration if available
- `"Understanding [Concept]"` subheading + 1–2 more teaser paragraphs
- `"Why It Matters"` — 2–3 bullet points with checkmark icons
- **Related Concepts** — row of small concept chips showing: difficulty tag, concept name, topic tag

#### Right Column (narrower)
- **Prerequisites block**: list of prereq concepts, each with name + completion status (checkmark or empty) + progress bar
- **Unlock CTA card** (prominent):
  - Heading: `Unlock Concept`
  - Body: short description of what unlocking gives access to
  - XP cost + user's current XP
  - Primary button: `"Unlock Concept"` — disabled if requirements not met
  - Secondary link: `"Save for Later"`

---

## Components

```
/app/concepts/[id]/page.tsx          ← renders locked or unlocked based on state

/components/concept/
  ConceptLocked.tsx
  ConceptHeader.tsx                  ← shared with unlocked
  ConceptBreadcrumb.tsx              ← shared with unlocked
  ConceptOverview.tsx
  WhyItMatters.tsx
  RelatedConcepts.tsx                ← shared, adapts per concept lock state
  PrerequisiteList.tsx
  UnlockCTACard.tsx
```

---

## Interactions
- `"Unlock Concept"`: disabled if prereqs incomplete or XP insufficient → on success, deducts XP and transitions page to unlocked state
- `"Save for Later"` → bookmarks concept, appears in KB with a saved tag
- Related concept chips → navigate to that concept's page
- Prerequisite items → navigate to that concept's page

---

## Data
- `concept.overview` — teaser text only, not full explanation
- `concept.prerequisites[]` — list of prereq IDs + user completion status per prereq
- `concept.unlockCost` — XP required
- `concept.relatedConcepts[]`
- `user.xp` — to compare against unlock cost