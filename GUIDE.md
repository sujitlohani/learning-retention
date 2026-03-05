# Memora UI Refinement Guide

Welcome to the newly refined Memora application! This guide provides an overview of the structural and visual changes made during the UI overhaul, and explains the underlying codebase architecture to help you navigate and understand data flows.

## Codebase Architecture & Data Flow

Understanding the physical separation of concerns and data lifecycle in Memora will help you safely modify and add features.

### 1. Folder Structure Highlights
- `/app` — Contains all Next.js App Router pages and API routes (`/api/ai/*`). The UI is strictly mapped to these routes.
- `/src/components` — Shared, reusable UI parts (ThemeToggle, Sidebar, MemoraLogo) and Radix UI heavily stylized primitives (`/ui`).
- `/src/features` — **Core Business Logic (Feature-Sliced Design).** The codebase categorizes features explicitly (`auth`, `cockpit`, `dashboard`, `deepdive`, `knowledge`, `landing`, `quiz`, `topics`) separating their individual components, hooks, and services.
- `/src/lib` — Integrations and storage logic (e.g., AI HuggingFace client, prompts, parsers, format validators, utility math).
- `/src/types` — Typescript index for unified database models (Topic, Concept, QuizAttempt).

### 2. State & Data Flow
Currently, the application relies heavily on **Local Storage** acting as a pseudo-database separated into logic silos, abstracted by service functions.

* **Data Silos**: 
  - `topics.service.ts`: Handles the creation and management of topics and their nested concepts.
  - `schedules.service.ts`: Handles mathematical spaced-repetition logic (`getTodaysSessions`, `markSessionComplete`).
  - `quiz-history.service.ts`: Records raw historical scores and quiz attempts.
  - `questions.service.ts`: Manages the generated question banks.

* **Lifecycle Example (Adding a Topic)**:
  1. User navigates through `/add-topic` wizard.
  2. The Wizard generates concepts via the API route (`POST /api/ai/generate-concepts`).
  3. Upon final confirmation, another API call (`POST /api/ai/generate-schedule`) creates the learning plan.
  4. Finally, `topicsService.saveTopic()` saves the data locally, and the user is redirected to the Quiz/Learn page.

* **Lifecycle Example (Taking a Quiz)**:
  1. Navigating to `/learn/[topicId]` fetches questions from `questionsStorage`.
  2. User answers -> Green/Red validation appears immediately.
  3. Clicking "Next" evaluates progress.
  4. Completing the quiz fires `quizHistoryService.saveAttempt()` which stores performance data viewable on the Cockpit or Knowledge Base pages.

---

## Overview of UI Changes

The goal of this refinement was to align the frontend with a new premium, dark-mode-first aesthetic provided by Stitch design mocks, while leaving the core logic and backend integrations intact. 

### Page Architecture & Layout Updates
- **Global Layout:** The application layout now conditionally hides the sidebar on immersive routes such as `/login`, `/onboarding`, `/add-topic`, and `/learn/[topicId]/`, as well as on the root landing page (`/`).
- **Sidebar:** The navigation rail has been updated to feature a collapsible icon-only mode spanning out on hover. The "Classroom" link was removed, and "Deep Dive" was added. The custom `MemoraLogo` SVG is now used.
- **Landing Page (`/`):** A new marketing page (`src/features/landing/components/LandingPage.tsx`) was introduced. It features abstract graphics (glassmorphism/gradients), a dark premium aesthetic, a "How It Works" track, and a sleek feature grid.
- **Home Dashboard (`/dashboard`):** The main dashboard was rewritten to feature dynamic horizontal "Priority Review" cards showcasing the Topic Score prominently, alongside a "This Week" study list. 
- **Cockpit Page (`/cockpit`):** Transformed into a multi-column view. The left module contains the topic cards, while clicking a topic actively slides open a right-hand detail sheet (`Sheet` from Radix UI) containing Overview, History, and Insights tabs.
- **Knowledge Base (`/knowledge-base`):** Developed into a detailed multi-pane layout featuring a robust left filter column and a searchable concept grid. Selecting a concept opens a deep detail side panel to view specific weak points and historical data. Added a "Generate New Questions" option 🎲.
- **Quiz / Learn Focus Mode (`/learn/[topicId]`):** Designed as a full-screen, distraction-free environment. It features a top progress bar, dynamic color-shifting option buttons upon answer submission (green for correct, red for incorrect), an inline expansion "Why?" explanation section, and a sticky "Next Question" footer. 
- **Deep Dive Page (`/deep-dive`):** A newly added mock page designed for reading long-form concept insight articles. It aligns to the new design system perfectly.
- **Add Topic Wizard (`/add-topic`):** Updated with large typography, bold primary-color accent buttons, and an engaging spinning `MemoraMark` SVG animation that replaces generic loaders during the AI generation process.

### Terminology & Brand Updates
In addition to the visual overhaul, several key user-facing terms were updated:
- **"Flashcard" / "Cards"** $\rightarrow$ **"Concept" / "Concepts"**
- **"Memory Score"** $\rightarrow$ **"Topic Score"** (used predominantly in dashboard layouts)
- The raw text `Memora` logos across the site have been replaced with the inline scalable SVG components `<MemoraLogo />` and `<MemoraMark />`. The logo is a dynamic, abstract spark utilizing `blur_on` visual principles that inherits context colors via `currentColor`.

## How to Verify locally
1. **Run the Application locally:** 
   ```bash
   npm run dev
   ```
2. **Review Unauthenticated Experience:**
   - Log out (if logged in) and navigate to `http://localhost:3000/`. You should see the completely rewritten Landing Page with no sidebar.
   - Click "Get Started" or navigate to `/login` to view the updated sign-in UI featuring the new Memora svg logo.
3. **Review Authenticated Experience:**
   - Log in and arrive at the updated **Dashboard** view. Notice the Topic scores and new pill designs.
   - Navigate to the **Knowledge Base** (the `BookOpen` icon) to see the newly structured design + the new Generate questions button next to the standard Quiz button.
   - Navigate to **Deep Dive** (the `Brain` icon). Note the sidebar correctly expands these out.
