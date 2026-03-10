# Memora — Product Context Document
> Source of truth for product direction, architecture, and page roles. Reference this in every implementation task.

---

## 1. Core Philosophy

Memora is an **AI-powered memory reinforcement tool**, not a learning platform.

The product promise:
```
Learn anywhere. Capture instantly. Remember longer.
```

The core loop:
```
Learn → Capture → Reinforce
```

Memora does not teach. It does not generate courses, guided paths, or curriculum. It takes what a user already learned elsewhere and helps them retain it through intelligent, adaptive quizzing.

---

## 2. Terminology

| Old Term | New Term | Definition |
|----------|----------|------------|
| Concept  | **Unit**  | A discrete, required building block of knowledge needed to understand a topic |
| Topic    | **Topic** | A high-level subject the user wants to learn (unchanged) |

### What is a Unit?
A unit is not a chapter or a lesson. It is a **prerequisite building block** — a specific piece of knowledge that must be understood to fully grasp the parent topic. Units are ordered, foundational, and purposeful.

Example:
```
Topic: Binary Trees
  └── Unit: What is a node?
  └── Unit: Parent-child relationships
  └── Unit: Binary vs general trees
  └── Unit: Traversal algorithms
  └── Unit: Time complexity of operations
```

Units are **AI-generated** as required building blocks, not chosen by the user. Users may add custom units. Units can belong to multiple topics (many-to-many).

### AI Prompt Instruction for Unit Generation
> "Generate the fundamental units of knowledge a person must understand to fully learn [topic]. Think of these as required prior knowledge or prerequisite building blocks, not chapters or lessons. List them in logical progression order from foundational to advanced."

---

## 3. Onboarding Flow (Per Topic)

When a user adds a new topic, the following steps run in sequence:

### Step 1 — Topic Input
User types the topic they want to learn.
Example: *"Binary Trees"*

### Step 2 — Difficulty Selection
User selects their general experience level: **Beginner**, **Intermediate**, or **Expert**.
This is a broad starting signal, not a final classification.

### Step 3 — Unit Generation
AI generates required units for the topic based on selected difficulty level.
- Units are **displayed but not selectable** — all units are included
- User **may add custom units** if something is missing
- No checkboxes to skip units — all generated units are active

### Step 4 — Familiarity Check (Baseline Calibration)
Replaces the old "how long do you want to study" and "daily time commitment" pages — those pages are removed.

Purpose: Establish a precise baseline *within* the selected difficulty level (not just beginner/intermediate/expert, but a 1–5 sub-level).

Display: A checklist of knowledge statements AI generates per difficulty level.

Example for Beginner / Binary Trees:
```
"Which of these do you already understand?"
□ I know what a node is
□ I understand parent-child relationships in trees
□ I can explain what makes a tree 'binary'
□ I can implement a traversal algorithm from memory
```

User checks what they genuinely know. The system uses the number and pattern of checked items to assign a **sub-level score of 1–5** within their chosen difficulty band.

Sub-level mapping (within each difficulty):
```
0–1 checked  → sub-level 1 (complete beginner within band)
2   checked  → sub-level 2
3   checked  → sub-level 3
4   checked  → sub-level 4
All checked  → sub-level 5 (ready to move up)
```

This sub-level is stored and used by the AI quiz layer to calibrate question difficulty. It updates automatically over time based on quiz performance.

### AI Layer Instruction for Familiarity Check Generation
> "Given the topic [topic] and difficulty level [beginner/intermediate/expert], generate 4–5 knowledge statements a user at this level might or might not already know. Statements should range from very foundational to moderately advanced within this difficulty band. Format as short, clear first-person declarations."

### AI Layer Instruction for Quiz Generation Using Baseline
> "The user is at difficulty level [beginner/intermediate/expert], sub-level [1–5]. Generate questions calibrated to this precise level. Sub-level 1 = most foundational questions only. Sub-level 5 = push toward the edge of this difficulty band. As quiz performance improves, increase sub-level and adjust question difficulty accordingly. Never exceed the difficulty band unless sub-level reaches 5 and performance is consistently strong."

### Step 5 — Onboarding Quiz Triggers
See Quiz Types section.

---

## 4. Quiz Types

### 4.1 Onboarding Quiz
**Purpose:** Establish the user's true baseline for a new topic.
**Trigger:** Auto-triggered immediately after onboarding flow completes for a new topic.
**Behavior:**
- Questions drawn from all units of the topic
- Calibrated to the familiarity check sub-level
- Adaptive: correct answer → harder next question; wrong answer → easier next question
- Length: 10–15 questions
- Result: Sets initial mastery score per unit and overall topic baseline

**AI Instruction:**
> "Generate an onboarding quiz for [topic] at sub-level [1–5] within [difficulty band]. Questions should span all units. Use adaptive difficulty: if the user answers correctly, the next question should be harder; if wrong, easier. Goal is to locate the user's true knowledge level, not to teach. Mix question types: MCQ, true/false, applied reasoning."

---

### 4.2 Daily Quiz
**Purpose:** Keep all topics warm. Prevent forgetting through regular mixed practice.
**Trigger:** Auto-prompted each day from the Home page.
**Behavior:**
- Pulls questions from across all active topics
- Weighted toward units with lowest recent accuracy or longest time since last practiced
- Length: 5–10 questions
- Mixed topics — not topic-specific
- Streak tracked here

**AI Instruction:**
> "Select units across all of the user's active topics. Prioritize units with the lowest recent accuracy score or the longest time since last practiced. Generate one question per selected unit. Vary question types. Calibrate each question to the current sub-level of its unit."

---

### 4.3 Topic Challenge
**Purpose:** Stress-test full understanding of a topic.
**Trigger:** User manually starts from Topic Page.
**Behavior:**
- Questions from all units of the topic
- Length: 20 questions
- Estimated completion time shown before start
- Balanced distribution across all units
- Score updates topic-level mastery

**AI Instruction:**
> "Generate a 20-question topic challenge for [topic]. Distribute questions proportionally across all units. Include MCQ, true/false, application, and edge case questions. Weight harder questions toward units with higher existing mastery scores. Show no mercy on well-mastered units."

---

### 4.4 Unit Test
**Purpose:** Focused practice on a single unit.
**Trigger:** User clicks Start from unit card in Topic Page → Units tab.
**Behavior:**
- Questions only from the selected unit
- Length: 10 questions
- Dice button generates a fresh question set without retaking
- Start button shows NEW tag after dice is rolled
- Score updates unit-level mastery

**AI Instruction:**
> "Generate 10 questions strictly for the unit [unit name] within topic [topic]. Calibrate to the unit's current sub-level [1–5]. Vary difficulty across the set. Include conceptual, applied, and edge case questions. Do not repeat questions from the most recent session if history is available."

---

### 4.5 Weak Area Quiz
**Purpose:** Targeted practice on consistently underperforming units.
**Trigger:** TBD — to be defined in future planning session.
**Status:** Name and intent established. Implementation pending.

---

## 5. Page Roles

### Home
**Role:** Daily entry point and action hub.
**Contains:**
- Add new topic (primary CTA)
- Due Today — units and topics due for practice based on recency and score
- This Week — calendar view of practice activity
- Daily Quiz prompt
- Streak and light motivational layer
**Not:** A topic directory or stats dashboard.

---

### Cockpit
**Role:** Analytics and performance overview. Understand progress, not take action.
**Contains:**
- Overall quiz accuracy over time (line chart)
- Performance breakdown by topic (bar or radar chart)
- Recent quiz session history with scores
- Weak areas surfaced — units below performance threshold
- Streak and activity heatmap
**Not:** A place to start quizzes or browse topics.

---

### Knowledge Base
**Role:** Central library. Entry point to all topic pages.
**Contains:**
- Topic cards grid with quick score overview
- Click topic card → opens Topic Page
- Search and filter
**Not:** A unit browser. Units live inside topic pages.

---

### Topic Page
**Role:** Full view of a single topic — units, scores, and quiz entry points.
**Layout:**
- Top: Topic title, AI-generated definition, real-world usage context
- Middle: Unit cards with mastery score per unit
- Right sidebar: Radar or horizontal bar chart of all unit scores
- Tabs:
  - **Overview** — above layout
  - **Units** — flat list with score, last practiced, Start + Dice buttons per unit
- Topic Challenge button at top level
**Not:** A lesson page. No guided paths, no locked states, no explanations.

---

### Deep Dive (to be renamed: Review)
**Role:** Historical quiz log and insight engine. Look back and understand patterns.
**Contains:**
- Full quiz history filterable by Topic, Unit, Quiz Type, Date
- Each entry: quiz type, score, date, expandable correct/incorrect breakdown
- Retry weak questions from any past session
- AI-surfaced insights: error patterns, neglected units, accuracy trends
**Not:** A learning or content page.

---

## 6. Navigation Rules
- Left sidebar only — never a top navbar
- Top bar = utility strip (search, notifications, avatar)
- Sidebar pages: Home, Cockpit, Knowledge Base, Deep Dive (Review)
- Topic Page and Quiz pages are flow/detail pages — never in sidebar

---

## 7. Design System Reference
See `brand.md` for all tokens. Key references:
- Font: Plus Jakarta Sans
- Accent: `--accent` (`#514DD9` light / `#6860F0` dark)
- Radius: `--radius-md` (8px) for cards, inputs, buttons
- Motion: Fast = 120ms hover, Base = 150ms general, Answer = 200ms quiz feedback