# Task 1 — Deep Dive Page

> Refer to `brand.md` for all colors, typography, spacing, button variants, and component styles.
>
> **UI Reference**: `docs/ui-inspo/deepdivePage/` contains the Stitch-designed HTML and PNG for this page. Use it for layout structure and visual hierarchy inspiration only. Do not lift styles, class names, or markup from it directly — all styling must use Memora's existing design system from `brand.md`. The Stitch file may use a top navbar; Memora uses a left sidebar — follow Memora's actual nav pattern.

---

## Overview
Top-level page — appears in sidebar nav. The concept discovery engine where users explore new (mostly locked) concepts.

**Route**: `/deep-dive`

---

## Layout (top → bottom)

### Header
- Title: **"Deep Dive"**
- Subtitle: `"Discover new concepts and expand your knowledge with our adaptive exploration engine."`
- `"View All"` text link aligned right (scoped to Recommended section)

### Section 1 — Recommended Concepts
- Label: `✦ Recommended Concepts`
- Horizontally scrollable row of locked Concept Cards
- Each card: topic pill, difficulty pill, estimated time, concept name, short description, `"Explore Concept"` outline button

### Section 2 — Guided Concept Paths
- Label: `⟶ Guided Concept Paths`
- 2-column grid of Path Cards
- Each card: topic icon, path name, short description, progress bar + %, `"Continue Path"` or `"Start Path"` button

### Section 3 — Trending Concepts
- Label: `↑ Trending Concepts`
- Horizontal row of smaller cards
- Each card: topic pill, lock icon (top right), concept name, subtopic label, thin mastery bar at bottom

### Section 4 — Explore by Topic
- Label: `⊞ Explore by Topic`
- Grid of topic tiles (3–4 columns)
- Each tile: centered icon, topic name, concept count in muted text


---

## Components

```
/app/deep-dive/page.tsx

/components/deep-dive/
  RecommendedConcepts.tsx
  ConceptCardLocked.tsx       ← shared with KB and links to Concept Page
  GuidedPaths.tsx
  PathCard.tsx
  TrendingConcepts.tsx
  TrendingCard.tsx
  ExploreByTopic.tsx
  TopicTile.tsx
```

---

## Interactions
- `"Explore Concept"` on any card → `/concepts/[id]` (locked state)
- Topic tile → topic-scoped concept list
- Path CTA → first unlocked concept in that path
- `"View All"` → full paginated concept discovery view

---

## Data
- All concepts default to locked unless already unlocked by user
- Recommended: personalized per user topic interests + knowledge graph
- Trending: platform-wide
- Topic tiles show total concept count for that topic