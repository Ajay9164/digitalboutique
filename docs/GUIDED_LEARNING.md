# Guided Learning Mode (Tailor Academy)

Structured 8-stage journey that teaches tailoring from beginner to advanced while still allowing optional free exploration.

## Entry points

| Route | Purpose |
|-------|---------|
| `/` | Learning Journey dashboard |
| `/journey` | Same dashboard (deep link) |
| `/journey/[stageId]` | Stage lesson list |
| `/journey/[stageId]/[lessonId]` | Lesson player |
| `/progress` | XP / streaks / charts hub |

## Stages

1. Introduction to Tailoring  
2. Learn Body Measurements  
3. Practice Measurements  
4. Learn Measurement Marking  
5. Practice Drafting  
6. Learn Fabric Placement  
7. Practice Fabric Alignment  
8. Complete Project → Journal  

## Dashboard widgets

Current lesson · Progress % · Completed lessons · Next recommended · Practice score · Recent activities · Achievement badges · ETA · Continue Learning

## Modes

- **Beginner / Intermediate / Advanced** — adjusts practice depth (hints, targets)
- **Free explore** — unlocks all stages without sequence locks
- **Voice** — speechSynthesis narration architecture (opt-in per lesson)

## Persistence

Dexie schema **v8**:

- `journeyProgress` — mode, current/resume lesson, free explore, narration
- `journeyLessons` — per-lesson status, sections, scores, attempts

Completing a lesson also writes XP into the existing learning ecosystem (`recordActivity`).

## Lesson structure

Every lesson explains What · Why · How · Common mistakes · Professional tips · Practice · Completion status.
