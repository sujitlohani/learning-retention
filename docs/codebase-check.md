# Codebase Audit — Quality & Cleanup

This is a read-only audit pass. Do not modify any files during this task. Produce a written report only. The report will be reviewed and a separate cleanup task will be created from it.

---

## What to Audit

### 1. Folder Structure

Map out the actual folder structure of the project. For each major directory (`app/`, `src/features/`, `src/lib/`, `src/components/`, `src/types/`, `src/hooks/`) list what lives inside it and what it's doing.

Flag anything that looks misplaced:
- A component that lives in the wrong feature folder
- A utility function sitting inside a component file instead of `src/lib/`
- A type definition scattered in a feature file instead of `src/types/`
- Route files that don't follow the Next.js App Router convention
- Files at the root of `src/` that should be in a subdirectory

---

### 2. Dead Code

For each of the following categories, find candidates and explain specifically why you believe they are dead — don't just flag them, justify each one.

**Unused exports**
Find functions, components, types, and constants that are exported but never imported anywhere in the codebase. Check every import across all files before flagging. A file that is imported but whose specific named export is never used counts as a dead export.

**Unreachable code paths**
Find code that can never execute:
- Conditions that are always true or always false given the types
- Code after an unconditional `return`
- `catch` blocks that swallow errors silently (no log, no UI update, no rethrow) — flag as dead in the sense that errors disappear invisibly
- Switch cases that can never be reached given the union type

**Commented-out code blocks**
Find blocks of code that have been commented out (not documentation comments — actual commented-out implementation). List the file, line range, and what the code appears to have been doing. These are candidates for deletion.

**Stale TODO/FIXME comments**
Find all `// TODO`, `// FIXME`, `// HACK`, `// NOTE` comments. For each, assess whether it refers to something that has already been implemented elsewhere in the codebase. If it has, flag it as stale. If it hasn't, leave it — it's still valid.

**Console logs left in production code**
Find every `console.log`, `console.warn`, `console.error` that is not inside a catch block or an explicit error handler. These are almost always debugging artifacts.

---

### 3. Duplicate Logic

Find logic that is implemented more than once across different files. Specifically look for:

**Score/accuracy computation**
Is unit accuracy computed in more than one place? Check every file that reads from `quiz_history` in localStorage or calls `quizHistoryService`. If the same averaging logic appears in two or more files, flag both locations.

**localStorage reads outside the service layer**
The rule is: nothing should read from or write to localStorage directly except the three service files (`topics.service.ts`, `quiz-history.service.ts`, `questions.service.ts`). Find any component or hook that calls `localStorage.getItem` or `localStorage.setItem` directly. Each one is a violation.

**Question generation logic**
Is there any question generation or prompt construction happening outside of `app/api/ai/generate-quiz/route.ts`? Flag any file that builds an AI prompt string or calls the HuggingFace API directly.

**Quiz session state**
Is there any quiz state being managed outside of `useQuizSession`? Find components that maintain their own local copy of questions, score, or current question index that duplicates what the hook already tracks.

---

### 4. Type Safety Gaps

**`any` types**
Find every use of `: any` or `as any` in the codebase. For each, note whether it's in a type definition, a function parameter, a return type, or a cast. Casts that come from parsing JSON or external API responses are expected — note them but don't flag as critical. `any` used to silence a TypeScript error is critical.

**Missing null checks**
Find places where a value that could be `null` or `undefined` is accessed without a guard. Specifically:
- `localStorage.getItem()` returns `string | null` — is the null case always handled before `JSON.parse`?
- `Array.find()` returns `T | undefined` — is the undefined case handled before accessing properties?
- URL search params — are they checked for null before use?

**Type assertions without validation**
Find `as SomeType` casts that are applied to raw JSON parse results without any runtime validation. These are type lies — the runtime value might not match the asserted type.

---

### 5. Component Quality

**Components doing too much**
Flag any component file over 300 lines that is mixing data fetching, business logic, and rendering in the same function. These should be split.

**Inline styles that should be CSS variables**
Find hardcoded hex colours in JSX `style` props that exist in `brand.md` as CSS variables. These should use the variable instead.

**Missing loading and error states**
Find any component that calls an API or reads from a service on mount but has no loading state and no error state. If the call fails or is slow, the component will render broken or empty silently.

**Key prop issues**
Find any `.map()` rendering in JSX that is missing a `key` prop, or that uses array index as the key when the list is ordered by something meaningful (score, date) — index keys break React reconciliation when the list reorders.

---

### 6. API Route Quality

For each file in `app/api/`:

- Does the route validate its request body before using it? If a required field is missing, does it return a 400 or does it crash?
- Does it handle the case where the AI service returns an unparseable response?
- Does it have a timeout or does it hang indefinitely if HuggingFace doesn't respond?
- Are API keys read from `process.env` and checked for existence at startup, or are they used blindly (which produces a confusing error later)?

---

## Report Format

Write the report as a structured markdown document with one section per audit category above. For each finding:

```
File: src/path/to/file.ts
Issue: one sentence describing the problem
Why: one sentence explaining how you determined this is an issue
Severity: Critical | Moderate | Low
```

Severity guide:
- **Critical** — causes bugs, data loss, or silent failures in production
- **Moderate** — code smell, maintainability risk, or potential future bug
- **Low** — style, cleanup, or minor inconsistency

At the end of the report, provide a summary table:

```
| Category              | Critical | Moderate | Low |
|-----------------------|----------|----------|-----|
| Folder structure      | X        | X        | X   |
| Dead code             | X        | X        | X   |
| Duplicate logic       | X        | X        | X   |
| Type safety           | X        | X        | X   |
| Component quality     | X        | X        | X   |
| API route quality     | X        | X        | X   |
| TOTAL                 | X        | X        | X   |
```

Do not suggest fixes in this report. Only findings. A separate cleanup task will be written from this report.

Do not run `npm run build` as part of this task — this is a static analysis pass only.