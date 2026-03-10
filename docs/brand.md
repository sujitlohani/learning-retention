# Memora Brand Guidelines

Source of truth for all UI styling and design tokens. Reference this document in every implementation task.

---

## 1. Color Tokens

Defined via CSS variables in `app/globals.css`. Dual-mode (Light & Dark).

### Core

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| `--bg-base` | `#F7F7FC` | `#0E0E16` | App background |
| `--bg-surface` | `#FFFFFF` | `#16161F` | Cards, popovers, nav |
| `--bg-raised` | `#EFEFF8` | `#1E1E2A` | Secondary surfaces, hovers |
| `--accent` | `#514DD9` | `#6860F0` | Primary brand color, CTAs |
| `--accent-light` | `#EAE9FF` | `#1C1B33` | Selection states, soft backgrounds |
| `--border` | `#E0DFF5` | `#28283A` | Borders and separators |

### Text

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| `--text-primary` | `#111020` | `#EEEDF8` | Body text, headings |
| `--text-muted` | `#6B6A85` | `#72728A` | Subtext, labels, captions |

### Status

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| `--success` | `#16A34A` | `#4ADE80` | High mastery, positive actions |
| `--warning` | `#CA8A04` | `#FACC15` | Intermediate mastery, caution |
| `--danger` | `#DC2626` | `#F87171` | Weak mastery, errors, destructive |

---

## 2. Typography

**Font**: Plus Jakarta Sans, system-ui, sans-serif
**Base size**: 16px (1rem)

| Weight | Value | Usage |
| :--- | :--- | :--- |
| Regular | 400 | Body text |
| Medium | 500 | Secondary UI elements |
| Semi-Bold | 600 | Subheadings |
| Bold | 700 | Page headings |

---

## 3. Buttons

Built with CVA in `src/components/ui/button.tsx`.

| Variant | Style | Usage |
| :--- | :--- | :--- |
| `default` | `bg-primary text-primary-foreground` | Primary actions |
| `secondary` | `bg-secondary text-secondary-foreground` | Secondary/passive actions |
| `outline` | `border-border bg-background shadow-xs` | Complementary actions |
| `destructive` | `bg-destructive text-white` | Irreversible actions |
| `ghost` | `hover:bg-accent hover:text-accent-foreground` | Nav, low-emphasis actions |

---

## 4. Form Elements

- Height: `h-9` (36px)
- Border: `1px solid var(--border)`
- Focus: `ring-3 ring-ring/50 border-ring`
- Dark mode: `bg-input/30`

---

## 5. Badges & Pills

- Shape: `rounded-full`
- Font size: `text-xs`

### Mastery State Tints (color-mix in srgb)

| State | % Range | Color Token | Tint Mix |
| :--- | :--- | :--- | :--- |
| New | 0–15% | `--text-muted` | 12% muted |
| Learning | 16–35% | `--accent` | 12% accent |
| Weak | 36–55% | `--danger` | 12% danger |
| Strong | 56–75% | `--warning` | 12% warning |
| Almost Mastered | 76–94% | `--success` | 12% success |
| Mastered | 95–100% | `--success` | 20% success + star icon |

### Topic Tag Pills
- Background: `--accent-light`
- Text: `--accent`
- Shape: `rounded-full`
- Size: `text-xs`, `px-2 py-0.5`

---

## 6. Layout

### Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-sm` | `6px` | Badges, tags, small elements |
| `--radius-md` | `8px` | Cards, inputs, buttons |
| `--radius-lg` | `10px` | Modals, drawers only — never cards |

### Shadows

| Token | Value |
| :--- | :--- |
| `--shadow-resting` | `0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04)` |
| `--shadow-raised` | `0 4px 12px rgba(0,0,0,.12), 0 1px 3px rgba(0,0,0,.06)` |

### Motion

| Name | Duration | Usage |
| :--- | :--- | :--- |
| Instant | `80ms` | Immediate feedback |
| Fast | `120ms` | Hover states |
| Base | `150ms` | General transitions |
| Answer | `200ms` | Quiz answer feedback |
| Progress | `350ms` | XP bars, mastery bars |

---

## 7. Navigation Rules

- Memora uses a **left sidebar** — never a top navbar
- The top bar is a utility strip only (search, notifications, avatar)
- Only top-level pages appear in the sidebar: Cockpit, Deep Dive, Knowledge Base, Quiz
- Flow/detail pages (Concept Page, Quiz Completion) are **never** added to the sidebar