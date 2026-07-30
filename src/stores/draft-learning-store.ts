import { create } from "zustand";
import { db, DRAFT_LEARNING_ID } from "@/lib/db";
import { quietDbWrite } from "@/lib/db/safe";
import {
  CONSTRUCTION_STEPS,
  CONSTRUCTION_STEP_MAP,
  type ConstructionStepId,
} from "@/features/drafts/data/construction-steps";
import {
  DEFAULT_DRAFTING_INPUTS,
  SAMPLE_BODY,
  type BodyMeasurements,
  type DraftingInputs,
} from "@/features/drafts/data/formulas";
import {
  generateRandomBody,
  generateRandomInputs,
  getCorrectAnswers,
  scoreGuesses,
  type PracticeAnswers,
  type PracticeGuesses,
} from "@/features/drafts/lib/practice";
import {
  recordActivity,
  recordPracticeAttempt,
} from "@/features/learning/lib/ecosystem";
import { useMasteryStore } from "@/stores/mastery-store";
import { useUnitStore } from "@/stores/unit-store";

export type DraftLearningMode = "lesson" | "modules" | "practice" | "engine";

type DraftLearningState = {
  hydrated: boolean;
  mode: DraftLearningMode;
  stepIndex: number;
  completedSteps: ConstructionStepId[];
  lessonMaxStep: number;
  /** Lesson demo body (fixed sample). */
  lessonBody: BodyMeasurements;
  lessonInputs: DraftingInputs;
  /** Practice session. */
  practiceBody: BodyMeasurements;
  practiceInputs: DraftingInputs;
  practiceGuesses: PracticeGuesses;
  practiceAnswers: PracticeAnswers | null;
  practiceChecked: boolean;
  practiceFieldResults: Partial<Record<string, boolean>>;
  practiceAttempts: number;
  practiceCompletions: number;
  practiceBestScore: number;
  lastScore: number | null;
  hydrate: () => Promise<void>;
  setMode: (mode: DraftLearningMode) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  markStepComplete: (id: ConstructionStepId) => void;
  newPracticeRound: () => void;
  setPracticeGuess: (field: string, value: string) => void;
  checkPractice: () => void;
  revealPractice: () => void;
};

async function persist(partial: {
  completedSteps?: ConstructionStepId[];
  lessonMaxStep?: number;
  practiceAttempts?: number;
  practiceCompletions?: number;
  practiceBestScore?: number;
  lastScore?: number | null;
}) {
  quietDbWrite(async () => {
    const existing = await db.draftLearning.get(DRAFT_LEARNING_ID);
    await db.draftLearning.put({
      id: DRAFT_LEARNING_ID,
      completedSteps: partial.completedSteps ?? existing?.completedSteps ?? [],
      lessonMaxStep: partial.lessonMaxStep ?? existing?.lessonMaxStep ?? 0,
      practiceAttempts:
        partial.practiceAttempts ?? existing?.practiceAttempts ?? 0,
      practiceCompletions:
        partial.practiceCompletions ?? existing?.practiceCompletions ?? 0,
      practiceBestScore:
        partial.practiceBestScore ?? existing?.practiceBestScore ?? 0,
      lastScore:
        partial.lastScore !== undefined
          ? partial.lastScore
          : (existing?.lastScore ?? null),
      updatedAt: new Date(),
    });
  });
}

export const useDraftLearningStore = create<DraftLearningState>((set, get) => ({
  hydrated: false,
  mode: "lesson",
  stepIndex: 0,
  completedSteps: [],
  lessonMaxStep: 0,
  lessonBody: SAMPLE_BODY,
  lessonInputs: DEFAULT_DRAFTING_INPUTS,
  practiceBody: SAMPLE_BODY,
  practiceInputs: DEFAULT_DRAFTING_INPUTS,
  practiceGuesses: {},
  practiceAnswers: null,
  practiceChecked: false,
  practiceFieldResults: {},
  practiceAttempts: 0,
  practiceCompletions: 0,
  practiceBestScore: 0,
  lastScore: null,

  hydrate: async () => {
    if (get().hydrated) return;
    try {
      const record = await db.draftLearning.get(DRAFT_LEARNING_ID);
      const body = generateRandomBody();
      const inputs = generateRandomInputs();
      set({
        hydrated: true,
        completedSteps: (record?.completedSteps ?? []) as ConstructionStepId[],
        lessonMaxStep: record?.lessonMaxStep ?? 0,
        stepIndex: Math.min(record?.lessonMaxStep ?? 0, CONSTRUCTION_STEPS.length - 1),
        practiceAttempts: record?.practiceAttempts ?? 0,
        practiceCompletions: record?.practiceCompletions ?? 0,
        practiceBestScore: record?.practiceBestScore ?? 0,
        lastScore: record?.lastScore ?? null,
        practiceBody: body,
        practiceInputs: inputs,
        practiceGuesses: {},
        practiceAnswers: null,
        practiceChecked: false,
        practiceFieldResults: {},
      });
    } catch {
      set({ hydrated: true });
    }
  },

  setMode: (mode) => set({ mode }),

  nextStep: () => {
    const { stepIndex, lessonMaxStep, completedSteps } = get();
    if (stepIndex >= CONSTRUCTION_STEPS.length - 1) return;
    const next = stepIndex + 1;
    const stepId = CONSTRUCTION_STEPS[stepIndex].id;
    const completed = completedSteps.includes(stepId)
      ? completedSteps
      : [...completedSteps, stepId];
    const maxStep = Math.max(lessonMaxStep, next);
    set({ stepIndex: next, completedSteps: completed, lessonMaxStep: maxStep });
    void persist({ completedSteps: completed, lessonMaxStep: maxStep });
  },

  prevStep: () => {
    const { stepIndex } = get();
    if (stepIndex <= 0) return;
    set({ stepIndex: stepIndex - 1 });
  },

  goToStep: (index) => {
    if (index < 0 || index >= CONSTRUCTION_STEPS.length) return;
    const { lessonMaxStep } = get();
    const maxStep = Math.max(lessonMaxStep, index);
    set({ stepIndex: index, lessonMaxStep: maxStep });
    void persist({ lessonMaxStep: maxStep });
  },

  markStepComplete: (id) => {
    const { completedSteps, lessonMaxStep } = get();
    if (completedSteps.includes(id)) return;
    const next = [...completedSteps, id];
    set({ completedSteps: next });
    void persist({ completedSteps: next, lessonMaxStep });
    const label = CONSTRUCTION_STEP_MAP[id]?.label ?? id;
    void recordActivity({
      type:
        next.length >= CONSTRUCTION_STEPS.length
          ? "lesson_complete"
          : "lesson_step",
      title:
        next.length >= CONSTRUCTION_STEPS.length
          ? "Construction block complete"
          : `Completed ${label}`,
      detail: "Draft Learning construction step finished.",
      refId: id,
      xp: next.length >= CONSTRUCTION_STEPS.length ? 40 : 12,
    });
  },

  newPracticeRound: () => {
    const body = generateRandomBody();
    const inputs = generateRandomInputs();
    set({
      practiceBody: body,
      practiceInputs: inputs,
      practiceGuesses: {},
      practiceAnswers: null,
      practiceChecked: false,
      practiceFieldResults: {},
    });
  },

  setPracticeGuess: (field, value) => {
    set((state) => ({
      practiceGuesses: { ...state.practiceGuesses, [field]: value },
      practiceChecked: false,
    }));
  },

  checkPractice: () => {
    const {
      practiceBody,
      practiceInputs,
      practiceGuesses,
      practiceAttempts,
      practiceCompletions,
      practiceBestScore,
    } = get();
    const answers = getCorrectAnswers(practiceBody, practiceInputs);
    const unit = useUnitStore.getState().unit;
    const { correct, total, fieldResults } = scoreGuesses(
      practiceGuesses,
      answers,
      unit,
    );
    const attempts = practiceAttempts + 1;
    const perfect = correct === total;
    const completions = perfect ? practiceCompletions + 1 : practiceCompletions;
    const best = Math.max(practiceBestScore, correct);

    // Mark all construction steps complete when practice is mastered once
    let completedSteps = get().completedSteps;
    if (perfect && completedSteps.length < CONSTRUCTION_STEPS.length) {
      completedSteps = CONSTRUCTION_STEPS.map((s) => s.id);
    }

    set({
      practiceAnswers: answers,
      practiceChecked: true,
      practiceFieldResults: fieldResults,
      practiceAttempts: attempts,
      practiceCompletions: completions,
      practiceBestScore: best,
      lastScore: correct,
      completedSteps,
    });

    void persist({
      practiceAttempts: attempts,
      practiceCompletions: completions,
      practiceBestScore: best,
      lastScore: correct,
      completedSteps,
      lessonMaxStep: get().lessonMaxStep,
    });

    void recordPracticeAttempt({ score: correct, total }).then(() => {
      void useMasteryStore.getState().awardModuleComplete({
        title: perfect ? "Perfect practice draft" : "Practice draft complete",
        detail: perfect
          ? "Every formula landed — +50 Tailor Points earned."
          : `Scored ${correct}/${total}. +50 Tailor Points for finishing the round.`,
        refId: "practice-draft",
        xp: 50,
      });
    });
  },

  revealPractice: () => {
    const { practiceBody, practiceInputs } = get();
    const answers = getCorrectAnswers(practiceBody, practiceInputs);
    set({
      practiceAnswers: answers,
      practiceChecked: true,
      practiceFieldResults: Object.fromEntries(
        Object.keys(answers).map((key) => [key, false]),
      ),
    });
  },
}));
