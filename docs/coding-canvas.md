# Coding Canvas — Implementation

Read `brand.md` before touching styles. Run `npm run build` after completion — zero TypeScript errors.

C++ is out of scope for this build. JavaScript runs via `new Function()` in-browser. Python runs via Pyodide (WebAssembly, loaded once from CDN). No external execution API required.

---

## Step 1 — New Question Type

**File to modify:** wherever `AIGeneratedQuestion` is defined (likely `src/types/index.ts` or `src/types/ai.ts`)

Add `'coding'` to the `type` union on `AIGeneratedQuestion`.

Add these fields to the interface (all optional so existing questions are unaffected):

```typescript
language?: 'javascript' | 'python'
starterCode?: string
testCases?: {
  input: string
  expectedOutput: string
  isHidden: boolean
}[]
hints?: string[]
```

---

## Step 2 — Python Runtime Loader

**New file:** `src/lib/pyodide-loader.ts`

Single exported async function `loadPyodide(): Promise<any>`. Caches the instance in a module-level variable so it only loads once per session.

```typescript
let instance: any = null

export async function getPyodide(): Promise<any> {
  if (instance) return instance
  const py = await (window as any).loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
  })
  instance = py
  return py
}
```

Pyodide script tag needs to be added to `app/layout.tsx` (or the root layout):

```html
<script src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js" async />
```

This loads the runtime in the background. By the time a user opens a coding question it's usually ready.

---

## Step 3 — Execution Utilities

**New file:** `src/lib/code-runner.ts`

Two exported functions. Both return the same shape:

```typescript
interface RunResult {
  output: string
  passed: boolean[]   // one boolean per test case
  error: string | null
}
```

`runJavaScript(code: string, testCases: TestCase[]): RunResult`

Wraps user code in a function that calls `solution(input)`. Captures the return value and compares to `expectedOutput` after `.trim()` and `String()` normalisation. Catches thrown errors and returns them in `error`. Never throws — always returns a `RunResult`.

The execution wrapper:
```typescript
const fn = new Function('input', `${code}; return solution(input)`)
const output = String(fn(tc.input)).trim()
```

`runPython(code: string, testCases: TestCase[]): Promise<RunResult>`

Loads Pyodide via `getPyodide()`. For each test case, runs the user code then calls `solution(input)`:
```python
exec(userCode)
str(solution(input))
```

Captures stdout and return value. On `PythonError`, populates `error`. Never throws.

Both functions: if `isCorrect` = all non-hidden test cases pass → the question scores as correct.

---

## Step 4 — CodingCanvas Component

**New file:** `src/features/quiz/components/CodingCanvas.tsx`

This component replaces the MCQ answer area when `question.type === 'coding'`. It receives the full `AIGeneratedQuestion` as a prop plus `onAnswer: (isCorrect: boolean) => void`.

### Layout (top to bottom)

**Language pills row**
Two pills: JavaScript | Python. Pre-selected based on `question.language`. Switching language resets the editor to starter code — show a confirmation if the user has typed anything.

**Editor area**
A `<textarea>` for input overlaid with a `<pre>` for display. They share the same font, size, padding, and line height so they align pixel-perfectly. The `<textarea>` is transparent with the caret visible; the `<pre>` sits behind it with coloured spans.

- Font: `var(--font-mono)`, 13px, line-height 1.7
- Background: `#0E0E16` (same dark surface used in the Deep Dive module)
- Line numbers: a fixed-width column on the left, `width: 38px`, right-aligned, `color: #3D3B5A`, separated by a 1px border at `#1E1D30`
- Tab key in the textarea should insert 2 spaces — intercept `keydown` with `e.key === 'Tab'`
- Starter code pre-filled on mount

**Syntax colouring (no external library)**
Same approach as Deep Dive module. Split code by line, apply `<span>` wrappers using regex for:
- Keywords (`function`, `def`, `class`, `return`, `if`, `else`, `for`, `while`, `const`, `let`, `var`, `import`, `from`, `int`, `void`, `true`, `false`, `None`, `and`, `or`, `not`, `in`): accent purple `#9B8AE8`
- Strings (`"..."`, `'...'`, backticks): green `#7EC8A0`
- Comments (`//...`, `#...`): muted `#4D4A6E`
- Numbers: amber `#E8B96C`

Apply to the `<pre>` only. The `<textarea>` stays plain — the user types in it, the coloured `<pre>` mirrors it.

**Toolbar row**
`[ ▶ Run Code ]` button (accent filled), hints buttons if `question.hints` exists.

Hints: show "Hint 1" and "Hint 2" as outline pills. Each reveals a warning-tinted card above the editor on click and permanently strikes through the button. Hints are one-time — once shown they stay visible.

**Output panel**
Dark surface (`#0E0E16`), monospace, shows stdout or error on run. If error: danger colour. If output: neutral. Label: "OUTPUT" in muted small caps. Starts with a placeholder: "Run your code to see output here."

**Test results panel**
Shows after first run. One row per test case.
- Pass: success icon + "Test N passed" + `input → output` in monospace hint text
- Fail: danger icon + "Test N failed" + `got "X", expected "Y"` in danger small text
- Hidden: `?` icon + "Hidden test" + "Result hidden — visible after submission" in hint text

Score line above the rows: `"2 / 2 visible tests passed"` in success or danger colour depending on result.

**Submit button**
Appears after at least one run. `[ Submit Answer ]` accent filled. On click: calls `onAnswer(isCorrect)` where `isCorrect = all non-hidden tests passed`. Does not re-run code — uses the last run result.

**Python first-load state**
If Python is selected and Pyodide isn't ready yet, the Run button shows "Loading Python runtime..." and is disabled. Once ready, it re-enables automatically. Show this as button label change only — no separate loading UI needed.

---

## Step 5 — Wire Into Quiz Renderer

**File to modify:** wherever the quiz renders individual questions — likely `src/features/quiz/components/QuizQuestion.tsx` or equivalent.

Add a condition: if `question.type === 'coding'`, render `<CodingCanvas question={question} onAnswer={handleAnswer} />` instead of the MCQ/text input. Everything else (progress, session tracking, score storage) stays unchanged.

The `onAnswer` callback receives a boolean. Map it to the existing answer handling: `isCorrect: boolean`, `userAnswer: 'code'` (string literal — the actual code isn't stored in the attempt), `correctAnswer: 'passed all tests'` or `'failed tests'`.

---

## Step 6 — AI Generation for Coding Questions

**File to modify:** `app/api/ai/generate-quiz/route.ts`

Add a condition when `type === 'coding'` is in the request body. Use this prompt:

> "Generate a coding exercise for the unit '[unit name]' from topic '[topic name]' in [language]. The exercise must test understanding of this specific unit, not general programming ability. Return ONLY valid JSON with no markdown: { \"question\": string, \"language\": string, \"starterCode\": string, \"testCases\": [{ \"input\": string, \"expectedOutput\": string, \"isHidden\": boolean }], \"hints\": [string, string] }. Rules: starterCode must include a function signature named exactly `solution` with a comment explaining what to implement. testCases must have exactly 3 items — first 2 visible (isHidden: false), last 1 hidden (isHidden: true). Each test input must be a value that can be passed directly to the solution function. expectedOutput must be the string representation of the return value after String() and trim(). hints must have exactly 2 items. Do not include the solution in starterCode."

Parse response as JSON. On failure fall back to a template coding question (same pattern as MCQ fallback). Return in the same `{ questions: [] }` shape.

---

## Step 7 — Topic Page Code Challenge Button

**File to modify:** `src/features/topics/components/TopicPage.tsx`

Add a `</> Code Challenge` button to the header button row, after the Dice button. Style: outline — `border: 1px solid var(--accent)`, accent text, transparent background.

On click: show an inline language picker (two buttons, JavaScript / Python) in a small card that appears below the button row. No modal — just a conditional render. On language select: call `/api/ai/generate-quiz` with `{ topicId, topic: topic.name, type: 'coding', language, units: topic.units, count: 5 }`. Show a loading state on the button: "Generating challenges...". On success: start the quiz via `useQuizSession` with the returned questions, `type: 'unit-test'`.

If the user dismisses the picker without selecting (clicks away or presses Escape), close it without triggering generation.

---

## Step 8 — Daily Quiz Guard

**File to modify:** `app/quiz/daily/page.tsx`

When building the daily quiz question pool, filter out any questions where `type === 'coding'`. One line. Coding questions must not appear in the daily quiz.

---

## Verification

1. JavaScript question runs in-browser with zero network calls — check network tab, no outbound requests on Run
2. Python runtime loads from Pyodide CDN on first Python run, subsequent runs are instant
3. Starter code pre-fills in the editor on mount
4. Tab key inserts 2 spaces, does not move focus
5. Syntax colouring applies to keywords, strings, comments, numbers
6. Switching language resets editor to starter code (with confirmation if edited)
7. Hints reveal one at a time, buttons strike through after use
8. Output panel shows stdout or error correctly coloured
9. Hidden test case shows `?` and no expected value — never reveals expected output
10. Submit button only appears after at least one run
11. `onAnswer(true)` fires only when all non-hidden tests pass
12. Quiz attempt stores `isCorrect` correctly — coding answer does not break session history
13. Code Challenge button on Topic Page shows language picker, generates 5 questions, starts quiz
14. Coding questions do not appear in daily quiz
15. `npm run build` — zero TypeScript errors