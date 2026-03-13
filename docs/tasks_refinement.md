# Tasks — Topic Page Refinements + Cockpit Removal

Read `brand.md` before touching any styles. Run `npm run build` after completing all tasks — zero TypeScript errors required.

---

## Task 1 — Remove Cockpit

Remove Cockpit from the sidebar navigation. Delete the Cockpit page component, its route, and all imports that reference it. The sidebar now has exactly three items: Home, Knowledge Base, Deep Dive.

---

## Task 2 — Topic Page: Overview tab left column reorder

Change the order of sections in the Overview tab left column to:
1. What Is It? (first)
2. Commonly Used In (part of same card as above)
3. Unit Progress cards (last)

Needs Practice moves to the right sidebar panel (see Task 3).

---

## Task 3 — Topic Page: Needs Practice becomes a sliding card in the right sidebar

Remove the static Needs Practice section from the left column entirely. Replace it with an animated sliding card at the top of the right sidebar — above Performance Trend and Unit Health.

**Data — real weakest units:**
Compute unit accuracy from `quizHistoryService.getAttemptsByTopicId(topicId)`. For each unit, average the `unitBreakdown[unitId].score` values across all attempts for that topic. Sort units by this computed score ascending. Take the top 3 weakest. If a unit has zero attempts, its score is 0 — show "0% — Never practiced" as the label.

**Slider card design:**
- Background: deep indigo gradient `linear-gradient(135deg, #3730A3 0%, #4338CA 40%, #5B4FE8 100%)`
- Border: `1px solid rgba(104,96,240,.5)`
- Box shadow: `0 4px 24px rgba(104,96,240,.25), 0 1px 4px rgba(0,0,0,.4)` — gives it CTA-level visual prominence
- Header row: "⚠ NEEDS PRACTICE" label left (white at 60% opacity, uppercase small caps), dot indicators right
- Dot indicators: 3 dots, active dot is white and pill-shaped (wider), inactive dots are white at 25% opacity. Dots are clickable.
- Viewport clips to a fixed height (~100px) so the card never resizes during slide transitions
- Inner track is 300% wide (3 slides), slides via `transform: translateX` with `transition: 500ms cubic-bezier(.4,0,.2,1)`

**Each slide contains:**
- Unit name (white, font-weight 700, top-left)
- Start button (white background, accent text) and Dice button (white border, white icon) top-right
- Bottom row: mastery % label (white at 75% opacity) + thin progress bar (white fill at 85% opacity on white-tinted track)
- "0% — Never practiced" label if no attempts

**Counter:** `"1 of 3"` text bottom-right of card, white at 45% opacity. Updates on each slide change.

**Auto-advance:** Slides advance automatically every 8 seconds, looping back to slide 1 after slide 3. Clicking a dot resets the 8-second timer. Pause auto-advance while user hovers over the card.

---

## Task 4 — Topic Page: What Is It — split card + richer concept generation

The What Is It card has two internal sub-sections divided by a border line.

**Sub-section 1 — "CONCEPT"** (accent micro-label)

On Topic Page mount, check if `topic.description` exists in localStorage. If it does, render it. If not, call the AI service with this prompt:

> "Return ONLY valid JSON with no markdown or code fences: { \"description\": string, \"useCases\": [{ \"title\": string, \"description\": string }] }. The description should explain [topic name] to someone learning at the [difficulty level] level. Write 5–6 sentences: start with what it is, then explain how it works conceptually, then explain why it matters to someone at this level. Aim for around 80–100 words — enough to be genuinely informative, not just a one-liner. Keep the same approximate word count regardless of topic so the UI stays visually consistent. useCases should contain exactly 3 real-world applications with a bold title and one concise sentence each."

Parse the JSON, store both `description` and `useCases` on the topic via `topicsService` so AI is only called once per topic. On parse failure, show "Unable to generate description" in muted text — do not crash.

Render description as a paragraph of body text, `font-size: 13px`, `line-height: 1.7`, `opacity: 0.85`.

**Sub-section 2 — "COMMONLY USED IN"** (accent micro-label)

Render the 3 use cases as a plain bullet list:
- Each bullet: small accent-colored dot marker, bold title, muted one-line description below
- No tag pills, no right-aligned labels, no borders between items
- Just clean vertical spacing between bullets

---

## Task 5 — Topic Page: Unit Progress cards — clickable filters

The four stat cards (Practiced, Strong, Weak, Unattempted) should navigate to the Units tab with the corresponding filter pre-applied on click.

- Practiced → Units tab, "All" filter active
- Strong → Units tab, "Strong" filter active
- Weak → Units tab, "Weak" filter active
- Unattempted → Units tab, "Unattempted" filter active

Each card gets a hover state: subtle background tint matching the card's color (accent/success/danger), slight `translateY(-1px)`, border color shifts to match. A small "View →" hint appears on hover in the matching color. No other behavior changes.

---

## Task 6 — Topic Page: Rename Unit Strength → Unit Health, remove Practice Frequency

In the right sidebar:
- Rename the section label from "UNIT STRENGTH" to "UNIT HEALTH"
- Remove Practice Frequency / Practice Distribution entirely — delete the component, its data derivation, and all imports referencing it

---

## Task 7 — Topic Page: Units tab — add Score column

The units table shows: Unit name, Status, Attempts, Last Practiced.

Add a **Score** column between Attempts and Last Practiced. Compute score the same way as Task 3 — average `unitBreakdown[unitId].score` across all attempts for this topic. Color code:
- ≥ 75%: `var(--success)`
- 50–74%: `var(--warning)`
- < 50%: `var(--danger)`
- No attempts: show "—" in `var(--muted)`

---

## Task 8 — Topic Page: Add History tab

Add a third tab "History" alongside Overview and Units.

Pull data from `quizHistoryService.getAttemptsByTopicId(topicId)`, sorted newest first.

Filter pills at the top: All | Unit Test | Topic Challenge

Each session is a collapsible card — reuse the same session card component used in Deep Dive. On expand: question breakdown with correct (✓ success) and incorrect (✗ danger) rows. Incorrect rows show question text, your answer in danger color, correct answer in success color, and a concept pill if `unitName` is defined on the question.

Include "↻ Retry weak questions" button at the bottom of each expanded session. It collects questions from that attempt where `isCorrect === false` and passes them to `useQuizSession` — same pattern as Deep Dive.

Empty state: "No quiz history for this topic yet. Start a quiz to see your sessions here."

Do not create new service methods — `getAttemptsByTopicId` already exists.

---

## Task 9 — Topic Mastery: donut chart in header

Replace the plain mastery percentage text with an SVG donut chart in the header.

- SVG circle, `r="36"`, `stroke-width="7"`, total circumference = `2π × 36 ≈ 226.2px`
- Background track: `var(--raised)` stroke, full circle
- Filled arc: `stroke-dasharray="${mastery/100 * 226.2} ${226.2 - mastery/100 * 226.2}"`, rotated -90deg so it starts at the top
- Arc color: `var(--danger)` if < 50%, `var(--warning)` if 50–74%, `var(--success)` if ≥ 75%
- `stroke-linecap="round"` for clean arc ends
- Centered text overlay: mastery % (font-weight 800, same tint color as arc) and "Mastery" label below in muted uppercase small caps
- Size: 88×88px
- Positioned inline next to the Start Topic Challenge button, not stacked above it

---

## Verification

1. Cockpit gone from nav, no broken links or imports
2. Overview tab left column order: What Is It → Unit Progress (Needs Practice is now in right sidebar)
3. Needs Practice slider card sits at top of right sidebar, shows real 3 weakest units by computed accuracy
4. Slider auto-advances every 8 seconds, dots are clickable, timer resets on dot click, pauses on hover
5. Unit names and mastery % in slider reflect actual quiz history data — not hardcoded
6. Units with zero attempts show "0% — Never practiced"
7. What Is It — Concept section shows 5–6 sentence description (~80–100 words), generated by AI on first visit, cached on subsequent visits
8. Commonly Used In shows 3 bullet points with bold title + muted description, no tag pills
9. Unit Progress cards are clickable — each navigates to Units tab with correct filter applied
10. Unit Health label correct in sidebar, Practice Frequency removed entirely
11. Units table has Score column, color-coded correctly
12. History tab shows topic-scoped sessions only, filters work, expand/collapse works, Retry button works
13. Donut chart in header reflects real mastery %, color matches tint thresholds
14. `npm run build` — zero TypeScript errors