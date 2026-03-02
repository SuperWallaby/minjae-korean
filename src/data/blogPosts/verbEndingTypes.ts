/**
 * Types for Korean verb ending table data (blog: Korean verb endings).
 */

export type VerbEndingExample = {
  text: string;
  meaning: string;
  feeling: string;
  sound?: string;
};

export type VerbEndingEntry = {
  form: string;
  phonetic: string;
  frequency: number;
  meaning: string;
  type: string;
  form_rule: string;
  verb_type: string;
  /** When set, used as the single description (meta). Otherwise subject/tense/nuance are shown. */
  des?: string;
  subject_constraint?: string;
  tense_constraint?: string;
  nuance?: string;
  core_meaning: string;
  function: string;
  examples: VerbEndingExample[];
};

export type VerbEndingData = VerbEndingEntry[];
