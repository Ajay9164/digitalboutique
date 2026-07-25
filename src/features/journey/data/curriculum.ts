/**
 * Guided Learning Mode — Tailor Academy curriculum.
 * Stages unlock sequentially; lessons inside a stage unlock in order.
 */

export type JourneyStageId =
  | "intro"
  | "body-measurements"
  | "practice-measurements"
  | "measurement-marking"
  | "practice-drafting"
  | "fabric-placement"
  | "practice-fabric"
  | "complete-project";

export type JourneyLessonKind =
  | "theory"
  | "interactive"
  | "practice"
  | "project";

export type JourneyDifficulty = "beginner" | "intermediate" | "advanced";

export type JourneyLessonSection = {
  id: string;
  title: string;
  /** What to do */
  what: string;
  /** Why it matters */
  why: string;
  /** How to do it (steps) */
  how: string[];
  commonMistakes: string[];
  proTips: string[];
  /** Optional practice prompt inside the section */
  practicePrompt?: string;
  /** Optional interactive surface key rendered by the lesson player */
  interactive?:
    | "tools-grid"
    | "tape-demo"
    | "fabric-swatches"
    | "terminology"
    | "mistakes-quiz"
    | "mannequin"
    | "posture"
    | "measure-practice"
    | "marking-animation"
    | "draft-practice"
    | "fabric-camera"
    | "fabric-align-practice"
    | "project-workflow";
};

export type JourneyLesson = {
  id: string;
  stageId: JourneyStageId;
  order: number;
  title: string;
  subtitle: string;
  kind: JourneyLessonKind;
  /** Estimated minutes for a focused learner */
  etaMinutes: number;
  /** Minimum mode that sees full depth (beginners still see it, but advanced unlocks extras) */
  difficulty: JourneyDifficulty;
  xp: number;
  /** Deep-link into an existing atelier surface when helpful */
  exploreHref?: string;
  sections: JourneyLessonSection[];
};

export type JourneyStage = {
  id: JourneyStageId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  icon: "sparkles" | "ruler" | "target" | "pen" | "draft" | "fabric" | "align" | "project";
  etaMinutes: number;
  lessons: JourneyLesson[];
};

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "intro",
    order: 1,
    title: "Introduction to Tailoring",
    subtitle: "Stage 1 · Foundations",
    description:
      "Become fluent in the language of the atelier — tools, tape, fabric, and the mistakes beginners make.",
    icon: "sparkles",
    etaMinutes: 45,
    lessons: [
      {
        id: "s1-basics",
        stageId: "intro",
        order: 0,
        title: "Tailoring basics",
        subtitle: "What a tailor actually does",
        kind: "theory",
        etaMinutes: 8,
        difficulty: "beginner",
        xp: 20,
        sections: [
          {
            id: "craft",
            title: "The craft",
            what: "Understand the end-to-end path from body to finished garment.",
            why: "Without the map, every tool and formula feels random.",
            how: [
              "Measure the body with a tape.",
              "Translate those numbers into paper draft lines.",
              "Place the pattern on fabric with grain and economy in mind.",
              "Cut, sew, and refine fit.",
            ],
            commonMistakes: [
              "Jumping straight to cutting without a measured draft.",
              "Treating ease as optional.",
            ],
            proTips: [
              "Think in layers: body → block → style → cloth.",
              "Write every measurement before you draft — memory lies.",
            ],
          },
        ],
      },
      {
        id: "s1-tools",
        stageId: "intro",
        order: 1,
        title: "Required tools",
        subtitle: "What belongs on your table",
        kind: "interactive",
        etaMinutes: 6,
        difficulty: "beginner",
        xp: 15,
        sections: [
          {
            id: "kit",
            title: "Essential kit",
            what: "Know each tool and when you reach for it.",
            why: "The right tool keeps lines true and fabric calm.",
            how: [
              "Measuring tape — soft, centimetre side clear.",
              "L-square / set square — right angles for the block.",
              "French curve — armholes and necklines.",
              "Tracing wheel & carbon — transfer marks.",
              "Sharp shears + paper scissors (never mix).",
              "Pins, chalk, and a clear ruler.",
            ],
            commonMistakes: [
              "Using kitchen scissors on cloth.",
              "A stretched, soft tape that reads long.",
            ],
            proTips: [
              "Keep a dedicated paper scissors next to your shears.",
              "Replace chalk before it smears and misleads you.",
            ],
            interactive: "tools-grid",
          },
        ],
      },
      {
        id: "s1-tape",
        stageId: "intro",
        order: 2,
        title: "Measuring tape usage",
        subtitle: "How to hold and read the tape",
        kind: "interactive",
        etaMinutes: 7,
        difficulty: "beginner",
        xp: 20,
        sections: [
          {
            id: "hold",
            title: "Hold, snug, read",
            what: "Practice a professional tape grip and reading habit.",
            why: "A 1 cm error at the bust becomes 0.25 cm on a quarter draft — still enough to twist a dart.",
            how: [
              "Start at the zero metal tip, not the fabric edge of the tape.",
              "Keep the tape parallel to the floor for girths.",
              "Snug means touching skin without compressing soft tissue.",
              "Read at eye level; do not tilt the tape.",
            ],
            commonMistakes: [
              "Pulling so tight the number drops.",
              "Letting the tape droop at the back.",
            ],
            proTips: [
              "Have the client exhale gently before you lock the number.",
              "Call the number aloud and write it immediately.",
            ],
            interactive: "tape-demo",
            practicePrompt: "Animate the tape and confirm the reading at 88 cm.",
          },
        ],
      },
      {
        id: "s1-fabrics",
        stageId: "intro",
        order: 3,
        title: "Fabric types",
        subtitle: "Grain, hand, and behaviour",
        kind: "interactive",
        etaMinutes: 8,
        difficulty: "beginner",
        xp: 20,
        sections: [
          {
            id: "types",
            title: "Know your cloth",
            what: "Recognise common blouse fabrics and how they behave.",
            why: "Grain and stretch decide whether your draft lands true on the body.",
            how: [
              "Cotton — stable, forgiving for beginners.",
              "Silk / satin — slippery; needs more pins and patience.",
              "Georgette / chiffon — fluid; grain is critical.",
              "Knit — stretches; drafting ease rules change.",
            ],
            commonMistakes: [
              "Cutting silk without a stabilising underlayer.",
              "Ignoring selvedge direction.",
            ],
            proTips: [
              "Press a sample scrap before committing the full piece.",
              "Mark grain with a single chalk arrow on the wrong side.",
            ],
            interactive: "fabric-swatches",
          },
        ],
      },
      {
        id: "s1-terms",
        stageId: "intro",
        order: 4,
        title: "Pattern terminology",
        subtitle: "Speak the draft’s language",
        kind: "interactive",
        etaMinutes: 8,
        difficulty: "beginner",
        xp: 20,
        sections: [
          {
            id: "lexicon",
            title: "Core terms",
            what: "Learn the words you will hear in every later stage.",
            why: "Shared language keeps lessons short and precise.",
            how: [
              "Block / sloper — basic fitted shape.",
              "Ease — room beyond the body.",
              "Dart — wedge that shapes flat paper into 3D.",
              "Grainline — parallel to selvedge.",
              "Notch — match mark between pieces.",
              "Seam allowance — fabric beyond the stitch line.",
            ],
            commonMistakes: [
              "Calling the cutting line the stitch line.",
              "Confusing bust line with apex depth.",
            ],
            proTips: [
              "Write the term on your draft the first time you use it.",
              "Ease is chosen; stretch is fabric — do not confuse them.",
            ],
            interactive: "terminology",
          },
        ],
      },
      {
        id: "s1-mistakes",
        stageId: "intro",
        order: 5,
        title: "Beginner mistakes",
        subtitle: "Spot and avoid early traps",
        kind: "practice",
        etaMinutes: 8,
        difficulty: "beginner",
        xp: 25,
        sections: [
          {
            id: "traps",
            title: "Common traps",
            what: "Identify mistakes before they waste cloth.",
            why: "Most fitting disasters start as a skipped checkpoint.",
            how: [
              "Skipping posture checks when measuring.",
              "Drafting without adding ease.",
              "Cutting on the bias by accident.",
              "Not truing dart legs.",
              "Using blunt chalk that thickens every mark.",
            ],
            commonMistakes: [
              "Assuming one size chart fits every body.",
              "Skipping a toile / muslin on a new block.",
            ],
            proTips: [
              "Build a personal mistake checklist and tick it every project.",
              "Measure twice, chalk once, cut last.",
            ],
            interactive: "mistakes-quiz",
            practicePrompt: "Mark which scenarios are mistakes — score at least 4/5.",
          },
        ],
      },
    ],
  },
  {
    id: "body-measurements",
    order: 2,
    title: "Learn Body Measurements",
    subtitle: "Stage 2 · The form",
    description:
      "Every body measurement with the 3D mannequin, posture guides, and professional checkpoints.",
    icon: "ruler",
    etaMinutes: 90,
    lessons: [
      {
        id: "s2-posture",
        stageId: "body-measurements",
        order: 0,
        title: "Correct vs incorrect posture",
        subtitle: "Set the body before the tape",
        kind: "interactive",
        etaMinutes: 10,
        difficulty: "beginner",
        xp: 25,
        exploreHref: "/measurements",
        sections: [
          {
            id: "stance",
            title: "Stance that measures true",
            what: "Place the client so every girth reads consistently.",
            why: "Slouch or raised shoulders change bust, waist, and back length by centimetres.",
            how: [
              "Feet under hips, weight even.",
              "Arms relaxed at the sides.",
              "Look forward; chin level.",
              "Wear a well-fitting bra for blouse work.",
            ],
            commonMistakes: [
              "Measuring while the client holds their breath.",
              "Arms lifted “to help” — that shortens the back.",
            ],
            proTips: [
              "Ask them to shake their shoulders once, then settle.",
              "Photograph posture (with consent) for later comparison.",
            ],
            interactive: "posture",
          },
        ],
      },
      {
        id: "s2-core-girths",
        stageId: "body-measurements",
        order: 1,
        title: "Core girths",
        subtitle: "Bust, waist, hip",
        kind: "interactive",
        etaMinutes: 18,
        difficulty: "beginner",
        xp: 40,
        exploreHref: "/measurements",
        sections: [
          {
            id: "girths",
            title: "Bust · Waist · Hip",
            what: "Take the three foundation circumferences on the mannequin.",
            why: "These set almost every bodice quarter and dart intake.",
            how: [
              "Open Measurements and tap Bust, Waist, then Hip.",
              "Read definition, purpose, and how-to for each.",
              "Study the illustration overlay and checkpoints.",
              "Mark each as learned when you can explain it aloud.",
            ],
            commonMistakes: [
              "Tape not parallel to the floor.",
              "Waist taken at the belt line instead of the natural waist.",
            ],
            proTips: [
              "Use the 3D form to rehearse before a live client.",
              "Voice-ready: enable narration for step cues.",
            ],
            interactive: "mannequin",
            practicePrompt: "Learn Bust, Waist, and Hip on the mannequin.",
          },
        ],
      },
      {
        id: "s2-shoulders-arms",
        stageId: "body-measurements",
        order: 2,
        title: "Shoulders & arms",
        subtitle: "Shoulder, armhole, sleeve",
        kind: "interactive",
        etaMinutes: 16,
        difficulty: "beginner",
        xp: 35,
        exploreHref: "/measurements",
        sections: [
          {
            id: "upper",
            title: "Shoulder to sleeve",
            what: "Master the upper-body lengths that place the sleeve.",
            why: "Wrong shoulder or armhole depth shows immediately in wear.",
            how: [
              "Study Shoulder, Armhole, Arm Round, Sleeve Length.",
              "Note how shoulder drop interacts with armhole depth.",
              "Mark each lesson complete when checkpoints are clear.",
            ],
            commonMistakes: [
              "Measuring shoulder with the tape following a sloping seam poorly.",
              "Armhole depth taken too shallow for mobility.",
            ],
            proTips: [
              "Compare left and right shoulders — many bodies are asymmetric.",
            ],
            interactive: "mannequin",
          },
        ],
      },
      {
        id: "s2-blouse-points",
        stageId: "body-measurements",
        order: 3,
        title: "Blouse drafting points",
        subtitle: "Apex, princess, length",
        kind: "interactive",
        etaMinutes: 16,
        difficulty: "intermediate",
        xp: 35,
        exploreHref: "/measurements",
        sections: [
          {
            id: "points",
            title: "Apex & length",
            what: "Locate apex, apex distance, princess length, and blouse length.",
            why: "Dart tips and princess seams fail when apex is guessed.",
            how: [
              "Work through Apex, Apex Distance, Princess Length, Blouse Length.",
              "Confirm each checkpoint on the learning card.",
              "Mark learned when you can place the apex without looking at notes.",
            ],
            commonMistakes: [
              "Placing apex too high on a mature figure.",
              "Blouse length measured to the hip instead of the design hem.",
            ],
            proTips: [
              "Apex distance is usually measured between peaks, then halved for the draft.",
            ],
            interactive: "mannequin",
          },
        ],
      },
      {
        id: "s2-neck-detail",
        stageId: "body-measurements",
        order: 4,
        title: "Neck & finishing measures",
        subtitle: "Neck, cross front/back, darts",
        kind: "interactive",
        etaMinutes: 14,
        difficulty: "intermediate",
        xp: 30,
        exploreHref: "/measurements",
        sections: [
          {
            id: "neck",
            title: "Neckline & balance",
            what: "Complete neck and balance measurements used in drafting.",
            why: "Neck width/depth and cross measures keep the neckline from gaping.",
            how: [
              "Study Neck, Front Neck, Back Neck, Cross Front, Cross Back, Dart Point.",
              "Use interactive labels on the mannequin.",
              "Finish remaining measurement cards you have not learned.",
            ],
            commonMistakes: [
              "Front neck depth copied from a fashion sketch without ease.",
            ],
            proTips: [
              "Record both front and back neck — they are rarely equal.",
            ],
            interactive: "mannequin",
          },
        ],
      },
    ],
  },
  {
    id: "practice-measurements",
    order: 3,
    title: "Practice Measurements",
    subtitle: "Stage 3 · Hands-on",
    description:
      "Random exercises with hints, step-by-step help, and accuracy feedback.",
    icon: "target",
    etaMinutes: 40,
    lessons: [
      {
        id: "s3-warmup",
        stageId: "practice-measurements",
        order: 0,
        title: "Measurement warm-up",
        subtitle: "Identify the right measure",
        kind: "practice",
        etaMinutes: 12,
        difficulty: "beginner",
        xp: 30,
        sections: [
          {
            id: "id-practice",
            title: "Name that measurement",
            what: "Match scenarios to the correct measurement id.",
            why: "Speed and accuracy come from recognition, not memorising lists.",
            how: [
              "Read the client scenario.",
              "Choose the measurement that solves it.",
              "Use a hint if stuck — then retry a fresh set.",
            ],
            commonMistakes: [
              "Confusing apex depth with blouse length.",
              "Picking hip when the problem is waist shaping.",
            ],
            proTips: [
              "Say the definition out loud before you tap an answer.",
            ],
            interactive: "measure-practice",
            practicePrompt: "Score at least 4/5 on the recognition set.",
          },
        ],
      },
      {
        id: "s3-accuracy",
        stageId: "practice-measurements",
        order: 1,
        title: "Accuracy drill",
        subtitle: "Spot the error in the method",
        kind: "practice",
        etaMinutes: 14,
        difficulty: "intermediate",
        xp: 35,
        sections: [
          {
            id: "errors",
            title: "Find the fault",
            what: "Decide whether a described measuring method is correct.",
            why: "Professionals catch bad method before bad numbers exist.",
            how: [
              "Read each method card.",
              "Mark Correct or Mistake.",
              "Read the feedback — then try another round.",
            ],
            commonMistakes: [
              "Accepting a tape that compresses soft tissue.",
            ],
            proTips: [
              "When unsure, ask: is the tape parallel and unstretched?",
            ],
            interactive: "measure-practice",
            practicePrompt: "Pass one full accuracy round (≥80%).",
          },
        ],
      },
      {
        id: "s3-challenge",
        stageId: "practice-measurements",
        order: 2,
        title: "Mixed challenge",
        subtitle: "Timed recognition under pressure",
        kind: "practice",
        etaMinutes: 14,
        difficulty: "advanced",
        xp: 45,
        sections: [
          {
            id: "mix",
            title: "Mixed set",
            what: "Complete a harder randomised set with fewer hints.",
            why: "Advanced mode prepares you for live client sessions.",
            how: [
              "Hints are limited — use them wisely.",
              "Aim for a perfect or near-perfect score.",
            ],
            commonMistakes: [
              "Rushing without reading the full scenario.",
            ],
            proTips: [
              "Breath between cards — accuracy over speed still wins.",
            ],
            interactive: "measure-practice",
            practicePrompt: "Score at least 5/6 on the advanced set.",
          },
        ],
      },
    ],
  },
  {
    id: "measurement-marking",
    order: 4,
    title: "Learn Measurement Marking",
    subtitle: "Stage 4 · Paper lines",
    description:
      "Watch body numbers become draft lines — and learn why each line exists.",
    icon: "pen",
    etaMinutes: 55,
    lessons: [
      {
        id: "s4-neck-shoulder",
        stageId: "measurement-marking",
        order: 0,
        title: "Neck width & shoulder",
        subtitle: "Top of the block",
        kind: "interactive",
        etaMinutes: 12,
        difficulty: "beginner",
        xp: 30,
        exploreHref: "/drafts",
        sections: [
          {
            id: "top",
            title: "From neck to shoulder point",
            what: "Animate neck width and shoulder drop onto the draft.",
            why: "These lines place the collar and the sleeve head.",
            how: [
              "Neck width ≈ Neck ÷ 6 + 0.5 cm.",
              "Shoulder length follows the body; drop ~2.5 cm.",
              "Watch the animation, then open Draft Learning to replay the step.",
            ],
            commonMistakes: [
              "Using full neck circumference as neck width.",
            ],
            proTips: [
              "Always mark the neck point before drawing the shoulder.",
            ],
            interactive: "marking-animation",
          },
        ],
      },
      {
        id: "s4-armhole-bust",
        stageId: "measurement-marking",
        order: 1,
        title: "Armhole & bust line",
        subtitle: "Width and scye",
        kind: "interactive",
        etaMinutes: 12,
        difficulty: "beginner",
        xp: 30,
        exploreHref: "/drafts",
        sections: [
          {
            id: "mid",
            title: "Armhole depth and bust¼",
            what: "See how Bust ÷ 4 − 1.5 becomes armhole depth and bust width.",
            why: "The bust line is the scaffold for apex and darts.",
            how: [
              "Bust line width = (Bust + Ease) ÷ 4.",
              "Armhole depth ≈ Bust ÷ 4 − 1.5.",
              "Follow the animated construction, then mark the lesson complete.",
            ],
            commonMistakes: [
              "Forgetting ease before dividing by four.",
            ],
            proTips: [
              "Ease is chosen for the fabric and style — write it on the draft.",
            ],
            interactive: "marking-animation",
          },
        ],
      },
      {
        id: "s4-waist-princess",
        stageId: "measurement-marking",
        order: 2,
        title: "Waist & princess line",
        subtitle: "Shape and length",
        kind: "interactive",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 30,
        exploreHref: "/drafts",
        sections: [
          {
            id: "waist",
            title: "Waist¼ and princess",
            what: "Connect waist width to princess length through the apex.",
            why: "Princess seams and darts both depend on these references.",
            how: [
              "Waist line = (Waist + Ease) ÷ 4.",
              "Princess ≈ Apex depth + Shoulder ÷ 2.",
              "Study the animation frames for each mark.",
            ],
            commonMistakes: [
              "Drawing princess length without locating the apex first.",
            ],
            proTips: [
              "True the waist line after dart intake is known.",
            ],
            interactive: "marking-animation",
          },
        ],
      },
      {
        id: "s4-darts-seams",
        stageId: "measurement-marking",
        order: 3,
        title: "Darts, side seam & SA",
        subtitle: "Shaping and finishing",
        kind: "interactive",
        etaMinutes: 14,
        difficulty: "intermediate",
        xp: 35,
        exploreHref: "/drafts",
        sections: [
          {
            id: "finish",
            title: "Darts, side, seam allowance",
            what: "Animate dart intake, side seam path, and seam allowance.",
            why: "Without darts the block stays flat; without SA you cut the stitch line.",
            how: [
              "Dart intake ≈ Bust¼ − Waist¼.",
              "Side seam joins underarm → waist → hem.",
              "Seam allowance is added at cutting — keep net lines clean on paper.",
            ],
            commonMistakes: [
              "Adding SA into every formula instead of at cut time.",
            ],
            proTips: [
              "Stop the dart tip ~2.5–3 cm short of the apex.",
            ],
            interactive: "marking-animation",
          },
        ],
      },
    ],
  },
  {
    id: "practice-drafting",
    order: 5,
    title: "Practice Drafting",
    subtitle: "Stage 5 · Your hand",
    description:
      "Create drafts with hints, corrections, comparison, and scored difficulty levels.",
    icon: "draft",
    etaMinutes: 50,
    lessons: [
      {
        id: "s5-guided",
        stageId: "practice-drafting",
        order: 0,
        title: "Guided draft practice",
        subtitle: "Hint mode on",
        kind: "practice",
        etaMinutes: 15,
        difficulty: "beginner",
        xp: 35,
        exploreHref: "/drafts",
        sections: [
          {
            id: "guided",
            title: "Fill the formulas",
            what: "Compute each drafting value from a random chart with hints.",
            why: "Repetition with feedback builds muscle memory for the table.",
            how: [
              "Read the body chart.",
              "Enter each value; open a hint when needed.",
              "Compare with the correct draft after submit.",
            ],
            commonMistakes: [
              "Mixing up Bust÷4 with Armhole depth formulas.",
            ],
            proTips: [
              "Round consistently to 1 decimal — Tailor accepts ±0.15 cm.",
            ],
            interactive: "draft-practice",
            practicePrompt: "Complete one guided round (≥7/9).",
          },
        ],
      },
      {
        id: "s5-intermediate",
        stageId: "practice-drafting",
        order: 1,
        title: "Intermediate draft",
        subtitle: "Fewer hints",
        kind: "practice",
        etaMinutes: 16,
        difficulty: "intermediate",
        xp: 40,
        exploreHref: "/drafts",
        sections: [
          {
            id: "mid",
            title: "Score the block",
            what: "Complete a practice round with limited hints.",
            why: "Independence on the numbers frees you to focus on line quality.",
            how: [
              "Attempt first without hints.",
              "Use interactive corrections on wrong fields.",
              "Aim for a strong score before advancing.",
            ],
            commonMistakes: [
              "Skipping dart intake when waist and bust quarters look “close enough”.",
            ],
            proTips: [
              "Open Draft Learning → Practice for extra rounds anytime.",
            ],
            interactive: "draft-practice",
            practicePrompt: "Score at least 8/9.",
          },
        ],
      },
      {
        id: "s5-advanced",
        stageId: "practice-drafting",
        order: 2,
        title: "Advanced draft challenge",
        subtitle: "Compare with master key",
        kind: "practice",
        etaMinutes: 18,
        difficulty: "advanced",
        xp: 50,
        exploreHref: "/drafts",
        sections: [
          {
            id: "adv",
            title: "Near-perfect block",
            what: "Hit a near-perfect score and review the comparison panel.",
            why: "Advanced accuracy is what clients feel in the first fitting.",
            how: [
              "No free hints until after first submit.",
              "Study the correct draft overlay.",
              "Retry until you clear the target.",
            ],
            commonMistakes: [
              "Changing multiple wrong answers without re-checking formulas.",
            ],
            proTips: [
              "When one field is wrong, re-derive from the body chart — do not guess.",
            ],
            interactive: "draft-practice",
            practicePrompt: "Score 9/9 once.",
          },
        ],
      },
    ],
  },
  {
    id: "fabric-placement",
    order: 6,
    title: "Learn Fabric Placement",
    subtitle: "Stage 6 · On the cloth",
    description:
      "Grain, borders, folds, and economical pattern placement — with camera guidance.",
    icon: "fabric",
    etaMinutes: 40,
    lessons: [
      {
        id: "s6-grain",
        stageId: "fabric-placement",
        order: 0,
        title: "Fabric grain & direction",
        subtitle: "Selvedge tells the truth",
        kind: "theory",
        etaMinutes: 10,
        difficulty: "beginner",
        xp: 25,
        exploreHref: "/studio",
        sections: [
          {
            id: "grain",
            title: "Lengthwise, cross, bias",
            what: "Identify grainlines and why direction matters.",
            why: "Off-grain garments twist, ripple, and refuse to hang.",
            how: [
              "Lengthwise grain runs parallel to selvedge.",
              "Crossgrain is perpendicular; more give.",
              "Bias is 45° — drapes, stretches, needs care.",
            ],
            commonMistakes: [
              "Placing a grainline arrow casually “by eye”.",
            ],
            proTips: [
              "Align pattern grainline with a thread of the weave, not the cut edge.",
            ],
          },
        ],
      },
      {
        id: "s6-borders",
        stageId: "fabric-placement",
        order: 1,
        title: "Borders & print alignment",
        subtitle: "Match motifs with intent",
        kind: "interactive",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 30,
        exploreHref: "/studio",
        sections: [
          {
            id: "print",
            title: "Borders and prints",
            what: "Plan border and motif placement before you cut.",
            why: "Misaligned borders shout “amateur” from across the room.",
            how: [
              "Decide which edge carries the border.",
              "Match motifs across seams where the design demands it.",
              "Use Studio overlay to preview on a captured fabric photo.",
            ],
            commonMistakes: [
              "Cutting mirror pieces without flipping the pattern.",
            ],
            proTips: [
              "Extra fabric for matching is cheaper than a ruined blouse.",
            ],
            interactive: "fabric-camera",
          },
        ],
      },
      {
        id: "s6-fold-economy",
        stageId: "fabric-placement",
        order: 2,
        title: "Folding & fabric saving",
        subtitle: "Layout that respects cloth",
        kind: "theory",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 30,
        sections: [
          {
            id: "economy",
            title: "Fold and nest",
            what: "Fold fabric correctly and nest pieces to save yardage.",
            why: "Good layouts cut waste and keep pairs symmetric.",
            how: [
              "Fold selvedge to selvedge for mirrored pairs.",
              "Place largest pieces first.",
              "Nest smaller pieces into gaps.",
              "Keep grain arrows parallel — never rotate to “fit”.",
            ],
            commonMistakes: [
              "Single-layer cutting when a fold would guarantee matching pairs.",
            ],
            proTips: [
              "Sketch a mini layout on paper before unrolling expensive silk.",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "practice-fabric",
    order: 7,
    title: "Practice Fabric Alignment",
    subtitle: "Stage 7 · Overlay skill",
    description:
      "Align virtual patterns over captured fabric with grids, snaps, and scoring.",
    icon: "align",
    etaMinutes: 35,
    lessons: [
      {
        id: "s7-grid",
        stageId: "practice-fabric",
        order: 0,
        title: "Grid & snap practice",
        subtitle: "Train the eye",
        kind: "practice",
        etaMinutes: 12,
        difficulty: "beginner",
        xp: 30,
        exploreHref: "/studio",
        sections: [
          {
            id: "grid",
            title: "Align to the grid",
            what: "Move and rotate a pattern until it snaps within tolerance.",
            why: "Studio overlays only help if you can judge alignment.",
            how: [
              "Enable the alignment grid.",
              "Nudge scale, rotation, and position.",
              "Hit the target zone to score.",
            ],
            commonMistakes: [
              "Scaling without checking rotation first.",
            ],
            proTips: [
              "Fix rotation, then position, then fine scale.",
            ],
            interactive: "fabric-align-practice",
            practicePrompt: "Reach an alignment score ≥ 80.",
          },
        ],
      },
      {
        id: "s7-overlay",
        stageId: "practice-fabric",
        order: 1,
        title: "Overlay comparison",
        subtitle: "Match the master placement",
        kind: "practice",
        etaMinutes: 14,
        difficulty: "intermediate",
        xp: 35,
        exploreHref: "/studio",
        sections: [
          {
            id: "compare",
            title: "Ghost overlay",
            what: "Match your overlay to a hidden correct placement.",
            why: "Comparison trains precision you will use on real cloth.",
            how: [
              "Adjust until the accuracy meter turns teal.",
              "Reveal the comparison when ready.",
              "Retry for a higher score.",
            ],
            commonMistakes: [
              "Ignoring opacity — you need to see the cloth underneath.",
            ],
            proTips: [
              "Lower opacity while aligning; raise it to verify.",
            ],
            interactive: "fabric-align-practice",
            practicePrompt: "Score ≥ 90 on comparison mode.",
          },
        ],
      },
      {
        id: "s7-realtime",
        stageId: "practice-fabric",
        order: 2,
        title: "Real-time hint run",
        subtitle: "Hints while you align",
        kind: "practice",
        etaMinutes: 10,
        difficulty: "advanced",
        xp: 40,
        exploreHref: "/studio",
        sections: [
          {
            id: "live",
            title: "Live coaching",
            what: "Follow real-time hints to finish a tight alignment.",
            why: "Advanced layouts leave little margin for error.",
            how: [
              "Watch hint chips for rotate / move / scale.",
              "Snap guides appear near the target.",
              "Lock in when the score clears the bar.",
            ],
            commonMistakes: [
              "Fighting the hint instead of making the smallest correction.",
            ],
            proTips: [
              "One axis at a time — the meter will tell you when to stop.",
            ],
            interactive: "fabric-align-practice",
            practicePrompt: "Clear the advanced target with hints on.",
          },
        ],
      },
    ],
  },
  {
    id: "complete-project",
    order: 8,
    title: "Complete Project",
    subtitle: "Stage 8 · Full blouse",
    description:
      "Guided blouse workflow: measure → draft → fabric → journal → review.",
    icon: "project",
    etaMinutes: 60,
    lessons: [
      {
        id: "s8-measure",
        stageId: "complete-project",
        order: 0,
        title: "Project measurements",
        subtitle: "Capture the chart",
        kind: "project",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 30,
        exploreHref: "/measurements",
        sections: [
          {
            id: "chart",
            title: "Build the chart",
            what: "Confirm the core measurements for your blouse project.",
            why: "The journal project starts with a trustworthy chart.",
            how: [
              "Revisit Bust, Waist, Hip, Shoulder, Neck, Apex Distance, Apex Depth, Blouse Length.",
              "Note them for the project form.",
              "Mark this checkpoint when your chart is ready.",
            ],
            commonMistakes: [
              "Starting a project with incomplete apex data.",
            ],
            proTips: [
              "Keep units consistent — Tailor stores centimetres in the engine.",
            ],
            interactive: "project-workflow",
          },
        ],
      },
      {
        id: "s8-draft",
        stageId: "complete-project",
        order: 1,
        title: "Project draft",
        subtitle: "Run the drafting engine",
        kind: "project",
        etaMinutes: 14,
        difficulty: "intermediate",
        xp: 35,
        exploreHref: "/drafts",
        sections: [
          {
            id: "engine",
            title: "Intelligent draft",
            what: "Enter the chart in Drafts → Engine and export a draft image.",
            why: "A saved draft image becomes part of the journal record.",
            how: [
              "Open the drafting engine.",
              "Enter measurements and review auto-calcs.",
              "Export PNG for the journal attachment.",
            ],
            commonMistakes: [
              "Exporting before ease values are set.",
            ],
            proTips: [
              "Use undo/redo while exploring construction lines.",
            ],
            interactive: "project-workflow",
          },
        ],
      },
      {
        id: "s8-fabric",
        stageId: "complete-project",
        order: 2,
        title: "Project fabric alignment",
        subtitle: "Capture and overlay",
        kind: "project",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 30,
        exploreHref: "/studio",
        sections: [
          {
            id: "studio",
            title: "Studio capture",
            what: "Freeze a fabric photo and place a neckline/pattern overlay.",
            why: "Visual proof of placement belongs in the project archive.",
            how: [
              "Enable camera and freeze a frame.",
              "Choose a pattern and align with grid/snap.",
              "Save the fabric photo for the journal.",
            ],
            commonMistakes: [
              "Saving a blurry frame — light the cloth first.",
            ],
            proTips: [
              "HTTPS or localhost is required for camera access.",
            ],
            interactive: "project-workflow",
          },
        ],
      },
      {
        id: "s8-journal",
        stageId: "complete-project",
        order: 3,
        title: "Save to Journal",
        subtitle: "Archive the blouse",
        kind: "project",
        etaMinutes: 12,
        difficulty: "intermediate",
        xp: 40,
        exploreHref: "/journal",
        sections: [
          {
            id: "save",
            title: "Create the project",
            what: "Create a Journal project with measurements, draft, and fabric.",
            why: "Offline archive + export backup keeps your learning durable.",
            how: [
              "Open Journal → New project.",
              "Fill name, date, measurements, notes.",
              "Attach fabric photo and draft image if available.",
              "Save and confirm it appears in the list.",
            ],
            commonMistakes: [
              "Forgetting to export a backup after major work.",
            ],
            proTips: [
              "Use alteration notes for fitting changes after the first toile.",
            ],
            interactive: "project-workflow",
            practicePrompt: "Save at least one journal project to complete the academy path.",
          },
        ],
      },
      {
        id: "s8-review",
        stageId: "complete-project",
        order: 4,
        title: "Project review",
        subtitle: "Reflect and close",
        kind: "project",
        etaMinutes: 10,
        difficulty: "advanced",
        xp: 35,
        sections: [
          {
            id: "review",
            title: "Review checklist",
            what: "Walk a professional review of your completed blouse project.",
            why: "Reflection turns one project into lasting craft judgment.",
            how: [
              "Confirm measurements were complete.",
              "Confirm draft formulas were checked.",
              "Confirm fabric grain and placement were considered.",
              "Note one improvement for the next blouse.",
            ],
            commonMistakes: [
              "Closing the project without writing observations.",
            ],
            proTips: [
              "Your Learning Hub streak and XP already tracked the journey — celebrate it.",
            ],
            interactive: "project-workflow",
          },
        ],
      },
    ],
  },
];

export const ALL_JOURNEY_LESSONS: JourneyLesson[] = JOURNEY_STAGES.flatMap(
  (stage) => stage.lessons,
);

export const JOURNEY_LESSON_MAP = Object.fromEntries(
  ALL_JOURNEY_LESSONS.map((lesson) => [lesson.id, lesson]),
) as Record<string, JourneyLesson>;

export const JOURNEY_STAGE_MAP = Object.fromEntries(
  JOURNEY_STAGES.map((stage) => [stage.id, stage]),
) as Record<JourneyStageId, JourneyStage>;

export const FIRST_LESSON_ID = ALL_JOURNEY_LESSONS[0]?.id ?? "s1-basics";

export function totalJourneyEtaMinutes(): number {
  return JOURNEY_STAGES.reduce((sum, stage) => sum + stage.etaMinutes, 0);
}

export function remainingEtaMinutes(completedLessonIds: Set<string>): number {
  return ALL_JOURNEY_LESSONS.filter((lesson) => !completedLessonIds.has(lesson.id)).reduce(
    (sum, lesson) => sum + lesson.etaMinutes,
    0,
  );
}
