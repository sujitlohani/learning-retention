# Topic Page — Refinement Prompt

You are making targeted fixes to the existing Topic Page (`/topics/[id]`). Read `brand.md` before touching any styles. These are specific changes only — do not refactor, restructure, or rebuild anything that is already working.

---

## Fix 1 — Generate "What Is It?" content

The section currently shows "AI Description not yet generated." Fix this.

On Topic Page mount, check `topic.description` in localStorage (via `topicsService.getTopicById()`). If it exists, render it immediately. If it doesn't exist, call the AI service (same HuggingFace client used elsewhere in the project) with this prompt:

> "Return ONLY valid JSON with no markdown or code fences: { \"description\": string, \"useCases\": [{ \"title\": string, \"description\": string, \"tag\": string }] }. The description should explain [topic name] in 2-3 sentences — what it is and why it matters to someone learning it. useCases should contain exactly 3 real-world applications of this topic. Each tag should be a single word category like 'Efficiency', 'Storage', 'Compilers', 'Networking', etc."

After receiving the response:
- Parse the JSON. If parsing fails, show "Unable to generate description" in muted text — do not crash.
- Store `description` and `useCases` on the topic object via `topicsService` so it only generates once per topic
- Render the description as 2–3 sentences in muted body text
- Render use cases as 3 vertically stacked rows below, each with:
  - Bold title on the left
  - One-line muted description
  - Small tag pill on the right — `rounded-full text-xs px-2 py-0.5`, `var(--accent-light)` background, `var(--accent)` text

---

## Fix 2 — Add difficulty level tag to header

`topic.level` is already stored as `'beginner' | 'intermediate' | 'expert'`. Display it as a small pill in the header, next to or directly below the topic name.

Styling per level:
- Beginner: `var(--success)` tint background (12% mix), success text
- Intermediate: `var(--warning)` tint background (12% mix), warning text
- Expert: `var(--danger)` tint background (12% mix), danger text
- Shape: `rounded-full text-xs px-2 py-0.5`
- Capitalize the displayed text ("Beginner", "Intermediate", "Expert")

---

## Fix 3 — Unit Strength: all units, sorted highest first

The current Unit Strength section shows a single stacked composite bar. Replace it with individual horizontal bars per unit — one row per unit.

Each row:
- Unit name on the left
- Accuracy % on the right (color coded)
- Horizontal bar between them, full width, color follows mastery tints:
  - ≥ 75%: `var(--success)`
  - 50–74%: `var(--warning)`
  - < 50%: `var(--danger)`

Sort all units by accuracy **descending** (highest first). All units must be visible — not just weak ones. If a unit has zero attempts, show 0% with a muted bar.

---

## Fix 4 — Practice Frequency (rename + fix data)

Rename "Practice Distribution" to "Practice Frequency" everywhere it appears.

The current display shows time in seconds — this is wrong. Fix the data source to show **session count**: how many quiz sessions have included each unit, computed as the count of `QuizAttempt[]` entries where `unitBreakdown` contains the unit's `unitId`.

Display format per row:
- Unit name on left
- Session count integer on right (e.g. "12 sessions")
- Horizontal bar showing relative frequency (bar width proportional to max count across all units)

No time values anywhere in this section.

---

## Fix 5 — Performance Trend: interactive hover chart

The current Performance Trend shows a static large percentage. Replace it with an interactive SVG line chart.

Data source: `getAccuracyOverTime(topicId)` returning `{ date: string; score: number }[]`

Chart requirements:
- X axis: dates of quiz attempts (spaced proportionally across the SVG width)
- Y axis: score 0–100 (no axis labels needed — just a clean range)
- Smooth SVG `<path>` using cubic bezier curves, `var(--accent)` stroke, 2px width
- Low-opacity filled area beneath the path using `var(--accent)` at ~15% opacity
- Data points: small filled circles at each point, `var(--accent)` fill

Hover interaction (pure SVG + React mouse events, no library):
- Add a transparent `<rect>` overlay covering the full chart area that captures `onMouseMove` and `onMouseLeave`
- On mouse move: calculate nearest data point by comparing mouse X to each point's scaled X position
- Render a vertical dashed line at the nearest point's X position
- Render a small tooltip above the point showing:
  ```
  Mar 8
  74%
  ```
  Tooltip: `var(--bg-surface)` background, `var(--border)` border, `var(--radius-sm)`, `text-xs`, `var(--shadow-resting)`
- On mouse leave: hide the vertical line and tooltip

Edge cases:
- Only one data point: show the single point with message "Keep practicing to build your trend" in muted text below the chart
- No data points: show muted text "No quiz history yet" — no empty axes

---

## After All Fixes

Run `npm run build` — zero TypeScript errors required.

Manual verification:
1. What Is It section generates on first visit, renders description + 3 use case rows with tag pills
2. Second visit to same topic — content loads instantly from cache, no AI call
3. Difficulty tag visible in header, correct color per level
4. Unit Strength shows all units as individual bars, sorted highest accuracy first
5. Practice Frequency shows integer session counts, no time values, correct unit label
6. Performance Trend renders SVG line chart with hover interaction — tooltip appears on mouse move, disappears on leave
7. Single data point shows correctly without crashing
8. Empty state (incognito, no history) shows correctly for Performance Trend