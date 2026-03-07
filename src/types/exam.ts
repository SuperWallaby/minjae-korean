/* =========================================================
 * Interactive Korean (TOPIK-style) Assessment Schema (TS)
 * - Placement (등급 받기) + Level Tests (등급별 시험) + Banks
 * - Listening-heavy friendly (audio-first items, replay rules)
 * - Normalize item bank + delivery blueprint (shuffle/sections)
 * - Attempts + grading + skill/tag analytics
 * ========================================================= */

/** ---------------------------
 *  Primitives
 * -------------------------- */

export type ID = string;
export type ISODateString = string; // e.g. "2026-03-05T12:34:56Z"

export type Locale = "ko" | "en" | "id" | "vi" | "th" | "ja" | "zh";
export type Level = "A0" | "A1" | "A2" | "B1" | "B2"; // map to TOPIK later if needed
export type Skill = "listening" | "reading" | "writing" | "speaking" | "vocab" | "grammar";
export type Difficulty = 1 | 2 | 3 | 4 | 5; // internal difficulty granularity

export interface Tag {
  id: ID;
  label: string; // e.g. "Particles", "Honorifics", "TOPIK I", "A1"
  kind?: "level" | "grammar" | "skill" | "topic" | "exam" | "other";
}

/** Localizable text */
export type LocalizedText = {
  default: string;
  translations?: Partial<Record<Locale, string>>;
};

/** Small rich blocks (upgrade to block-JSON later if you want) */
export type RichBlock =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "dialog"; turns: { speaker: string; text: string }[] };

export interface LocalizedRichContent {
  default: RichBlock[];
  translations?: Partial<Record<Locale, RichBlock[]>>;
}

/** ---------------------------
 *  Media
 * -------------------------- */

export type MediaKind = "audio" | "image";

export interface MediaAsset {
  id: ID;
  kind: MediaKind;
  url: string; // CDN path
  mime?: string; // "audio/mpeg"
  durationSec?: number; // audio
  width?: number; // image
  height?: number; // image
  alt?: LocalizedText;
}

/** Listening policies (useful for TOPIK-ish listening) */
export interface ListeningPolicy {
  replayLimit?: number; // e.g. 1, 2, 999
  allowSeek?: boolean; // usually false for tests
  autoPlay?: boolean; // often true for listening sections
  gapAfterSec?: number; // time gap after audio ends before enabling answer
}

/** ---------------------------
 *  Product model: Exams & Blueprints
 * -------------------------- */

export type ExamKind = "placement" | "level_test" | "topic_quiz" | "mock_topik";

/** High-level container shown to users */
export interface Exam {
  id: ID;
  slug: string;
  title: string;
  description?: string;
  kind: ExamKind;
  uiLocale: Locale;
  targetLevel?: Level;
  blueprint: ExamBlueprint;
  tags?: Tag[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  version: number;
}

export interface ExamBlueprint {
  timeLimitSec?: number;
  shuffleSections?: boolean;
  sections: ExamSectionBlueprint[];
  placementRule?: PlacementRule;
  gradingRule?: ExamGradingRule;
}

export interface ExamSectionBlueprint {
  id: ID;
  title?: string;
  description?: string;
  skill?: Skill;
  timeLimitSec?: number;
  shuffleItems?: boolean;
  source: SectionItemSource;
  weight?: number;
  listeningPolicy?: ListeningPolicy;
}

export type SectionItemSource =
  | { type: "explicit"; itemIds: ID[] }
  | {
      type: "query";
      bankId: ID;
      limit: number;
      filter?: {
        levels?: Level[];
        skills?: Skill[];
        tagsAny?: ID[];
        tagsAll?: ID[];
        difficultyMin?: Difficulty;
        difficultyMax?: Difficulty;
        types?: ItemType[];
        hasAudio?: boolean;
      };
      balance?: {
        byType?: Partial<Record<ItemType, number>>;
        byDifficulty?: Partial<Record<Difficulty, number>>;
      };
    };

export interface PlacementRule {
  byTotalPercent: { minInclusive: number; level: Level }[];
  constraints?: { minSkillPercent?: Partial<Record<Skill, number>> };
}

export interface ExamGradingRule {
  showPercent?: boolean;
  passThresholdPercent?: number;
  bands?: { label: string; minScoreInclusive: number }[];
}

/** ---------------------------
 *  Item Banks
 * -------------------------- */

export interface ItemBank {
  id: ID;
  title: string;
  locale: Locale;
  description?: string;
  items: AssessmentItem[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
  version: number;
}

/** ---------------------------
 *  Items (question types)
 * -------------------------- */

export type ItemType =
  | "mcq"
  | "multi_select"
  | "short_answer"
  | "cloze"
  | "reorder_tokens"
  | "dictation"
  | "audio_mcq"
  | "match_pairs"
  | "true_false";

export interface ItemUI {
  layout?: "stack" | "grid2" | "grid3";
  showQuestionIndex?: boolean;
  showTimer?: boolean;
  reveal?: { correctAnswerOnSubmit?: boolean; explanationOnSubmit?: boolean };
}

export interface ItemStem {
  instruction: LocalizedText;
  content?: LocalizedRichContent;
  media?: MediaAsset[];
  contextNote?: LocalizedText;
}

export interface ItemExplanation {
  rationale?: LocalizedRichContent;
  commonMistakes?: { pattern: string; note: LocalizedText }[];
  links?: { label: string; href: string }[];
}

export interface ItemScoring {
  points: number;
  autoGrade: boolean;
  partialCredit?: PartialCreditPolicy;
  key: ScoringKey;
}

export type PartialCreditPolicy =
  | { mode: "none" }
  | { mode: "by_unit"; unitPoints?: number }
  | { mode: "proportional" };

export type ScoringKey =
  | MCQKey
  | MultiSelectKey
  | ShortAnswerKey
  | ClozeKey
  | ReorderTokensKey
  | DictationKey
  | MatchPairsKey
  | TrueFalseKey;

export interface AssessmentItemBase {
  id: ID;
  type: ItemType;
  level?: Level;
  skill?: Skill;
  difficulty?: Difficulty;
  tags?: Tag[];
  stem: ItemStem;
  ui?: ItemUI;
  scoring: ItemScoring;
  explanation?: ItemExplanation;
  meta?: {
    author?: string;
    source?: string;
    createdAt?: ISODateString;
    updatedAt?: ISODateString;
  };
}

export interface Option {
  id: ID;
  text: LocalizedText;
  media?: MediaAsset[];
}

export interface MCQItem extends AssessmentItemBase {
  type: "mcq";
  interaction: { options: Option[] };
  scoring: ItemScoring & { key: MCQKey };
}
export interface MCQKey {
  kind: "mcq";
  correctOptionId: ID;
}

export interface MultiSelectItem extends AssessmentItemBase {
  type: "multi_select";
  interaction: {
    options: Option[];
    minSelect?: number;
    maxSelect?: number;
  };
  scoring: ItemScoring & { key: MultiSelectKey };
}
export interface MultiSelectKey {
  kind: "multi_select";
  correctOptionIds: ID[];
  wrongPenalty?: number;
}

export interface ShortAnswerItem extends AssessmentItemBase {
  type: "short_answer";
  interaction: {
    placeholder?: LocalizedText;
    inputMode?: "text" | "hangul";
    maxLength?: number;
  };
  scoring: ItemScoring & { key: ShortAnswerKey };
}
export interface ShortAnswerKey {
  kind: "short_answer";
  accepted: string[];
  normalize?: {
    trim?: boolean;
    collapseSpaces?: boolean;
    ignorePunctuation?: boolean;
    caseFold?: boolean;
  };
  typoTolerance?: { maxLevenshtein?: number };
}

export interface ClozeItem extends AssessmentItemBase {
  type: "cloze";
  interaction: {
    template: LocalizedText;
    blanks: {
      id: ID;
      placeholder?: string;
      choices?: Option[];
    }[];
  };
  scoring: ItemScoring & { key: ClozeKey };
}
export interface ClozeKey {
  kind: "cloze";
  answersByBlankId: Record<ID, string[] | { optionIds: ID[] }>;
}

export interface ReorderTokensItem extends AssessmentItemBase {
  type: "reorder_tokens";
  interaction: { tokens: string[]; separator?: "space" | "none" };
  scoring: ItemScoring & { key: ReorderTokensKey };
}
export interface ReorderTokensKey {
  kind: "reorder_tokens";
  correctSequence: string[];
  allowAlternate?: string[][];
}

export interface DictationItem extends AssessmentItemBase {
  type: "dictation";
  interaction: { audio: MediaAsset; listeningPolicy?: ListeningPolicy };
  scoring: ItemScoring & { key: DictationKey };
}
export interface DictationKey {
  kind: "dictation";
  acceptedTranscripts: string[];
  normalize?: ShortAnswerKey["normalize"];
  typoTolerance?: ShortAnswerKey["typoTolerance"];
}

export interface AudioMCQItem extends AssessmentItemBase {
  type: "audio_mcq";
  interaction: {
    audio: MediaAsset;
    options: Option[];
    listeningPolicy?: ListeningPolicy;
  };
  scoring: ItemScoring & { key: MCQKey };
}

export interface MatchPairsItem extends AssessmentItemBase {
  type: "match_pairs";
  interaction: {
    left: { id: ID; text: LocalizedText }[];
    right: { id: ID; text: LocalizedText }[];
    mode?: "drag" | "dropdown";
  };
  scoring: ItemScoring & { key: MatchPairsKey };
}
export interface MatchPairsKey {
  kind: "match_pairs";
  pairs: { leftId: ID; rightId: ID }[];
}

export interface TrueFalseItem extends AssessmentItemBase {
  type: "true_false";
  interaction: { statement: LocalizedText };
  scoring: ItemScoring & { key: TrueFalseKey };
}
export interface TrueFalseKey {
  kind: "true_false";
  correct: boolean;
}

export type AssessmentItem =
  | MCQItem
  | MultiSelectItem
  | ShortAnswerItem
  | ClozeItem
  | ReorderTokensItem
  | DictationItem
  | AudioMCQItem
  | MatchPairsItem
  | TrueFalseItem;

/** ---------------------------
 *  Attempt / Session
 * -------------------------- */

export type AttemptStatus = "in_progress" | "submitted" | "expired";

export interface Attempt {
  id: ID;
  examId: ID;
  userId?: ID;
  status: AttemptStatus;
  startedAt: ISODateString;
  submittedAt?: ISODateString;
  order: {
    sectionIds: ID[];
    itemIdsBySectionId: Record<ID, ID[]>;
  };
  responses: Record<ID, ItemResponse>;
  timers?: {
    examRemainingSec?: number;
    sectionRemainingSec?: Record<ID, number>;
  };
  grading?: AttemptGrading;
}

export type ItemResponse =
  | { type: "mcq"; optionId: ID }
  | { type: "multi_select"; optionIds: ID[] }
  | { type: "short_answer"; text: string }
  | { type: "cloze"; answersByBlankId: Record<ID, string> }
  | { type: "reorder_tokens"; sequence: string[] }
  | { type: "dictation"; text: string }
  | { type: "audio_mcq"; optionId: ID }
  | { type: "match_pairs"; pairs: { leftId: ID; rightId: ID }[] }
  | { type: "true_false"; value: boolean };

export interface AttemptGrading {
  totalPoints: number;
  earnedPoints: number;
  percent: number;
  placement?: { level: Level; rationale?: string };
  byItem: Record<
    ID,
    {
      earned: number;
      max: number;
      correct: boolean;
      feedback?: LocalizedText;
      skill?: Skill;
      level?: Level;
      tagIds?: ID[];
    }
  >;
  bySkill?: Partial<Record<Skill, { earned: number; max: number; percent: number }>>;
  byTag?: Record<ID, { earned: number; max: number; percent: number }>;
  bandLabel?: string;
}

export type TopikTrack = "TOPIK_I" | "TOPIK_II";

export interface TopikProfile {
  track: TopikTrack;
  sectionWeights?: Partial<Record<Skill, number>>;
  bands?: { grade: 1 | 2 | 3 | 4 | 5 | 6; minScoreInclusive: number }[];
}
