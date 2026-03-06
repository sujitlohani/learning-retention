# Cockpit — Page Specification
> Performance overview across all topics.  
> Visual reference: Stitch designs in ui-inspo/  
> Last updated: March 2026

---

## Purpose

The user's birds-eye view of all their learning. Answers: "How am I doing overall?" and "What needs attention?" Lets the user take action (retake, regenerate) without leaving the page.

---

## Layout

Sidebar + main content area. When the detail panel is open, main content shifts left — panel never overlays.

---

## Main Page

### Header
- Left: "Cockpit" Bold 700, 28px, `--text-primary`
- Subtitle: "Good morning. You have N topics due for review today." Regular 14px, `--text-muted`
- Right: "+ Add New Topic" primary button | "Filters" secondary button with filter icon

### Stats Row
4 cards in a horizontal row, equal width, 16px gaps:
- Total Topics
- Avg Score — color-coded per global rules
- Due Today — `--warning` color if > 0
- Total Sessions

Each card: `--bg-surface`, `1px --border`, `--radius-md`, 24px padding. Large number Bold 700 `--text-primary`, label Regular 13px `--text-muted` below.

### Priority Review
- Only renders if overdue topics exist — hidden entirely when nothing is overdue
- Section label: "Priority Review" Semibold 600 + `--warning` exclamation icon left
- Flat list rows inside a `--bg-surface` bordered container:
  - Topic name Semibold 600, 15px, `--text-primary`
  - Overdue label below: "Overdue since yesterday" / "Due N hours ago" in `--danger` Regular 13px
  - "Review →" accent-colored ghost link right-aligned
  - 1px `--border` bottom between rows, 56px row height

### Active Topics Grid
- Section label: "Active Topics" Semibold 600
- 2 columns desktop, equal width, 16px gap
- Each topic card:
  - Difficulty label top-left: "ADVANCED" / "INTERMEDIATE" / "BEGINNER" — uppercase, `--accent` color, Medium 500, 11px
  - Topic name Semibold 600, 20px, `--text-primary`
  - Topic score — Bold 700, 48px, color-coded right-aligned:
    - Below 60 → `--danger`
    - 60 to 79 → `--warning`
    - 80 and above → `--success`
  - "Topic Score" label `--text-muted` 12px + score % right
  - Score bar: 4px, color-coded fill, `--bg-raised` track, full width
  - Bottom row: concept count pill + difficulty pill — both `--bg-raised` `--text-muted` `--radius-sm`
  - Active/selected card state: `--accent` 2px border
- Clicking any card → opens right-side detail panel for that topic

---

## Right-Side Detail Panel

**Component:** Sheet (not Dialog — never a modal)
**Width:** 420px
**Behaviour:** Slides in from right. Main content area shifts left by 420px. Does not overlay.
**Background:** `--bg-surface`
**Left border:** `1px --border`
**Close:** X button top-right OR clicking outside panel

### Panel Header
- Topic name Bold 700, 20px, `--text-primary`
- X close button top-right

### Three Tabs: Overview · History · Insights
Tab bar sits directly below the header. Active tab: `--accent` bottom border, `--text-primary` label. Inactive: `--text-muted`.

**All three tabs must be fully implemented — none are decorative.**

---

### Tab 1 — Overview (default open)

**Concept Performance section**
- Label: "MASTERY BY CONCEPT" uppercase Medium 500, 11px, `--text-muted`
- Each concept as a row:
  - Concept name Regular 15px `--text-primary` left
  - Score % Bold color-coded right
  - Score bar full width below, 4px, color-coded fill
  - 16px vertical gap between concepts
- Data: topic's concept list with their current scores

**Recent Sessions section**
- Label: "RECENT SESSIONS" same label style
- Last 3 quiz sessions for this topic as compact rows:
  - Session type icon left
  - Session name + date `--text-muted` 13px
  - Score right Bold `--text-primary`
- Data: most recent 3 quiz attempts for this topic

**Action Buttons (pinned to bottom of panel, always visible)**
- "New Practice Questions" primary full-width with play icon
  → calls the AI quiz generation endpoint for this topic
  → button shows "Regenerating…" with inline spinner while running
  → on complete, navigates to the quiz page for this topic
- "Retake Last Quiz" secondary full-width with refresh icon
  → navigates to the quiz page using existing stored questions

---

### Tab 2 — History

**Header row**
- "Session History" Semibold 600, 16px left
- "Clear Filter" ghost link right

**Session list — accordion pattern**

Each session is an expandable row:

*Collapsed state:*
- Colored dot left — green if high score, yellow if medium, red if low
- Date Bold 600, 14px `--text-primary`
- Duration + concept count `--text-muted` 13px below date
- Chevron icon right — rotates 180° on expand

*Expanded state (opens inline — no new panel or modal):*
- "CONCEPT SCORES" label
- Each concept tested in that session:
  - Concept name Regular 14px `--text-primary`
  - Score bar full width, color-coded, 4px
  - Score % right, color-coded Bold
- Data: concept breakdown stored per quiz attempt

**Bottom of tab — sticky, always visible**
- "View in Deep Dive →" ghost link centered
  → navigates to the Deep Dive page filtered to this topic

---

### Tab 3 — Insights

Concept-level insights derived from the user's quiz history for this topic. No additional AI call — derived from existing attempt data using this logic:

- 80%+ correct across attempts → "Strong grasp. No errors in last N attempts."
- 60–79% → "Moderate. Some inconsistency across sessions."
- Below 60% → "Struggling. Answered incorrectly in N of N attempts."
- No attempts → "Not started."

Each concept as a card:
- Concept name Semibold 600, 14px
- Insight text Regular 14px `--text-muted`
- Status badge right: Strong / Needs Work / Not Started — color-coded
- `--bg-raised` background, `--radius-md`, 16px padding, 8px gap between cards

Empty state (no quiz history yet):
"Complete a quiz session to generate insights for this topic." centered `--text-muted`

---

## States

| State | Behaviour |
|---|---|
| No topics added | Full page empty: "Nothing here yet. Add your first topic." + Add Topic button centered |
| Panel closed | Full 2-column grid visible |
| Panel open | Grid shifts left 420px, panel slides in from right, 200ms ease-out |
| Overdue topics exist | Priority Review renders above Active Topics |
| No overdue topics | Priority Review hidden entirely |
| Regenerating questions | Button shows "Regenerating…" + spinner, disabled until complete |

---

## Data Requirements

All data comes from existing stored data — no new structures needed. The page reads:

- All topics with their concept lists and current scores
- Quiz attempt history per topic — used for Recent Sessions and History tab
- Concept-level scores from attempt history — used for concept breakdown rows
- Scheduled sessions — used for Due Today count in stats row
- Attempt patterns per concept — used to derive Insights tab content