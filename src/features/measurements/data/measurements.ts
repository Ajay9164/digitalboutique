export type MeasurementId =
  | "bust"
  | "upper-bust"
  | "waist"
  | "hip"
  | "shoulder"
  | "front-shoulder"
  | "back-shoulder"
  | "armhole"
  | "arm-round"
  | "sleeve-length"
  | "elbow"
  | "wrist"
  | "neck"
  | "front-neck"
  | "back-neck"
  | "princess-length"
  | "katori-height"
  | "cross-front"
  | "cross-back"
  | "apex"
  | "apex-distance"
  | "blouse-length"
  | "dart-point";

export type MeasurementKind = "girth" | "length" | "point";

/** 2D overlay drawn on the SVG illustration (viewBox 0 0 200 260). */
export type IllustrationOverlay =
  | { kind: "band"; y: number; halfWidth: number }
  | { kind: "hline"; y: number; x1: number; x2: number }
  | { kind: "vline"; x: number; y1: number; y2: number }
  | { kind: "curve"; d: string }
  | { kind: "dot"; x: number; y: number };

export type MeasurementGuide = {
  id: MeasurementId;
  label: string;
  group: string;
  kind: MeasurementKind;
  definition: string;
  purpose: string;
  whyItMatters: string;
  howToMeasure: string[];
  proTips: string[];
  commonMistakes: string[];
  tools: string[];
  checkpoints: string[];
  /** Typical adult range in centimeters, when meaningful. */
  typicalRangeCm?: [number, number];
  illustration: IllustrationOverlay;
};

export const MEASUREMENT_GROUPS = [
  "Core girths",
  "Shoulders & back",
  "Arms",
  "Neck",
  "Blouse drafting",
] as const;

export const MEASUREMENTS: MeasurementGuide[] = [
  {
    id: "bust",
    label: "Bust",
    group: "Core girths",
    kind: "girth",
    definition:
      "The circumference of the torso at the fullest part of the bust, passing over the apex points.",
    purpose:
      "Sets the base width of every bodice, blouse, and fitted top pattern.",
    whyItMatters:
      "Almost every other bodice measurement is proportioned from the bust. An error here multiplies through the whole draft.",
    howToMeasure: [
      "Have the client stand relaxed, arms at the sides, wearing a well-fitting bra.",
      "Wrap the tape around the back, across the shoulder blades, and over the fullest part of the bust.",
      "Keep the tape parallel to the floor all the way around.",
      "Read the tape at normal exhale — snug but never compressing.",
    ],
    proTips: [
      "Check the tape level in a mirror or from the side; it often dips at the back.",
      "For a full bust, take the reading at the end of a relaxed exhale.",
      "Record bra style worn during measuring — it changes the reading.",
    ],
    commonMistakes: [
      "Pulling the tape tight enough to flatten the bust.",
      "Letting the tape ride up on the back.",
      "Measuring over bulky clothing.",
    ],
    tools: ["Flexible measuring tape", "Elastic to mark the level", "Mirror"],
    checkpoints: [
      "Tape passes over both apex points",
      "Tape level and parallel to the floor",
      "One finger fits comfortably under the tape",
    ],
    typicalRangeCm: [78, 110],
    illustration: { kind: "band", y: 96, halfWidth: 42 },
  },
  {
    id: "upper-bust",
    label: "Upper Bust",
    group: "Core girths",
    kind: "girth",
    definition:
      "The circumference of the torso directly above the bust, high under the arms.",
    purpose:
      "Used with the bust measurement to judge cup fullness and choose the right dart size.",
    whyItMatters:
      "The difference between upper bust and bust tells you how much shaping the front pattern needs — the key to a gape-free neckline.",
    howToMeasure: [
      "Wrap the tape around the torso just above the bust, under the armpits.",
      "Keep the tape snug and higher at the front than a bust tape would sit.",
      "Read while the client breathes normally.",
    ],
    proTips: [
      "A bust minus upper-bust difference above 7.5 cm (3\") usually calls for a full-bust adjustment.",
      "Ask the client to lift arms slightly to seat the tape, then lower arms before reading.",
    ],
    commonMistakes: [
      "Taking it at the same level as the bust tape.",
      "Letting the tape slide down at the back.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Tape sits above breast tissue at the front",
      "Arms are down when the reading is taken",
    ],
    typicalRangeCm: [74, 102],
    illustration: { kind: "band", y: 84, halfWidth: 40 },
  },
  {
    id: "waist",
    label: "Waist",
    group: "Core girths",
    kind: "girth",
    definition:
      "The circumference at the natural waist — the narrowest part of the torso, usually just above the navel.",
    purpose:
      "Controls fit through the midriff and anchors darts, seams, and waistbands.",
    whyItMatters:
      "The waist is where garments settle. If this reading is off, hems tilt and darts land in the wrong place.",
    howToMeasure: [
      "Tie a narrow elastic around the torso and let the client bend side to side — it settles at the natural waist.",
      "Measure over the elastic, keeping the tape parallel to the floor.",
      "Read snug, without pressing into the flesh.",
    ],
    proTips: [
      "Never trust the waistband of trousers as the waist level.",
      "Ask the client not to pull in their stomach — a friendly chat helps them relax.",
    ],
    commonMistakes: [
      "Measuring at the belly button instead of the narrowest point.",
      "Client holding their breath during the reading.",
    ],
    tools: ["Flexible measuring tape", "Narrow elastic"],
    checkpoints: [
      "Elastic settled naturally before measuring",
      "Reading taken mid-breath, tape level",
    ],
    typicalRangeCm: [60, 95],
    illustration: { kind: "band", y: 130, halfWidth: 32 },
  },
  {
    id: "hip",
    label: "Hip",
    group: "Core girths",
    kind: "girth",
    definition:
      "The circumference around the fullest part of the hips and seat, typically 18–23 cm below the waist.",
    purpose:
      "Defines the lower width of blouses, kurtis, dresses, and all bottom-wear.",
    whyItMatters:
      "A garment must pass over the hip to be worn. Underestimating here means the piece will not close, however good the rest of the draft is.",
    howToMeasure: [
      "Have the client stand with feet together.",
      "Wrap the tape around the fullest part of the seat, checking the side profile.",
      "Keep the tape level and note the distance from waist to this level.",
    ],
    proTips: [
      "Measure at two or three heights and keep the largest reading.",
      "Record the waist-to-hip depth as well — drafting needs both.",
    ],
    commonMistakes: [
      "Measuring at a fixed height instead of the visually fullest point.",
      "Tape dipping at the back below the seat.",
    ],
    tools: ["Flexible measuring tape", "Full-length mirror"],
    checkpoints: [
      "Feet together, weight even",
      "Tape passes over the fullest part of the seat",
    ],
    typicalRangeCm: [84, 118],
    illustration: { kind: "band", y: 168, halfWidth: 44 },
  },
  {
    id: "shoulder",
    label: "Shoulder",
    group: "Shoulders & back",
    kind: "length",
    definition:
      "The length of one shoulder from the base of the neck to the shoulder bone (acromion), following the slope.",
    purpose:
      "Sets the shoulder seam length so sleeves hang from the correct point.",
    whyItMatters:
      "A seam that overshoots the shoulder bone drops the whole sleeve; one that stops short pulls and restricts arm movement.",
    howToMeasure: [
      "Find the neck base point where a fine chain would rest.",
      "Find the sharp corner of the shoulder bone by having the client raise the arm slightly — a dimple appears at the joint.",
      "Measure between the two points along the top of the shoulder.",
    ],
    proTips: [
      "Mark both endpoints with tailor's chalk before measuring.",
      "Measure both shoulders — many people are asymmetric by up to 1 cm.",
    ],
    commonMistakes: [
      "Starting from the middle of the neck instead of its base.",
      "Following a straight air-line instead of the body's slope.",
    ],
    tools: ["Flexible measuring tape", "Tailor's chalk"],
    checkpoints: [
      "Endpoints marked at neck base and shoulder bone",
      "Both sides measured and recorded separately",
    ],
    typicalRangeCm: [11, 16],
    illustration: { kind: "hline", y: 52, x1: 100, x2: 146 },
  },
  {
    id: "front-shoulder",
    label: "Front Shoulder",
    group: "Shoulders & back",
    kind: "length",
    definition:
      "The width across the front from one shoulder bone to the other, measured over the upper chest.",
    purpose:
      "Checks the front bodice width at shoulder level and balances it against the back.",
    whyItMatters:
      "If the front shoulder width is drafted too wide, the neckline gapes; too narrow and the armhole cuts forward into the chest.",
    howToMeasure: [
      "Locate the shoulder bone point on each side.",
      "Measure straight across the front, over the collarbones, between the two points.",
      "Keep the tape lightly touching the body, not bridging.",
    ],
    proTips: [
      "Compare with the back shoulder width — front is normally 1–2 cm narrower on balanced posture.",
    ],
    commonMistakes: [
      "Measuring too low, across the bust instead of the upper chest.",
      "Letting the tape float in a straight line off the body.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Tape passes over the collarbones",
      "Same endpoint markings used as the shoulder measurement",
    ],
    typicalRangeCm: [30, 40],
    illustration: { kind: "hline", y: 60, x1: 58, x2: 142 },
  },
  {
    id: "back-shoulder",
    label: "Back Shoulder",
    group: "Shoulders & back",
    kind: "length",
    definition:
      "The width across the back from one shoulder bone to the other, measured over the shoulder blades' top.",
    purpose:
      "Sets the back bodice width at shoulder level and the placement of back darts or ease.",
    whyItMatters:
      "The back shoulder carries reach movement. Too tight here and the garment strains when the arms move forward.",
    howToMeasure: [
      "Have the client stand naturally, arms relaxed.",
      "Measure across the back between the two shoulder bone points.",
      "Keep the tape straight and level across the upper back.",
    ],
    proTips: [
      "Take the reading with arms relaxed and again with arms slightly forward; keep both for ease planning.",
    ],
    commonMistakes: [
      "Measuring with rounded, slouched posture without noting it.",
      "Confusing this with the cross back, which sits lower.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Posture natural, arms at the sides",
      "Reading distinct from cross back (taken higher)",
    ],
    typicalRangeCm: [32, 42],
    illustration: { kind: "hline", y: 56, x1: 56, x2: 144 },
  },
  {
    id: "armhole",
    label: "Armhole",
    group: "Arms",
    kind: "girth",
    definition:
      "The circumference around the arm joint — over the shoulder bone, around the front of the arm, under the armpit, and back over the shoulder.",
    purpose:
      "Determines the size of the armhole (armscye) curve and the sleeve cap that must fit into it.",
    whyItMatters:
      "Armhole and sleeve cap must agree. A mismatch causes puckering, binding at the underarm, or a sleeve that twists.",
    howToMeasure: [
      "Client stands with the arm relaxed at the side.",
      "Pass the tape over the shoulder point, down the front of the joint, under the armpit, and back up.",
      "Keep the tape comfortably snug — this is a movement zone.",
    ],
    proTips: [
      "Add ease during drafting, never during measuring.",
      "Check the reading twice; the tape twists easily here.",
    ],
    commonMistakes: [
      "Measuring with the arm lifted, which enlarges the reading.",
      "Letting the tape slide off the shoulder point.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Arm fully relaxed at the side",
      "Tape passes exactly over the shoulder bone point",
    ],
    typicalRangeCm: [36, 48],
    illustration: { kind: "curve", d: "M 142 52 C 158 62 158 84 144 92" },
  },
  {
    id: "arm-round",
    label: "Arm Round",
    group: "Arms",
    kind: "girth",
    definition:
      "The circumference of the upper arm at its fullest point, usually mid-bicep.",
    purpose: "Sets the width of the sleeve through the upper arm.",
    whyItMatters:
      "Sleeves that grip the bicep are the most common comfort complaint in fitted blouses. This reading prevents it.",
    howToMeasure: [
      "With the arm relaxed and slightly bent, wrap the tape around the fullest part of the upper arm.",
      "Keep the tape level around the arm, snug but soft.",
    ],
    proTips: [
      "Measure the dominant arm — it is usually slightly larger.",
      "For fitted sleeves, also note the reading with the bicep flexed.",
    ],
    commonMistakes: [
      "Measuring with the arm held straight and tense.",
      "Taking the reading too close to the armpit.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Arm relaxed, slightly bent",
      "Fullest point of the bicep located first",
    ],
    typicalRangeCm: [24, 36],
    illustration: { kind: "hline", y: 88, x1: 152, x2: 176 },
  },
  {
    id: "sleeve-length",
    label: "Sleeve Length",
    group: "Arms",
    kind: "length",
    definition:
      "The distance from the shoulder bone point down the outside of the arm to the desired sleeve end.",
    purpose: "Sets where the sleeve hem falls on the arm.",
    whyItMatters:
      "Sleeve length is instantly visible. Even 1 cm past or short of the intended point reads as a fitting error.",
    howToMeasure: [
      "Start the tape at the shoulder bone point.",
      "Run it down the outside of a slightly bent arm.",
      "Stop at the design point: short sleeve, elbow, three-quarter, or wrist.",
    ],
    proTips: [
      "Measure with the elbow slightly bent so movement ease is built in.",
      "Record multiple stop points in one pass (short / elbow / full).",
    ],
    commonMistakes: [
      "Measuring a dead-straight arm, which shortens working length.",
      "Running the tape along the inside of the arm.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: [
      "Elbow slightly bent during measuring",
      "Design stop point agreed with the client",
    ],
    typicalRangeCm: [15, 60],
    illustration: { kind: "vline", x: 164, y1: 56, y2: 140 },
  },
  {
    id: "elbow",
    label: "Elbow",
    group: "Arms",
    kind: "girth",
    definition: "The circumference around the elbow joint, taken with the arm slightly bent.",
    purpose:
      "Controls sleeve width at the elbow for three-quarter and full sleeves.",
    whyItMatters:
      "The elbow expands when bent. A sleeve drafted on a straight-arm reading locks the arm and creases badly.",
    howToMeasure: [
      "Bend the arm to about 90 degrees.",
      "Wrap the tape around the point of the elbow.",
      "Read snug — the bent position already includes working room.",
    ],
    proTips: [
      "For fitted sleeves, also mark the shoulder-to-elbow distance in the same session.",
    ],
    commonMistakes: [
      "Measuring the arm held straight.",
      "Placing the tape above or below the joint.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Arm bent ~90° during the reading", "Tape crosses the elbow point"],
    typicalRangeCm: [22, 32],
    illustration: { kind: "hline", y: 110, x1: 154, x2: 176 },
  },
  {
    id: "wrist",
    label: "Wrist",
    group: "Arms",
    kind: "girth",
    definition: "The circumference around the wrist, just below the wrist bone.",
    purpose: "Sets the sleeve opening for full-length fitted sleeves and cuffs.",
    whyItMatters:
      "The hand must pass through the opening unless a placket is planned — this reading decides which.",
    howToMeasure: [
      "Wrap the tape around the wrist just below the protruding wrist bone.",
      "Keep it snug but not tight.",
    ],
    proTips: [
      "Also measure around the widest part of the hand if there is no placket or closure planned.",
    ],
    commonMistakes: [
      "Measuring over the wrist bone, inflating the reading.",
      "Forgetting the hand-width check for closed cuffs.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Tape below the wrist bone", "Hand passage confirmed for closed openings"],
    typicalRangeCm: [14, 19],
    illustration: { kind: "hline", y: 138, x1: 158, x2: 174 },
  },
  {
    id: "neck",
    label: "Neck",
    group: "Neck",
    kind: "girth",
    definition: "The circumference around the base of the neck, where a collar would sit.",
    purpose: "Sets the neckline circumference and collar length.",
    whyItMatters:
      "Necklines cut on a wrong neck reading either choke or slide off the shoulders — both are unwearable.",
    howToMeasure: [
      "Wrap the tape around the base of the neck, touching the collarbone points at the front.",
      "Hold one finger inside the tape for wearing ease.",
    ],
    proTips: [
      "Follow the natural crease that appears when the client tilts the head slightly forward.",
    ],
    commonMistakes: [
      "Measuring the middle of the neck instead of the base.",
      "Reading too tight with no ease allowance.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Tape at the neck base crease", "One finger of ease inside the tape"],
    typicalRangeCm: [30, 40],
    illustration: { kind: "band", y: 36, halfWidth: 14 },
  },
  {
    id: "front-neck",
    label: "Front Neck",
    group: "Neck",
    kind: "length",
    definition:
      "The depth of the front neckline, from the neck base at the shoulder down to the desired lowest point at center front.",
    purpose: "Sets the front neckline depth of a blouse or kurti.",
    whyItMatters:
      "Front neck depth is a style decision made on the body — measuring it live prevents necklines that feel too revealing or too high once sewn.",
    howToMeasure: [
      "Hold the tape at the neck base beside the shoulder.",
      "Drop vertically to the chosen depth at center front.",
      "Confirm the depth visually with the client using a mirror.",
    ],
    proTips: [
      "Have the client sit and bend forward slightly before finalizing a deep neckline.",
    ],
    commonMistakes: [
      "Deciding depth on the table instead of on the body.",
      "Measuring from the shoulder seam instead of the neck base.",
    ],
    tools: ["Flexible measuring tape", "Mirror"],
    checkpoints: ["Client approved the depth in a mirror", "Depth tested in a seated position"],
    typicalRangeCm: [15, 25],
    illustration: { kind: "curve", d: "M 84 40 Q 100 78 116 40" },
  },
  {
    id: "back-neck",
    label: "Back Neck",
    group: "Neck",
    kind: "length",
    definition:
      "The depth of the back neckline from the prominent neck bone (C7) down to the desired point at center back.",
    purpose: "Sets the back neckline depth, a signature style line in blouses.",
    whyItMatters:
      "Deep back necks need careful support drafting; the live measurement tells you exactly how much structure is required.",
    howToMeasure: [
      "Find the prominent bone at the back of the neck (bend the head forward — it stands out).",
      "Measure straight down the center back to the chosen depth.",
    ],
    proTips: [
      "For very deep backs, plan the strap or band placement while the client is present.",
    ],
    commonMistakes: [
      "Starting from the hairline instead of the neck bone.",
      "Ignoring bra-line visibility at the chosen depth.",
    ],
    tools: ["Flexible measuring tape", "Tailor's chalk"],
    checkpoints: ["C7 bone located as the start point", "Bra line checked against the depth"],
    typicalRangeCm: [8, 30],
    illustration: { kind: "curve", d: "M 84 38 Q 100 64 116 38" },
  },
  {
    id: "princess-length",
    label: "Princess Length",
    group: "Blouse drafting",
    kind: "length",
    definition:
      "The distance from the mid-shoulder, over the bust apex, down to the waistline — the path of a princess seam.",
    purpose: "Drafts princess-line panels and checks bodice balance over the bust.",
    whyItMatters:
      "Princess seams shape the bodice without darts. If this length is short, the seam lifts the hem over the bust; if long, the panel collapses.",
    howToMeasure: [
      "Start at the middle of the shoulder line.",
      "Run the tape over the bust apex.",
      "Continue straight down to the waist elastic.",
    ],
    proTips: [
      "Keep the tape touching the body over the bust curve — do not bridge from apex to waist.",
    ],
    commonMistakes: [
      "Missing the apex and running the tape inside or outside it.",
      "Stopping at the underbust instead of the waist.",
    ],
    tools: ["Flexible measuring tape", "Waist elastic"],
    checkpoints: ["Tape passes exactly over the apex", "End point on the settled waist elastic"],
    typicalRangeCm: [36, 46],
    illustration: { kind: "curve", d: "M 112 50 Q 122 96 112 130" },
  },
  {
    id: "katori-height",
    label: "Katori Height",
    group: "Blouse drafting",
    kind: "length",
    definition:
      "The height of the katori (cup section) of a blouse — from the bust apex down to the underbust line.",
    purpose: "Shapes the cup panel of katori-style blouses.",
    whyItMatters:
      "The katori must cradle the bust exactly. Wrong height means the cup seam sits on the bust instead of under it.",
    howToMeasure: [
      "Locate the apex point.",
      "Measure straight down from the apex to the crease where the bust meets the ribcage.",
    ],
    proTips: [
      "Take this with a well-fitted bra of the style the blouse will be worn with.",
    ],
    commonMistakes: [
      "Measuring to the waist instead of the underbust crease.",
      "Using a different bra than the one intended for wear.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Same bra as final wear", "End point at the underbust crease, not lower"],
    typicalRangeCm: [7, 12],
    illustration: { kind: "vline", x: 112, y1: 96, y2: 114 },
  },
  {
    id: "cross-front",
    label: "Cross Front",
    group: "Shoulders & back",
    kind: "length",
    definition:
      "The width across the front chest between the two front armhole creases, about 7–8 cm below the neck base.",
    purpose: "Sets the front armhole position so it clears the chest.",
    whyItMatters:
      "This is the reading that stops armholes cutting into the front of the body when the arms move.",
    howToMeasure: [
      "Find the crease where each arm meets the chest.",
      "Measure straight across the front between the two creases.",
    ],
    proTips: ["Take it with arms hanging naturally, then verify with hands resting on hips."],
    commonMistakes: [
      "Measuring at bust level, which is wider and lower.",
      "Pressing the tape into the arm creases.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Level roughly 7–8 cm below neck base", "Endpoints at the arm creases, not beyond"],
    typicalRangeCm: [28, 37],
    illustration: { kind: "hline", y: 72, x1: 66, x2: 134 },
  },
  {
    id: "cross-back",
    label: "Cross Back",
    group: "Shoulders & back",
    kind: "length",
    definition:
      "The width across the back between the two back armhole creases, about 10 cm below the neck bone.",
    purpose: "Sets the back armhole position and back panel width.",
    whyItMatters:
      "Reaching forward is powered by the back. Cross back plus ease decides whether the garment allows a full hug or restricts it.",
    howToMeasure: [
      "Find the crease where each arm meets the back.",
      "Measure straight across the shoulder blades between the creases.",
    ],
    proTips: [
      "Also take the reading with arms crossed in front — the difference is your movement ease budget.",
    ],
    commonMistakes: [
      "Taking it at the same height as the front (back sits slightly lower).",
      "Including part of the arm in the reading.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["About 10 cm below the neck bone", "Arms relaxed for the base reading"],
    typicalRangeCm: [30, 40],
    illustration: { kind: "hline", y: 76, x1: 62, x2: 138 },
  },
  {
    id: "apex",
    label: "Apex",
    group: "Blouse drafting",
    kind: "point",
    definition:
      "The most prominent point of the bust — the reference point all bust shaping converges toward.",
    purpose: "Anchors dart directions, princess seams, and katori panels.",
    whyItMatters:
      "Every dart aims at the apex and stops short of it. Locate it wrongly and all shaping tilts off the body.",
    howToMeasure: [
      "With the client in the intended bra, locate the highest projection point of each bust.",
      "Mark its position by two numbers: neck-base-to-apex length and apex-to-apex distance.",
    ],
    proTips: [
      "Always record apex as a coordinate pair (down + across), never as a single number.",
    ],
    commonMistakes: [
      "Assuming the apex is symmetric on both sides without checking.",
      "Marking it over a padded bra that will not be worn later.",
    ],
    tools: ["Flexible measuring tape", "Tailor's chalk"],
    checkpoints: ["Same bra as final wear", "Both sides located and compared"],
    illustration: { kind: "dot", x: 112, y: 94 },
  },
  {
    id: "apex-distance",
    label: "Apex Distance",
    group: "Blouse drafting",
    kind: "length",
    definition: "The horizontal distance between the two bust apex points.",
    purpose: "Positions darts and princess seams symmetrically about center front.",
    whyItMatters:
      "Half of this value places each apex from center front. Errors here make one dart visibly closer to the center than the other.",
    howToMeasure: [
      "Locate both apex points.",
      "Measure straight across from one apex to the other, keeping the tape level.",
    ],
    proTips: ["Divide by two during drafting and mark each apex from center front."],
    commonMistakes: [
      "Following the bust curve instead of measuring straight across.",
      "Taking it over a bra with heavy padding.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Tape straight and level between the points", "Reading halved for drafting"],
    typicalRangeCm: [16, 24],
    illustration: { kind: "hline", y: 94, x1: 88, x2: 136 },
  },
  {
    id: "blouse-length",
    label: "Blouse Length",
    group: "Blouse drafting",
    kind: "length",
    definition:
      "The finished length of the blouse from the highest shoulder point down the front to the desired hem.",
    purpose: "Sets the hem level of the blouse.",
    whyItMatters:
      "Blouse length defines the silhouette with a saree. It must be confirmed on the body against the petticoat waistline.",
    howToMeasure: [
      "Start at the highest point of the shoulder beside the neck.",
      "Run the tape down the front, over the bust, to the chosen hem level.",
      "Check the level against where the saree or skirt will sit.",
    ],
    proTips: [
      "Measure over the bust, not beside it — the curve consumes length.",
      "Confirm the hem with the client seated as well as standing.",
    ],
    commonMistakes: [
      "Measuring down the side of the body, missing bust length.",
      "Ignoring the petticoat waist level.",
    ],
    tools: ["Flexible measuring tape"],
    checkpoints: ["Tape passes over the bust", "Hem level agreed standing and seated"],
    typicalRangeCm: [33, 42],
    illustration: { kind: "vline", x: 106, y1: 44, y2: 134 },
  },
  {
    id: "dart-point",
    label: "Dart Point",
    group: "Blouse drafting",
    kind: "point",
    definition:
      "The point where a dart ends — always short of the apex, typically 2.5–4 cm away from it.",
    purpose: "Ends bust shaping smoothly so fabric domes gently over the apex.",
    whyItMatters:
      "A dart stitched all the way to the apex creates a hard cone. Stopping at the correct dart point is what makes shaping invisible.",
    howToMeasure: [
      "Locate the apex first.",
      "Mark the dart point 2.5–4 cm back from the apex along the dart's direction.",
      "Softer, fuller busts need the larger offset.",
    ],
    proTips: [
      "Press darts over a tailor's ham so the point melts into the curve.",
      "Shorten the last stitches to almost zero and tie off — never backstitch at the point.",
    ],
    commonMistakes: [
      "Stitching darts right up to the apex.",
      "Using the same offset for every figure.",
    ],
    tools: ["Tailor's chalk", "Ruler", "Tailor's ham (for pressing)"],
    checkpoints: ["Offset chosen for the figure (2.5–4 cm)", "Dart point marked before stitching"],
    illustration: { kind: "dot", x: 104, y: 102 },
  },
];

export const MEASUREMENT_MAP: Record<MeasurementId, MeasurementGuide> =
  Object.fromEntries(MEASUREMENTS.map((m) => [m.id, m])) as Record<
    MeasurementId,
    MeasurementGuide
  >;
