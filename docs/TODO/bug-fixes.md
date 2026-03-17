# Data & Logic Bug Fixes

Read `brand.md` and `api-context-reference.md` before starting. Run `npm run build` after — zero TypeScript errors.

---

## Bug 1 — Unit Status Calculation Wrong (Critical)

**Symptom:** 3 units show 100% score in Unit Health bars but Strong count = 0. Units tab shows all as Weak despite 100% scores.

**Root cause:** Unit status (`strong` / `weak` / `neutral`) is being set from a different source than the computed score. The status stored on `unit.status` in localStorage is not being updated correctly after quizzes — or the Units tab is reading `unit.status` directly instead of deriving it from computed score.

**Fix:** In `updateTopicAfterQuiz` in `topics.service.ts`, after computing each unit's score via `computeUnitScore`, update `unit.status` using these thresholds:
- Score ≥ 75% → `'strong'`
- Score < 60% → `'weak'`  
- Otherwise → `'neutral'`

Only update status for units that appeared in `result.testedUnitIds` — do not touch untested units. This is the existing bug where all units get marked weak after every quiz.

The Unit Progress cards (Practiced / Strong / Weak / Unattempted) must derive their counts from the same computed scores, not from `unit.status` directly.

---

## Bug 2 — Unit Progress Cards Count Wrong (14 instead of 8)

**Symptom:** 8 units exist but the four stat cards add up to 14.

**Root cause:** Units are being double-counted. The Practiced count likely includes units from other topics, or the same unit is being counted in multiple categories.

**Fix:** Filter `topic.units` strictly by `topicId` before counting. Each unit should appear in exactly one category — Practiced OR Strong OR Weak OR Unattempted — never multiple. Logic:
- Unattempted: `totalAttempts === 0` for that unit
- Strong: attempted AND score ≥ 75%
- Weak: attempted AND score < 60%
- Practiced: all attempted units (Strong + Weak + Neutral combined)

These four categories are not mutually exclusive in the current code. Practiced should be the total of all attempted, the other three are subsets.

---

## Bug 3 — Attempts Count Wrong in Units Tab

**Symptom:** Units showing nonsensical attempt numbers after one quiz session.

**Root cause:** Attempts are being counted from all quiz history across all topics, not filtered to this topic + this unit combination.

**Fix:** In `TopicUnits.tsx`, when computing attempt count per unit, filter `quizHistoryService.getAttemptsByTopicId(topicId)` then count only attempts where `unitBreakdown` contains the specific `unitId`. Do not use a global attempts count.

---

## Bug 4 — Performance Trend Chart Missing

**Symptom:** Performance Trend section shows a number (30%) but no chart.

**Root cause:** The SVG chart component either has no data points (only one quiz session = no trend to draw) or the chart component broke during a recent edit.

**Fix:** 
- If only one data point exists: show a message "Keep practicing to build your trend" below the single score — no chart yet. This is already partially there but the chart renders nothing instead of gracefully hiding.
- If multiple data points exist: the SVG path calculation is likely producing `NaN` coordinates. Add a guard — if any coordinate is NaN, fall back to the single-point state.
- Chart should show last 7 sessions for this topic, not all-time. Pull from `quizHistoryService.getAttemptsByTopicId(topicId)` sorted by date, take last 7.

---

## Bug 5 — Unit Test Session Card Label Order

**Symptom:** Shows "Binary Tree · Unit Test · Recursion" — topic first, then type, then unit.

**Fix:** In `QuizSessionCard.tsx`, change the label order for all session types:
- Unit Test: `[Unit Name] · Unit Test · [Topic Name]`
- Topic Challenge: `[Topic Name] · Topic Challenge`
- Daily: `Daily Quiz · [Topic Name]`
- Weak Area: `[Unit Name] · Weak Area · [Topic Name]`

Unit and action type are what the user cares about first. Topic is context, shown last. Apply this same order in both Deep Dive session list and Topic History tab.

---

## Verification

1. After completing a quiz, units with 100% score show as Strong in both Unit Health bars and the Strong count card
2. Four stat cards sum to exactly the total unit count — no double counting
3. Unattempted + Practiced = total units
4. Attempt count per unit in Units tab matches actual sessions for that specific unit
5. Performance trend shows chart when 2+ sessions exist, graceful message when only 1
6. Session cards across Deep Dive and History tab show unit first, type second, topic last
7. `npm run build` — zero TypeScript errors