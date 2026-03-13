# Memora Scheduling — Playbook

This document explains how the scheduling and scoring system works conceptually. It is a reference for understanding what's happening and why. For implementation instructions, see `scheduling-implementation.md`.

---

## The Core Loop

Every time a user completes a quiz, three things happen:
1. Unit scores update
2. Topic score recalculates
3. The system checks thresholds and decides what to show on Home

The daily quiz is what keeps this loop running automatically. Everything else (unit tests, topic challenges) is user-initiated on top.

---

## How Unit Score Is Calculated

A unit's score reflects how well the user knows that specific piece of knowledge. It's not just the last quiz — it's a weighted rolling average.

```
Unit Score = (Unit Test avg × 0.7) + (Daily Quiz unit contributions avg × 0.3)

Rolling window: last 5 sessions involving this unit
```

Unit Tests carry more weight (70%) because they're focused — 10 questions on one unit. Daily Quiz contributions carry less (30%) because the context is mixed and rushed. If no Unit Test exists yet, the daily quiz average stands alone at 100% weight.

**Where it's stored:** `topic.units[n].status` currently holds `'weak' | 'strong' | 'neutral'`. The score itself needs to be derived from quiz history — `quizHistoryService.getAttemptsByTopicId()` → `unitBreakdown[unitId].score` averaged across sessions.

---

## How Topic Score Is Calculated

Topic score has two inputs: the Topic Challenge (the most reliable signal) and the average of all unit scores (the ongoing signal).

```
IF Topic Challenge taken within last 30 days:
  Topic Score = (Challenge score × 0.6) + (Avg unit score × 0.4)

IF Topic Challenge is older than 30 days OR never taken:
  Topic Score = (Old challenge score × 0.4) + (Avg unit score × 0.6)
  — unit scores carry more weight as the challenge gets stale
```

**Why the decay:** A Topic Challenge taken once months ago shouldn't permanently define a topic score. The decay creates a natural pull — users will notice their topic score drifting downward and be prompted to retake the challenge. This is intentional.

**Where it's stored:** `topic.memoryScore` (which we now call Topic Score in the UI). Currently it's a simple running average — this needs to be replaced with the weighted formula above.

---

## How Overall Mastery Is Calculated

Shown on the Home page and in analytics. Simple weighted average:

```
Overall Mastery = Sum(Topic Score × unit count) / Sum(all unit counts)
```

A topic with 10 units contributes more to overall mastery than a topic with 3 units. This makes it a meaningful signal — a small shallow topic can't inflate your overall score.

---

## Daily Quiz — What It Is and Why

The daily quiz is the system's proactive layer. It runs once per day and covers the topic that needs the most attention that day. The user doesn't choose — the system decides.

**Composition (20 questions total):**
```
14  Unit questions     → from today's primary topic, weighted to weakest units
 5  Review questions   → wrong answers from any topic in the last 7 days
 1  Synthesis question → cross-unit applied reasoning from primary topic
```

The synthesis question is the hardest — it requires combining knowledge across multiple units. It's generated fresh each time with a specific AI prompt.

Review questions are pulled from `QuizAttempt.questions` where `isCorrect === false` within the last 7 days across all topics. If fewer than 5 wrong answers exist, the gap is filled with more unit questions.

---

## How the Primary Topic Is Selected Each Day

Every topic gets a priority score:

```
Priority = (1 - topicScore/100) × 0.4
         + daysSinceLastPracticed × 0.35
         + (hasWeakUnits ? 0.25 : 0)
```

The topic with the highest priority score becomes today's primary topic. This means:
- A topic at 40% mastery that you haven't touched in 5 days will almost always win
- A topic at 80% mastery practiced yesterday will have low priority
- No fixed rotation — the algorithm decides based on need
- Some days one topic dominates the daily quiz; other days it's more even

**Where this runs:** On the Home page when the user taps "Start Daily Quiz", the builder runs this calculation and constructs the quiz on the fly. Nothing is pre-scheduled or stored overnight.

---

## Threshold System — What Triggers Recommendations

After every quiz completion, the system checks these thresholds:

```
Unit level:
  Score < 60%          → unit flagged as 'weak', added to review pool
  Score drops 10%+     → surface ⚠ on Home immediately

Topic level:
  Score < 65%          → recommend Topic Challenge
  Challenge > 30 days  → nudge to retake
  Score > 75%          → surface "Ready for Challenge" prompt
```

Recommendations appear as cards on the Home page in priority order:
1. ⚠ "[Unit] has dropped — review now" → starts Weak Area Quiz directly
2. 🎯 "[Topic] is ready for a Challenge" → opens Topic Challenge
3. 🔁 "[Topic] hasn't been challenged in 14 days" → nudge

Cards are dismissable per session but reappear next visit if still valid.

---

## Weak Area Quiz — Trigger and Composition

The trigger is the Home page recommendation card. User taps "Review Now" → Weak Area Quiz starts. No other entry point needed.

```
Composition: 10 questions
Source:      Units currently flagged weak (score < 60%)
             Pull from wrong answers first, then generate fresh
Weighting:   Same as Unit Test (full weight on unit score)
```

If multiple units are weak, questions are distributed proportionally across them.

---

## Quiz Type Summary

| Type | Who triggers | Questions | Affects |
|---|---|---|---|
| Daily Quiz | System (Home) | 20 (14 unit + 5 review + 1 synthesis) | Unit score (30% weight) + topic score (40% weight) |
| Unit Test | User (Topic Page → Units tab) | 10 | Unit score (70% weight) |
| Topic Challenge | User (Topic Page header) | 20 | Topic score (60% weight) |
| Weak Area Quiz | System recommendation (Home) | 10 | Unit score (70% weight) |
| Onboarding Quiz | Auto after onboarding | 10–15 | Sets initial baselines |

---

## What's Not Being Built

- User-configured schedules (which days, times) — unnecessary friction
- Streak penalties — streaks are informational, not punishing
- Locked content — everything accessible anytime
- Push notifications — out of scope