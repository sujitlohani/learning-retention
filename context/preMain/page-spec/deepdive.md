# Deep Dive — Page Specification
> Concept-level forensic detail and learning resource hub.  
> Visual reference: Stitch designs in ui-inspo/  
> Status: PARTIAL — core structure defined, full feature set to be specced in a later sprint.  
> Last updated: March 2026

---

## Purpose

Deep Dive is where a concept gets its own dedicated space. Not just quiz history — the full picture of what this concept is, how well the user knows it, and resources to strengthen it. Think of it as the concept's personal page.

This page is more ambitious than the other pages and will be built in phases. The current sprint should build the core structure and session history. The resource attachment and richer learning features come later.

---

## Entry Points

- "Deep Dive" icon button on Knowledge Base concept card
- "View Full History in Deep Dive →" link from Knowledge Base history panel
- "View in Deep Dive →" link from Cockpit history panel
- Brain emoji icon in sidebar (no label) — opens unfiltered, shows all concepts

---

## Layout

Sidebar visible. Standard left sidebar rail — not a top navbar (the Stitch design shows a top navbar, ignore that).

Two-column layout:
- Left column (200px fixed): concept list grouped by topic
- Right column (flexible): concept detail view

---

## Left Column — Concept Navigator

- Search/filter input at top: "Filter concepts…"
- Concepts listed and grouped by topic name
- Each group: topic name as a label uppercase `--text-muted` 11px, concepts listed below
- Each concept row: concept name + score badge right
- Active concept: `--accent` left border + `--accent-light` background, full row width
- Clicking a concept loads it in the right column

---

## Right Column — Concept Detail

### Concept Header
- Topic label top: "UX DESIGN" / "[TOPIC NAME]" uppercase `--accent` Medium 500, 11px + "· Last session: N days ago" `--text-muted` 13px
- Concept name Bold 700, 32px, `--text-primary`
- Concept description: 2-3 sentence explanation of what this concept actually is, Regular 16px `--text-muted`
- Accuracy score display top-right: circular indicator (this is the one place a ring/gauge is used — it's the signature element of this page), score number Bold 700 inside, "ACCURACY SCORE" label below

### Session History Section
- Label: "Session History" Semibold 600, 18px + sync icon left + "Export Data" ghost link right (placeholder for now)
- Sessions listed newest first, each as an expandable accordion row:

*Collapsed:*
- Session type icon left (colored)
- Session name (e.g. "Mastery Review", "Daily Recap", "First Exposure")
- Date + time `--text-muted` 13px
- "SCORE" label + score % color-coded right
- Chevron — rotates on expand

*Expanded (one session shown open at a time):*
- Each question in that session as a card:
  - "QUESTION" label uppercase 11px `--text-muted`
  - Question text Regular 15px `--text-primary`
  - Two columns below:
    - Left: "YOUR ANSWER" label + answer text — red if wrong, green if correct
    - Right: "CORRECT ANSWER" label + correct answer text — always `--success` color
  - "RELATED TAGS" label + keyword tags as `--bg-raised` pills

---

## What's Placeholder for Now

These sections are visible in the Stitch design and should be scaffolded as empty/placeholder sections in this sprint. Full implementation comes later:

- **Resource attachments** — ability to attach articles, videos, notes to a concept
- **AI recommendations** — suggested resources based on weak areas
- **"Ready to boost your score?" CTA** — prompts a targeted practice session
- **Community/shared insights** — not in current scope at all

For now: build the left column navigator, concept header, and session history accordion fully. Leave the rest as clearly marked placeholder sections with "Coming soon" or empty state text.

---

## States

| State | Behaviour |
|---|---|
| No concept selected | "Select a concept from the list to view its details." centered `--text-muted` |
| Concept with no history | Session History section shows: "No sessions recorded yet for this concept." |
| Opened from Knowledge Base | Pre-selects and loads the concept it was called with |
| Opened from Cockpit | Pre-selects and loads concepts for that topic, first one active |
| Opened from sidebar | No pre-selection, left column visible, right column shows empty state |

---

## Data Requirements

All data comes from existing stored data:

- All concepts grouped by topic — for the left column navigator
- Concept scores — for the score badge in the navigator and the accuracy ring
- Quiz attempt history per concept — for the session history accordion
- Per-question detail per attempt — for the expanded question cards (question text, user answer, correct answer, keywords)
- Session type and timestamp — for session name, date, and icon in the accordion