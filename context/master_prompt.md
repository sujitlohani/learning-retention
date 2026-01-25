# Master Context Document — Student Learning Platform (MVP)

**For:** Antigravity (Implementation Agent)  
**Purpose:** High-level system alignment and architectural intent  
**Read Time:** ~8 minutes

---

## The Core Idea

Students forget what they learn because **passive consumption doesn't create durable memory**.

**Hypothesis:**  
If students self-assess → actively retrieve through quizzes → reinforce via spaced repetition, retention improves.

**MVP Goal:**  
Validate this learning loop with students only. Teachers come later.

---

## What Exists (In Scope)

### The Student Journey
1. **Learn** — Enter a topic, assess knowledge, get quizzed
2. **Track** — See progress across topics, memory scores, points
3. **Review** — Access detailed learning history, revisit weak concepts
4. **Reinforce** — Spaced repetition reminds them to quiz again

### The Four Pages

**Home (`/`)**  
Primary interaction surface. Think "ChatGPT for learning."
- Student enters topic they want to learn
- Self-rates confidence (simple scale)
- System presents concepts for that topic
- Student takes a quiz (MCQ + short answer)
- Immediate feedback: points, memory score, what to review
- Knowledge stored

**Cockpit (`/cockpit`)**  
High-level dashboard. Think "status panel, not archive."
- Shows all topics being learned
- Visual memory score per topic (green = retained, red = forgetting)
- Total quiz points and global learning score
- Upcoming spaced repetition tasks
- Click topic → navigate to Content Dump for details

**Content Dump (`/content-dump`)**  
Detailed knowledge archive. Think "chat history for learning."
- Lists all topics student has engaged with
- Drill down into any topic:
  - Full concept list
  - Per-concept retention indicators
  - Quiz history with responses
  - Feedback and explanations
- Can trigger re-quiz from here

**Classroom (`/classroom`)**  
Placeholder only. Future teacher functionality. Empty for now.

---

## System Modules (Conceptual)

### Topic Management
- Creates and stores topics
- Extracts/generates concepts for each topic
- Allows student to modify concept lists
- Tracks topic metadata and progress

### Quiz Engine
- Generates quizzes from topic concepts
- Mix of MCQ and short-answer questions
- Scores responses immediately
- Provides feedback

### Memory Scoring
- Calculates topic-level memory scores
- Determines strong vs weak concepts
- Schedules spaced repetition
- Computes global learning score

### Gamification (Lightweight)
- Awards points for quiz participation
- Displays learning/memory score prominently
- Simple progress indicators
- No leaderboards or complex rewards in MVP

---

## Knowledge Model (Conceptual Only)

Think: **Student → Topics → Concepts → Quiz History**

Each student has multiple topics.  
Each topic has:
- Concepts (system-generated or student-modified)
- Quiz attempts over time
- Derived memory score
- Retention signals (which concepts are strong/weak)

Data flows **one direction:**
- Home creates/updates knowledge
- Cockpit and Content Dump consume it

Don't define exact schemas. Antigravity decides storage details.

---

## Key Principles

### Frontend-First Architecture
- Built with **Next.js (App Router)**
- Backend is **abstracted** — start with mock data, design for real APIs later
- Server Components by default
- Client Components only for interactive elements (forms, quizzes)
- SSR for initial page loads

### Progressive Disclosure
- Home: Action (learn/quiz)
- Cockpit: Overview (metrics/status)
- Content Dump: Archive (detailed history)

Each page has a clear, single purpose.

### Replaceability Over Optimization
- Mock data is fine for MVP
- Scoring algorithms should be pluggable functions
- AI quiz generation is a future service call
- Don't build for scale — build to validate behavior

### Clarity Over Cleverness
- Simple code beats optimized code
- Obvious beats clever
- Readable beats compact

---

## Technical Stack

**Core:**
- Framework: Next.js (App Router)
- Language: TypeScript
- UI: shadcn/ui + Tailwind CSS
- Rendering: Server Components default, Client where needed

**Backend (MVP):**
- Mock data or simple JSON files
- Optional API routes under `/app/api` as stubs
- Structure responses as if from a real backend
- Easy to replace later

**Navigation:**
- Client-side routing (`next/link`)
- Fast transitions, no full reloads

---

## Suggested Folder Structure

```
app/
├─ layout.tsx
├─ page.tsx              # Home
├─ cockpit/
│  └─ page.tsx
├─ content-dump/
│  └─ page.tsx
├─ classroom/
│  └─ page.tsx           # Placeholder
├─ api/                  # Optional stubs
components/
├─ ui/                   # shadcn components
├─ topic/
├─ quiz/
└─ dashboard/
lib/
├─ mock-data.ts
├─ scoring.ts
└─ utils.ts
types/
└─ index.ts
styles/
└─ globals.css
```

This is guidance, not gospel. Adjust as needed.

---

## Design Philosophy

### Visual Tone
- Calm, focused, minimal
- Soft gradients for primary actions
- Green = retained, red = forgetting (universal)
- Neutral backgrounds, clean typography
- No visual noise or over-gamification

### Component Approach
- Use shadcn/ui as foundation
- Consistent spacing (Tailwind scale)
- Cards for contained content
- Progress indicators: linear and circular
- Buttons: clear hierarchy (primary, secondary, danger)

### User Experience
- One primary action per screen
- Immediate feedback on quiz submission
- Clear "where am I" indicators
- Natural language throughout

---

## What You Should Build

### MVP Deliverables
1. Working Home page with topic entry and quiz flow
2. Cockpit showing topic cards and metrics
3. Content Dump with topic detail view
4. Classroom placeholder
5. Mock data representing realistic learning scenarios
6. Basic scoring functions (simple is fine)
7. Type definitions for core entities
8. Reusable UI components (forms, cards, quiz interface)

### What You Should NOT Build
- Real authentication (assume single user)
- Actual database (mock data is fine)
- Teacher features (beyond conceptual support)
- Complex analytics
- Social features
- Third-party integrations
- Production optimization

---

## Open Design Decisions

Antigravity has freedom to decide:

**Scoring formulas:**  
How exactly is memory score calculated? Keep it simple and transparent. Weighted recent attempts? Exponential decay? Your call.

**Quiz generation:**  
Hardcoded questions for topics? Random selection? Template-based? AI later? Start simple.

**Spaced repetition intervals:**  
What's the formula? (e.g., score >80 → 7 days, score 60-80 → 3 days). Use common sense defaults.

**Concept extraction:**  
Manual list in mock data? Simple keyword extraction? Full NLP later? Start with hardcoded concepts per topic.

**UI micro-interactions:**  
How do cards animate? What's the loading state? Transitions? Make it feel good, but don't overthink.

---

## The Learning Loop (High-Level Flow)

### New Topic Flow
1. Student enters topic on Home
2. Rates confidence (1-5 scale)
3. System shows concept list for topic
4. Student confirms or modifies concepts
5. Quiz generated (mix MCQ + short answer)
6. Student completes quiz
7. Scored immediately, feedback shown
8. Points awarded, memory score calculated
9. Topic saved to knowledge base
10. Appears in Cockpit and Content Dump

### Spaced Repetition Flow
1. Cockpit shows "due for review" reminder
2. Student clicks reminder
3. Navigates to Home with pre-loaded topic
4. Takes new quiz on same topic
5. Score updates based on performance
6. Next review date calculated
7. Longer interval if strong, shorter if weak

### History Review Flow
1. Student navigates to Content Dump
2. Selects topic from list
3. Views concept breakdown and quiz history
4. Identifies weak concepts (red indicators)
5. Clicks "quiz again" → back to Home

---

## Non-Functional Expectations

**Performance:**  
Good enough. Don't optimize prematurely.

**Accessibility:**  
Semantic HTML, keyboard nav, ARIA labels where appropriate.

**Responsiveness:**  
Mobile-first. Works on phone, tablet, desktop.

**Maintainability:**  
Readable code > clever code. TypeScript everywhere.

---

## Explicitly Out of Scope

Do NOT design or implement:
- User authentication
- Real database
- Teacher dashboard (beyond placeholder)
- Advanced analytics or exports
- AI tutor conversations
- Social/sharing features
- Email notifications
- Payment or subscriptions

These features wait until **after behavior validation**.

---

## Success Criteria (Post-Launch)

After MVP, measure:
- Do students return voluntarily?
- Do memory scores improve over time?
- Do students identify weak concepts accurately?
- Does spaced repetition actually help?

If yes → expand to teachers.  
If no → iterate on core loop.

---

## Your Role (Antigravity)

**You decide:**
- Exact implementations
- API contracts
- Scoring formulas
- UI details
- Component structure
- State management approach
- Error handling
- Edge cases

**You follow:**
- System intent (the learning loop)
- Module boundaries (topic, quiz, scoring, gamification)
- Page purposes (Home = action, Cockpit = overview, Content Dump = archive)
- Design tone (calm, focused, minimal)
- Technical stack (Next.js, TypeScript, shadcn/ui)

**You avoid:**
- Over-engineering
- Premature optimization
- Scope creep beyond MVP
- Building out-of-scope features

---

## Final Guidance

This is an MVP to **validate a behavioral hypothesis**, not to build a perfect product.

**Optimize for:**
- Speed of iteration
- Clarity of code
- Ease of replacement (mock → real)
- Learning from user behavior

**Don't optimize for:**
- Scale
- Edge cases
- Production hardening
- Feature completeness

Build something students can use **this week** to test if the learning loop works.

Everything else comes later.

---

## Questions? Ambiguity?

If something is unclear:
1. Use common sense
2. Choose the simpler path
3. Make it work, then make it better
4. Document your decisions in code comments

This document guides, it doesn't constrain.

---

**End of Master Context Document**

You now have the system intent, boundaries, and architectural direction.

Go build.