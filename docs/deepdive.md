# Deep Dive — Page Additions + Learning Module

Read `brand.md` before touching styles. The `deepdive_model` folder has UI screenshots for visual reference — use them for layout inspiration only. All code written fresh for the existing stack.

Run `npm run build` after completion — zero TypeScript errors.

---

## What Already Exists (Do Not Touch)

- Filters row (Topic, Unit, Quiz Type, Date range)
- Session cards with expand/collapse, question breakdown, Retry Weak Questions button
- AI Insights right panel with Generate Insight button

---

## Change 1 — Needs Review Sliding Card

Add a sliding card at the top of the right panel, above the existing AI Insights section. Same design as the Topic Page Needs Practice slider (Task 3 in topic refinements) with one extra button per slide.

**Data:** Top 3 weakest units across all topics. Compute accuracy by averaging `unitBreakdown[unitId].score` across all attempts using `quizHistoryService.getAllAttempts()`. Sort ascending, take top 3. If no weak units exist, hide the card entirely.

**Per slide layout:**
```
[Unit name]              [Start]  [Deep Dive →]  [⚄]
[X% mastery]  [░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]
```

- "Deep Dive →" is a white outline button (white border at 50% opacity, white text) — secondary to Start
- Clicking "Deep Dive →" navigates to `/deep-dive/learn?unitId=[unitId]&topicId=[topicId]`
- Everything else identical to Topic Page slider — indigo gradient background, dot indicators, 8s auto-advance, pause on hover

---

## Change 2 — AI Insight Card (with Topic/Unit Selector)

Replace the existing Generate Insight button area with a proper AI Insight card that lets the user target a specific topic and unit before generating.

**Layout:**
```
AI INSIGHT
──────────────────────────────────────────
Topic    [dropdown — all user topics     ▼]
Unit     [dropdown — units for selected ▼]
         (Unit dropdown populates based on topic selection)

[ Generate Insight ]
```

- Topic dropdown: populated from `topicsService.getTopics()`, sorted alphabetically. Default: first topic.
- Unit dropdown: populated from `selectedTopic.units`, sorted alphabetically. Default: first unit. Repopulates whenever topic changes.
- "Generate Insight" is an accent-filled button. On click, disabled + shows a spinner inside the button.

**AI prompt on click:**

> "A student is struggling with the unit '[unit name]' from topic '[topic name]'. Their accuracy on this unit is [X]%. Return ONLY valid JSON with no markdown: { \"diagnosis\": string, \"confusions\": string[] } — diagnosis is one sentence identifying the root cause of their struggle. confusions is an array of 2–3 short phrases describing the specific sub-concepts they are most likely misunderstanding. Be specific to this unit, not generic."

Compute the accuracy for the selected unit using the same `computeUnitScore` function from `retention-calculator.ts`. Pass it into the prompt.

**On success, replace the form with the result:**
```
Why you might be struggling with [unit name]

[diagnosis sentence — body text, muted]

You're likely confusing:
• [confusion 1]
• [confusion 2]
• [confusion 3]

[ 🔬 Deep Dive Concept → ]
```

- Bullet dots: accent colour
- "Deep Dive Concept →" is an accent filled button that navigates to `/deep-dive/learn?unitId=[selectedUnitId]&topicId=[selectedTopicId]`
- "Generate another" link below the button resets the card back to the selector form

On parse failure: show "Unable to generate insight. Try again." in muted text with a retry link. No crash.

---

## Change 3 — Deep Dive Learning Module Page

**Route:** `app/deep-dive/learn/page.tsx`

Full-page flow, not a modal. Reads `unitId` and `topicId` from URL search params. On mount, look up the unit name and topic name from `topicsService.getTopics()`.

**Page shell (present throughout all steps):**
```
← Back to Deep Dive

[Unit name]
[Topic name]           STEP X OF 4     [X]% Complete
[progress bar — accent fill, full width, thin 4px]
```

Progress: Step 1 = 25%, Step 2 = 50%, Step 3 = 75%, Step 4 = 100%.

Steps render one at a time. Users move forward only. The Continue / Next button at the bottom of each step advances to the next. Back button in the shell exits to Deep Dive — not back through steps.

State managed by a `useDeepDiveSession` hook at the page level. State shape:

```typescript
interface DeepDiveSession {
  topicId: string
  unitId: string
  unitName: string
  topicName: string
  step: 1 | 2 | 3 | 4
  keyIdea: KeyIdeaData | null
  example: ExampleLine[] | null
  miniCheck: MiniCheckQuestion[] | null
  miniCheckAnswers: Record<number, number>
  currentMiniQ: number
  loading: boolean
  error: string | null
}
```

All state is in-memory only — not persisted. Refreshing or navigating away restarts from Step 1.

---

### Step 1 — Key Idea

On mount (step = 1), call `/api/ai/generate-description` or create a dedicated endpoint if needed. Use this prompt:

> "Return ONLY valid JSON with no markdown: { \"title\": string, \"explanation\": string, \"codeSnippet\": { \"language\": string, \"code\": string, \"resultLine\": string } | null } — Generate a key idea explanation for the unit '[unit name]' from topic '[topic name]'. title should start with 'Key Idea:' and be 4–6 words. explanation should be exactly 2–3 sentences — the core concept only, no fluff. If the unit involves code, include codeSnippet with a 5–8 line example and a resultLine showing the output. If not code-related, set codeSnippet to null."

**Render:**

A lightbulb icon followed by the title (heading style). Explanation paragraph below. If `codeSnippet` is not null:

```
EXAMPLE SNIPPET         ← muted uppercase label
┌────────────────────────────────────────┐
│  [code rendered in dark surface block] │
└────────────────────────────────────────┘
Result: [resultLine]    ← accent-coloured "Result:" label, muted value text
```

Code block: dark surface `#0E0E16`, monospace font, padding 14px, border-radius var(--r-md). Apply inline span syntax colouring — same approach as the coding canvas (no external library). Keywords in purple `#9B8AE8`, strings in green `#7EC8A0`, comments in muted `#4D4A6E`, numbers in amber `#E8B96C`.

While loading: show a subtle skeleton placeholder in place of the content — a few muted rounded rects of varying width. Do not show a spinner — the skeleton communicates loading without feeling blocked.

Continue button at the bottom: disabled until AI response arrives.

---

### Step 2 — Example Breakdown

If Step 1 returned `codeSnippet: null`, skip this step entirely — advance `step` from 1 to 3 automatically, no user action needed.

If a code snippet exists, call AI with:

> "Return ONLY valid JSON with no markdown: { \"lines\": [{ \"code\": string, \"explanation\": string }] } — Take this code from unit '[unit name]': [code from step 1]. Break it into 3–5 meaningful lines or logical blocks. For each, provide the code fragment and a one-sentence plain-English explanation of exactly what it does and why."

**Render:**

Stacked rows, one per line:
```
[code fragment — monospace, surface background, padding 8px 12px]
[explanation — 12px, muted, padding 4px 0 10px 12px]
```

A thin left border in accent colour ties each code+explanation pair together visually.

While loading: skeleton rows.

Continue button at bottom.

---

### Step 3 — Mini Check

Call AI with:

> "Return ONLY valid JSON with no markdown: { \"questions\": [{ \"question\": string, \"options\": string[], \"correctIndex\": number, \"explanation\": string }] } — Generate exactly 3 multiple-choice questions testing the concept '[title from step 1]' from unit '[unit name]'. Each question has exactly 4 options. correctIndex is 0-based. explanation is shown after the user answers — make it genuinely explain why the correct answer is right, not just restate it. Make each question slightly harder than the previous."

Render one question at a time using `currentMiniQ` index.

**Per question layout:**
```
QUICK CHECK            ← muted uppercase label

[question text — 15px, normal weight]

[Option A]
[Option B]
[Option C]
[Option D]
```

Options are full-width buttons, outlined. On click:
- Lock all options (disable further clicks)
- Selected correct option: success background tint, success border, checkmark icon
- Selected wrong option: danger tint and border
- If wrong, also highlight the correct option in success tint
- Show explanation card below options: success tint if correct, danger tint if wrong. Explanation text inside.
- "Next Question →" button appears below the explanation card

After question 3 is answered, the Next button label changes to "Continue →" and advances to Step 4.

No going back to previous questions. No score shown during mini check — just move forward.

---

### Step 4 — Concept Reinforced

**Top card — accent gradient background (same indigo gradient as the Needs Practice slider):**
```
  🚀
  Concept Reinforced
  You've worked through [unit name]. Ready to test yourself?

  [ Start Unit Test → ]
```

"Start Unit Test →" calls `useQuizSession` with `{ type: 'unit-test', topicId, targetUnitId: unitId }`. Same pattern used everywhere in the app.

**Confidence check below the card:**
```
HOW WELL DO YOU UNDERSTAND THIS?

[ 😵 Still confused ]   [ 😐 Somewhat ]   [ 🙂 Clear ]
```

Behaviour:
- "Still confused": disables the three buttons, shows a loading state, calls AI with the alternate explanation prompt below. On response, renders an "Alternate Explanation" card below the confidence row.
- "Somewhat" / "Clear": visually marks the selected button as active (accent tint), no other action.

**Alternate explanation prompt:**
> "Return ONLY valid JSON with no markdown: { \"explanation\": string } — A student still finds '[title from step 1]' confusing after the standard explanation. Write a completely different explanation using a real-world analogy or a different framing. 3–4 sentences. Do not repeat any phrasing from the original explanation."

Alternate explanation card: same surface card style, with a small "Different angle" label in accent above the text. If generation fails, show "Unable to generate alternate explanation. Try reviewing the example again." — no crash.

---

## Route — Dedicated AI Endpoint for Learning Module

**New file:** `app/api/ai/learn/route.ts`

All four AI calls from the learning module (key idea, example breakdown, mini check, alternate explanation) go through this single endpoint. The request body includes a `step` field (`'key-idea' | 'example' | 'mini-check' | 'alternate'`) and the relevant context (`unitName`, `topicName`, `code`, `title`). The route switches on `step` and runs the appropriate prompt.

This keeps all learning module prompts in one place and avoids cluttering `generate-quiz` or `generate-description`.

---

## Verification

1. Needs Review slider shows real weakest units from all topics, "Deep Dive →" navigates correctly
2. AI Insight card has Topic and Unit dropdowns — unit list updates when topic changes
3. Generate Insight uses the selected topic/unit, not a hardcoded value
4. Accuracy passed into the insight prompt is computed from `computeUnitScore`, not hardcoded
5. "Deep Dive Concept →" navigates to the correct `/deep-dive/learn` URL with right params
6. "Generate another" resets the insight card back to the selector form
7. Learning module reads `unitId` and `topicId` from URL params correctly
8. Step 1 generates key idea, renders code snippet with syntax colouring, Continue disabled until loaded
9. Step 2 skips automatically if no code snippet, advances directly to Step 3
10. Step 2 renders line-by-line breakdown with left accent border per row
11. Step 3 renders 3 MCQ questions one at a time, options lock after selection, explanation shown
12. Step 3 advances to Step 4 after third question
13. Step 4 "Start Unit Test →" triggers quiz via `useQuizSession`
14. "Still confused" generates alternate explanation, "Somewhat"/"Clear" mark selection only
15. Progress bar and step counter update correctly at each step
16. Back button returns to Deep Dive, does not navigate backward through steps
17. Skeleton placeholders shown during AI loading, not spinners
18. `npm run build` — zero TypeScript errors