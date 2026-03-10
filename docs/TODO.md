# Memora — TODO: Core Rework
> Work through tasks in order. Reference `memora-context.md` for all product decisions. Do not deviate from it.

---

## Task 1 — Rename Concepts → Units (Global)

**Scope:** Codebase-wide terminology change.

- [ ] Find and replace all instances of `concept` / `concepts` / `Concept` / `Concepts` with `unit` / `units` / `Unit` / `Units` in:
  - Component file names
  - Directory names (`src/features/concepts/` → `src/features/units/`)
  - Variable names, props, state keys
  - Type definitions and interfaces
  - API route names (`/api/concepts` → `/api/units`)
  - Database field names or references
  - UI-facing strings (labels, headings, button text, empty states)
- [ ] Update any comments or inline documentation that reference "concept"
- [ ] Confirm nothing is broken after rename — check all imports and references resolve correctly

---

## Task 2 — Remove Unit Selection Checkboxes from Onboarding

**Context:** Previously, onboarding Step 2 (difficulty selection) showed a list of AI-generated concepts with checkboxes. Only checked concepts were included. This is now removed.

**Changes:**
- [ ] Remove the checkbox UI from the unit list in the onboarding difficulty step
- [ ] Update the logic so that **all AI-generated units are included by default** — no selection required
- [ ] Keep the ability for users to **add their own custom units** to the list
- [ ] Remove any filtering logic that excluded unchosen concepts from quiz generation
- [ ] Ensure the full list of generated units is passed to all downstream services (quiz generation, mastery tracking)

---

## Task 3 — Remove "How Long Do You Want to Study" and "Daily Time Commitment" Pages

**Context:** These two onboarding pages are removed entirely. They were tied to an LMS-style scheduling model that no longer fits the product direction.

**Changes:**
- [ ] Delete the "How long do you want to study" onboarding step/page/component
- [ ] Delete the "Daily time commitment" onboarding step/page/component
- [ ] Remove any state, hooks, or logic that depended on these inputs
- [ ] Remove any scheduling logic driven by these values (e.g. generating a weekly study plan)
- [ ] Update the onboarding flow routing so it skips cleanly from difficulty selection → familiarity check (new Task 4)
- [ ] Confirm onboarding step count and progress indicator updates correctly

---

## Task 4 — Add Familiarity Check Page to Onboarding

**Context:** A new onboarding step is inserted after difficulty selection. Its purpose is to calibrate the user's precise sub-level (1–5) within their chosen difficulty band (Beginner / Intermediate / Expert). See `memora-context.md` Section 3 for full specification.

**Changes:**

### UI
- [ ] Create a new onboarding step component: `FamiliarityCheck`
- [ ] Display heading: *"Which of these do you already understand?"*
- [ ] Display a checklist of 4–5 knowledge statements (AI-generated, see below)
- [ ] Each item is a checkbox — user checks what they genuinely know
- [ ] Show a Continue button — enabled after at least one interaction (even if nothing checked)

### AI Generation
- [ ] Add an API call to generate familiarity statements using this prompt:
  > "Given the topic [topic] and difficulty level [beginner/intermediate/expert], generate 4–5 knowledge statements a user at this level might or might not already know. Statements should range from very foundational to moderately advanced within this difficulty band. Format as short, clear first-person declarations. Return as a JSON array of strings."
- [ ] Parse and display the returned statements as checkboxes

### Sub-level Calculation
- [ ] After user submits, count checked items and assign sub-level 1–5:
  ```
  0–1 checked → sub-level 1
  2   checked → sub-level 2
  3   checked → sub-level 3
  4   checked → sub-level 4
  All checked → sub-level 5
  ```
- [ ] Store sub-level on the topic record (new field: `subLevel: number (1–5)`)
- [ ] Store unchecked items as identified knowledge gaps (new field: `knowledgeGaps: string[]`)
- [ ] Pass sub-level and knowledge gaps into the onboarding quiz generation call

### Onboarding Flow Update
- [ ] Insert FamiliarityCheck step between difficulty selection and onboarding quiz trigger
- [ ] Update routing and step progress indicator accordingly

---

## Task 5 — Update AI Quiz Generation to Use Sub-level

**Context:** The AI layer for quiz generation must now use the user's sub-level (1–5) within their difficulty band to calibrate question difficulty. This applies to all quiz types.

**Changes:**

### Onboarding Quiz
- [ ] Pass `difficulty`, `subLevel`, and `knowledgeGaps` to the quiz generation prompt
- [ ] Update the prompt to:
  > "Generate an onboarding quiz for [topic] at sub-level [1–5] within [difficulty band]. Questions should span all units. Use adaptive difficulty within the session: correct answer → next question harder; wrong answer → next question easier. Goal is to locate the user's true knowledge level. Mix question types: MCQ, true/false, applied reasoning. Weight more questions toward the user's identified knowledge gaps: [knowledgeGaps]."

### All Other Quiz Types
- [ ] Pass `subLevel` for the relevant unit or topic into every quiz generation call
- [ ] Update prompts to reference sub-level for question difficulty calibration
- [ ] After each quiz session, update the sub-level based on performance:
  - Strong performance (>80% accuracy) → increment sub-level by 1 (cap at 5)
  - Weak performance (<50% accuracy) → decrement sub-level by 1 (floor at 1)
  - Mid performance → sub-level unchanged

---

## Task 6 — Update Unit Generation AI Prompt

**Context:** The AI prompt used to generate units (previously concepts) must be updated to reflect the new definition of units as required prior knowledge and building blocks — not topics or lessons.

**Changes:**
- [ ] Find the AI prompt used for unit/concept generation in the codebase
- [ ] Replace with:
  > "Generate the fundamental units of knowledge a person must understand to fully learn [topic] at [difficulty] level. Think of these as required prior knowledge or prerequisite building blocks, not chapters or lessons. Each unit should be a discrete, learnable piece of knowledge. List them in logical progression order from most foundational to most advanced. Return as a JSON array of objects with fields: `name` (string), `description` (one sentence), `order` (number)."
- [ ] Ensure the returned `order` field is stored and used to display units in progression order on the Topic Page

---

*Reference `memora-context.md` for all product decisions before and during implementation. Do not add features not defined there.*