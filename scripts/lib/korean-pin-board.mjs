/**
 * Korean Pinterest board + format-family routing.
 *
 * Vocab charts stay on "Korean words". Other formats split so the 2.2k
 * words board is not the only surface.
 */
import { isJjibaraComicId, isReadingPinId } from "./pin-review-ids.mjs";

export const KO_PIN_BOARD_WORDS =
  (process.env.PINTEREST_BOARD_NAME || "Korean words").trim() || "Korean words";
export const KO_PIN_BOARD_WORKSHEET =
  (process.env.PINTEREST_WORKSHEET_BOARD || "Korean Worksheet").trim() ||
  "Korean Worksheet";
export const KO_PIN_BOARD_PHRASES =
  (process.env.PINTEREST_PHRASES_BOARD || "Korean phrases").trim() ||
  "Korean phrases";
export const KO_PIN_BOARD_GRAMMAR =
  (process.env.PINTEREST_GRAMMAR_BOARD || "Korean grammar").trim() ||
  "Korean grammar";
export const KO_PIN_BOARD_READING =
  (process.env.PINTEREST_READING_BOARD || "Korean reading").trim() ||
  "Korean reading";
export const KO_PIN_BOARD_QUIZ =
  (process.env.PINTEREST_QUIZ_BOARD || "Korean quiz").trim() || "Korean quiz";
export const KO_PIN_BOARD_CUTE =
  (process.env.PINTEREST_CUTE_BOARD || "Cute jjibara").trim() || "Cute jjibara";
export const KO_PIN_BOARD_COMIC =
  (process.env.PINTEREST_CAPY_TOON_BOARD || "Capy Toon").trim() || "Capy Toon";

/** @typedef {"words"|"phrases"|"grammar"|"reading"|"worksheet"|"quiz"|"cute"|"comic"} KoPinFamily */

/**
 * @param {string} [id]
 * @param {object|null} [entry]
 * @param {string} [format]
 * @returns {KoPinFamily}
 */
export function formatFamilyForKoreanPin(id = "", entry = null, format = "") {
  if (isJjibaraComicId(id, entry)) return "comic";
  const fmt = String(format || entry?.format || "").toLowerCase();
  const sid = String(id || "").toLowerCase();

  if (
    isReadingPinId(id) ||
    sid.startsWith("rd_") ||
    fmt.includes("reading") ||
    fmt === "story"
  ) {
    return "reading";
  }
  if (fmt === "cute_cast" || sid.startsWith("cute-") || sid.startsWith("cute_")) {
    return "cute";
  }
  if (fmt === "match_worksheet" || sid.startsWith("match-") || sid.includes("-match-")) {
    return "worksheet";
  }
  if (
    fmt === "phrase_square" ||
    fmt === "phrase_stack" ||
    sid.startsWith("phrase-") ||
    sid.startsWith("psq-")
  ) {
    return "phrases";
  }
  if (
    fmt === "grammar_spotlight" ||
    fmt === "topik_upgrade" ||
    sid.startsWith("gram-") ||
    sid.startsWith("topik-")
  ) {
    return "grammar";
  }
  if (
    fmt === "quiz_comment" ||
    fmt === "photo_quiz" ||
    fmt === "photo-quiz" ||
    sid.startsWith("quiz-") ||
    sid.startsWith("photo-quiz-") ||
    // Photo-trial grammar cards: A1-pay-by-card, B1-met-yesterday, …
    /^[a-z]\d+-[a-z0-9-]+$/i.test(sid) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sid)
  ) {
    return "quiz";
  }
  return "words";
}

/**
 * @param {string} id
 * @param {object|null} [entry]
 * @param {string} [fallback]
 * @param {string} [format]
 */
export function boardForKoreanPin(
  id,
  entry = null,
  fallback = KO_PIN_BOARD_WORDS,
  format = "",
) {
  const family = formatFamilyForKoreanPin(id, entry, format);
  switch (family) {
    case "comic":
      return KO_PIN_BOARD_COMIC;
    case "cute":
      return KO_PIN_BOARD_CUTE;
    case "worksheet":
      return KO_PIN_BOARD_WORKSHEET;
    case "phrases":
      return KO_PIN_BOARD_PHRASES;
    case "grammar":
      return KO_PIN_BOARD_GRAMMAR;
    case "reading":
      return KO_PIN_BOARD_READING;
    case "quiz":
      return KO_PIN_BOARD_QUIZ;
    case "words":
    default:
      return String(fallback || KO_PIN_BOARD_WORDS).trim() || KO_PIN_BOARD_WORDS;
  }
}
