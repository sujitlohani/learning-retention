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
7. [The Data Layer — How Memora "Remembers" Things](#7-the-data-layer--how-memora-remembers-things)
8. [AI Integration — How It Fits In](#8-ai-integration--how-it-fits-in)
9. [The Golden Rules](#9-the-golden-rules)
10. [Quick Reference Card](#10-quick-reference-card)

---

## 1. The Big Picture

Memora is a **Next.js** app that helps users learn via spaced repetition. Before touching any code, understand the two core ideas that shape the entire architecture:

### Feature-Sliced Design (FSD)
Code is organized by **what it does for the user**, not by what type of code it is.

> **Real-world analogy:** Imagine a restaurant. A bad kitchen organizes by tool — all knives together, all pans together, all plates together. A good kitchen organizes by station — the grill station has its own tools, its own prep space, its own workflow. FSD is the good kitchen.

Most codebases you'll see in the wild use some version of this. The alternative — grouping all components together, all hooks together, all utils together — works fine at small scale but becomes a nightmare to navigate on a real team.

### Separation of Concerns
Every file and folder has **one clear job**. UI files handle display. Service files handle data. API routes handle server-side logic. They don't do each other's jobs.

> **Why this matters:** When something breaks, you know exactly where to look. When you need to change something, you change it in one place, not five.

---

## 2. Folder Structure at a Glance

```
/
├── app/                        # Pages and API routes (Next.js App Router)
│   ├── api/ai/                 # Server-side AI endpoints
│   │   ├── generate-concepts/
│   │   └── generate-schedule/
│   ├── dashboard/
│   ├── cockpit/
│   ├── knowledge-base/
│   ├── deep-dive/
│   ├── add-topic/
│   └── learn/[topicId]/
│
├── src/
│   ├── components/             # Shared UI pieces used across features
│   ├── features/               # One folder per product feature
│   │   ├── auth/
│   │   ├── cockpit/
│   │   ├── dashboard/
│   │   ├── deepdive/
│   │   ├── knowledge/
│   │   ├── landing/
│   │   ├── quiz/
│   │   └── topics/
│   │
│   ├── lib/                    # Integrations, utilities, services
│   │   ├── ai/
│   │   ├── prompts/
│   │   ├── parsers/
│   │   ├── validators/
│   │   └── math/
│   │
│   └── types/                  # Shared TypeScript data models
│       └── index.ts
```

---

## 3. The Three Zones

Think of the codebase as three distinct zones. Understanding which zone you're in tells you what rules apply.

---

### Zone 1 — `app/` — Pages & API Routes

This is the **entry point layer**. It connects URLs to your features.

- `app/dashboard/page.tsx` renders the dashboard page
- `app/api/ai/generate-concepts/route.ts` handles a POST request from the frontend

**What belongs here:** Routing, page layout, API route handlers.  
**What does NOT belong here:** Business logic, data manipulation, complex UI components. Those live in `src/features/` and `src/lib/`.

> **Industry note:** This is the "thin controller" principle. In MVC (Model-View-Controller) architecture, controllers are supposed to be thin — they receive a request, hand it off, and return a response. The actual work happens elsewhere. App Router pages and API routes play this role in Memora.

---

### Zone 2 — `src/features/` — Feature Modules

This is the **heart of the application**. Each subfolder owns one user-facing feature end-to-end.

A feature folder typically contains:
- **Components** — the React UI for that feature
- **Hooks** — state management and logic for that feature
- **Anything specific** to that feature that no other feature needs

**The critical rule:** Features don't import from each other.

```
✅  features/quiz/ imports from lib/  (fine — shared utility)
✅  features/quiz/ imports from components/  (fine — shared UI)
❌  features/quiz/ imports from features/topics/  (wrong — cross-feature coupling)
```

> **Why no cross-feature imports?** The moment features start depending on each other, you create a web of hidden dependencies. Change one thing and something unrelated breaks. This is called **tight coupling** and it's one of the most common causes of messy, hard-to-maintain codebases.

---

### Zone 3 — `src/lib/` — Shared Logic & Services

This is the **shared utilities and data layer**. Anything used by more than one feature lives here.

| Subfolder | What it does |
|---|---|
| `ai/` | The HuggingFace client setup |
| `prompts/` | Prompt templates sent to the AI |
| `parsers/` | Logic to interpret AI responses |
| `validators/` | Format checking |
| `math/` | Spaced-repetition calculations |

Also here (likely at root of `src/lib/` or nearby) are the **storage services**:

| Service | Responsibility |
|---|---|
| `topics.service.ts` | Create/read/update topics and their concepts |
| `schedules.service.ts` | Spaced-repetition session logic |
| `quiz-history.service.ts` | Save and retrieve quiz attempt records |
| `questions.service.ts` | Manage generated question banks per topic |

> **Industry note:** These service files are a pattern called the **Repository Pattern** — a layer that abstracts your data storage. Your components don't know or care whether data is in localStorage, a database, or an API. They just call `topicsService.saveTopic()` and trust it works. Swap localStorage for a real database later? You only change the service file, nothing else.

---

## 4. Where to Go for What

Use this as your first stop whenever you need to find or change something.

---

### "The UI looks wrong on the Cockpit page"
→ `src/features/cockpit/`

### "The quiz isn't tracking my score correctly"
→ `src/lib/quiz-history.service.ts` (data saving)  
→ `src/features/quiz/` (quiz UI + logic)

### "The AI is generating bad concepts"
→ `src/lib/prompts/` — edit the prompt template  
→ `src/lib/parsers/` — if the response isn't being read correctly

### "The spaced repetition schedule feels wrong"
→ `src/lib/math/` — the algorithm lives here  
→ `src/lib/schedules.service.ts` — how sessions are stored and retrieved

### "I need to change what happens when a user submits the add-topic form"
→ `src/features/topics/` — the form logic and submission handler  
→ `app/api/ai/generate-concepts/` — if the AI call itself needs changing

### "A TypeScript type is wrong or missing"
→ `src/types/index.ts` — all shared models (Topic, Concept, QuizAttempt) live here

### "I need to add a new page"
→ Create `app/<page-name>/page.tsx` for the route  
→ Create `src/features/<feature-name>/` for the actual content

---

## 5. Adding a New Feature — Step by Step

Let's say you're building a **Streaks** feature — it tracks how many days in a row a user has studied.

---

### Step 1 — Create the feature folder

```
src/features/streaks/
├── StreaksCard.tsx        ← the UI component
├── useStreaks.ts          ← the hook managing streak state/logic
└── index.ts              ← exports (so other files import cleanly)
```

> **Why an index.ts?** It creates a clean public interface for your feature. External files import from `features/streaks` not `features/streaks/StreaksCard`. If you rename internal files, nothing outside breaks.

---

### Step 2 — Create a service if you need to persist data

```
src/lib/streaks.service.ts
```

This file handles all localStorage reads and writes for streaks. The feature's hook calls this service — it never touches localStorage directly.

```ts
// ✅ Correct — hook calls the service
const streak = streaksService.getCurrentStreak();

// ❌ Wrong — hook touches storage directly
const streak = JSON.parse(localStorage.getItem('streaks'));
```

---

### Step 3 — Add your TypeScript types

```
src/types/index.ts
```

Add a `Streak` type here alongside the existing `Topic`, `Concept`, and `QuizAttempt`.

```ts
export type Streak = {
  userId: string;
  currentCount: number;
  lastStudiedDate: string;
};
```

> **Why shared types matter:** Types are a contract. When your service saves a `Streak` and your component reads a `Streak`, they're guaranteed to be talking about the same shape of data. This catches bugs at compile time, not at 2am in production.

---

### Step 4 — Add a page if needed

```
app/streaks/page.tsx
```

Keep this thin. Import your feature component and render it.

```tsx
// app/streaks/page.tsx
import { StreaksDashboard } from '@/features/streaks';

export default function StreaksPage() {
  return <StreaksDashboard />;
}
```

---

### Step 5 — Add an API route only if you need server-side logic

If streaks need AI (e.g. "generate a motivational message") add:

```
app/api/ai/generate-streak-message/route.ts
```

And a corresponding prompt template in `src/lib/prompts/`.

If streaks are purely calculated from local data, skip this entirely.

---

## 6. What Counts as a Feature vs. Something Else

This is one of the most common points of confusion for developers new to structured codebases. Use these questions to decide.

---

### Is it a Feature?

Ask: **"Would a product manager describe this as a thing users can do?"**

If yes → it's a feature. Give it a folder in `src/features/`.

| ✅ Feature | ❌ Not a Feature |
|---|---|
| Streaks tracker | Formatting a date |
| Notes / annotations on concepts | A reusable Badge component |
| Social sharing of scores | Calculating a percentage |
| Onboarding wizard | Debouncing a search input |
| Achievements / badges system | Updating a button's color |

---

### Is it a Service?

Ask: **"Is this code reading, writing, or transforming data that needs to be stored?"**

If yes → it's a service. Put it in `src/lib/` as a `*.service.ts` file.

| ✅ Service | ❌ Not a Service |
|---|---|
| Saving a quiz attempt | Rendering quiz results on screen |
| Reading today's scheduled sessions | Styling the schedule calendar |
| Updating a topic's score | Toggling a dropdown open/closed |

---

### Is it a Shared Component?

Ask: **"Will two or more features use this exact UI piece?"**

If yes → `src/components/`. If only one feature uses it, keep it inside that feature's folder.

---

### Is it a Utility / Helper?

Ask: **"Is this a pure function with no side effects — input goes in, output comes out?"**

Examples: date formatters, string truncators, math helpers.  
These go in `src/lib/` (or a `utils/` subfolder if you add one). They're not services (no storage) and not features (no UI).

---

## 7. The Data Layer — How Memora "Remembers" Things

Memora uses **localStorage** as its database. This is fine for a client-side app but has implications to understand.

### The Four Storage Silos

Each service owns its own isolated key space in localStorage. They never read each other's keys.

```
localStorage
├── [topics keys]         ← owned by topics.service.ts
├── [schedules keys]      ← owned by schedules.service.ts
├── [quiz-history keys]   ← owned by quiz-history.service.ts
└── [questions keys]      ← owned by questions.service.ts
```

> **Why isolated key spaces?** If every service wrote to the same keys, they'd overwrite each other's data. By giving each service its own namespace (e.g. `memora:topics:`, `memora:schedules:`), they can never collide. This is the same principle used in real databases with separate tables.

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

Never skip steps in this chain. A component should never call localStorage directly.

---

## 8. AI Integration — How It Fits In

The AI layer is cleanly separated from the rest of the app. Here's why that matters.

```
Frontend (browser)
    ↓  fetch POST
app/api/ai/generate-concepts/route.ts   ← API route (server-side)
    ↓  calls
src/lib/ai/                             ← HuggingFace client
    ↓  uses
src/lib/prompts/                        ← Prompt templates
    ↓  response parsed by
src/lib/parsers/                        ← Response interpreters
    ↓  result returned to
Frontend → saved via topicsService
```

**The API key never touches the browser.** The frontend calls your own Next.js API route, which calls HuggingFace. This is standard practice in production apps.

> **Why not call HuggingFace directly from the frontend?** If you did, your API key would be visible in the browser's network tab to anyone using your app. Server-side API routes keep credentials safe. This pattern is sometimes called a **Backend for Frontend (BFF)**.

### Changing AI Behaviour

| You want to... | Go to... |
|---|---|
| Change what the AI is asked to do | `src/lib/prompts/` |
| Change how the AI's response is interpreted | `src/lib/parsers/` |
| Change which AI model is used | `src/lib/ai/` |
| Add a new AI-powered endpoint | `app/api/ai/<new-route>/` |

---

## 9. The Golden Rules

These apply at all times, no exceptions.

1. **Features don't import from other features.** If two features need the same thing, it moves to `src/lib/` or `src/components/`.

2. **Components don't touch localStorage.** That's a service's job.

3. **API routes stay thin.** They receive a request, call a lib function, return a response. No business logic lives directly in a route handler.

4. **Types live in `src/types/index.ts`.** Don't define the same shape in two places.

5. **New pages get new feature folders.** Don't stuff new feature code into an existing feature just because it's "nearby."

6. **AI prompts live in `src/lib/prompts/`.** Never hardcode a prompt string inside a component or API route.

---

## 10. Quick Reference Card

| Task | Where to go |
|---|---|
| Fix UI on a specific page | `src/features/<that-feature>/` |
| Fix data not saving/loading | `src/lib/*.service.ts` |
| Fix AI generating wrong output | `src/lib/prompts/` |
| Fix AI response being misread | `src/lib/parsers/` |
| Fix spaced repetition math | `src/lib/math/` |
| Add a new page | `app/<page>/page.tsx` + `src/features/<feature>/` |
| Add data persistence | New `src/lib/<name>.service.ts` |
| Add a new AI endpoint | `app/api/ai/<name>/route.ts` + `src/lib/prompts/` |
| Add a shared UI component | `src/components/` |
| Add a TypeScript model | `src/types/index.ts` |
| Add a pure utility function | `src/lib/` |

---

*This guide reflects the architecture as of the initial Memora build. As the codebase grows, keep this document updated — a guidebook that falls behind the code is worse than no guidebook at all.*