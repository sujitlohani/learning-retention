# Knowledge Base — Page Specification
> Personal encyclopedia of every concept across all topics.  
> Visual reference: Stitch designs in ui-inspo/  
> Last updated: March 2026

---

## Purpose

The concept-level view of everything the user has learned. Answers: "How well do I actually know this specific concept?" Entry point to concept-level quiz sessions and Deep Dive forensic history.

---

## Layout

Three-column layout:
- Left column (220px fixed): search + filters
- Center column (flexible): concept card grid, 2 columns
- Right panel (420px, conditional): detail panel — slides in when a concept is selected, center column shifts left

Sidebar visible. Standard sidebar rail — not a top navbar. The nav items in the Stitch design showing a top navbar are incorrect — use the standard left sidebar from brand.md.

---

## Left Column — Filters

### Search
- Full-width input at top: "Find concepts…"
- Filters the concept grid in real time as user types
- Searches concept name and parent topic name

### Filter by Tag
- Label: "FILTER BY TAG" uppercase Medium 500, 11px, `--text-muted`
- Pill group: All (default) / Beginner / Intermediate / Expert / Advanced
- Multi-select — multiple tags can be active simultaneously
- Active pill: `--accent` background, white text
- Inactive pill: `--bg-raised` background, `--text-muted` text
- "All" pill deselects when any specific tag is selected

### Filter by Topic
- Label: "FILTER BY TOPIC" same style
- Dropdown: "All Topics" default, lists all topic names
- Single select

### Sort By
- Label: "SORT BY" same style
- Vertical list of options (not a dropdown):
  - Mastery Score (default, active state: `--accent` background, white text, full width)
  - Last Reviewed
  - Alphabetical
- One active at a time

---

## Center Column — Concept Grid

### Grid Header
- "Concept Browser" Bold 700, 22px, `--text-primary` left
- "Showing N Concepts" Regular 13px, `--text-muted` right

### Concept Card
2-column grid, equal width, 16px gaps.

Each card:
- Topic name top-left: uppercase Medium 500, 11px, `--accent` color (e.g. "PSYCHOLOGY", "UI DESIGN")
- Score % top-right: Bold 700, 28px, color-coded. "SCORE" label Regular 11px `--text-muted` below
- Concept name Semibold 600, 18px, `--text-primary`
- Concept description: 2-line truncated preview, Regular 14px, `--text-muted`
- Stats row: review count with eye icon | last reviewed date with calendar icon — both `--text-muted` 13px
- "View Details" primary full-width button at bottom
- Deep Dive icon button (graduation cap icon) right of View Details button — navigates to `/deep-dive?concept=[conceptId]`

Clicking "View Details" → opens right-side detail panel for that concept

---

## Right-Side Detail Panel

**Component:** Sheet (not Dialog — never a modal)
**Width:** 420px
**Behaviour:** Slides in from right. Center column shifts left. Does not overlay.
**Background:** `--bg-surface`
**Left border:** `1px --border`
**Open trigger:** "View Details" button on any concept card
**Close:** chevron/arrow button top-left of panel OR clicking outside

### Panel Header
- Concept name Bold 700, 18px, `--text-primary`
- Status badge top-right: "MASTERED" / "LEARNING" / "STRUGGLING" / "NOT STARTED" — color-coded pill

### Two Tabs: Overview · History
Tab bar below header. Active tab: `--accent` bottom border. Inactive: `--text-muted`.
**Both tabs must be fully implemented.**

---

### Tab 1 — Overview (default open)

This is the current panel content from the Stitch design — keep it exactly as designed.

**Current Performance section**
- Label: "CURRENT PERFORMANCE" uppercase 11px `--text-muted`
- Performance bar: segmented bar showing last 5 session scores as color-coded filled blocks, full width, 8px height, `--bg-raised` track
- Score % below: Bold 700, 32px, color-coded
- Delta from last session right-aligned: "+N% from last week" in `--success` or "-N%" in `--danger`, Regular 13px

**Stats row**
- Two stat blocks side by side:
  - "Total Reviews" — number Bold 700 + label `--text-muted` 12px
  - "Streak" — number + "d" Bold 700 + label `--text-muted` 12px

**AI Memory Insight section**
- Label: "AI MEMORY INSIGHT" uppercase 11px `--text-muted` with brain icon
- Insight text in a `--bg-raised` block, `--radius-md`, 16px padding
- Italic style, `--text-primary` 14px
- Example: "You tend to struggle with this concept when applied to navigation menus. Re-studying the 'Mega Menu' sub-topic could improve your retention score by 15%."

**Key Takeaways section**
- Label: "Key takeaways" Semibold 600, 14px
- 3 bullet points with checkmark icons, Regular 14px `--text-muted`
- Derived from concept content and quiz history

**Action Buttons (pinned to bottom)**
- "Quiz This Concept" primary full-width with quiz icon
  → navigates to quiz page for this specific concept
- "Deep Dive" ghost link centered below button
  → navigates to `/deep-dive?concept=[conceptId]`

---

### Tab 2 — History

Full question-by-question history of every time this concept was quizzed.

**Layout**
- Sessions grouped by date, newest first
- Each session is a collapsible group with: date header + overall score badge

**Within each session — question list**
Each question row shows:
- Question text — Regular 14px `--text-primary`, truncated to 2 lines
- Answer result indicator left: green checkmark if answered correctly last time, red X if answered incorrectly
- User's last answer below question text — color-coded:
  - Green text if correct
  - Red text if incorrect
- One-liner explanation below the answer: Regular 13px `--text-muted` italic
  Example: "Correct — Hick's Law states decision time increases logarithmically with choices."
  Example: "Incorrect — The correct answer relates to logarithmic not linear scaling."
- Subtle 1px `--border` bottom between question rows

**Color coding rule:**
- The green/red indicator reflects whether the answer was correct in the MOST RECENT attempt for that question — not a historical average. The user can see at a glance which questions they currently know and which they don't.

**Bottom of tab**
- "View Full History in Deep Dive →" ghost link
  → navigates to `/deep-dive?concept=[conceptId]`

---

## States

| State | Behaviour |
|---|---|
| No concepts yet | "Add a topic to start building your knowledge base." centered + Add Topic button |
| No filter results | "No concepts match your filters." + "Clear filters" ghost link |
| Panel closed | Full 2-column concept grid visible |
| Panel open | Grid shifts left, panel slides in from right, 200ms ease-out |
| Concept with no history | History tab shows: "You haven't quizzed on this concept yet." |
| Concept not started | Performance bar empty, score shows "—", stats show 0 |

---

## Data Requirements

All data comes from existing stored data — no new structures needed. The page reads:

- All concepts across all topics — flattened into a single browsable list
- Each concept's current score — for the score display and color coding
- Quiz attempt history per concept — for the History tab question list
- Most recent answer per question — for the green/red correct/incorrect indicator
- Per-session concept breakdown — for grouping history by session date
- AI insight per concept — derived from attempt patterns, same logic as Cockpit Insights tab
- Key takeaways — derived from concept's quiz history (most missed questions inform the takeaways)