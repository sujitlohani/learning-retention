# Landing Page — Specification
> Marketing entry point for Memora.  
> Visual reference: Both Stitch variants in ui-inspo/  
> Preferred direction: Left variant (Abstract Symbolic Layering) as primary reference.  
> Last updated: March 2026

---

## Purpose

The first thing anyone sees before signing up. Should communicate what Memora is, why it matters, and make signing up feel like the obvious next step. Dark, premium, editorial — not a generic SaaS template.

---

## Routing

- Landing page is the root entry point: `/`
- Authenticated users bypass this and land on the Home Dashboard
- "Sign In" in the navbar → redirects to `/login` (existing demo login page)
- "Sign up" / "Get Started" CTA → redirects to `/login` for now
- All auth flows go through the existing login page

---

## Layout

Full-width marketing page. No sidebar. Standard top navbar.

---

## Navbar

- Left: Memora logo mark (circle within circle SVG) + "Memora" wordmark, Plus Jakarta Sans Bold, sentence case
- Center: ghost text links — Product / Features / Pricing / About (placeholder links, no pages behind them yet)
- Right: "Sign In" ghost link + "Get Started" primary button
- Navbar background: `--bg-base` with subtle `1px --border` bottom
- Sticky on scroll

---

## Section 1 — Hero

Full viewport height. Two-column layout.

**Left column (text):**
- Small label above headline: "VARIANT 01: ABSTRACT LAYERING" style — but for production use: a small accent-colored label like "NOW IN BETA" or leave empty
- Headline: "Knowledge" (white) + line break + "that " + "sticks." (`--accent` colored) — Bold 700, 56px, tight line height
- Subheading: one sentence, Regular 16px, `--text-muted`, max-width 320px
  "The cognitive-first workspace that turns information into long-term memory using AI-driven active recall and spaced repetition."
- Two CTAs below:
  - "Start Learning" / "Sign up for free" — primary button
  - "View Demo" / "See how it works →" — secondary or ghost button
- Social proof row below CTAs: avatar stack (3-4 small circles) + "Trusted by 2,400+ lifelong learners" in `--text-muted` 13px

**Right column (visual):**
- Abstract symbolic composition — floating elements at varying depths and opacities:
  - Brain/neural network outline icon (large, low opacity, background layer)
  - Code snippet fragments (monospace font, `--accent` tinted, mid opacity)
  - Mathematical formula fragments (e.g. retention curves)
  - Small UI card glimpse showing "RETENTION SCORE" label + score number
  - Question mark symbols scattered at different scales
  - Geometric grid lines at very low opacity
- All elements: `--accent` color family, varying opacity from 10% to 60%
- No bright colors, no cartoonish illustration style
- Feels like knowledge floating in dark space

---

## Section 2 — How It Works

Centered, full-width section. Dark background.

- Section label above: "PROCESS" uppercase `--accent` Medium 500, 12px, centered
- Section headline: "A proven loop for mastery" Bold 700, 32px, centered
- Three steps in a horizontal row, equal width:

| Step | Icon | Title | Description |
|---|---|---|---|
| 1 | capture icon | Log | Capture concepts, thoughts, and complex data naturally. Our editor understands intent and context. |
| 2 | AI/sparkle icon | AI Plan | Memora analyzes your logs to generate personalized review schedules based on your personal forgetting curve. |
| 3 | review/cycle icon | Review | Engage in active recall through dynamic quizzes and interactive sessions designed for retention. |

Each step: icon top, step number + title Semibold 600 16px, description Regular 14px `--text-muted`.

---

## Section 3 — Features

Two-column layout. Left: bold headline + stats. Right: 2x2 feature grid.

**Left:**
- Label: "FEATURES" uppercase `--accent` 12px
- Headline: "Engineered for cognitive depth." Bold 700, 36px, `--text-primary`
- Subtext: Regular 15px `--text-muted`, 2-3 sentences about the product philosophy
- Two stats below:
  - "98%" Bold 700 32px `--success` + "Retention rate reported by active users" `--text-muted` 13px
  - "4x" Bold 700 32px `--accent` + "Faster recall of complex topics" `--text-muted` 13px

**Right — 2x2 feature grid:**

| Feature | Icon | Description |
|---|---|---|
| Spaced Repetition | repeat/interval icon | Intelligent intervals that hit the sweet spot of memory consolidation. |
| AI Quizzes | sparkle/quiz icon | Dynamic testing generated from your notes to verify true understanding. |
| Concept Tracking | graph/map icon | Visualize the neural map of your knowledge and how topics interconnect. |
| Topic Score | score/gauge icon | Quantify your mastery level for every single subject in your library. |

Each feature card: `--bg-surface`, `1px --border`, `--radius-md`, 20px padding. Icon top-left `--accent`. Title Semibold 600 15px. Description Regular 13px `--text-muted`.

---

## Footer

- Left: Memora logo mark + wordmark
- Center: Privacy Policy / Terms of Service / Contact — ghost text links
- Right: © 2024 Memora Inc. All rights reserved.
- Top: subtle `1px --border` separator
- Background: `--bg-base`

---

## Design Rules

- No illustrations that aren't the abstract symbolic composition
- No light backgrounds on any section — all `--bg-base` or `--bg-surface`
- Accent color used sparingly — headline word, CTAs, section labels, stat numbers
- No gradients except very subtle radial glow behind the hero visual (low opacity `--accent`)
- Motion: subtle parallax on hero elements on scroll (optional, 120ms ease-out)
- Mobile: hero goes single column, visual moves below text, steps stack vertically