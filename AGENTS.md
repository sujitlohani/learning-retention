# Memora — Agent Guidelines

## File Modification Rules
- **Never create a new file if an existing file should be modified.**
- Always search for an existing component before creating a new one.
- If a file path already exists, modify it — do not duplicate it.
- Before implementing anything, check the relevant feature folder for existing components.

## Folder Structure Rules
- Code used by ONE feature → `src/features/[feature]/components|hooks|services/`
- Code used by TWO OR MORE features → `src/shared/components|hooks|services/`
- Never create top-level `src/hooks/` or `src/services/` folders — use `src/shared/` instead.
- Scoring logic lives in `src/features/scoring/` — mastery, XP, topic progress.

## Data Model Rules
- Concept = atomic unit. Topic = organizational container.
- Concepts and topics have a many-to-many relationship via TopicConcept.
- Never assume a concept belongs to only one topic.
- localStorage keys: `topics_v1`, `concepts_v1`, `topic_concepts_v1`, `mastery_v1`, `xp_balance_v1`, `xp_history_v1`

## Icon Rules
- Always use Lucide React — never Material Symbols or any other icon library.
- Import: `import { IconName } from 'lucide-react'`

## Styling Rules
- All styling must use tokens from `docs/brand.md` — no hardcoded hex values.
- UI inspiration files in `docs/ui-inspo/` are layout reference only — never copy markup or class names.

## Navigation Rules
- Memora uses a left sidebar — never add a top navbar.
- Top bar is utility only: search, notifications, avatar.
- Sidebar pages: Home, Cockpit, Deep Dive, Knowledge Base, Quiz.
- Non-sidebar pages (flow/detail): Concept Page, Topic Page, Quiz Completion.

## Learning Flow Rules
- Flow A (top-down): Topic → Concept → Quiz → Mastery
- Flow B (bottom-up): User inputs concept → system suggests topics → quiz → KB
- Quick Capture lives on Home Page — not in Cockpit.
- Cockpit is for reflection and progress analysis only.
