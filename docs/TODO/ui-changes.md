# Login System + Demo Mode + Landing Page Implementation

Read `brand.md` and `memora-context.md` before starting. Run `npm run build` after each phase. Zero TypeScript errors.

---

## Phase 1 — Authentication with Clerk

Clerk is the simplest auth integration for Next.js. It handles signup, login, session management, and UI components out of the box. No database required for auth itself — user data stays in localStorage keyed by userId.

### Setup (do this before writing any code)

1. Go to `clerk.com`, create a free account, create a new application called "Memora"
2. Choose "Email" as the sign-in method (add Google later if wanted)
3. Copy the two keys from the Clerk dashboard into `.env.local`:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/login
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

4. Install: `npm install @clerk/nextjs`

### Files to create/modify

**[MODIFY] `app/layout.tsx`**
Wrap the entire app in `<ClerkProvider>`. Import from `@clerk/nextjs`. This is the only wrapper needed — Clerk handles everything from here.

**[MODIFY] `middleware.ts`** (create if doesn't exist at project root)
Add Clerk middleware to protect all routes except `/`, `/login`, and `/api/webhook`:
```
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isPublicRoute = createRouteMatcher(['/', '/login(.*)'])
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) await auth.protect()
})
export const config = { matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'] }
```

**[MODIFY] `app/login/page.tsx`**
Replace any existing login page content with Clerk's `<SignIn>` component plus the demo login button (see Phase 2). Center it on the page, use `var(--bg-base)` background.

**[MODIFY] Sidebar component**
Add a logout button at the bottom using Clerk's `<SignOutButton>`. Show the user's email or first name using `useUser()` hook from `@clerk/nextjs`.

### localStorage scoping per user

Currently localStorage uses fixed keys. With multiple users on the same browser, they'd share data. Scope each key by userId:

**[MODIFY] `src/features/topics/services/topics.service.ts`**
**[MODIFY] `src/features/quiz/services/quiz-history.service.ts`**
**[MODIFY] `src/features/quiz/services/questions.service.ts`**

In each service file, import `useAuth` from `@clerk/nextjs` — or better, accept `userId` as a parameter to the service methods. The simplest approach: export a function `getStorageKey(baseKey: string, userId: string)` in a shared util file and use it in all three services.

Storage keys become:
- `learning-retention-mvp-data-{userId}`
- `learning_loop_quiz_history-{userId}`
- `learning-retention-questions-{userId}`

Since services are not React components, they can't use hooks. Pass userId down from the component layer or read it from a module-level store set on app init. The cleanest pattern: create `src/lib/user-store.ts` that holds the current userId and is set once on app load from the Clerk session.

```typescript
// src/lib/user-store.ts
let currentUserId: string = 'anonymous'
export const setUserId = (id: string) => { currentUserId = id }
export const getUserId = () => currentUserId
```

In a client component that wraps the app (or in layout), call `setUserId(user.id)` when the Clerk user loads.

---

## Phase 2 — Demo Mode

Demo mode lets anyone try the app without creating an account. It uses a shared demo userId so demo users see pre-seeded data.

**[MODIFY] `app/login/page.tsx`**

Below the Clerk `<SignIn>` component, add:

```
──── or ────

[ Try the demo — no account needed ]
```

The demo button: outline style, full width, muted text. On click it calls a server action or API route that signs the user into a demo account.

**[NEW] `app/api/auth/demo/route.ts`**

Creates a demo session. Since Clerk handles auth, the simplest approach is to have a pre-created demo account in Clerk with fixed credentials. The button POSTs to this route which calls Clerk's backend API to create a short-lived session token for the demo user, then redirects to `/`.

Demo userId is fixed: store it in `.env.local` as `DEMO_USER_ID`. Demo data is pre-seeded — if the demo localStorage key is empty, seed it with 2 example topics (Binary Tree, Promises in JS) with some quiz history so new demo users see a populated state.

**[NEW] `src/lib/demo-seed.ts`**

Contains the seed data function. Called on app init if the current user is the demo user and their localStorage is empty. Seed 2 topics with 5 units each and a handful of quiz attempts so the demo feels alive, not empty.

---

## Phase 3 — Landing Page

**[MODIFY] `src/features/landing/components/LandingPage.tsx`** (or wherever landing page lives)

Replace all existing copy with the copy below. Keep the existing layout structure (nav, hero, how it works, features, CTA, footer) — only update the text content and add the new feature cards.

### Nav
```
Memora    How It Works · Features · Pricing · Sign In    [Try Memora Free →]
```
"Try Memora Free" links to `/login`.

### Hero
Badge: `✦ Early Access`

Headline (two lines, second line in `var(--accent)`):
```
Your knowledge has a shelf life.
Memora keeps it from expiring.
```

Subhead:
```
Add any topic you've studied. Memora turns it into a personal quiz system —
tracking every unit, testing what's weak, and closing gaps before they cost you.
```

Primary CTA: `Add your first topic — it's free` → links to `/login`
Secondary CTA: `See how it works` → scrolls to `#how-it-works`

### How It Works
Label: `The Loop`
Headline: `Three steps. One habit.`

Step 01 — Add what you learned:
```
Name a topic — a course module, a concept, a chapter.
Memora maps it into the specific knowledge units you need to retain it.
Not lessons. Building blocks.
```

Step 02 — Get quizzed intelligently:
```
Questions are calibrated to your starting level and get sharper as you improve.
The more you practice, the more precisely Memora knows what to test you on.
```

Step 03 — See exactly what's slipping:
```
Every unit gets a score. You see what's strong, what's weak, and what needs
a revisit — before an exam or interview makes it obvious.
```

### Features
Label: `Features`
Headline: `Built around how memory actually works.`
Subhead: `No decks to build. No schedules to manage. Just test yourself on what you've learned and let the gaps surface.`

Five feature cards:

**Weak-First Quizzing:** Memora doesn't quiz you randomly. It finds the units you keep getting wrong and drills those harder — so your weak spots close instead of compound.

**Deep Dive on Any Unit:** Struggling with a specific unit? Go deep — get an explanation, a worked example, a mini-check, and a targeted unit test. One flow that actually repairs the gap, not just flags it.

**Code While You Quiz:** For technical topics, Memora generates real coding challenges inside the quiz. Write and run code against test cases — not just pick an answer.

**Unit-Level Scoring:** Every building block of a topic is scored separately. You always know which units you own and which ones are still shaky.

**Topic Mastery Score:** One honest number per topic — weighted by your recent challenge performance and unit scores. Not a streak. Not XP. An actual signal of what you retain.

### Final CTA section
Headline: `Stop reviewing. Start retaining.`
Body: `The learning already happened. Memora makes sure it stays.`
Button: `Add your first topic — free`
Micro-copy: `Takes 2 minutes. No card required.`

### Footer
`Privacy Policy · Terms of Service · Contact`
`© 2025 Memora Inc. All rights reserved.`

**Copy rules (enforce in implementation):**
- Never use the word "AI" in any heading — describe the behavior instead
- "Units" not "topics" when referring to building blocks
- No exclamation marks anywhere
- All CTA buttons in sentence case
- Tone: plain, confident, no hype

---

## Branch Merge Process (core → main)

Run these commands in order. Do not skip the diff check.

```bash
# 1. Make sure core is clean
git checkout core
git status  # must be clean, commit anything uncommitted first

# 2. Create a safety backup
git checkout -b core-backup
git checkout core

# 3. Pull latest main to see what diverged
git fetch origin main
git diff origin/main..core --stat  # review what's different

# 4. Switch to main and merge
git checkout main
git merge core --no-ff -m "Merge core rework into main"

# 5. Resolve any conflicts
# - For conflicts in package.json: keep core's dependencies
# - For conflicts in app files: keep core's version (it's the rework)
# - For .env files: do not commit, keep local only

# 6. Build test before pushing
npm run build  # must pass with zero errors

# 7. Push to main (Vercel auto-deploys)
git push origin main
```

If the merge produces too many conflicts, alternative approach:
```bash
# Reset main to core entirely (nuclear option — only if merge is unworkable)
git checkout main
git reset --hard core
git push origin main --force-with-lease
```
Use `--force-with-lease` not `--force` — safer, won't overwrite if someone else pushed.

After deploying, verify on Vercel that env vars are set (Clerk keys, any other `.env.local` values need to be added in Vercel dashboard under Settings → Environment Variables).

---

## Verification

1. Unauthenticated user visiting `/` sees landing page — no redirect to login
2. Unauthenticated user visiting `/home` or any app route redirects to `/login`
3. Sign up creates a new user, lands on Home with empty state
4. Demo button on login page logs in without creating an account
5. Demo user sees pre-seeded topics and quiz history
6. Two different browser profiles (simulating different users) have separate data
7. Sign out returns to landing page
8. `npm run build` — zero TypeScript errors
9. Vercel deployment succeeds after branch merge