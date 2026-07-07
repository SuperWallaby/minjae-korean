/** Heuristics: topics foreigners actually search when learning Korean grammar. */

export const LOANWORD_STEMS = new Set([
  "업로드", "다운로드", "로그인", "로그아웃", "검색", "접속", "결제", "환불", "예약",
  "편집", "촬영", "필터", "정렬", "공유", "저장", "설치", "삭제", "동기화", "백업",
  "모니터링", "배포", "테스트", "검증", "패치", "업데이트",
]);

const JARGON = new Set([
  "프론트", "백엔드", "API", "DB", "KPI", "PDF", "GPS", "VOD", "HOT", "ICE", "MC", "FAQ",
  "OST", "BGM", "AS", "ATM", "KTX", "UI", "UX", "SDK", "URL", "HTTP", "JSON", "HTML",
  "업로드", "다운로드", "로그인", "로그아웃", "회원가입", "배포", "롤백", "핫픽스", "패치",
  "온보딩", "오프보딩", "랜딩페이지", "리텐션", "대시보드", "모니터링", "클라이언트",
  "서버", "토큰", "암호", "백업", "동기화", "푸시", "e스포츠", "브랜딩", "유입", "이탈",
  "클로즈", "프로모션", "체크인", "체크아웃", "워크인", "픽업", "무신사", "쿠팡", "배민",
  "프리랜서", "계약직", "정규직", "인턴", "재택", "야근", "보너스", "연봉", "시급",
  "마일리지", "멤버십", "구독", "팔로우", "좋아요", "댓글", "해시태그", "클라이언트",
  "가이드", "튜토리얼", "알림", "푸시",
]);

const PREFIXES = ["다시", "미리", "함께", "계속", "갑자기", "천천히", "빨리", "조금", "많이", "잘"];

/** Short pairs learners compare for nuance — not random vocabulary. */
const DISCOURSE_SHORT = new Set([
  "미안", "죄송", "고마워", "감사", "실례", "양해", "네", "예", "응", "그래", "안녕",
  "위", "아래", "앞", "뒤", "옆", "밖", "안", "여기", "저기", "거기", "이곳", "그곳",
  "어제", "그저께", "내일", "모레", "오늘", "방금", "곧", "이미", "벌써", "아직",
  "먼저", "나중", "항상", "자주", "가끔", "왜", "어떻게", "그냥", "그저", "단지",
  "옛날", "예전", "요즘", "최근", "평일", "주말", "휴일",
  "같이", "함께", "많이", "너무", "아주", "나중", "후에", "전에", "앞에",
  "하지만", "그런데", "그렇지만", "이렇게", "저렇게", "그렇게",
]);

function hasLatinOrDigits(word: string): boolean {
  return /[A-Za-z0-9]/.test(word);
}

const GRAMMAR_CONCEPTS = new Set([
  "간접", "우회", "돌려", "양보", "대조", "나열", "선택", "인용", "전달", "조건", "가정",
  "목적", "결과", "원인", "이유", "과정", "결론", "능동", "수동", "사동", "피동", "현재",
  "과거", "미래", "진행", "완료", "경험", "추측", "회상", "전망", "연결", "종결", "주격",
  "목적격", "보격", "부사격", "관형격", "보어격", "격조사", "보조사", "접속조사", "의존명사",
  "단위명사", "대명사", "자동사", "타동사", "준타동사", "규칙활용", "불규칙활용", "예외활용",
  "높임", "낮춤", "중립", "강조", "완화", "생략", "직설", "완곡", "의역", "직역", "문어",
  "구어", "속어", "방언", "사투리", "지역어", "한자어", "고유어", "외래어", "신조어", "줄임말",
  "격식체", "문어체", "공문체", "구어체", "대화체", "일상체", "하오체", "하게체", "해라체",
  "해요체", "합니다체", "해체", "평서", "의문", "감탄", "명령", "청유", "긍정", "부정",
  "현재형", "과거형", "관형사형", "종결형", "평서형", "의문형", "명령형", "청유형", "감탄형",
  "시제", "서법", "높임법", "연결어미", "종결어미", "전성어미", "부사절", "명사절", "관형절",
  "표준어", "비표준", "존댓말", "반말", "경어", "편말", "낮춤말",
]);

function looksGrammarRelevant(word: string): boolean {
  if (/[/／]/.test(word)) return true;
  if (DISCOURSE_SHORT.has(word) || GRAMMAR_CONCEPTS.has(word)) return true;
  if (/(습니다|세요|십시오|하세요|할게|을게|을거|겠어|잖아|거든|는데|더니|자마자|도록|면서|니까|어서)$/.test(word)) {
    return true;
  }
  if (/(하다|되다|싶다|있다|없다|보다|주다|받다|가다|오다|이다)$/.test(word)) return true;
  if (/(부터|까지|무렵|즈음|쯤|든지|거나|나마|체|형|격|어미|조사|서법|높임|피동|사동)$/.test(word)) {
    return true;
  }
  return false;
}

function isRedundantPrefixVerbPair(a: string, b: string): boolean {
  for (const pre of PREFIXES) {
    if (a === `${pre}${b}` || b === `${pre}${a}`) return true;
  }
  if (a !== b && (a.endsWith(b) || b.endsWith(a)) && (a.endsWith("다") || b.endsWith("다"))) {
    return true;
  }
  return false;
}

function isTrivialHaSpeechPair(a: string, b: string): boolean {
  const pairs: Array<[RegExp, (stem: string) => string]> = [
    [/^(.+)하다$/, (s) => `${s}해`],
    [/^(.+)해야한다$/, (s) => `${s}하고싶다`],
    [/^(.+)하기$/, (s) => `${s}하는것`],
  ];
  for (const [re, other] of pairs) {
    const ma = a.match(re);
    const mb = b.match(re);
    if (ma && b === other(ma[1]!)) return true;
    if (mb && a === other(mb[1]!)) return true;
  }
  const ha = a.match(/^(.+)하다$/);
  const doe = b.match(/^(.+)되다$/);
  if (ha && doe && ha[1] === doe[1] && LOANWORD_STEMS.has(ha[1]!)) return true;
  return false;
}

/** Shopping-list / category nouns — not grammar searches (수도 vs 인터넷, 향수 vs 로션). */
function isWeakVocabPair(a: string, b: string): boolean {
  if (looksGrammarRelevant(a) || looksGrammarRelevant(b)) return false;
  if (DISCOURSE_SHORT.has(a) || DISCOURSE_SHORT.has(b)) return false;

  const concrete = (w: string) => /^[가-힣]{2,10}$/.test(w) && !/(다|요|게)$/.test(w);
  return concrete(a) && concrete(b);
}

function isWeakVocabTriple(words: string[]): boolean {
  if (words.some(looksGrammarRelevant)) return false;
  if (words.some((w) => DISCOURSE_SHORT.has(w))) return false;
  // Only long concrete nouns (반려동물·반려식물), not grammar adverb triples (하지만·그런데).
  return words.every(
    (w) => /^[가-힣]{4,10}$/.test(w) && !/(다|요|게)$/.test(w),
  );
}

export function isLearnerQualityComparison(words: string[]): boolean {
  if (words.length < 2 || words.length > 3) return false;
  if (words.some((w) => !w.trim() || hasLatinOrDigits(w) || JARGON.has(w))) return false;
  if (words.some((w) => [...LOANWORD_STEMS].some((stem) => w.startsWith(stem)))) return false;

  if (words.length === 2) {
    const [a, b] = words;
    if (isRedundantPrefixVerbPair(a, b)) return false;
    if (isTrivialHaSpeechPair(a, b)) return false;
    if (isWeakVocabPair(a, b)) return false;
  }

  if (words.length === 3 && isWeakVocabTriple(words)) return false;

  return true;
}

/** High-confidence junk — safe to delete without AI (prefix spam, IT jargon, etc.). */
export function isDefiniteLowQuality(words: string[]): boolean {
  if (words.length < 2 || words.length > 3) return true;
  if (words.some((w) => !w.trim() || hasLatinOrDigits(w) || JARGON.has(w))) return true;
  if (words.some((w) => [...LOANWORD_STEMS].some((stem) => w.startsWith(stem)))) return true;

  if (words.length === 2) {
    const [a, b] = words;
    if (isRedundantPrefixVerbPair(a, b)) return true;
    if (isTrivialHaSpeechPair(a, b)) return true;
  }

  return false;
}
