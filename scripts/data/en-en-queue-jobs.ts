/** Sample EN→EN warehouse jobs for EigoSound (sound.eigopin.com). */

export type EnEnSimpleUpgradeJob = {
  id: string;
  format: "simple_upgrade";
  topicSlug: string;
  /** Easy gloss shown at top */
  simple: string;
  /** Punchier synonym / target word at bottom */
  target: string;
  /** Illustration scene — beige doodle CAPYBARA only, no text */
  scene: string;
  targetColor?: string;
};

export type EnEnOtherWaysJob = {
  id: string;
  format: "other_ways";
  topicSlug: string;
  /** Shown under "Other ways to say" */
  headline: string;
  phrases: string[];
  /** Mood for the capybara pose */
  mood: string;
  /** Pose / prop direction for the brand CAPYBARA (right side) */
  characterHint: string;
  brand?: string;
  kicker?: string;
};

/** Oneshot gpt-image-2 card: label + word + definition + scene + example */
export type EnEnSlangCardJob = {
  id: string;
  format: "slang_card";
  topicSlug: string;
  label: string;
  word: string;
  definition: string;
  example: string;
  scene: string;
  accent?: string;
};

export type EnEnJob =
  | EnEnSimpleUpgradeJob
  | EnEnOtherWaysJob
  | EnEnSlangCardJob;

export const EN_EN_QUEUE_JOBS: EnEnJob[] = [
  {
    id: "en_upgrade__filthy",
    format: "simple_upgrade",
    topicSlug: "upgrade-adjectives",
    simple: "Very dirty",
    target: "Filthy",
    scene:
      "Beige doodle CAPYBARA covered in dripping brown mud splatters, shocked oval-snout face, stubby limbs out, standing in a tiny mud puddle, cream backdrop — huge hero chibi",
    targetColor: "#dc2626",
  },
  {
    id: "en_upgrade__exhausted",
    format: "simple_upgrade",
    topicSlug: "upgrade-adjectives",
    simple: "Very tired",
    target: "Exhausted",
    scene:
      "Beige doodle CAPYBARA slumped over a tiny desk with a tipped coffee cup, heavy sleepy eyes, soft cream background — huge hero chibi filling the frame",
    targetColor: "#7c3aed",
  },
  {
    id: "en_upgrade__starving",
    format: "simple_upgrade",
    topicSlug: "upgrade-adjectives",
    simple: "Very hungry",
    target: "Starving",
    scene:
      "Beige doodle CAPYBARA hugging an empty plate, stomach rumble lines, hopeful eyes, warm cream background — huge hero chibi",
    targetColor: "#ea580c",
  },
  {
    id: "en_other__dont-like-it",
    format: "other_ways",
    topicSlug: "other-ways",
    headline: "I don't like it",
    kicker: "Other ways to say",
    mood: "disgust / rejection",
    characterHint:
      "beige doodle CAPYBARA with disgusted face, one stubby paw raised in a stop gesture, large waist-up on the right",
    phrases: [
      "That's not for me",
      "I'm not into it",
      "I'm not fond of it",
      "I dislike it",
      "I'm not crazy about it",
      "It doesn't appeal to me",
      "It's not my cup of tea",
      "I'm not a big fan of it",
      "I'm not keen on it",
      "I pass",
    ],
    brand: "EIGO SOUND",
  },
  {
    id: "en_other__im-sorry",
    format: "other_ways",
    topicSlug: "other-ways",
    headline: "I'm sorry",
    kicker: "Other ways to say",
    mood: "apology / regret",
    characterHint:
      "beige doodle CAPYBARA looking apologetic with soft eyes, stubby paws clasped, large waist-up on the right",
    phrases: [
      "My bad",
      "I apologize",
      "That was on me",
      "I regret that",
      "Please forgive me",
      "I didn't mean to",
      "It won't happen again",
      "I owe you an apology",
      "Sorry about that",
      "I take full responsibility",
    ],
    brand: "EIGO SOUND",
  },
  {
    id: "en_other__thats-great",
    format: "other_ways",
    topicSlug: "other-ways",
    headline: "That's great",
    kicker: "Other ways to say",
    mood: "celebration / excitement",
    characterHint:
      "beige doodle CAPYBARA cheering with a tiny fist pump, big happy smile, optional blue backward cap, large waist-up on the right",
    phrases: [
      "That's awesome",
      "Love that",
      "Sounds perfect",
      "Couldn't be better",
      "I'm all for it",
      "That's wonderful",
      "Nailed it",
      "That's fantastic",
      "I'm thrilled",
      "Way to go",
    ],
    brand: "EIGO SOUND",
  },
  {
    id: "en_slang__phubbing",
    format: "slang_card",
    topicSlug: "modern-slang",
    label: "Modern English Slang",
    word: "Phubbing",
    definition:
      "Ignoring someone in a social setting by looking at your phone.",
    example: "She kept phubbing her friend during dinner.",
    scene:
      "two beige doodle CAPYBARAS at a cafe: one staring at a phone, the other looking sad; flat sticker style, muted warm tones",
    accent: "deep purple / violet (#6B3FA0)",
  },
  {
    id: "en_slang__ghosting",
    format: "slang_card",
    topicSlug: "modern-slang",
    label: "Modern English Slang",
    word: "Ghosting",
    definition:
      "Suddenly cutting off all contact with someone without explanation.",
    example: "He started ghosting me after our third date.",
    scene:
      "beige doodle CAPYBARA checking an empty phone chat while a faint translucent capybara silhouette walks away; sticker doodle style",
    accent: "deep purple / violet (#6B3FA0)",
  },
  {
    id: "en_slang__rizz",
    format: "slang_card",
    topicSlug: "modern-slang",
    label: "Modern English Slang",
    word: "Rizz",
    definition: "Charisma or skill at charming / flirting with someone.",
    example: "He's got serious rizz — everyone laughs at his jokes.",
    scene:
      "confident beige doodle CAPYBARA (blue backward cap) charming a tiny group of sticker friends, warm smiles, flat doodle style",
    accent: "deep purple / violet (#6B3FA0)",
  },
];
