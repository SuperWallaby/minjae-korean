/**
 * Compound word equation cards — A + B → AB (Eggbun-style).
 * Merged into ALL_VOCAB_BUNDLES from bundle-catalog.ts.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

export type CompoundPart = {
  hangul: string;
  romanization: string;
  english: string;
  /** Icon / object for the card illustration (no text). */
  icon: string;
};

export type CompoundWordData = {
  left: CompoundPart;
  right: CompoundPart;
  resultHangul: string;
  resultRomanization: string;
  /** Short meaning sentence in English (why A+B). */
  resultMeaning: string;
};

type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
  compoundWord?: CompoundWordData;
};

function part(
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): CompoundPart {
  return { hangul, romanization, english, icon };
}

function c(
  slug: string,
  data: CompoundWordData,
  priority: BundlePriority = "high",
): VocabBundle {
  return {
    id: `cmp-${slug}`,
    format: "compound_word",
    title: `${data.left.hangul} + ${data.right.hangul} = ${data.resultHangul}`,
    count: 3,
    fit: `Compound equation — ${data.left.english} + ${data.right.english} → ${data.resultHangul}`,
    priority,
    tags: ["compound", "word-blend", "vocabulary", data.resultHangul],
    preview: [
      data.left.hangul,
      data.right.hangul,
      data.resultHangul,
      data.resultMeaning,
    ],
    compoundWord: data,
  };
}

export const COMPOUND_WORD_WAVE_BUNDLES: VocabBundle[] = [
  c("sul-gorae", {
    left: part("술", "sul", "Alcohol", "green soju bottle"),
    right: part("고래", "gorae", "Whale", "cute blue whale spouting water"),
    resultHangul: "술고래",
    resultRomanization: "sul-gorae",
    resultMeaning:
      "People who drink a lot of alcohol — like whales drink a lot of water.",
  }),
  c("nun-saram", {
    left: part("눈", "nun", "Snow", "soft snowflake"),
    right: part("사람", "saram", "Person", "simple stick-figure person"),
    resultHangul: "눈사람",
    resultRomanization: "nun-saram",
    resultMeaning: "A snowman — a person made of snow.",
  }),
  c("bul-gogi", {
    left: part("불", "bul", "Fire", "small flame"),
    right: part("고기", "gogi", "Meat", "piece of grilled meat"),
    resultHangul: "불고기",
    resultRomanization: "bul-gogi",
    resultMeaning: "Korean BBQ beef — meat cooked over fire.",
  }),
  c("mul-gae", {
    left: part("물", "mul", "Water", "water drop"),
    right: part("개", "gae", "Dog", "cute small dog"),
    resultHangul: "물개",
    resultRomanization: "mul-gae",
    resultMeaning: "A seal — like a dog that lives in water.",
  }),
  c("son-top", {
    left: part("손", "son", "Hand", "open hand"),
    right: part("톱", "top", "Saw", "small hand saw"),
    resultHangul: "손톱",
    resultRomanization: "son-top",
    resultMeaning: "A fingernail — the hard tip on your hand.",
  }),
  c("sin-bal", {
    left: part("신", "sin", "Shoe (bound form)", "sneaker silhouette"),
    right: part("발", "bal", "Foot", "simple foot outline"),
    resultHangul: "신발",
    resultRomanization: "sin-bal",
    resultMeaning: "Shoes — what you put on your feet.",
  }),
  c("chaek-bang", {
    left: part("책", "chaek", "Book", "closed book"),
    right: part("방", "bang", "Room", "small room doorway"),
    resultHangul: "책방",
    resultRomanization: "chaek-bang",
    resultMeaning: "A bookstore — a room full of books.",
  }),
  c("bam-haneul", {
    left: part("밤", "bam", "Night", "crescent moon"),
    right: part("하늘", "haneul", "Sky", "soft sky with stars"),
    resultHangul: "밤하늘",
    resultRomanization: "bam-haneul",
    resultMeaning: "The night sky.",
  }),
  c("ip-mat", {
    left: part("입", "ip", "Mouth", "simple smiling mouth"),
    right: part("맛", "mat", "Taste", "tasty sparkles on food"),
    resultHangul: "입맛",
    resultRomanization: "ip-mat",
    resultMeaning: "Appetite — the taste your mouth wants.",
  }),
  c("ko-kkiri", {
    left: part("코", "ko", "Nose", "cute nose"),
    right: part("끼리", "kkiri", "(sound / chunk)", "long curly trunk doodle"),
    resultHangul: "코끼리",
    resultRomanization: "ko-kkiri",
    resultMeaning: "An elephant — the animal with a long nose.",
  }),
];
