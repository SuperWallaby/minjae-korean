/**
 * 한글 초성+중성 조합 (유니코드 완성형).
 * U+AC00 + (choseong * 588) + (jungseong * 28) + jongseong
 */

const CHOSEONG_INDEX: Record<string, number> = {
  ㄱ: 0, ㄲ: 1, ㄴ: 2, ㄷ: 3, ㄸ: 4, ㄹ: 5, ㅁ: 6, ㅂ: 7, ㅃ: 8,
  ㅅ: 9, ㅆ: 10, ㅇ: 11, ㅈ: 12, ㅉ: 13, ㅊ: 14, ㅋ: 15, ㅌ: 16, ㅍ: 17, ㅎ: 18,
};

const JUNGSEONG_INDEX: Record<string, number> = {
  ㅏ: 0, ㅐ: 1, ㅑ: 2, ㅒ: 3, ㅓ: 4, ㅔ: 5, ㅕ: 6, ㅖ: 7,
  ㅗ: 8, ㅘ: 9, ㅙ: 10, ㅚ: 11, ㅛ: 12, ㅜ: 13, ㅝ: 14, ㅞ: 15, ㅟ: 16,
  ㅠ: 17, ㅡ: 18, ㅢ: 19, ㅣ: 20,
};

/** 자음(초성) + 모음(중성) → 한 글자 (가, 나, …). 받침 없음. */
export function composeHangeulSyllable(consonant: string, vowel: string): string {
  const c = CHOSEONG_INDEX[consonant];
  const v = JUNGSEONG_INDEX[vowel];
  if (c == null || v == null) return consonant + vowel;
  const code = 0xac00 + c * 588 + v * 28 + 0;
  return String.fromCodePoint(code);
}
