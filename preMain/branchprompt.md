# Branch Prompt — preMain
> Instructions for Antigravity to scaffold and build the new branch.  
> Read `appbrief.md` and `folderstructure.md` first, then follow this document.

---

## Context

We are creating a new branch called `preMain` on the Memora codebase. This is a clean rebuild — new folder structure, new UI, same core product logic.

**Do not migrate data or touch the database layer yet.** localStorage stays as-is for now. The folder structure is being built to make the eventual Supabase swap clean and isolated.

**Your job:** Scaffold the new structure, move and refactor existing logic into it, and rebuild the UI from scratch using the brand guidelines in `brand.md`.

---

## Step 1 — Create the Branch

```bash
git checkout -b preMain
```

---

## Step 2 — Read These Files Before Writing Any Code

1. `appbrief.md` — what the app is, all flows, all features, current pain points
2. `folderstructure.md` — exact target directory tree, naming conventions, service layer rules
3. `brand.md` — typography, colors, spacing, component rules — the UI bible

Do not proceed until you have read all three.

---

## Step 3 — Scaffold the Folder Structure

Create the full directory tree from `folderstructure.md` as empty files with clear TODO comments.

Rules:
- Every `app/[route]/page.tsx` must be a thin wrapper only. No logic, no state, no JSX beyond importing and rendering a feature component.
- Every feature gets its own folder under `src/features/[name]/`.
- Every feature that touches data gets a `services/` subfolder.
- Every feature with state logic gets a `hooks/` subfolder.
- Do not put anything in `src/components/` unless it is used across 3 or more features.

---

## Step 4 — Set Up the Design System

Before building any UI components, establish the design tokens globally.

In `app/globals.css`:
- Define all CSS variables from `brand.md` for both dark and light themes.
- Set the base font to **Plus Jakarta Sans** loaded via `next/font/google`.
- Apply the dot-grid background to `--bg-base`.
- Define `--radius-sm`, `--radius-md`, `--radius-lg`.
- Define motion durations as CSS variables: `--duration-fast: 80ms`, `--duration-base: 150ms`, `--duration-slow: 350ms`.

Override `tailwind.config.ts` to map all `--` CSS variables into Tailwind utilities so they are usable as `bg-surface`, `text-muted`, `border-border`, etc.

---

## Step 5 — Build Shared Components First

Before touching any feature, build the shared shell components. These must conform strictly to `brand.md`.

### Sidebar (`src/components/sidebar/Sidebar.tsx`)
- Desktop: sticky left sidebar, 240px wide.
- Mobile: drawer triggered by hamburger.
- Nav items: Home, Cockpit, Knowledge Base. Classroom item shows "Soon" badge and is non-clickable.
- Active state: `--accent` left border indicator + `--accent-light` background on the active item.
- Logo at top: circle-within-circle mark (SVG) + "Memora" wordmark in Plus Jakarta Sans Bold.
- Hidden on: `/login`, `/onboarding`, `/add-topic`, all `/learn/` routes.

### Theme
- `ThemeProvider.tsx` — next-themes wrapper, `defaultTheme="dark"`.
- `ThemeToggle.tsx` — icon button, no label, 80ms transition.

### Root Layout (`app/layout.tsx`)
- Load Plus Jakarta Sans from `next/font/google` — weights 400, 500, 600, 700.
- Provider order: `ThemeProvider > AuthProvider > TooltipProvider > [Sidebar + main]`.
- `main` takes remaining width, `min-h-screen`, `bg-base`.

---

## Step 6 — Migrate the Service Layer

Move all storage logic into the correct service files. Do not change how the storage works — only move it to the right place.

| Old file | New location |
|---|---|
| `lib/storage.ts` | `src/features/topics/services/topics.service.ts` |
| `lib/storage/schedules-storage.ts` | `src/features/schedule/services/schedule.service.ts` |
| `lib/storage/questions-storage.ts` | `src/features/quiz/services/questions.service.ts` |
| `lib/storage/quiz-history-storage.ts` | `src/features/quiz/services/quiz-history.service.ts` |
| `lib/ai/huggingface-client.ts` | `src/services/ai/huggingface-client.ts` |
| `lib/ai/prompts/` | `src/services/ai/prompts/` |
| `lib/ai/parsers/` | `src/services/ai/parsers/` |
| `lib/ai/validators/` | `src/services/ai/validators/` |

Delete from the repo once moved:
- `huggingface-client.ts` (root level duplicate)
- `test-hf.js` (root level)
- `components/sidebar-demo.tsx`
- `lib/quiz-generator.ts` (legacy)

---

## Step 7 — Migrate and Extract Custom Hooks

Extract state logic out of page components into feature hooks.

**`src/features/topics/hooks/useTopicWizard.ts`**  
Extract from `app/add-topic/page.tsx`:
- All `useState` for wizard steps, form values, concept selections.
- All step navigation logic.
- The AI call orchestration currently in the `generating` step.
- The submission logic that writes to all 4 storage keys.
- Return clean interface: `{ step, fields, setters, goNext, goBack, submit, isGenerating, progress }`.

**`src/features/quiz/hooks/useQuizSession.ts`**  
Extract from `app/learn/[topicId]/page.tsx`:
- Question loading, current question index, answer state.
- Correct/incorrect tracking, timing.
- Completion handler that writes to quiz history and updates topic score.

**`src/features/schedule/hooks/useSchedule.ts`**  
Thin hook wrapping `schedule.service.ts` calls with React state and loading flags.

**`src/features/auth/hooks/useAuth.ts`**  
Thin hook wrapping auth state. Keep the same interface: `{ isAuthenticated, login, logout }`. This is the seam that gets replaced with Supabase Auth later.

---

## Step 8 — Rebuild All UI from Scratch

Rebuild every page and component according to `brand.md`. Do not copy old JSX. New design, clean code.

### Rules for every component
- Colors: only use the CSS variables from `brand.md`. Never hardcode hex values.
- Font: Plus Jakarta Sans only. Bold (700) for display, Semibold (600) for headings, Regular (400) for body, Medium (500) for labels.
- Spacing: 8px grid only. Use Tailwind spacing utilities (p-2 = 8px, p-4 = 16px, etc.).
- Radius: `rounded-sm` (8px), `rounded-md` (12px), `rounded-lg` (20px).
- Buttons: Primary (`--accent` fill), Secondary (`--bg-raised` + `--border`), Ghost (no fill, no border). No shadows. No gradients. No uppercase.
- Cards: `--bg-surface` background, `1px solid --border`, `--radius-md`, `24px` padding.
- No decorative illustrations.
- No more than one accent-colored element per screen section.
- Animations: use durations from brand — 80ms for button feedback, 150ms for element enter, 120ms for page transitions.

### Components to build (in order)

**1. Home Dashboard (`src/features/dashboard/components/HomeDashboard.tsx`)**
- Greeting at top: "Good morning." or time-appropriate variant. Warm, no fluff.
- "Due Today" section: cards using `DueSessionCard.tsx`. Each card shows topic name, concept count, memory score (large numeral in `--accent`), and a primary CTA button.
- "This Week" section: compact list of upcoming sessions.
- Empty states: "Nothing due today." — no illustration, just the text.

**2. Add Topic Wizard (`src/features/topics/components/`)**
- `WizardShell.tsx` handles the step container, progress bar (4px, `--accent` fill), and Framer Motion `AnimatePresence` for step transitions.
- Each step is its own isolated component. No step knows about any other step — all state lives in `useTopicWizard.ts`.
- `GeneratingStep.tsx` shows animated progress with the actual percentage and current action label ("Generating questions for Closures…").
- `ExitStep.tsx` success state: headline "Your study plan is ready." with two actions: "Start first quiz" (primary) and "Go to dashboard" (ghost).

**3. Cockpit (`src/features/cockpit/components/`)**
- Stats row: 4 stat cards. Number large in `--text-primary`, label in `--text-muted` below.
- Topic cards grid: memory score displayed as the large numeral design from `brand.md` — no rings, no gauges, just the number.
- Topic detail modal: concept breakdown table, quiz history accordion, action buttons.

**4. Knowledge Base (`src/features/knowledge/components/`)**
- Filter bar at top: topic tag pills + sort dropdown. Pills use `--accent-light` background when active.
- Concept cards in a responsive grid.
- Concept detail modal: performance history chart (use recharts), recent attempts list.

**5. Quiz Page (`src/features/quiz/components/`)**
- Clean, full-focus layout. No sidebar.
- Progress bar at top showing question n of total.
- Question text in Semibold, 20px.
- Answer options as full-width buttons. State transitions per `brand.md`: selected = `--accent` border + `--accent-light` fill, correct = `--success` border + green fill, wrong = `--danger` border + red fill.
- Explanation appears below options after answer — plain text in `--text-muted`, no box.
- Result screen: score as large numeral, concept breakdown, "Done" or "Next session" CTA.

---

## Step 9 — Wire Everything Together

- Confirm every `app/[route]/page.tsx` imports from `src/features/` and renders a single component.
- Confirm all service calls go through `src/features/[name]/services/*.service.ts` — no page component imports from `lib/storage` directly.
- Confirm auth guard still works: unauthenticated → `/login`, no onboarding → `/onboarding`, else → `/`.
- Confirm sidebar hides correctly on `/login`, `/onboarding`, `/add-topic`, `/learn/*`.
- Confirm dark/light theme works with the new CSS variables.
- Confirm mobile sidebar drawer works.

---

## Step 10 — Generate GUIDE.md

Once the above is complete and the app is functional, generate a `GUIDE.md` at the project root.

This file must contain:

1. **File map** — every file in `src/` described in one sentence: what it does, what it imports, what depends on it.

2. **Flow traces** — for each key user flow, trace the exact sequence of files that activate. Example format:
   ```
   User adds a topic:
   app/add-topic/page.tsx
   → features/topics/components/AddTopicPage.tsx
   → features/topics/components/wizard/WizardShell.tsx
   → features/topics/hooks/useTopicWizard.ts (all state lives here)
   → features/topics/components/wizard/steps/[step].tsx (per step)
   → app/api/ai/generate-schedule/route.ts (on submit)
   → src/services/ai/huggingface-client.ts
   → features/schedule/services/schedule.service.ts (save result)
   → features/quiz/services/questions.service.ts (save questions)
   ```

3. **Service contracts** — for every function in every `*.service.ts`, document: input types, output types, side effects, which localStorage key it touches (now), which Supabase table it will touch (later).

4. **Where to add new features** — a decision guide written as questions:
   - "Does this feature have its own page?" → Add to `src/features/` and wire in `app/`.
   - "Is this UI used in 3+ places?" → Goes in `src/components/`.
   - "Is this a data access function?" → Goes in the relevant `services/` file.
   - "Is this business logic with no UI?" → Goes in a hook in the relevant `hooks/` folder.

5. **Supabase migration checklist** — exact ordered list of which files to change and in which order when Supabase is ready, based on the service layer structure built in this sprint.

---

## What You Must Not Do

- Do not add logic to any `app/[route]/page.tsx`. Route files are wrappers only.
- Do not access localStorage directly from any component or hook. All storage goes through `services/`.
- Do not hardcode any color hex values in components. Use CSS variables only.
- Do not create any new localStorage keys. Stick to the existing 4.
- Do not add any new features or flows not listed in `appbrief.md`. This sprint is a refactor + redesign, not a feature sprint.
- Do not copy old JSX. Rebuild UI from scratch per `brand.md`.
- Do not use any font other than Plus Jakarta Sans.
- Do not add gradients, shadows on dark theme, illustrations, or uppercase labels.
- Do not leave the root-level `huggingface-client.ts` or `test-hf.js` in the repo.
