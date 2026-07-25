"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CheckCircle2,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { MEASUREMENTS } from "@/features/measurements/data/measurements";
import {
  generateRandomBody,
  generateRandomInputs,
  getCorrectAnswers,
  isAnswerCorrect,
  PRACTICE_FIELDS,
  type PracticeFieldId,
  type PracticeGuesses,
} from "@/features/drafts/lib/practice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Shared chrome                                                      */
/* ------------------------------------------------------------------ */

function SurfaceShell({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "glass-panel space-y-3 rounded-3xl p-4",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage 1 interactives                                               */
/* ------------------------------------------------------------------ */

const TOOLS = [
  { name: "Measuring tape", tip: "Soft centimetre tape — check it is not stretched." },
  { name: "L-square", tip: "Keeps block corners true." },
  { name: "French curve", tip: "Armholes and necklines." },
  { name: "Tracing wheel", tip: "Transfers marks through carbon." },
  { name: "Cloth shears", tip: "Never cut paper with these." },
  { name: "Chalk & pins", tip: "Temporary marks that brush away." },
];

export function ToolsGridSurface() {
  const [active, setActive] = useState(0);
  return (
    <SurfaceShell title="Interactive · Tools">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TOOLS.map((tool, index) => (
          <button
            key={tool.name}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "rounded-2xl border px-3 py-3 text-left text-xs font-semibold transition",
              active === index
                ? "border-primary bg-primary/10 text-primary"
                : "border-border/70 bg-background/50 hover:border-primary/40",
            )}
          >
            {tool.name}
          </button>
        ))}
      </div>
      <p className="rounded-2xl bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <Lightbulb className="mr-1 inline size-3.5 text-primary" aria-hidden />
        {TOOLS[active]?.tip}
      </p>
    </SurfaceShell>
  );
}

export function TapeDemoSurface() {
  const reduceMotion = useReducedMotion();
  const [reading, setReading] = useState(88);
  return (
    <SurfaceShell title="Interactive · Measuring tape">
      <div className="relative h-16 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 via-card to-muted">
        <motion.div
          className="absolute inset-y-3 left-3 flex items-center"
          animate={reduceMotion ? undefined : { x: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        >
          <div className="h-8 w-48 rounded-md border border-primary/40 bg-background/90 shadow-sm">
            <div className="flex h-full items-end gap-1 px-2 pb-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <span
                  key={i}
                  className="w-px flex-1 bg-foreground/30"
                  style={{ height: i % 4 === 0 ? "70%" : "40%" }}
                />
              ))}
            </div>
          </div>
          <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
            {reading} cm
          </span>
        </motion.div>
      </div>
      <div className="flex flex-wrap gap-2">
        {[86, 88, 90, 92].map((value) => (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={reading === value ? "default" : "outline"}
            className="rounded-xl"
            onClick={() => setReading(value)}
          >
            Set {value}
          </Button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Keep the tape parallel, snug, and read at eye level — never from an angle.
      </p>
    </SurfaceShell>
  );
}

const SWATCHES = [
  { name: "Cotton", note: "Stable grain — ideal first cloth." },
  { name: "Silk", note: "Slippery; pin generously." },
  { name: "Georgette", note: "Fluid; grain critical." },
  { name: "Knit", note: "Stretch changes ease rules." },
];

export function FabricSwatchesSurface() {
  const [active, setActive] = useState(0);
  return (
    <SurfaceShell title="Interactive · Fabric types">
      <div className="grid grid-cols-2 gap-2">
        {SWATCHES.map((swatch, index) => (
          <button
            key={swatch.name}
            type="button"
            onClick={() => setActive(index)}
            className={cn(
              "rounded-2xl border p-3 text-left transition",
              active === index
                ? "border-primary bg-gradient-to-br from-primary/15 to-card"
                : "border-border/70 bg-muted/30",
            )}
          >
            <p className="text-sm font-semibold">{swatch.name}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">{swatch.note}</p>
          </button>
        ))}
      </div>
    </SurfaceShell>
  );
}

const TERMS = [
  { term: "Block", def: "Basic fitted shape before style lines." },
  { term: "Ease", def: "Room beyond the body for comfort and style." },
  { term: "Dart", def: "Wedge that shapes flat paper into 3D." },
  { term: "Grainline", def: "Line parallel to the selvedge." },
  { term: "Notch", def: "Match mark between pattern pieces." },
  { term: "Seam allowance", def: "Fabric beyond the stitch line." },
];

export function TerminologySurface() {
  const [open, setOpen] = useState<string | null>(TERMS[0]?.term ?? null);
  return (
    <SurfaceShell title="Interactive · Terminology">
      <div className="space-y-2">
        {TERMS.map((item) => (
          <button
            key={item.term}
            type="button"
            onClick={() => setOpen(item.term)}
            className={cn(
              "flex w-full items-start justify-between gap-3 rounded-2xl border px-3 py-2.5 text-left",
              open === item.term
                ? "border-primary/50 bg-primary/5"
                : "border-border/60",
            )}
          >
            <span className="text-sm font-semibold">{item.term}</span>
            {open === item.term ? (
              <span className="text-xs text-muted-foreground">{item.def}</span>
            ) : (
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Tap
              </span>
            )}
          </button>
        ))}
      </div>
    </SurfaceShell>
  );
}

const MISTAKE_CARDS = [
  {
    text: "Cutting cloth with paper scissors",
    mistake: true,
  },
  {
    text: "Writing measurements before drafting",
    mistake: false,
  },
  {
    text: "Adding ease into Bust ÷ 4",
    mistake: false,
  },
  {
    text: "Guessing the apex without measuring",
    mistake: true,
  },
  {
    text: "Aligning grainline to selvedge",
    mistake: false,
  },
];

export function MistakesQuizSurface({
  onScored,
}: {
  onScored?: (score: number, total: number) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let correct = 0;
    MISTAKE_CARDS.forEach((card, index) => {
      if (answers[index] === card.mistake) correct += 1;
    });
    return correct;
  }, [answers]);

  return (
    <SurfaceShell title="Practice · Beginner mistakes">
      <div className="space-y-2">
        {MISTAKE_CARDS.map((card, index) => (
          <div
            key={card.text}
            className="rounded-2xl border border-border/60 bg-background/40 p-3"
          >
            <p className="text-sm font-medium">{card.text}</p>
            <div className="mt-2 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={answers[index] === true ? "default" : "outline"}
                className="rounded-xl"
                disabled={submitted}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [index]: true }))
                }
              >
                Mistake
              </Button>
              <Button
                type="button"
                size="sm"
                variant={answers[index] === false ? "default" : "outline"}
                className="rounded-xl"
                disabled={submitted}
                onClick={() =>
                  setAnswers((prev) => ({ ...prev, [index]: false }))
                }
              >
                Good practice
              </Button>
              {submitted ? (
                <span
                  className={cn(
                    "ml-auto self-center text-[11px] font-semibold",
                    answers[index] === card.mistake
                      ? "text-primary"
                      : "text-destructive",
                  )}
                >
                  {answers[index] === card.mistake ? "Correct" : "Review"}
                </span>
              ) : null}
            </div>
          </div>
        ))}
      </div>
      <Button
        type="button"
        className="w-full rounded-xl"
        disabled={
          submitted ||
          MISTAKE_CARDS.some((_, index) => answers[index] == null)
        }
        onClick={() => {
          setSubmitted(true);
          onScored?.(score, MISTAKE_CARDS.length);
        }}
      >
        {submitted
          ? `Score ${score}/${MISTAKE_CARDS.length}`
          : "Check answers"}
      </Button>
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Posture                                                            */
/* ------------------------------------------------------------------ */

export function PostureSurface() {
  const [mode, setMode] = useState<"correct" | "incorrect">("correct");
  return (
    <SurfaceShell title="Interactive · Posture">
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={mode === "correct" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setMode("correct")}
        >
          Correct
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === "incorrect" ? "default" : "outline"}
          className="rounded-xl"
          onClick={() => setMode("incorrect")}
        >
          Incorrect
        </Button>
      </div>
      <div className="relative mx-auto aspect-[3/4] max-w-[200px] rounded-3xl border border-border/60 bg-gradient-to-b from-muted/80 to-card p-4">
        <svg viewBox="0 0 100 140" className="h-full w-full" aria-hidden>
          <ellipse
            cx="50"
            cy="22"
            rx="12"
            ry="14"
            className="fill-primary/30 stroke-primary"
            strokeWidth="1.5"
          />
          <path
            d={
              mode === "correct"
                ? "M50 36 L50 78 M50 48 L32 70 M50 48 L68 70 M50 78 L38 120 M50 78 L62 120"
                : "M50 36 L46 78 M46 48 L28 66 M46 48 L70 72 M46 78 L34 118 M46 78 L64 122"
            }
            className="stroke-foreground/70"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
        <p className="absolute inset-x-3 bottom-3 rounded-xl bg-background/90 px-2 py-1.5 text-center text-[10px] font-medium text-muted-foreground">
          {mode === "correct"
            ? "Weight even · arms relaxed · chin level"
            : "Slouch + raised shoulder skews every girth"}
        </p>
      </div>
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Measurement practice                                               */
/* ------------------------------------------------------------------ */

type MeasureCard =
  | { kind: "identify"; prompt: string; answerId: string; options: string[] }
  | { kind: "method"; prompt: string; correct: boolean };

function buildMeasureCards(difficulty: "easy" | "hard"): MeasureCard[] {
  const pool = MEASUREMENTS.slice(0, difficulty === "easy" ? 12 : 20);
  const cards: MeasureCard[] = [];
  for (let i = 0; i < (difficulty === "easy" ? 5 : 6); i += 1) {
    if (i % 2 === 0) {
      const target = pool[Math.floor(Math.random() * pool.length)];
      const distractors = pool
        .filter((m) => m.id !== target.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((m) => m.id);
      cards.push({
        kind: "identify",
        prompt: target.definition,
        answerId: target.id,
        options: [target.id, ...distractors].sort(() => Math.random() - 0.5),
      });
    } else {
      const good = Math.random() > 0.45;
      cards.push({
        kind: "method",
        prompt: good
          ? "Keep the tape parallel to the floor while taking the bust."
          : "Pull the tape until the soft tissue compresses for a smaller bust.",
        correct: good,
      });
    }
  }
  return cards;
}

export function MeasurePracticeSurface({
  difficulty = "easy",
  onScored,
}: {
  difficulty?: "easy" | "hard";
  onScored?: (score: number, total: number) => void;
}) {
  // Client-only random deck: keep SSR/client first paint identical (null),
  // then adjust during render after mount (avoids hydration mismatch + effect loops).
  const [deck, setDeck] = useState<{
    difficulty: "easy" | "hard";
    cards: MeasureCard[];
  } | null>(null);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);

  if (
    typeof window !== "undefined" &&
    (deck === null || deck.difficulty !== difficulty)
  ) {
    setDeck({ difficulty, cards: buildMeasureCards(difficulty) });
    setIndex(0);
    setScore(0);
    setFeedback(null);
    setHint(false);
    setDone(false);
  }

  if (!deck) {
    return (
      <SurfaceShell title="Practice">
        <p className="text-sm text-muted-foreground">Preparing cards…</p>
      </SurfaceShell>
    );
  }

  const cards = deck.cards;
  const card = cards[index];
  const labelFor = (id: string) =>
    MEASUREMENTS.find((m) => m.id === id)?.label ?? id;

  const advance = (correct: boolean) => {
    const nextScore = score + (correct ? 1 : 0);
    setScore(nextScore);
    setFeedback(correct ? "Correct — well spotted." : "Not quite — review and continue.");
    window.setTimeout(() => {
      setFeedback(null);
      setHint(false);
      if (index + 1 >= cards.length) {
        setDone(true);
        onScored?.(nextScore, cards.length);
      } else {
        setIndex((v) => v + 1);
      }
    }, 700);
  };

  if (done) {
    return (
      <SurfaceShell title="Practice complete">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <CheckCircle2 className="size-10 text-primary" aria-hidden />
          <p className="font-display text-2xl font-semibold">
            {score}/{cards.length}
          </p>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => {
              setDeck({ difficulty, cards: buildMeasureCards(difficulty) });
              setIndex(0);
              setScore(0);
              setDone(false);
            }}
          >
            <RotateCcw aria-hidden />
            New round
          </Button>
        </div>
      </SurfaceShell>
    );
  }

  if (!card) return null;

  return (
    <SurfaceShell title={`Practice · Card ${index + 1}/${cards.length}`}>
      <p className="text-sm leading-relaxed">{card.prompt}</p>
      {hint ? (
        <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
          {card.kind === "identify"
            ? `Think about: ${labelFor(card.answerId)}`
            : "Ask: does this compress or respect the body?"}
        </p>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="rounded-xl"
          onClick={() => setHint(true)}
        >
          Hint
        </Button>
      )}
      {card.kind === "identify" ? (
        <div className="grid gap-2">
          {card.options.map((id) => (
            <Button
              key={id}
              type="button"
              variant="outline"
              className="justify-start rounded-xl"
              onClick={() => advance(id === card.answerId)}
            >
              {labelFor(id)}
            </Button>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1 rounded-xl"
            onClick={() => advance(card.correct === true)}
          >
            Correct method
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={() => advance(card.correct === false)}
          >
            Mistake
          </Button>
        </div>
      )}
      <AnimatePresence>
        {feedback ? (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-xs font-medium text-primary"
          >
            {feedback}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Marking animation                                                  */
/* ------------------------------------------------------------------ */

const MARKING_FRAMES = [
  { id: "neck", label: "Neck width", formula: "Neck ÷ 6 + 0.5", d: "M40 20 H70" },
  { id: "shoulder", label: "Shoulder", formula: "Length + 2.5 drop", d: "M70 20 L95 32" },
  { id: "armhole", label: "Armhole", formula: "Bust ÷ 4 − 1.5", d: "M95 32 Q110 70 95 95" },
  { id: "bust", label: "Bust line", formula: "(Bust + Ease) ÷ 4", d: "M40 95 H95" },
  { id: "waist", label: "Waist line", formula: "(Waist + Ease) ÷ 4", d: "M40 130 H85" },
  { id: "princess", label: "Princess", formula: "Apex depth + Sh ÷ 2", d: "M55 20 L60 100" },
  { id: "darts", label: "Darts", formula: "Bust¼ − Waist¼", d: "M70 95 L65 125 L75 125 Z" },
  { id: "side", label: "Side seam", formula: "Underarm → waist → hem", d: "M95 95 L85 130 L88 160" },
  { id: "sa", label: "Seam allowance", formula: "Add at cutting", d: "M36 18 H74" },
];

export function MarkingAnimationSurface({ focusIds }: { focusIds?: string[] }) {
  const frames = focusIds?.length
    ? MARKING_FRAMES.filter((f) => focusIds.includes(f.id))
    : MARKING_FRAMES;
  const [step, setStep] = useState(0);
  const current = frames[Math.min(step, frames.length - 1)];

  return (
    <SurfaceShell title="Interactive · Measurement marking">
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-primary/5 to-muted/40 p-3">
        <svg viewBox="0 0 140 180" className="mx-auto h-48 w-full max-w-xs">
          <line x1="40" y1="18" x2="40" y2="165" className="stroke-muted-foreground/40" strokeWidth="1.5" />
          {frames.slice(0, step + 1).map((frame) => (
            <path
              key={frame.id}
              d={frame.d}
              className={
                frame.id === current?.id
                  ? "stroke-primary fill-primary/20"
                  : "stroke-foreground/50 fill-none"
              }
              strokeWidth="2"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>
      {current ? (
        <div>
          <p className="font-display text-lg font-semibold">{current.label}</p>
          <p className="text-xs text-muted-foreground">{current.formula}</p>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            Why: this mark exists so later lines have a true reference — never draw style before structure.
          </p>
        </div>
      ) : null}
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="rounded-xl"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Previous
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-xl"
          disabled={step >= frames.length - 1}
          onClick={() => setStep((s) => Math.min(frames.length - 1, s + 1))}
        >
          Next mark
        </Button>
      </div>
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Draft practice                                                     */
/* ------------------------------------------------------------------ */

export function DraftPracticeSurface({
  hintLimit = 99,
  targetScore = 7,
  onScored,
}: {
  hintLimit?: number;
  targetScore?: number;
  onScored?: (score: number, total: number) => void;
}) {
  const [session, setSession] = useState<{
    body: ReturnType<typeof generateRandomBody>;
    inputs: ReturnType<typeof generateRandomInputs>;
  } | null>(null);

  if (typeof window !== "undefined" && session === null) {
    setSession({
      body: generateRandomBody(),
      inputs: generateRandomInputs(),
    });
  }

  const body = session?.body ?? null;
  const inputs = session?.inputs ?? null;
  const answers = useMemo(
    () => (body && inputs ? getCorrectAnswers(body, inputs) : null),
    [body, inputs],
  );
  const [guesses, setGuesses] = useState<PracticeGuesses>({});
  const [hintsLeft, setHintsLeft] = useState(hintLimit);
  const [revealed, setRevealed] = useState<Partial<Record<PracticeFieldId, boolean>>>({});
  const [result, setResult] = useState<{
    correct: number;
    total: number;
    fieldResults: Record<PracticeFieldId, boolean>;
  } | null>(null);

  const showHint = (id: PracticeFieldId) => {
    if (hintsLeft <= 0) return;
    setHintsLeft((h) => h - 1);
    setRevealed((prev) => ({ ...prev, [id]: true }));
  };

  if (!body || !inputs || !answers) {
    return (
      <SurfaceShell title="Practice · Drafting">
        <p className="text-sm text-muted-foreground">Preparing practice…</p>
      </SurfaceShell>
    );
  }

  return (
    <SurfaceShell title="Practice · Drafting">
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-muted/40 p-3 text-[11px]">
        <div>
          <p className="text-muted-foreground">Bust</p>
          <p className="font-semibold tabular-nums">{body.bust}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Waist</p>
          <p className="font-semibold tabular-nums">{body.waist}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Neck</p>
          <p className="font-semibold tabular-nums">{body.neck}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Shoulder</p>
          <p className="font-semibold tabular-nums">{body.shoulder}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Apex depth</p>
          <p className="font-semibold tabular-nums">{body.apexDepth}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Ease / SA</p>
          <p className="font-semibold tabular-nums">
            {inputs.bustEase}/{inputs.seamAllowance}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {PRACTICE_FIELDS.map((field) => (
          <label key={field.id} className="block space-y-1">
            <span className="flex items-center justify-between text-xs font-semibold">
              {field.label}
              <button
                type="button"
                className="text-[10px] font-medium text-primary disabled:opacity-40"
                disabled={hintsLeft <= 0 || !!result}
                onClick={() => showHint(field.id)}
              >
                Hint ({hintsLeft})
              </button>
            </span>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              disabled={!!result}
              value={guesses[field.id] ?? ""}
              onChange={(event) =>
                setGuesses((prev) => ({
                  ...prev,
                  [field.id]: event.target.value,
                }))
              }
              className={cn(
                "h-10 w-full rounded-xl border bg-background px-3 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring",
                result
                  ? result.fieldResults[field.id]
                    ? "border-primary"
                    : "border-destructive"
                  : "border-border",
              )}
            />
            <span className="text-[10px] text-muted-foreground">
              {field.formula}
              {revealed[field.id] || result
                ? ` · answer ${answers[field.id]}`
                : ""}
            </span>
          </label>
        ))}
      </div>

      {!result ? (
        <Button
          type="button"
          className="w-full rounded-xl"
          onClick={() => {
            let correct = 0;
            const fieldResults = {} as Record<PracticeFieldId, boolean>;
            for (const field of PRACTICE_FIELDS) {
              const ok = isAnswerCorrect(
                guesses[field.id] ?? "",
                answers[field.id],
              );
              fieldResults[field.id] = ok;
              if (ok) correct += 1;
            }
            const total = PRACTICE_FIELDS.length;
            setResult({ correct, total, fieldResults });
            onScored?.(correct, total);
          }}
        >
          Check draft · target ≥{targetScore}
        </Button>
      ) : (
        <div className="rounded-2xl bg-primary/10 px-3 py-3 text-center">
          <p className="font-display text-xl font-semibold">
            {result.correct}/{result.total}
          </p>
          <p className="text-xs text-muted-foreground">
            {result.correct >= targetScore
              ? "Target met — you can complete the lesson."
              : "Compare with the correct draft above, then retry from Draft Learning."}
          </p>
        </div>
      )}
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Fabric alignment practice                                          */
/* ------------------------------------------------------------------ */

export function FabricAlignPracticeSurface({
  target = 80,
  comparison = false,
  liveHints = false,
  onScored,
}: {
  target?: number;
  comparison?: boolean;
  liveHints?: boolean;
  onScored?: (score: number, total: number) => void;
}) {
  const goal = useMemo(
    () => ({ x: 42, y: 38, scale: 1, rotate: -8 }),
    [],
  );
  const [x, setX] = useState(20);
  const [y, setY] = useState(55);
  const [scale, setScale] = useState(0.85);
  const [rotate, setRotate] = useState(12);
  const [showGhost, setShowGhost] = useState(false);

  const score = useMemo(() => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    const ds = Math.abs(scale - goal.scale) * 40;
    const dr = Math.abs(rotate - goal.rotate);
    const penalty = dx + dy + ds + dr;
    return Math.max(0, Math.round(100 - penalty * 1.2));
  }, [x, y, scale, rotate, goal]);

  const hint =
    Math.abs(rotate - goal.rotate) > 4
      ? "Rotate toward the grain first."
      : Math.abs(x - goal.x) > 6 || Math.abs(y - goal.y) > 6
        ? "Nudge position to the snap zone."
        : Math.abs(scale - goal.scale) > 0.05
          ? "Fine-tune scale."
          : "Locked in — looking sharp.";

  return (
    <SurfaceShell title="Practice · Fabric alignment">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/60 bg-[radial-gradient(circle_at_30%_20%,oklch(0.7_0.05_185/0.25),transparent_50%),linear-gradient(135deg,#3a2f28,#1c1612)]">
        {/* faux fabric weave */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />
        {comparison && showGhost ? (
          <div
            className="absolute rounded-xl border-2 border-dashed border-white/50 bg-white/10"
            style={{
              left: `${goal.x}%`,
              top: `${goal.y}%`,
              width: `${28 * goal.scale}%`,
              height: `${22 * goal.scale}%`,
              transform: `rotate(${goal.rotate}deg)`,
            }}
          />
        ) : null}
        <div
          className="absolute rounded-xl border-2 border-primary bg-primary/25 shadow-lg backdrop-blur-[1px]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${28 * scale}%`,
            height: `${22 * scale}%`,
            transform: `rotate(${rotate}deg)`,
          }}
        >
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-white">
            Pattern
          </span>
        </div>
        <div className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
          Score {score}
        </div>
      </div>

      {liveHints ? (
        <p className="rounded-xl bg-primary/10 px-3 py-2 text-xs text-primary">
          <Sparkles className="mr-1 inline size-3.5" aria-hidden />
          {hint}
        </p>
      ) : null}

      <div className="space-y-3">
        {(
          [
            ["X", x, setX, 5, 70],
            ["Y", y, setY, 5, 70],
            ["Scale", scale, setScale, 0.6, 1.3],
            ["Rotate", rotate, setRotate, -30, 30],
          ] as const
        ).map(([label, value, setter, min, max]) => (
          <label key={label} className="block text-[11px] font-semibold">
            <span className="mb-1 flex justify-between">
              {label}
              <span className="tabular-nums text-muted-foreground">
                {typeof value === "number" ? value.toFixed(label === "Scale" ? 2 : 0) : value}
              </span>
            </span>
            <input
              type="range"
              min={min}
              max={max}
              step={label === "Scale" ? 0.01 : 1}
              value={value}
              onChange={(event) => setter(Number(event.target.value))}
              className="w-full accent-[var(--primary)]"
            />
          </label>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {comparison ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-xl"
            onClick={() => setShowGhost((v) => !v)}
          >
            {showGhost ? "Hide master" : "Compare"}
          </Button>
        ) : null}
        <Button
          type="button"
          size="sm"
          className="rounded-xl"
          disabled={score < target}
          onClick={() => onScored?.(score, 100)}
        >
          Lock score ≥{target}
        </Button>
      </div>
    </SurfaceShell>
  );
}

/* ------------------------------------------------------------------ */
/* Project workflow                                                   */
/* ------------------------------------------------------------------ */

const PROJECT_STEPS = [
  { label: "Measurements", href: "/measurements", detail: "Confirm the blouse chart." },
  { label: "Draft", href: "/drafts", detail: "Run the engine and export PNG." },
  { label: "Fabric", href: "/studio", detail: "Capture cloth and align a pattern." },
  { label: "Journal", href: "/journal", detail: "Save the project archive." },
  { label: "Review", href: "/journey", detail: "Reflect and close the loop." },
];

export function ProjectWorkflowSurface({
  highlight = 0,
}: {
  highlight?: number;
}) {
  return (
    <SurfaceShell title="Project workflow">
      <ol className="space-y-2">
        {PROJECT_STEPS.map((step, index) => (
          <li key={step.label}>
            <a
              href={step.href}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-3 py-3 transition hover:border-primary/40",
                index === highlight
                  ? "border-primary bg-primary/10"
                  : "border-border/60 bg-background/40",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {index + 1}
              </span>
              <span>
                <span className="block text-sm font-semibold">{step.label}</span>
                <span className="text-xs text-muted-foreground">{step.detail}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </SurfaceShell>
  );
}

export function MannequinCalloutSurface() {
  return (
    <SurfaceShell title="Interactive · 3D mannequin">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Open the Measurements atelier to tap body regions, study animated guides,
        and mark each measurement learned. Your progress syncs back into this journey.
      </p>
      <Button asChild className="rounded-xl">
        <a href="/measurements">Open 3D mannequin</a>
      </Button>
    </SurfaceShell>
  );
}

export function FabricCameraCalloutSurface() {
  return (
    <SurfaceShell title="Interactive · Camera overlay">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Use Studio to freeze fabric under good light, then lay pattern overlays with
        grid, snap, scale, and rotation — the same skills scored in Stage 7.
      </p>
      <Button asChild className="rounded-xl">
        <a href="/studio">Open Studio camera</a>
      </Button>
    </SurfaceShell>
  );
}
