# Diagnostic Report — Code Challenge Stuck Loading

Do not fix anything. Read files and report only. The goal is to understand exactly what is happening between the API response and the challenge page render.

---

## What to Check and Report

### 1. Topic Page — After API Call

Find the click handler for the "Code Challenge" button in `src/features/topics/components/TopicPage.tsx`.

Report:
- The exact sequence of operations after `await fetch('/api/ai/generate-quiz', ...)` resolves
- Whether `setPrefetch` or any store setter is called before or after `router.push`
- Whether the fallback path (when AI fails) goes through the same code path as the success path, or branches separately
- Whether there is any condition that might skip calling the store setter

### 2. Coding Challenge Store

Find `src/lib/coding-challenge-store.ts` (or whatever the store file is named).

Report:
- The full contents of the file
- What `setPrefetch` / `setQuestions` accepts as input
- What `consumePrefetch` / `getQuestions` returns when empty
- Whether the store has any type mismatch between what the API returns and what it expects

### 3. Challenge Page — On Mount

Find `app/topics/[topicId]/code-challenge/page.tsx`.

Report:
- What happens on mount — does it call `consumePrefetch` immediately or wait for something
- What it does when the result is null or an empty array — does it redirect, show an error, or spin forever
- Whether `useQuizSession` is being called correctly with the questions
- Whether there are any console errors visible when the page loads

### 4. Generate Quiz Route — Fallback Path

Find `app/api/ai/generate-quiz/route.ts`, specifically the coding challenge section.

Report:
- What the route returns when the fallback templates are used — show the exact response shape
- Whether the returned questions array is nested correctly: `{ questions: [...] }` or `[...]` directly
- Whether the fallback questions go through the same validation/sanitisation as AI questions or bypass it

### 5. Console and Network Tab

Open the browser devtools when clicking Code Challenge:
- Report any console errors on the challenge page
- Report the exact response body from the `POST /api/ai/generate-quiz` network request — show the full JSON shape
- Report whether the challenge page makes any additional network requests after loading

---

## Report Format

Answer each section above with what you found. Be specific — quote the relevant code lines rather than describing them. Flag any mismatch between what one file produces and what another file expects.

Do not fix anything. Report only.