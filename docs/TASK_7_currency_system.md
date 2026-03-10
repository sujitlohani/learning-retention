# Task 7 — Scoring & Currency System

> Refer to `docs/brand.md` for all styling tokens.
> Read `AGENTS.md` before writing any code.

---

## Overview

Logic-only task — no new pages, no UI changes. Creates the scoring foundation that the rest of the app consumes via hooks.

All scoring logic lives in `src/features/scoring/` with `services/`, `hooks/`, and `types/` subfolders. Shared types go into `src/types/index.ts`.

---

## Many-to-Many Requirement

Concepts belong to multiple topics via the `topic_concepts_v1` junction in localStorage. The progress service must account for this — a concept mastered anywhere counts toward every topic it belongs to. Never assume one concept belongs to one topic only.

---

## 1. Mastery Service

Tracks how well a user knows a concept.

**States in order:** `new` → `learning` → `weak` → `strong` → `almost_mastered` → `mastered`

**Thresholds:**

| State | % Range |
| :--- | :--- |
| new | 0–15% |
| learning | 16–35% |
| weak | 36–55% |
| strong | 56–75% |
| almost_mastered | 76–94% |
| mastered | 95–100% |

**Responsibilities:**
- Derive mastery state from a percentage
- Get and update a concept's mastery record
- Apply quiz result deltas: correct answer raises mastery, incorrect lowers it, floor at 0%, ceiling at 100%
- Perfect quiz score applies an additional bonus on top of the base delta
- When a concept crosses into `mastered` state, trigger an XP bonus via the XP service
- Return weak concepts for a topic by looking up concept IDs from the junction table

**Storage key:** `mastery_v1`

---

## 2. XP Service

Tracks the user's experience point balance and transaction history.

**Earn events and amounts:**

| Event | XP |
| :--- | :--- |
| Correct answer | +5 |
| Quiz completed | +20 |
| Perfect quiz | +40 (replaces quiz completed bonus, not additional) |
| Concept mastered | +25 |
| Daily streak | +10 |

**Spend rules — concept unlock costs by difficulty:**

| Difficulty | Cost |
| :--- | :--- |
| Beginner | 100 XP |
| Intermediate | 150 XP |
| Advanced | 200 XP |

**Responsibilities:**
- Get current balance
- Earn XP for a given event — service calculates the amount internally
- Spend XP for an unlock — refuse and return failure if balance is insufficient
- Check affordability before attempting a spend
- Return full transaction history

**Storage keys:** `xp_balance_v1`, `xp_history_v1`

---

## 3. Progress Service

Calculates topic-level progress by aggregating concept mastery across the junction table.

**Formula:** concepts in the topic where state is `strong`, `almost_mastered`, or `mastered` divided by total concepts in the topic.

**Responsibilities:**
- Return overall progress percentage for a topic
- Return a full breakdown: total, mastered, strong, learning, weak, locked counts
- Return total XP earned within a topic by summing relevant transactions

**Critical:** Always look up concept IDs via `topic_concepts_v1` first — never hardcode or assume topic ownership.

---

## 4. Hooks

Thin reactive wrappers over the services. Components always use hooks — never call services directly.

- `useMastery(conceptId)` — mastery record and update action for one concept
- `useXP()` — balance, earn, spend, and affordability check
- `useTopicProgress(topicId)` — progress percentage, breakdown, and XP earned

---

## 5. Wire Into Existing Components

After services and hooks are built, update these existing components to consume them. Modify existing files — do not create new ones.

| Component | What to connect |
| :--- | :--- |
| `UnlockCTACard.tsx` | Live XP balance and affordability for button disabled state |
| `MasteryOverviewCard.tsx` | Live mastery record for percent and state display |
| `MasteryImpactRow.tsx` | Call mastery update on quiz completion |
| `XPEarnedStat.tsx` | Call XP earn on quiz complete event |
| `ConceptProgressCard.tsx` | Live mastery per card |
| `TopicHeader.tsx` | Live topic progress and XP earned |

---

## Verification

- Completing a quiz updates mastery on the Concept Page
- Perfect quiz applies the correct bonus
- XP balance increases after quiz, decreases after unlock
- Unlock button disabled when balance is insufficient
- Topic progress reflects the correct ratio of strong/mastered concepts
- Mastering a concept in one topic improves progress in all topics it belongs to
- `npm run build` passes with no TypeScript errors