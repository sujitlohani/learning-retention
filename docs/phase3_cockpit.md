# Phase 3 — Cockpit Implementation
> Prerequisite: Phase 2 complete. Topic Page working. `npm run build` passing. Read `brand.md` before writing any code.

---

## Context

Cockpit is a pure analytics dashboard. Users come here to understand their performance — not to start quizzes or browse topics. Every design decision should serve that single purpose.

The Stitch mockup under `cockpit` (HTML + PNG) is a strong visual reference — use it for layout inspiration and section structure. Do not copy code from it. Adapt everything to the existing Next.js/React/TypeScript codebase using brand tokens.

No new localStorage keys. No new AI calls. All data comes from existing services.

---

## Check Before Building

- Open `package.json` and find what charting library is installed (likely recharts or none). Use whatever exists. If nothing exists, build charts with plain SVG — do not install new dependencies.
- Confirm `quizHistoryService.getAllAttempts()` exists and returns `QuizAttempt[]`
- Confirm `topicsService.getTopics()` exists and returns `Topic[]`
- If `getWeekOverWeekChange(): number` doesn't exist on `quiz-history.service.ts`, add it — it computes the difference between this week's average accuracy and last week's average accuracy from attempt history

---

## Data Derivations (All Client-Side)

All of these are computed from existing localStorage data. No new keys.

```typescript
// Overall Mastery % — average of all topic memoryScores
const overallMastery = topics.reduce((sum, t) => sum + t.memoryScore, 0) / topics.length

// Week over week change
const thisWeekAvg = attempts.filter(a => isThisWeek(a.completedAt)).map(a => a.score)
const lastWeekAvg = attempts.filter(a => isLastWeek(a.completedAt)).map(a => a.score)
const change = avg(thisWeekAvg) - avg(lastWeekAvg)  // positive = improvement

// Accuracy over time for line chart
attempts.sort by completedAt asc → [{date, score}]

// Topic mastery bars
topics → [{name, memoryScore, level}] sorted by memoryScore desc

// Weak areas
topics.flatMap(t => t.units.map(u => ({...u, topicName: t.name, topicId: t.id})))
  .filter(u => u.status === 'weak')
  .sort by accuracy asc

// Recent sessions (last 10)
attempts.sort by completedAt desc → slice(0, 10)
  .map to {type, topicName, score, date}
  topicName resolved via topicsService.getTopicById(attempt.topicId)?.name

// Heatmap
attempts grouped by date(completedAt) → {date: string, count: number}[]
last 16 weeks

// Streak
count consecutive calendar days going back from today where at least one attempt exists
```

---

## Page Layout

Reference the `cockpit` Stitch mockup for proportions and visual feel. The section order below is intentional — most actionable content first.

```
┌──────────────────────────────────────────────────────┐
│ SECTION 1: Overall Mastery + Accuracy Over Time      │
│ Full width                                           │
├──────────────────────────────────────────────────────┤
│ SECTION 2: Weak Areas                                │
│ Full width — most actionable section                 │
├──────────────────────────────────────────────────────┤
│ SECTION 3: Recommended Practice                      │
│ Full width — single card, only if weak units exist   │
├─────────────────────────┬────────────────────────────┤
│ SECTION 4:              │ SECTION 5:                 │
│ Topic Mastery bars      │ Recent Sessions cards      │
│ ~50% width              │ ~50% width                 │
├─────────────────────────┴────────────────────────────┤
│ SECTION 6: Practice Activity Heatmap                 │
│ Full width                                           │
└──────────────────────────────────────────────────────┘
```

---

## Section Specifications

### Section 1 — Overall Mastery + Accuracy Over Time

Left side:
```
Overall Mastery
84.2%
↑ +5.3% this week
```
- "Overall Mastery" in small caps muted label
- Large percentage in `var(--text-primary)`, bold
- Change line: green `var(--success)` if positive, red `var(--danger)` if negative, muted if zero
- If no data: show "—" for percentage, omit change line

Right side: time range toggle — `7D` `30D` `All` — pill style, active gets `var(--accent)` background

Below both: Accuracy Over Time line chart
- X axis: dates, Y axis: 0–100
- Smooth SVG path or library equivalent, `var(--accent)` color, low-opacity fill beneath
- Responds to time range toggle — filter attempts accordingly
- Hover: vertical line snapping to nearest data point, tooltip showing `Date` and `Score %`
- Empty state: muted text "Complete quizzes to see your accuracy trend" — no empty axes

---

### Section 2 — Weak Areas

Label: "WEAK AREAS" small caps, subtext "Priority units recommended for review"

Each weak unit row:
```
[topic icon/color dot]  [Unit name]          [Critical Review tag]  [Practice →]
                        [Topic name] • [X%]
```
- Show up to 5 weak units, sorted by accuracy ascending (weakest first)
- Tag color: `var(--danger)` for < 40% ("Critical Review"), `var(--warning)` for 40–55% ("Needs Focus")
- "Practice →" button navigates to `/topics/[topicId]` — does NOT start a quiz directly
- Empty state: "No weak areas — keep practicing to maintain your strength" in muted text, hide section

---

### Section 3 — Recommended Practice

Only render if weak units exist. Show the single weakest unit:

```
RECOMMENDED PRACTICE
[Unit name]  •  [Topic name]
Mastery: X%

[ Practice Now → ]
```

- Background: `var(--accent-light)`, border: `var(--accent)` at low opacity
- "Practice Now" navigates to `/topics/[topicId]` — not a direct quiz trigger
- Derive from: weakest unit across all topics (lowest accuracy)
- Hide entirely if no weak units

---

### Section 4 — Topic Mastery

Label: "TOPIC MASTERY" small caps, subtext "X topics tracked"

Each topic row:
- Topic name left, mastery % right (color coded)
- Full-width progress bar beneath, color follows mastery tints:
  - < 50%: `var(--danger)`
  - 50–74%: `var(--warning)`
  - ≥ 75%: `var(--success)`
- Sort by mastery score descending
- Empty state: muted text if no topics

---

### Section 5 — Recent Sessions

Label: "RECENT SESSIONS"

Each session is a card (not a table row):
```
[type icon]  [Quiz Type]         [Score %]
             [Topic Name]        [Date]
             [NEEDS REVIEW tag if score < 60%]
```
- Score color coded with mastery tints
- "NEEDS REVIEW" tag: `var(--danger)` tint background, danger text — only if score < 60%
- Show last 10 sessions
- Empty state: "No sessions yet"
- Quiz type icon suggestions: use lucide-react icons — `Zap` for sprint/daily, `BookOpen` for topic challenge, `Target` for unit test

---

### Section 6 — Practice Activity

Label: "PRACTICE ACTIVITY" with subtext "Consistent learning builds long-term memory"

Right side of label row: `🔥 X Days` streak + `Total: X Sessions`

GitHub-style heatmap grid:
- 16 weeks × 7 days
- Cell intensity based on attempt count that day: 0 = `var(--bg-raised)`, 1 = light accent tint, 2–3 = medium, 4+ = full `var(--accent)`
- Month labels above columns
- Day labels (M W F) on left
- Tooltip on hover showing date and count
- Build in pure CSS/SVG if no library — it's just a grid of colored divs

---

## Empty State Strategy

If the user has zero quiz history (e.g. fresh incognito session):
- Section 1: show the mastery number from topics if they exist, hide the chart, show prompt
- Section 2 & 3: hide entirely
- Section 4: show topic bars if topics exist, muted if none
- Section 5: show empty state card
- Section 6: show empty grid with "Start practicing to build your activity history"

Never crash. Never show undefined or NaN.

---

## What NOT To Build

- No quiz start buttons anywhere on this page
- No navigation to topic pages except from Weak Areas and Recommended Practice (and those navigate, not quiz-trigger)
- No new localStorage keys
- No AI calls
- Do not add Cockpit to sidebar — it's already there, just update the page content

---

## Verification

1. `npm run build` — zero TypeScript errors
2. Overall Mastery shows correct average, change line shows correct direction
3. Time range toggle on chart works — filters attempts correctly
4. Chart hover tooltip works
5. Weak Areas shows up to 5 units, sorted correctly, Practice navigates to topic page
6. Recommended Practice shows only when weak units exist, hides when none
7. Topic Mastery bars show all topics, color coded correctly
8. Recent Sessions show last 10, NEEDS REVIEW tag appears only on scores < 60%
9. Heatmap renders with real data — cell intensity varies
10. Streak count is accurate
11. All empty states render gracefully in incognito
12. Zero quiz start buttons on the page