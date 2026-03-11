# Memora — Data Flow Playbook
> Reference for understanding where data lives, how it moves, and what needs refinement. No database exists — all persistence is localStorage via service abstractions.

---

## 1. Storage Architecture Overview

```
Browser localStorage
├── 'learning-retention-mvp-data'     → topics + units
├── 'learning_loop_quiz_history'      → all quiz attempts
└── 'learning-retention-questions'    → AI-generated questions cache
```

All reads/writes go through service files. UI never touches localStorage directly.

```
UI Component / Hook
      ↓
  Service Layer
      ↓
  localStorage
```

When a real database is added, only the service layer changes. UI stays untouched.

---

## 2. Service Layer Map

| Service File | localStorage Key | Responsibility |
|---|---|---|
| `topics.service.ts` | `learning-retention-mvp-data` | CRUD for topics and their units, updating scores after quiz |
| `quiz-history.service.ts` | `learning_loop_quiz_history` | Save and read quiz attempts |
| `questions.service.ts` | `learning-retention-questions` | Cache AI-generated questions, filter by topic/unit |
| `useQuizSession.ts` | (no own key — orchestrator) | Runs quiz state, calls all three services on completion |

---

## 3. Data Shapes (Current)

### Topic (stored inside `learning-retention-mvp-data`)
```typescript
{
  id: string                          // UUID
  name: string                        // e.g. "Binary Trees"
  level: 'beginner' | 'intermediate' | 'expert'
  subLevel?: number                   // 1–5, calibrated sub-level within difficulty band
  memoryScore: number                 // 0–100, weighted average of historical quiz scores
  lastPracticed: Date                 // stored as ISO string, parsed on read
  nextReviewDate: Date                // computed spaced repetition date
  totalAttempts: number               // running count of all quizzes taken for this topic
  units: Unit[]
}
```

### Unit (nested inside Topic)
```typescript
{
  id: string
  text: string                        // unit name/label — NOTE: should be renamed 'name'
  status: 'neutral' | 'weak' | 'strong'
  familiar: boolean                   // set during onboarding familiarity check
  // MISSING: description, order, accuracy, attempts — these need to be added
}
```

### QuizAttempt (stored inside `learning_loop_quiz_history`)
```typescript
{
  id: string                          // 'attempt-{timestamp}'
  topicId: string
  sessionId?: string
  type: 'unit' | 'topic'             // NOTE: quiz types are expanding — see refinements
  targetUnitId?: string               // only present for unit quizzes
  score: number                       // 0–100
  correctCount: number
  totalCount: number
  completedAt: string                 // ISO date string
  durationSeconds: number
  questions: QuestionResult[]
  unitBreakdown: UnitBreakdown[]
}
```

### QuestionResult (nested inside QuizAttempt)
```typescript
{
  questionId: string
  unitId: string
  unitName?: string
  questionText: string
  explanation?: string
  isCorrect: boolean
  userAnswer: string
  correctAnswer: string
}
```

### UnitBreakdown (nested inside QuizAttempt)
```typescript
{
  unitId: string
  unitName?: string
  totalCount: number
  correctCount: number
  score: number                       // 0–100 for this unit in this attempt
}
```

### AIGeneratedQuestion (stored inside `learning-retention-questions`)
```typescript
{
  id: string
  topicId: string
  unitId: string
  unitName?: string
  difficulty: 'beginner' | 'intermediate' | 'expert'
  type: 'short-answer' | 'mcq' | 'card'
  question: string
  correctAnswer: string
  options?: string[]                  // MCQ only
  explanation?: string
  keywords?: string[]                 // short-answer grading
  acceptableAnswers?: string[]        // short-answer grading
}
```

---

## 4. Data Flow: Adding a Topic (Onboarding)

```
User inputs topic name + difficulty
        ↓
AI generates units (HuggingFace)
        ↓
[NEW] Familiarity check — user checks known statements
        ↓
subLevel 1–5 computed from checked count
        ↓
[NEW] Onboarding quiz triggers (useQuizSession)
        ↓
Quiz completes → topicsService.updateTopicAfterQuiz()
        ↓
Topic written to localStorage with:
  memoryScore, nextReviewDate, unit statuses, subLevel
```

---

## 5. Data Flow: Taking a Quiz

```
User clicks Start (unit or topic)
        ↓
useQuizSession initializes:
  - loads questions from questionsService (by topicId + unitId)
  - if no questions cached → calls AI API → saves to questionsService
        ↓
User answers each question
        ↓
useQuizSession tracks: correctCount, userAnswers, duration
        ↓
Quiz ends → useQuizSession calls:
  1. quizHistoryService.saveAttempt(QuizAttempt)
  2. topicsService.updateTopicAfterQuiz(topicId, score, unitBreakdown)
        ↓
topicsService updates:
  - topic.memoryScore (weighted average)
  - topic.lastPracticed
  - topic.nextReviewDate (spaced repetition)
  - topic.totalAttempts
  - unit.status per unit ('weak' if score < 50, 'strong' if > 75)
  - topic.subLevel (increment/decrement based on performance)
```

---

## 6. Data Flow: Dice Button (Regenerate Questions)

```
User clicks Dice on a unit or topic
        ↓
questionsService.clearQuestionsForUnit(unitId) or clearForTopic(topicId)
        ↓
AI API called for new questions
        ↓
questionsService.saveQuestions(newQuestions)
        ↓
Start button gets NEW tag state
        ↓
User clicks Start → useQuizSession loads fresh questions
```

---

## 7. Computed Values (Derived at Read Time — Not Stored)

These values are not in localStorage. They must be computed from raw data whenever needed:

| Value | How to Compute | Source |
|---|---|---|
| Unit accuracy % | Filter `QuizAttempt[].unitBreakdown` by `unitId`, average `score` | `quiz-history.service.ts` |
| Unit attempts count | Count `QuizAttempt[]` where `unitBreakdown` contains `unitId` | `quiz-history.service.ts` |
| Unit last practiced | Max `completedAt` across `QuizAttempt[]` where unit appears | `quiz-history.service.ts` |
| Accuracy over time | Map `QuizAttempt[]` sorted by `completedAt` to `{date, score}` | `quiz-history.service.ts` |
| Performance by topic | Map `Topic[]` to `{topicName, memoryScore}` | `topics.service.ts` |
| Practice distribution | Group `QuizAttempt[]` by `unitId`, count per unit | `quiz-history.service.ts` |
| Streak | Count consecutive days with at least one attempt going back from today | `quiz-history.service.ts` |
| Activity heatmap | Group `QuizAttempt[]` by `date(completedAt)`, count per day | `quiz-history.service.ts` |

---

## 8. Schema Refinements Needed

### High Priority (blocking UI work)

**Unit.text → Unit.name**
Currently units store their label as `text`. This should be `name` for consistency. Requires migration on read — `topicsService.getTopics()` should map `text → name` transparently until renamed in storage.

**Unit is missing accuracy, attempts, lastPracticed**
These are needed on every Unit card. They are computed values (see Section 7) but they need a helper in `quiz-history.service.ts`:
```typescript
getUnitStats(unitId: string): {
  accuracy: number
  attempts: number
  lastPracticed: string | null
}
```

**QuizAttempt.type needs expanding**
Currently `'unit' | 'topic'`. New quiz types are:
```typescript
type: 'onboarding' | 'daily' | 'topic-challenge' | 'unit-test' | 'weak-area'
```
Old values `'unit'` and `'topic'` map to `'unit-test'` and `'topic-challenge'`. Add a migration shim in `quizHistoryService.getAllAttempts()` that normalises old values on read.

### Medium Priority (needed for analytics pages)

**Add `quizType` label to QuizAttempt for display**
The Review page needs to show human-readable quiz type names. Add a utility:
```typescript
getQuizTypeLabel(type: string): string
// 'unit-test' → 'Unit Test'
// 'topic-challenge' → 'Topic Challenge'
// 'daily' → 'Daily Quiz'
// 'onboarding' → 'Onboarding'
```

**Topic.memoryScore rename to Topic.masteryScore**
`memoryScore` is the stored field but the UI everywhere should now call this **Topic Mastery**. Rename in type definition and all references. Storage key value can stay the same for backward compat — just rename the TypeScript field.

### Low Priority (future cleanup)

**Unit.description and Unit.order**
Needed when Task 6 (unit generation prompt update) ships. Add to Unit type:
```typescript
description?: string    // one-sentence AI-generated description
order?: number          // display order, ascending from most foundational
```

**Topic.knowledgeGaps**
Needed when Task 4 (familiarity check) ships:
```typescript
knowledgeGaps?: string[]   // unchecked familiarity statements from onboarding
```

**StudyPlan on Topic**
Currently populated by schedule generation (removed in TODO Task 3). Leave the type in place, stop populating it. Remove entirely in a future cleanup pass.

---

## 9. Migration Readiness Checklist

When a real database is introduced, these are the only files that need updating:

- [ ] `topics.service.ts` — replace localStorage read/write with API calls
- [ ] `quiz-history.service.ts` — replace localStorage read/write with API calls
- [ ] `questions.service.ts` — replace localStorage read/write with API calls

UI components, hooks, and pages do NOT need changes if they respect the service abstraction.

---

## 10. Known Risks

| Risk | Impact | Mitigation |
|---|---|---|
| localStorage cleared by user | All data lost permanently | Warn user, offer export in future |
| localStorage full (~5MB) | Writes silently fail | Large question caches are the main risk — add size check in `questions.service.ts` |
| Old `type: 'unit' \| 'topic'` in stored attempts | Review page filter breaks | Add normalisation shim on read (see Section 8) |
| `text` vs `name` on Unit | Unit cards crash if referencing wrong field | Add transparent migration shim in `topicsService.getTopics()` |
| Concurrent tab writes | Last write wins, data loss possible | Acceptable for MVP, note for database migration |