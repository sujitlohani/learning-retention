# Memora — UI Refinement
> Give this to Antigravity after the initial preMain build is complete.  
> Architecture and logic are untouched — this is purely UI quality.

---

## Before You Start

Read everything in the `preMain/` folder:
- `brand.md` — colors, typography, spacing, component rules
- `appbrief.md` — product context and terminology
- `folderstructure.md` — where things live
- Page specs: `cockpit-spec.md`, `knowledge-base-spec.md`, `deep-dive-spec.md`, `landing-page-spec.md`

Then look at everything in `preMain/ui-inspo/` — Stitch-generated designs for every page plus the logo assets. Use these as visual reference for layout, composition, and component design. The specs define the requirements, the Stitch designs show the intended look and feel.

Do not change any logic, routing, hooks, or service layer. UI layer only.

---

## Logo — Apply Everywhere

The final Memora logo is saved in `memora_logo/` — PNG and SVG assets for both dark and light mode.

It is the Abstract Spark mark (07) paired with "Memora" in Plus Jakarta Sans Bold. Implementation specs from the logo guide:
- Wordmark: Plus Jakarta Sans Bold
- Lockup gap: 12px fixed
- Alignment: center baseline cap
- Icon style: optical weight 400
- Dark mode: white mark + white wordmark on `--bg-base`
- Light mode: dark mark + dark wordmark on light background
- Hover state: mark shifts to `--accent` color

Apply this consistently across:
- Sidebar (collapsed: mark only, expanded: full lockup)
- Landing page navbar (full lockup)
- Login and onboarding pages (full lockup, centered)
- Browser favicon (mark only)

The mark must be identical on every single page. No variations, no substitutions.

---

## Routing

Landing page becomes the root entry point:
- `/` → landing page for unauthenticated users
- `/` → redirect to dashboard for authenticated users
- All CTAs and "Sign In" on the landing page → `/login`
- Existing `/login` demo page stays untouched

---

## Global UI Standards

These apply to every page without exception.

**Colors** — no hardcoded hex values anywhere in components. Every color uses a CSS variable from `brand.md`. Audit everything.

**Typography** — Plus Jakarta Sans loaded and applied everywhere. Display and headlines in Bold 700, section headers and card titles in Semibold 600, body in Regular 400, labels and metadata in Medium 500.

**Score color coding** — everywhere a topic or concept score appears, the color must follow this rule consistently: below 60 is `--danger`, 60 to 79 is `--warning`, 80 and above is `--success`. This includes numerals, bars, and badges.

**Terminology** — find and replace across all UI copy:
- Any variation of "memory score" or "retention score" → "Topic score"
- "Cards" or "flashcards" when referring to concepts → "Concepts"
- Remove "Classroom" from sidebar and anywhere else it appears

**Sidebar** — identical across every page it appears on. Nav items: Home, Cockpit, Knowledge Base, Deep Dive (brain emoji, no text label). Nothing else. Collapsed rail at 60px, expands to 220px on hover without pushing content.

---

## Page Requirements

### Landing Page
Reference: `preMain/ui-inspo/landing*` and `preMain/landing-page-spec.md`

Build the full landing page. Hero section uses the abstract symbolic composition from the Stitch design — floating code fragments, question marks, formula snippets, geometric shapes in low-opacity accent tones. Three-step How It Works section. 2x2 feature highlights grid. Footer. Top navbar with the logo lockup, nav links, and Sign In + Get Started buttons.

### Home Dashboard
Reference: `preMain/ui-inspo/home-dashboard*`

Due Today cards must show topic name, concept tag pills, topic score as a large color-coded numeral with no ring or gauge, question count and estimated time, and a Start Session button. This Week section as a compact list with date pills, topic names, and session type badges.

### Cockpit
Reference: `preMain/ui-inspo/cockpit*` and `preMain/cockpit-spec.md`

Right-side detail panel is a Sheet component — main content shifts left when open, never overlays. All three tabs (Overview, History, Insights) fully implemented. History tab uses accordion rows. Insights tab derived from quiz history with no AI call. Action buttons pinned to panel bottom.

### Knowledge Base
Reference: `preMain/ui-inspo/knowledge-base*` and `preMain/knowledge-base-spec.md`

Left filter column with search, tag pills, topic dropdown, and sort options. Concept cards with View Details and Deep Dive buttons. Right panel is a Sheet with Overview and History tabs. History tab shows question-by-question breakdown with green/red indicators based on most recent attempt and a one-liner explanation per question. Sidebar stays — no top navbar on this page.

### Quiz Page
Reference: `preMain/ui-inspo/learn*`

No sidebar. Concept tag in header shows actual topic and concept name of the current question and updates on every question. Answer reveal: correct option green, wrong selected option red, others faded. Explanation slides in below options after answering. Results screen with topic score, concept breakdown, and two actions.

### Deep Dive
Reference: `preMain/ui-inspo/deep-dive*` and `preMain/deep-dive-spec.md`

Sidebar stays — no top navbar. Left column concept navigator grouped by topic. Right column shows concept header with accuracy ring, session history accordion with full question breakdowns. Placeholder sections for future features clearly marked.

### Add Topic Wizard
No sidebar, full screen focus. Progress bar at top tracking steps 1 through 6. AnimatePresence transitions between steps. Generating step shows real-time progress updating per concept. All 8 steps implemented per `appbrief.md`.

---

## Interactions to Verify

- Right-side panels slide in from right, main content shifts left, 200ms ease-out
- Accordion rows expand inline with chevron rotation, no new panels or modals
- Wizard step transitions slide and fade, 200ms ease-out
- Progress bars animate with ease-in-out, 350ms
- Button feedback at 80ms ease
- All loading states use skeleton loaders for cards and lists, not full-page spinners

---

## When Done

Run `npm run build` — zero errors. Browser test every page and every interaction state. Then generate `GUIDE.md` as specified in `folderstructure.md`.