# Memora Developer Guidebook
### How to navigate, build, and extend this codebase — the right way

---

## Table of Contents
1. [The Big Picture](#1-the-big-picture)
2. [Folder Structure at a Glance](#2-folder-structure-at-a-glance)
3. [The Three Zones](#3-the-three-zones)
4. [Where to Go for What](#4-where-to-go-for-what)
5. [Adding a New Feature — Step by Step](#5-adding-a-new-feature--step-by-step)
6. [What Counts as a Feature vs. Something Else](#6-what-counts-as-a-feature-vs-something-else)
7. [The Data Layer — How Memora Remembers Things](#7-the-data-layer--how-memora-remembers-things)
8. [The Knowledge Graph — Concepts and Topics](#8-the-knowledge-graph--concepts-and-topics)
9. [The Scoring System](#9-the-scoring-system)
10. [AI Integration — How It Fits In](#10-ai-integration--how-it-fits-in)
11. [The Two Learning Flows](#11-the-two-learning-flows)
12. [The Golden Rules](#12-the-golden-rules)
13. [Quick Reference Card](#13-quick-reference-card)

---

## 1. The Big Picture

Memora is a **Next.js** app that helps users build long-term memory of technical concepts through spaced repetition, mastery tracking, and AI-generated quizzes.

Before touching any code, understand the two core ideas that shape the entire architecture:

### Feature-Sliced Design (FSD)
Code is organized by **what it does for the user**, not by what type of code it is.

> **Real-world analogy:** Imagine a restaurant. A bad kitchen organizes by tool — all knives together, all pans together, all plates together. A good kitchen organizes by station — the grill station has its own tools, its own prep space, its own workflow. FSD is the good kitchen.

### Separation of Concerns
Every file and folder has **one clear job**. UI files handle display. Service files handle data. API routes handle server-side logic. They don't do each other's jobs.

> **Why this matters:** When something breaks, you know exactly where to look. When you need to change something, you change it in one place, not five.

---

## 2. Folder Structure at a Glance

```
/
├── app/                          # Pages and API routes (Next.js App Router)
│   ├── api/ai/                   # Server-side AI endpoints
│   │   ├── generate-concepts/
│   │   ├── generate-quiz/
│   │   └── generate-schedule/
│   ├── cockpit/
│   ├── knowledge-base/
│   ├── deep-dive/
│   ├── topics/[id]/              # Topic Page (not in sidebar)
│   ├── concepts/[id]/            # Concept Page (not in sidebar)
│   ├── quiz/[id]/
│   └── quiz/complete/            # Quiz Completion (not in sidebar)
│
├── src/
│   ├── components/               # Shared UI used across 2+ features
│   │
│   ├── features/                 # One folder per product feature
│   │   ├── auth/
│   │   ├── cockpit/
│   │   ├── concepts/             # Concept Page — locked + unlocked states
│   │   ├── deepdive/             # Deep Dive discovery page
│   │   ├── knowledge/            # Knowledge Base
│   │   ├── landing/
│   │   ├── quiz/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── scoring/              # Mastery, XP, topic progress — logic only
│   │   │   ├── services/
│   │   │   └── hooks/
│   │   ├── topics/               # Topic Page
│   │   └── schedule/
│   │
│   ├── lib/                      # Shared logic, services, AI utilities
│   │   ├── ai/                   # AI client setup
│   │   ├── prompts/              # All AI prompt templates
│   │   ├── parsers/              # AI response interpreters
│   │   ├── validators/
│   │   └── math/                 # Spaced repetition calculations
│   │
│   └── types/                    # Shared TypeScript data models
│       └── index.ts
```

---

## 3. The Three Zones

Think of the codebase as three distinct zones. Understanding which zone you're in tells you what rules apply.

---

### Zone 1 — `app/` — Pages & API Routes

The **entry point layer**. Connects URLs to your features.

**What belongs here:** Routing, page layout, API route handlers.
**What does NOT belong here:** Business logic, data manipulation, complex UI. Those live in `src/features/` and `src/lib/`.

> **The thin controller principle:** App Router pages receive a request, hand it off to a feature, and return a result. The actual work happens elsewhere.

---

### Zone 2 — `src/features/` — Feature Modules

The **heart of the application**. Each subfolder owns one user-facing feature end-to-end.

A feature folder typically contains:
- `components/` — the React UI for that feature
- `hooks/` — state management and logic
- `services/` — data access scoped to that feature (if needed)

**The critical rule: features never import from other features.**

```
✅  features/quiz/ imports from lib/         (fine — shared utility)
✅  features/quiz/ imports from components/  (fine — shared UI)
❌  features/quiz/ imports from features/topics/  (wrong — cross-feature coupling)
```

> If two features need the same thing, move it to `src/lib/` or `src/components/`. Don't work around this rule.

---

### Zone 3 — `src/lib/` — Shared Logic & Services

**Shared utilities and the data layer.** Anything used by more than one feature lives here.

| Subfolder | What it does |
| :--- | :--- |
| `ai/` | AI client setup |
| `prompts/` | Prompt templates sent to the AI |
| `parsers/` | Logic to interpret AI responses |
| `validators/` | Format checking |
| `math/` | Spaced-repetition calculations |

Services at `src/lib/`:

| Service | Responsibility |
| :--- | :--- |
| `topics.service.ts` | Create/read/update topics |
| `concepts.service.ts` | Create/read/update concepts |
| `schedules.service.ts` | Spaced-repetition session logic |
| `quiz-history.service.ts` | Save and retrieve quiz attempts |
| `questions.service.ts` | Manage generated question banks |

> **Repository Pattern:** Your components don't know or care whether data is in localStorage or a real database. They call `conceptsService.getConcept()` and trust it works. Swap localStorage for a database later? You only change the service file.

---

## 4. Where to Go for What

### "The UI looks wrong on the Cockpit page"
→ `src/features/cockpit/`

### "The quiz isn't tracking score correctly"
→ `src/lib/quiz-history.service.ts` (data saving)
→ `src/features/quiz/` (quiz UI + logic)

### "Mastery percentage isn't updating after a quiz"
→ `src/features/scoring/services/mastery.service.ts`
→ `src/features/scoring/hooks/useMastery.ts`

### "XP isn't being awarded or deducted correctly"
→ `src/features/scoring/services/xp.service.ts`

### "Topic progress shows the wrong percentage"
→ `src/features/scoring/services/progress.service.ts`
→ Remember: a concept mastered in one topic counts toward **all** topics it belongs to

### "The AI is generating bad concepts or quizzes"
→ `src/lib/prompts/` — edit the prompt template
→ `src/lib/parsers/` — if the response isn't being read correctly

### "A TypeScript type is wrong or missing"
→ `src/types/index.ts`

### "I need to add a new page"
→ Create `app/<page-name>/page.tsx` for the route
→ Create `src/features/<feature-name>/` for the actual content

---

## 5. Adding a New Feature — Step by Step

Example: adding a **Streaks** feature.

### Step 1 — Create the feature folder
```
src/features/streaks/
├── components/
│   └── StreaksCard.tsx
├── hooks/
│   └── useStreaks.ts
└── index.ts
```

> **Why an index.ts?** Creates a clean public interface. External files import from `features/streaks`, not from internal paths. Rename internals freely without breaking anything outside.

### Step 2 — Create a service if you need to persist data
```
src/lib/streaks.service.ts
```

The hook calls this service — it never touches localStorage directly.

```ts
// ✅ Correct
const streak = streaksService.getCurrentStreak();

// ❌ Wrong
const streak = JSON.parse(localStorage.getItem('streaks'));
```

### Step 3 — Add your TypeScript types
```
src/types/index.ts
```

```ts
export type Streak = {
  currentCount: number;
  lastStudiedDate: string;
};
```

### Step 4 — Add a page if needed
```tsx
// app/streaks/page.tsx — keep it thin
import { StreaksDashboard } from '@/features/streaks';
export default function StreaksPage() {
  return <StreaksDashboard />;
}
```

### Step 5 — Add an API route only if you need server-side AI logic
```
app/api/ai/generate-streak-message/route.ts
src/lib/prompts/streak-message.prompt.ts
```

---

## 6. What Counts as a Feature vs. Something Else

### Is it a Feature?
Ask: **"Would a product manager describe this as a thing users can do?"**

| ✅ Feature | ❌ Not a Feature |
| :--- | :--- |
| Concept Page (locked + unlocked) | Formatting a date |
| Topic Page | A reusable Badge component |
| Quick Capture flow | Calculating a percentage |
| Scoring / mastery system | Debouncing a search input |
| Quiz completion screen | Updating a button's color |

### Is it a Service?
Ask: **"Is this code reading, writing, or transforming data that needs to be stored?"**

| ✅ Service | ❌ Not a Service |
| :--- | :--- |
| Saving a quiz attempt | Rendering quiz results |
| Reading today's scheduled sessions | Styling the schedule calendar |
| Updating a concept's mastery percent | Toggling a dropdown |

### Is it a Shared Component?
Ask: **"Will two or more features use this exact UI piece?"**
Yes → `src/components/`. No → keep it inside the feature folder.

### Is it a Utility / Helper?
Pure function, no side effects, no storage?
→ `src/lib/` utility or `src/lib/math/` for calculations.

---

## 7. The Data Layer — How Memora Remembers Things

Memora uses **localStorage** as its database. Each service owns its own isolated key space.

```
localStorage
├── topics_v1            ← owned by topics.service.ts
├── concepts_v1          ← owned by concepts.service.ts
├── topic_concepts_v1    ← owned by concepts.service.ts (junction table)
├── mastery_v1           ← owned by mastery.service.ts
├── xp_balance_v1        ← owned by xp.service.ts
├── xp_history_v1        ← owned by xp.service.ts
└── quiz_history_v1      ← owned by quiz-history.service.ts
```

Services never read each other's keys. Components never read localStorage directly.

### The Flow of Data
```
User does something in the UI
        ↓
Feature hook handles the event
        ↓
Hook calls a service function
        ↓
Service reads/writes localStorage
        ↓
Updated data flows back up to the UI
```

Never skip steps in this chain.

---

## 8. The Knowledge Graph — Concepts and Topics

This is one of the most important architectural decisions in Memora. Read carefully.

### The Mental Model
- **Concept = atomic knowledge unit.** Users think in concepts: "I learned binary trees", not "I learned Data Structures".
- **Topic = organizational container.** Topics group concepts. They don't own them.

### Many-to-Many Relationship
A concept can belong to multiple topics. This is intentional and important.

```
Concept: Hash Tables

Topics:
→ Data Structures
→ Databases
→ System Design
```

The data model reflects this with a junction entity:

```
Topic { id, name, description, icon, category }
Concept { id, name, difficulty, description, explanation, keyIdeas[], relatedConceptIds[] }
TopicConcept { topicId, conceptId }
```

### Consequences
- **Never hardcode a concept as belonging to one topic.** Always look up via `topic_concepts_v1`.
- **Mastering a concept counts toward all topics it belongs to.** Topic progress is recalculated across the junction table.
- **Topic progress formula:**
  ```
  progress = (concepts in topic where state >= 'strong') / totalConceptsInTopic
  ```

---

## 9. The Scoring System

All scoring logic lives in `src/features/scoring/`. This is logic-only — no UI.

### Three Services

**mastery.service.ts** — tracks how well a user knows a concept
- States in order: `new` → `learning` → `weak` → `strong` → `almost_mastered` → `mastered`
- Correct answer: `+5%` mastery. Incorrect: `-3%` (floor 0%). Perfect quiz bonus: `+10%`

**xp.service.ts** — the reward currency
- Correct answer: `+5 XP`. Quiz complete: `+20 XP`. Perfect quiz: `+40 XP`. Concept mastered: `+25 XP`
- Concept unlock costs: Beginner `100 XP`, Intermediate `150 XP`, Advanced `200 XP`

**progress.service.ts** — topic-level progress
- Aggregates mastery across all concepts in a topic via the TopicConcept junction
- A shared concept mastered once counts toward all related topics

### Three Hooks
Consume these in components — never call services directly from UI:
- `useMastery(conceptId)` — mastery state for a concept
- `useXP()` — balance, earn, spend
- `useTopicProgress(topicId)` — progress % and breakdown

---

## 10. AI Integration — How It Fits In

```
Frontend (browser)
    ↓  fetch POST
app/api/ai/<endpoint>/route.ts    ← API route (server-side, key stays hidden)
    ↓  calls
src/lib/ai/                       ← AI client
    ↓  uses
src/lib/prompts/                  ← Prompt templates
    ↓  response parsed by
src/lib/parsers/                  ← Response interpreters
    ↓  result returned to
Frontend → saved via service
```

**The API key never touches the browser.** This is standard production practice — the frontend calls your own Next.js API route, which calls the AI provider.

### Changing AI Behaviour

| You want to... | Go to... |
| :--- | :--- |
| Change what the AI is asked to do | `src/lib/prompts/` |
| Change how the AI's response is interpreted | `src/lib/parsers/` |
| Change which AI model is used | `src/lib/ai/` |
| Add a new AI-powered endpoint | `app/api/ai/<new-route>/` |

---

## 11. The Two Learning Flows

Memora has two ways to enter the knowledge graph. Both are first-class features.

### Flow A — Top Down (Structured Learning)
User starts from a topic and works down to concepts.
```
Deep Dive / Topic Page
    ↓
User picks a Concept to unlock
    ↓
Unlocks with XP + prerequisites
    ↓
Learns on Concept Page
    ↓
Quizzes → Mastery grows
```

### Flow B — Bottom Up (Quick Capture)
User starts from a concept they just learned and the system organizes it for them.
```
Home Page — "What did you learn?"
    ↓
User types a concept (e.g. "binary tree traversal")
    ↓
System detects concept, suggests Topics it belongs to
    ↓
User optionally links to topic(s) — this step is optional
    ↓
Quiz generated immediately
    ↓
After quiz: "Add to Knowledge Base?" → enters mastery system
```

### Page Role Clarity

| Page | Role |
| :--- | :--- |
| **Home** | Action — capture new learning, add topics |
| **Cockpit** | Reflection — progress, weak areas, insights. No capture here. |
| **Deep Dive** | Browse — discover and explore new concepts |
| **Knowledge Base** | Inventory — everything you've unlocked |
| **Topic Page** | Overview — progress map for a single topic |
| **Concept Page** | Learning unit — explanation, quiz, mastery |

---

## 12. The Golden Rules

1. **Features don't import from other features.** If two features need the same thing, it moves to `src/lib/` or `src/components/`.

2. **Components don't touch localStorage.** That's a service's job. Always go through a hook → service → storage.

3. **API routes stay thin.** Receive request → call lib function → return response. No business logic in route handlers.

4. **Types live in `src/types/index.ts`.** Don't define the same shape in two places.

5. **Never create a new file if an existing file should be modified.** Check before creating.

6. **AI prompts live in `src/lib/prompts/`.** Never hardcode a prompt string inside a component or route.

7. **Never assume a concept belongs to one topic.** Always query via the TopicConcept junction.

8. **Icons are Lucide React only.** No Material Symbols, no FontAwesome.

9. **No hardcoded colors.** All styling values come from `docs/brand.md`.

10. **Scoring logic lives in `src/features/scoring/`.** Components use hooks — they never calculate mastery or XP themselves.

---

## 13. Quick Reference Card

| Task | Where to go |
| :--- | :--- |
| Fix UI on a specific page | `src/features/<feature>/components/` |
| Fix data not saving/loading | `src/lib/*.service.ts` |
| Fix mastery not updating | `src/features/scoring/services/mastery.service.ts` |
| Fix XP not awarding/deducting | `src/features/scoring/services/xp.service.ts` |
| Fix topic progress wrong | `src/features/scoring/services/progress.service.ts` |
| Fix AI generating wrong output | `src/lib/prompts/` |
| Fix AI response misread | `src/lib/parsers/` |
| Fix spaced repetition math | `src/lib/math/` |
| Add a new page | `app/<page>/page.tsx` + `src/features/<feature>/` |
| Add data persistence | `src/lib/<name>.service.ts` |
| Add a new AI endpoint | `app/api/ai/<name>/route.ts` + `src/lib/prompts/` |
| Add a shared UI component | `src/components/` |
| Add a TypeScript model | `src/types/index.ts` |
| Add scoring/mastery logic | `src/features/scoring/` |

---

*This guide reflects the Memora architecture as of the current build. Keep it updated as the codebase grows — a guidebook that falls behind the code is worse than no guidebook at all.*