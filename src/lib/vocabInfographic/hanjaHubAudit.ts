/**
 * Hanja hub vocabulary audit — pure logic, no I/O.
 *
 * Policy:
 * 1) Words are pre-chosen in the catalog (locked list for image gen).
 * 2) Every satellite must hangul-contain a hub reading AND pass false-friend checks.
 * 3) Rare/pad coinages and wrong-Hanja homophones must not ship.
 *
 * Hangul-only matching is NOT enough (안 安 ≠ 안내 案內; 원 圓 ≠ 직원 職員).
 */

export type HanjaHubLike = {
  syllable: string;
  hanja: string;
  english: string;
  readings?: string[];
  satellites: Array<{
    hangul: string;
    romanization?: string;
    english?: string;
  }>;
};

export type HanjaAuditIssue = {
  code:
    | "missing_reading"
    | "false_friend"
    | "low_value"
    | "too_few"
    | "too_many"
    | "empty_hangul"
    | "not_in_allowlist";
  hangul?: string;
  message: string;
};

/** Min/max satellites (gaps OK; never pad with junk). */
export const HANJA_SAT_MIN = 3;
export const HANJA_SAT_MAX = 8;

/**
 * Hangul that look like they include the hub syllable / reading, but use a
 * DIFFERENT Chinese character (or native Korean) — never teach as hub derivatives.
 * Keys: bundle id OR bare hub hanja.
 */
export const HANJA_FALSE_FRIENDS: Record<string, readonly string[]> = {
  // 圓 (currency/circle) false friends if ever reintroduced
  圓: ["원인", "직원", "회원", "공원", "정원", "병원", "지원", "자원"],
  // 員 (staff) — not money / park / cause
  "hanja-won-circle": ["원인", "공원", "정원", "병원", "만원", "지원", "자원"],
  員: ["원인", "공원", "정원", "병원", "만원", "지원", "자원"],
  // 安 vs 案
  "hanja-an-safe": ["안내", "안건", "제안"],
  安: ["안내", "안건", "제안"],
  // 音 vs 飮 / native
  "hanja-eum-sound": ["음료", "음식물", "음주"],
  音: ["음료", "음주"],
  // 物 — 음료 is 飮料
  "hanja-mul-thing": ["음료", "물걸레", "물총"],
  物: ["음료"],
  // 表 vs 時+計 / 票
  "hanja-pyo-surface": ["시계", "투표", "발표회"], // 발표 is 表 — keep; 시계 is 時
  表: ["시계"],
  // 旅
  "hanja-yeo-travel": ["관광", "여유", "여행사원"],
  旅: ["관광", "여유"],
  // 林 — 울림 (native), 조림 stew (native/cook) vs 造林
  "hanja-rim-forest": ["울림", "조림"],
  林: ["울림"],
  // 許 — 승낙 is 諾
  "hanja-heo-allow": ["승낙", "면허가"], // 면허가 is OK as 免許+許 but awkward; use 特許 only
  許: ["승낙"],
  // 同 vs paper/wrong invent (model noise)
  "hanja-dong-same": ["휴지", "편지", "지폐", "증서", "쌍둥이", "종이"],
  同: ["휴지", "편지", "지폐", "증서", "쌍둥이"],
  // 山 — birth/other 산, trash invent
  "hanja-san-mountain": [
    "산부인과",
    "산책",
    "화장지",
    "쓰레기",
    "청소기",
    "산업",
    "생산",
  ],
  山: ["산부인과", "산책", "산업", "생산"],
  // 學 — model may invent “학습지/학습서” which are real but pad; still allowed.
  // 景
  "hanja-gyeong-view": ["경개", "경물", "경승", "정경", "경관"],
  景: ["경개", "경물", "경승"],
  // 點 vs 店
  "hanja-jeom-point": ["상점", "서점", "편의점", "백화점", "점원"],
  點: ["상점", "서점", "편의점", "백화점", "점원"],
  // 店
  "hanja-jeom-shop": ["점수", "장점", "단점", "초점"],
  店: ["점수", "장점", "단점", "초점"],
};

/** Everyday high-value pack only — locked allowlist per hub id. */
export const HANJA_AUDITED_ALLOWLIST: Record<string, readonly string[]> = {
  "hanja-ji-paper": ["휴지", "편지", "지폐", "벽지", "용지", "백지"],
  "hanja-hak-study": ["학교", "학생", "학습", "대학", "유학", "학원", "과학", "문학"],
  "hanja-sik-food": ["식사", "음식", "식당", "간식", "외식", "급식", "채식"],
  "hanja-su-water": ["수영", "생수", "호수", "수분", "분수", "수돗물", "강수"],
  "hanja-cha-vehicle": [
    "자동차",
    "기차",
    "주차장",
    "자전거",
    "승차",
    "하차",
    "차량",
  ],
  "hanja-mun-writing": ["문화", "문자", "문서", "문학", "문구", "논문", "영문"],
  "hanja-il-day": ["일요일", "생일", "일기", "휴일", "내일", "매일", "평일"],
  "hanja-guk-country": [
    "한국",
    "외국",
    "미국",
    "중국",
    "국가",
    "국민",
    "국제",
    "귀국",
  ],
  "hanja-si-time": ["시간", "시계", "당시", "즉시", "동시", "시대", "임시"],
  "hanja-jeon-electric": [
    "전화",
    "전기",
    "전자",
    "전지",
    "전등",
    "충전",
    "전원",
  ],
  "hanja-san-mountain": ["등산", "산길", "산장", "명산", "산불", "화산", "산림"],
  "hanja-in-person": [
    "인간",
    "인구",
    "인사",
    "개인",
    "성인",
    "인기",
    "외국인",
    "한국인",
  ],
  "hanja-dong-same": ["동의", "동료", "동시", "공동", "동일", "동기"],
  "hanja-bu-part": ["부서", "부분", "부장", "내부", "외부", "전부"],
  "hanja-gyeong-view": ["경치", "풍경", "야경", "배경"],
  "hanja-mul-thing": ["물건", "동물", "식물", "선물", "물질", "생물"],
  "hanja-hwa-change": ["문화", "변화", "화학", "소화", "미화", "강화"],
  "hanja-jeom-point": ["점수", "초점", "장점", "단점", "요점", "시점"],
  "hanja-bang-direction": ["방향", "방법", "지방", "방안", "사방", "일방"],
  "hanja-heo-allow": ["허락", "허용", "허가", "특허"],
  "hanja-rim-forest": ["산림", "수림", "밀림", "임야"],
  "hanja-pyo-surface": ["표현", "표시", "대표", "발표", "표정", "도표"],
  // 員 staff — not 圓 / 園 / 原
  "hanja-won-circle": ["직원", "회원", "인원", "사원", "임원", "전원"],
  "hanja-seon-line": ["노선", "직선", "곡선", "시선", "무선", "전선"],
  "hanja-jang-place": ["장소", "시장", "운동장", "주차장", "현장", "극장"],
  "hanja-gi-machine": ["기계", "비행기", "기회", "기능", "기기", "위기"],
  "hanja-ryeok-power": ["노력", "능력", "협력", "체력", "압력", "폭력"],
  "hanja-jeong-correct": ["정확", "정답", "정상", "교정", "정의", "정문"],
  "hanja-an-safe": ["안전", "안녕", "불안", "안정", "편안", "안심"],
  "hanja-yeo-travel": ["여행", "여정", "여관", "여비", "여객", "도보여행"],
  "hanja-eum-sound": ["음악", "음성", "소음", "녹음", "발음", "음향"],
  "hanja-mun-gate": ["정문", "후문", "교문", "출입문", "창문", "대문"],
  "hanja-stock-su-water": ["수도", "수영", "생수", "온수", "냉수", "수분"],
  "hanja-hwa-fire": ["화재", "화요일", "화산", "소화기", "화력", "화염"],
  "hanja-cha-car": ["자동차", "주차", "기차", "승차", "하차", "자전거"],
  "hanja-stock-jeon-electric": [
    "전화",
    "전기",
    "전자",
    "전원",
    "충전기",
    "전선",
  ],
  "hanja-stock-sik-food": ["식사", "음식", "식당", "식품", "외식", "간식"],
  "hanja-stock-hak-study": ["학교", "학생", "학습", "유학", "학년", "학원"],
  "hanja-jeom-shop": ["상점", "서점", "편의점", "매점", "점원", "백화점"],
  "hanja-gi-energy": ["공기", "기분", "기온", "기후", "인기", "분위기"],
  "hanja-sil-room": ["교실", "사무실", "화장실", "실험실", "거실", "욕실"],
};

function denyListFor(bundleId: string, hanja: string): Set<string> {
  const out = new Set<string>();
  for (const key of [bundleId, hanja]) {
    for (const w of HANJA_FALSE_FRIENDS[key] || []) out.add(w);
  }
  return out;
}

export function hangulUsesReading(hangul: string, readings: string[]): boolean {
  return readings.some((r) => r && hangul.includes(r));
}

/**
 * Audit one hub definition (catalog or generated vision words).
 * @param allowlistStrict when true (default for gen), hangul must be on HANJA_AUDITED_ALLOWLIST
 */
export function auditHanjaHub(
  bundleId: string,
  hub: HanjaHubLike,
  opts: { allowlistStrict?: boolean } = {},
): HanjaAuditIssue[] {
  const allowlistStrict = opts.allowlistStrict !== false;
  const issues: HanjaAuditIssue[] = [];
  const sats = hub.satellites || [];
  const readings = Array.from(
    new Set([hub.syllable, ...(hub.readings || [])].filter(Boolean)),
  );
  const deny = denyListFor(bundleId, hub.hanja);
  const allow = HANJA_AUDITED_ALLOWLIST[bundleId];

  if (sats.length < HANJA_SAT_MIN) {
    issues.push({
      code: "too_few",
      message: `${bundleId}: need ≥${HANJA_SAT_MIN} compounds (got ${sats.length})`,
    });
  }
  if (sats.length > HANJA_SAT_MAX) {
    issues.push({
      code: "too_many",
      message: `${bundleId}: need ≤${HANJA_SAT_MAX} compounds (got ${sats.length})`,
    });
  }
  if (allowlistStrict && !allow) {
    issues.push({
      code: "not_in_allowlist",
      message: `${bundleId}: missing HANJA_AUDITED_ALLOWLIST entry — add audited pack before gen`,
    });
  }

  for (const s of sats) {
    const hangul = String(s.hangul || "").trim();
    if (!hangul) {
      issues.push({ code: "empty_hangul", message: `${bundleId}: empty hangul` });
      continue;
    }
    if (deny.has(hangul)) {
      issues.push({
        code: "false_friend",
        hangul,
        message: `${bundleId}: "${hangul}" is a false friend of ${hub.hanja} (${hub.syllable})`,
      });
    }
    if (!hangulUsesReading(hangul, readings)) {
      issues.push({
        code: "missing_reading",
        hangul,
        message: `${bundleId}: "${hangul}" lacks reading of ${hub.hanja} (${readings.join("/")})`,
      });
    }
    if (allowlistStrict && allow && !allow.includes(hangul)) {
      issues.push({
        code: "not_in_allowlist",
        hangul,
        message: `${bundleId}: "${hangul}" not in audited allowlist`,
      });
    }
  }

  // Allowlist words missing from satellites is not a hard fail (subset OK).
  if (allowlistStrict && allow) {
    const have = new Set(sats.map((s) => String(s.hangul || "").trim()));
    const extra = sats
      .map((s) => String(s.hangul || "").trim())
      .filter((h) => h && !allow.includes(h));
    for (const hangul of extra) {
      if (!issues.some((i) => i.hangul === hangul && i.code === "not_in_allowlist")) {
        issues.push({
          code: "not_in_allowlist",
          hangul,
          message: `${bundleId}: "${hangul}" not in audited allowlist`,
        });
      }
    }
    // require satellites ⊆ allow
    void have;
  }

  return issues;
}

export function formatHanjaAuditReport(
  results: Array<{ id: string; issues: HanjaAuditIssue[] }>,
): string {
  const bad = results.filter((r) => r.issues.length);
  if (!bad.length) return `hanja audit OK (${results.length} hubs)`;
  const lines = [`hanja audit FAILED: ${bad.length}/${results.length} hubs`];
  for (const r of bad) {
    lines.push(`  ${r.id}`);
    for (const i of r.issues) lines.push(`    - ${i.message}`);
  }
  return lines.join("\n");
}

type CatalogHanjaLike = {
  id: string;
  format?: string;
  hanjaHub?: HanjaHubLike | null;
};

/**
 * Audit every hanja_hub in a catalog. Use on catalog load / gen / publish.
 * Throws if any hub fails — audit is automatic, not optional.
 */
export function assertHanjaCatalogAudited(
  bundles: readonly CatalogHanjaLike[],
  opts: { allowlistStrict?: boolean } = {},
): { hubCount: number } {
  const results: Array<{ id: string; issues: HanjaAuditIssue[] }> = [];
  for (const b of bundles) {
    if (b.format !== "hanja_hub" || !b.hanjaHub) continue;
    results.push({
      id: b.id,
      issues: auditHanjaHub(b.id, b.hanjaHub, opts),
    });
  }
  const bad = results.filter((r) => r.issues.length);
  if (bad.length) {
    throw new Error(formatHanjaAuditReport(results));
  }
  return { hubCount: results.length };
}

/** Catalog-locked word list for SEO / pin desc (never vision-invented hangul). */
export function catalogHanjaImageWords(hub: HanjaHubLike): Array<{
  hangul: string;
  romanization: string;
  english: string;
}> {
  const readings = Array.from(
    new Set([hub.syllable, ...(hub.readings || [])].filter(Boolean)),
  );
  const rom0 = readings[0] || hub.syllable;
  return [
    { hangul: hub.syllable, romanization: rom0, english: hub.english },
    ...hub.satellites.map((s) => ({
      hangul: s.hangul,
      romanization: String(s.romanization || "").trim() || s.hangul,
      english: String(s.english || "").trim() || s.hangul,
    })),
  ];
}
