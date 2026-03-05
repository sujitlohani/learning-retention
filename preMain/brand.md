# Memora — Brand & UI Guidelines
> The UI bible. Every design decision made in this sprint must reference this document.  
> When in doubt, do less. Space and restraint are the design.

---

## Brand

**Name:** Memora  
**Tagline:** Knowledge that sticks.  
**Positioning:** Premium personal learning tool. Warm and intelligent — not a cold dev utility, not a gamified study app.  
**References:** Brilliant (precision), Claude (restraint), Duolingo (warmth)

---

## Logo

**The mark:** A circle with a single smaller circle offset inside it — like a lens focusing, or a memory forming. One shape inside another. Readable at any size.

**Lockup:** SVG mark + `Memora` wordmark in Plus Jakarta Sans Bold. Sentence case. Comfortable spacing.

**Variations:**
- Full lockup — default sidebar header
- Icon only — app icon, favicon, small contexts
- Monochrome — one color only, works on any background

**Rules:**
- Always sentence case, never all-caps
- Never apply gradient to the wordmark — mark only
- Minimum clear space = height of the `M` on all sides
- Never stretch or recolor outside of the defined palette

---

## Typography

**One typeface only: Plus Jakarta Sans** — load via `next/font/google`.

| Role | Weight | Size |
|---|---|---|
| Display / Hero | Bold (700) | 32–48px |
| Headings | Semibold (600) | 18–24px |
| Body / UI | Regular (400) | 14–16px |
| Labels / Metadata | Medium (500) | 12–13px |

**Rules:**
- Never use any other font family
- Never use italic
- Never use uppercase labels
- Two weights cover everything: Bold for display, Regular for body. Use Semibold and Medium sparingly.

---

## Color

**One accent. Used sparingly.** The accent appears on maybe 10% of any given screen. Neutrals and space do the heavy lifting.

### Brand Accent

| Token | Hex |
|---|---|
| `--accent` | `#6C63FF` |
| `--accent-light` | `#EAE9FF` |

### Dark Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#0E0E16` | Page background |
| `--bg-surface` | `#16161F` | Cards, panels |
| `--bg-raised` | `#1E1E2A` | Inputs, popovers, secondary buttons |
| `--border` | `#28283A` | All borders and dividers |
| `--text-primary` | `#EEEDF8` | Headings, body copy |
| `--text-muted` | `#72728A` | Labels, placeholders, secondary info |
| `--accent` | `#6C63FF` | CTAs, active nav, progress fills |
| `--accent-light` | `#EAE9FF` | Tints, selected state backgrounds |
| `--success` | `#4ADE80` | Correct answers, completed states |
| `--warning` | `#FACC15` | Due soon indicators |
| `--danger` | `#F87171` | Wrong answers, overdue states |

### Light Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#F7F7FC` | Slight violet tint — not stark white |
| `--bg-surface` | `#FFFFFF` | Cards, panels |
| `--bg-raised` | `#EFEFF8` | Inputs, popovers |
| `--border` | `#E0DFF5` | All borders and dividers |
| `--text-primary` | `#111020` | Headings, body copy |
| `--text-muted` | `#6B6A85` | Labels, placeholders |
| `--accent` | `#5650E8` | Slightly deeper for light bg contrast |
| `--accent-light` | `#EAE9FF` | Tints, selected state backgrounds |
| `--success` | `#16A34A` | Correct answers |
| `--warning` | `#CA8A04` | Due soon |
| `--danger` | `#DC2626` | Wrong answers, overdue |

> The light theme carries a faint violet tint through all backgrounds and borders. This is what makes light mode feel designed, not just "white mode."

### Implementation in globals.css

```css
:root {
  --bg-base: #F7F7FC;
  --bg-surface: #FFFFFF;
  --bg-raised: #EFEFF8;
  --border: #E0DFF5;
  --text-primary: #111020;
  --text-muted: #6B6A85;
  --accent: #5650E8;
  --accent-light: #EAE9FF;
  --success: #16A34A;
  --warning: #CA8A04;
  --danger: #DC2626;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;
}

.dark {
  --bg-base: #0E0E16;
  --bg-surface: #16161F;
  --bg-raised: #1E1E2A;
  --border: #28283A;
  --text-primary: #EEEDF8;
  --text-muted: #72728A;
  --accent: #6C63FF;
  --accent-light: #1C1B33;
  --success: #4ADE80;
  --warning: #FACC15;
  --danger: #F87171;
}
```

Note: `--accent-light` in dark mode should be a dark tint (`#1C1B33`) not the light value — ensures selected states are visible without blowing out the background.

---

## Spacing & Radius

**8px base grid. No exceptions.**

| Token | Value | Used on |
|---|---|---|
| `--radius-sm` | `8px` | Badges, chips, small buttons |
| `--radius-md` | `12px` | Cards, inputs, standard buttons |
| `--radius-lg` | `20px` | Modals, sheets, large containers |

All spacing in components should be multiples of 8: `8, 16, 24, 32, 40, 48, 64px`.

---

## Components

### Buttons — Three Variants Only

**Primary**
- Background: `--accent`
- Text: white
- Radius: `--radius-md`
- Height: 40px
- Padding: `0 20px`

**Secondary**
- Background: `--bg-raised`
- Text: `--text-primary`
- Border: `1px solid --border`
- Radius: `--radius-md`
- Height: 40px

**Ghost**
- No background
- No border
- Text: `--text-muted` → `--text-primary` on hover
- Radius: `--radius-md`
- Height: 40px

**Rules for all buttons:**
- No uppercase
- No text shadows
- No gradients
- No drop shadows
- Transition: `80ms ease` on background and color only

---

### Cards

- Background: `--bg-surface`
- Border: `1px solid --border`
- Radius: `--radius-md`
- Padding: `24px`
- No shadows on dark theme
- Subtle shadow on light theme only if needed for elevation: `0 1px 3px rgba(0,0,0,0.06)`

---

### Memory Score Display

The one place the brand is expressive. This is the signature display pattern.

```
  89
  ––
  %
```

- The number: Bold (700), 48px, color `--accent`
- The unit label ("%" or "/ 100"): Regular, 13px, `--text-muted`, centered below
- No rings. No circular progress gauges. No radial charts. Just the number.

---

### Quiz Option Buttons

Full-width buttons, secondary style by default.

| State | Style |
|---|---|
| Default | Secondary button style |
| Selected | `--accent` border (2px) + `--accent-light` background fill |
| Correct | `--success` border (2px) + `rgba(74, 222, 128, 0.1)` background |
| Wrong | `--danger` border (2px) + `rgba(248, 113, 113, 0.1)` background |

Explanation text: appears below options after answer is revealed. `--text-muted`, 14px Regular, no surrounding box — just text. Transition: `200ms ease`.

---

### Progress Bar

- Height: `4px`
- Track: `--bg-raised`
- Fill: `--accent`
- Radius: `2px`
- No label inside the bar
- Transition on fill width: `350ms ease-in-out`

---

### Navigation (Sidebar)

- Active item: `2px left border in --accent` + `--accent-light` background
- Inactive item: no background, `--text-muted` icon and label → `--text-primary` on hover
- Item height: `40px`
- Item radius: `--radius-sm` (on the right side — left side flush with sidebar edge for the border effect)
- "Soon" badge: small pill, `--bg-raised` background, `--text-muted` text, `--radius-sm`

---

### Badges / Tags

- Background: `--bg-raised`
- Text: `--text-muted`
- Radius: `--radius-sm`
- Padding: `4px 10px`
- Font: Medium (500), 12px
- Active/selected: `--accent-light` background, `--accent` text

---

### Modals / Sheets

- Background: `--bg-surface`
- Border: `1px solid --border`
- Radius: `--radius-lg` (top corners only for bottom sheets, all corners for centered modals)
- Backdrop: `rgba(0,0,0,0.6)` with `backdrop-filter: blur(4px)`
- Padding: `32px`

---

## Motion

Fast. Never decorative. If an animation doesn't make the interaction feel more responsive or clearer, remove it.

| Moment | Duration | Easing |
|---|---|---|
| Page transition | `120ms` | `ease-out` |
| Card / element enter | `150ms` | `ease-out` |
| Button feedback | `80ms` | `ease` |
| Quiz answer reveal | `200ms` | `ease` |
| Progress fill | `350ms` | `ease-in-out` |
| Wizard step transition | `200ms` | `ease-out` (slide + fade) |
| Modal enter | `150ms` | `ease-out` |
| Sidebar drawer (mobile) | `200ms` | `ease-out` |

Define as CSS variables in globals.css:
```css
--duration-instant: 80ms;
--duration-fast: 120ms;
--duration-base: 150ms;
--duration-answer: 200ms;
--duration-progress: 350ms;
```

---

## Voice & Copy

Warm but edited. No filler words. No exclamation points.

| Context | Copy |
|---|---|
| Onboarding | "What are you learning?" |
| Empty dashboard | "Nothing due today." |
| Good score | "Strong. 89% on React Hooks." |
| Low score | "64% — these 3 concepts need work." |
| Generating | "Building your study plan…" |
| Error | "Something went wrong. Try again." |
| Confirm delete | "Remove this topic?" |
| Success | "Your study plan is ready." |

---

## What Not To Do

| Don't | Why |
|---|---|
| Gradients on text or buttons | Looks decorative, not intentional |
| Shadows on dark theme | Flat dark surfaces don't cast realistic shadows |
| More than one accent element per section | Accent loses meaning when overused |
| Decorative illustrations or icons | Adds noise, breaks the premium feel |
| Multiple font families | Breaks cohesion instantly |
| Uppercase labels | Too aggressive for Memora's tone |
| Animation that isn't triggered by interaction | Decorative motion is distraction |
| Hardcoded hex colors in components | Use CSS variables only |
| Plus Jakarta Sans italic | Not part of the design system |

---

## Quick Reference

```
Accent (dark):   #6C63FF
Accent (light):  #5650E8
Accent tint:     #EAE9FF

Dark bg:   #0E0E16 · #16161F · #1E1E2A
Light bg:  #F7F7FC · #FFFFFF · #EFEFF8

Dark text:   #EEEDF8 (primary) · #72728A (muted)
Light text:  #111020 (primary) · #6B6A85 (muted)

Font:      Plus Jakarta Sans — 400 / 500 / 600 / 700
Radius:    8px / 12px / 20px
Grid:      8px base
Logo:      Circle within circle · sentence case wordmark
Tagline:   Knowledge that sticks.
```
