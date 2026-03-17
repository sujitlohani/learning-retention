# Home Page — Beautification

Read `brand.md` before touching any styles. Edit `HomeDashboard.tsx` only — no new files. Run `npm run build` after. Zero TypeScript errors.

Use the Stitch mockup in `stitch-home-mockup.png` as visual inspiration for the input section and daily quiz card. Do not copy it literally — adapt to brand tokens.

---

## Change 1 — Add Topic Section: Warm Input Block

Replace the current flat input bar with a proper contained block. This is the personality piece of the page.

**Container:** Surface background (`var(--bg-surface)`), `border: 1px solid var(--border)`, `border-radius: var(--r-md)`, padding `28px 24px`. Sits between the greeting row and the Daily Quiz card.

**Inside the container, top to bottom:**

Heading: `"What do you want to learn?"` — `font-size: 18px`, `font-weight: 700`, centered, `color: var(--text-primary)`. No subtitle.

Search input row: icon left, placeholder `"Start typing a topic..."`, `+` button right in accent. Same as before but now inside the container — `border-radius: var(--r-md)`, `background: var(--bg-raised)`, full width.

Suggestion pills below the input — 3 static example pills: `"Binary Trees"` · `"React Hooks"` · `"SQL Joins"`. Each pill: `background: var(--bg-raised)`, `border: 1px solid var(--border)`, `border-radius: 20px`, `font-size: 12px`, `padding: 4px 12px`, muted text. Clicking a pill pre-fills the input with that text and focuses it. These are just UX helpers — tapping one doesn't open the wizard, it just fills the input so the user can hit enter or click `+`.

Clicking anywhere functional (the `+` button, pressing Enter in the input) opens the onboarding wizard with the typed topic name pre-filled.

---

## Change 2 — Daily Quiz Card: Elevate It

The current card is functional but flat. Make it feel more like a CTA.

**Keep:** Accent gradient background, Start button, title, subtitle.

**Add:**
- A small pill badge top-left inside the card: `"DAILY QUIZ"` in white at 70% opacity, uppercase, `font-size: 10px`, `font-weight: 700`, `letter-spacing: .1em`, with a subtle white border at 30% opacity. Same style as the "PRIORITY RECAP" badge in the mockup.
- The subtitle should be dynamic: if `topics.length > 0`, show `"Across your [N] topics · 20 questions"`. If no topics yet, show `"Add a topic to start your daily practice"` and disable the Start button.
- Start button: white background, accent text, `font-weight: 700`. Add a small lightning bolt icon (Lucide `Zap`) before the label.

**Remove:** Any static "Across all your topics" hardcoded string — replace with the dynamic version above.

---

## Change 3 — Remove These Elements

- The `"SYSTEM ONLINE"` or any status indicator (not in our UI language)
- "Takes ~10 mins" label — we don't track estimated time
- "12 new insights ready" type dynamic counts — we don't have this data
- The "Add a new topic" dashed card in the topics grid at the bottom — the input block at the top replaces it entirely. Remove the dashed card from the grid.

---

## Change 4 — Suggestion Pills: Real Data

After the static example pills, if the user already has topics, replace the static pills with their actual topic names (max 3, most recently practiced first). This way returning users see their own topics as quick-access shortcuts.

If no topics yet, show the static example pills as before.

---

## Verification

1. Add topic block shows contained card with heading, input, and suggestion pills
2. Clicking a suggestion pill pre-fills the input — does not open wizard immediately
3. Pressing Enter or clicking `+` opens wizard with pre-filled topic name
4. Daily Quiz card shows dynamic topic count
5. Daily Quiz card disabled when no topics exist
6. No dashed add-topic card in the topics grid
7. `npm run build` — zero TypeScript errors