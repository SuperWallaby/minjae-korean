#!/usr/bin/env node
/**
 * Personal helper: find YouTube candidates via Data API, then fetch transcript text
 * **only via Supadata** (see https://supadata.ai / https://docs.supadata.ai/get-transcript).
 *
 *   SUPADATA_API_KEY  (required unless YOUTUBE_DIGEST_SKIP_SUPADATA=1)
 *   SUPADATA_TRANSCRIPT_MODE=native|auto|generate  (default auto)
 *   YOUTUBE_DIGEST_SKIP_SUPADATA=1  → no transcript attempts (for debugging only)
 *   YOUTUBE_TRANSCRIPT_LANGS=en,ko,hi  (first code sent as `lang` to Supadata)
 *   YOUTUBE_SEARCH_RELEVANCE_LANG=en  YOUTUBE_SEARCH_REGION=US
 *
 *   YOUTUBE_DIGEST_IP_BLOCK_COOLDOWN_MS=5000  (extra pause after rate-limit / throttle-style transcript errors)
 *   YOUTUBE_DIGEST_MIN_DURATION_SEC=70   YOUTUBE_DIGEST_MAX_DURATION_SEC=600  (1:10–10:00; skips Shorts & longform)
 *   YOUTUBE_DIGEST_MIN_MEANINGFUL_CHARS=50  (after stripping [Música]/[Music]/… bracket lines, min useful text)
 *
 *   Pre-transcript AI gate (saves Supadata on weak candidates; needs LLM):
 *   YOUTUBE_DIGEST_SKIP_AI_SCORE=1  → skip AI gate (try transcript on every duration-pass candidate)
 *   YOUTUBE_DIGEST_AI_SCORE_MIN=82  (0–100; below → skip transcript fetch; default stricter after topic gate)
 *   YOUTUBE_DIGEST_AI_COOLDOWN_MS=400  (pause after each AI scoring call)
 *   YOUTUBE_DIGEST_AI_SCORE_ON_FAILURE=80  (optional; when model returns empty/unparseable JSON after retries, use this score ≥ MIN so transcript is still tried; default = same as AI_SCORE_MIN)
 *   YOUTUBE_DIGEST_AI_NO_FALLBACK=1  → disable that fallback; skip the video on empty/unparseable score (old behavior)
 *   YOUTUBE_DIGEST_LLM=auto|gemini|azure  (default auto: Gemini if GEMINI_API_KEY, else Azure chat)
 *   GEMINI_API_KEY  or  GMINI_API_KEY  (Gemini)
 *   YOUTUBE_DIGEST_GEMINI_MODEL=gemini-2.5-flash-lite  (optional)
 *   Azure chat: AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, AZURE_OPENAI_CHAT_DEPLOYMENTS (or *_DEPLOYMENT_CHAT)
 *
 * Usage (from repo root):
 *   node scripts/youtube_personal_digest.mjs
 *   node scripts/youtube_personal_digest.mjs --query-count 8
 *   node scripts/youtube_personal_digest.mjs --candidates 5
 *   node scripts/youtube_personal_digest.mjs --queries "한국어 공부 팁,Korean study tips"
 *
 * Reads keys from process.env / .env.local and tries in order until one works:
 *   YOUTUBE_API_KEY, YOUTUBE_API_KEY1, … YOUTUBE_API_KEY7
 *
 * Not for production scraping at scale; polite delays between fetches.
 *
 * Per run: keeps N videos with usable transcript (default 1; `--candidates 5` for pick mode).
 *
 * When stderr shows rate limits or “blocking requests from your IP”: wait, fewer
 * queries per run, or check Supadata dashboard / plan.
 *
 * Logs: stderr uses color when TTY (set NO_COLOR=1 to disable, FORCE_COLOR=1 to force).
 * Machine-readable summary JSON is still printed once on stdout at the end.
 */

import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ENV_PATH = join(ROOT, ".env.local");
const OUT_DIR = join(ROOT, ".tmp");
const OUT_JSON = join(OUT_DIR, "youtube-personal-digest.json");

/** Human-readable stderr lines from this script (탐색 단계). */
const DIGEST_LOG = "[유튜브탐색] ";

/** Per query: how many videos to keep (must have usable transcript). */
const PER_QUERY_TARGET = 1;
/** Stop the whole run after this many videos are kept (skip remaining queries). */
const DIGEST_TOTAL_STOP_AFTER = 1;
/** search.list maxResults per page (max 50). */
const SEARCH_PAGE_SIZE = 15;
/** Caption text must be at least this many chars after trim. */
const MIN_TRANSCRIPT_CHARS = 80;
/** Max Supadata + search dequeue attempts per query before giving up. */
const MAX_CANDIDATES_PER_QUERY = 120;
/** Safety cap on dequeue/refill cycles per query (e.g. many duplicates). */
const MAX_STEPS_PER_QUERY = 250;

/** YouTube search.list relevanceLanguage (ko+KR skewed heavily toward Korea). */
const SEARCH_RELEVANCE_LANG = (process.env.YOUTUBE_SEARCH_RELEVANCE_LANG || "en").trim() || "en";
/** YouTube search.list regionCode. */
const SEARCH_REGION_CODE = (process.env.YOUTUBE_SEARCH_REGION || "US").trim() || "US";

/** YouTube `contentDetails.duration` (ISO 8601) → total seconds, or null. */
function parseYoutubeIsoDurationSeconds(iso) {
  if (!iso || typeof iso !== "string" || !iso.startsWith("PT")) return null;
  try {
    const body = iso.slice(2);
    const hMatch = body.match(/(\d+)H/);
    const mMatch = body.match(/(\d+)M/);
    const sMatch = body.match(/(\d+)(?:\.\d+)?S/);
    let sec = 0;
    if (hMatch) sec += Number(hMatch[1]) * 3600;
    if (mMatch) sec += Number(mMatch[1]) * 60;
    if (sMatch) sec += Math.floor(Number(sMatch[1]));
    return sec;
  } catch {
    return null;
  }
}

function digestMinVideoDurationSec() {
  const n = Number.parseInt(String(process.env.YOUTUBE_DIGEST_MIN_DURATION_SEC ?? "70").trim(), 10);
  return Math.max(1, Number.isFinite(n) ? n : 70);
}

function digestMaxVideoDurationSec() {
  const min = digestMinVideoDurationSec();
  const n = Number.parseInt(String(process.env.YOUTUBE_DIGEST_MAX_DURATION_SEC ?? "600").trim(), 10);
  return Math.max(min + 1, Number.isFinite(n) ? n : 600);
}

function digestMinMeaningfulTranscriptChars() {
  const n = Number.parseInt(
    String(process.env.YOUTUBE_DIGEST_MIN_MEANINGFUL_CHARS ?? "50").trim(),
    10,
  );
  return Math.max(10, Number.isFinite(n) ? n : 50);
}

/** 0–100; transcript fetch only if AI score ≥ this (unless YOUTUBE_DIGEST_SKIP_AI_SCORE=1). */
function digestAiScoreMin() {
  const n = Number.parseInt(String(process.env.YOUTUBE_DIGEST_AI_SCORE_MIN ?? "82").trim(), 10);
  return Math.min(100, Math.max(0, Number.isFinite(n) ? n : 80));
}

/**
 * When the scorer returns nothing or non-JSON after retries, use this score so we
 * still attempt Supadata (unless YOUTUBE_DIGEST_AI_NO_FALLBACK=1). Never below MIN.
 */
function digestAiScoreOnFailureFallback() {
  const minS = digestAiScoreMin();
  const raw = process.env.YOUTUBE_DIGEST_AI_SCORE_ON_FAILURE?.trim();
  if (!raw) return minS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return minS;
  return Math.min(100, Math.max(minS, n));
}

function digestAiNoFallback() {
  return String(process.env.YOUTUBE_DIGEST_AI_NO_FALLBACK ?? "").trim() === "1";
}

/** Strip `[…]` segments (auto-captions use these for music, applause, etc.). */
function transcriptTextWithoutBracketAnnotations(text) {
  return String(text || "")
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDurationMmSs(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function randomQueryCountFromEnv() {
  const raw = process.env.YOUTUBE_DIGEST_RANDOM_QUERY_COUNT ?? "5";
  const n = Number.parseInt(String(raw).trim(), 10);
  return Math.min(50, Math.max(1, Number.isFinite(n) ? n : 5));
}

/**
 * English YouTube search strings — wide pool for “curious, culture-adjacent”
 * discovery without meta queries like “what is K-culture”. Food / beauty / life
 * need not name Korea. Each run picks a random subset. Override: --queries "a,b,c"
 */
const TOPIC_QUERY_POOL = [
  // Concrete Korea-adjacent hooks (not “한류/K-culture 소개”)
  "Korean street food night market documentary voiceover",
  "Seoul cafe dessert trends why people queue explained",
  "Korean variety show games studio family explained",
  "mukbang psychology why eating shows work documentary",
  "ramyeon upgrade hacks egg cheese noodles dorm",
  "Korean fried chicken double fry crispy science explained",
  "banchan side dish philosophy small plates explained",
  "soju versus beer night out culture explained casual",
  "hanok stay traditional house overnight vlog documentary",
  "Korean sauna jjimjilbang first timer etiquette explained",
  "taekwondo basics philosophy documentary beginner",
  "fan translation versus official lyrics meaning explained",
  "BTS interview teamwork psychology moments documentary",
  "idol training schedule comeback rollout industry explained",
  "second language anxiety classroom versus real life documentary",
  "studied English years still shy speaking explained documentary",
  "Korean topic particle versus subject particle explained analogy",
  "why polite endings disappear in machine translation explained",
  "Arirang folk song history meaning documentary emotional",
  "gayageum Korean string instrument sound explained beginner",
  "spaced repetition language learning science explained",
  "study with me pomodoro focus routine student documentary",
  "AI tutor versus human coach language learning explained",
  "blended learning language study flow explained 2026",
  "Japanese convenience store food tour",
  "anime recommendations for beginners",
  "manga collecting where to start",
  "Chinese tea culture explained",
  "Vietnamese pho at home authentic",
  "Indian spices pantry essentials explained",
  "Thai curry paste explained types",
  "Filipino food tour documentary",
  "Indonesian street food documentary",
  "Middle Eastern mezze platter ideas",
  "Moroccan tagine explained beginner",
  "Turkish breakfast culture explained",
  "Greek islands travel tips documentary",
  "Peruvian food ceviche explained",
  "Brazilian carnival culture explained",
  "Nigerian jollof rice explained recipe",
  "Ethiopian injera explained food culture",
  "Scandinavian hygge lifestyle explained",
  "Irish pub culture documentary",
  "Scottish Highlands travel documentary",
  // Fashion / body / sleep
  "how to walk like a model runway",
  "model posture and walking technique",
  "how to sleep better science tips",
  "fix your sleep schedule habits",
  "insomnia tips that actually work",
  "mouth taping sleep trend explained",
  "blue light glasses worth it explained",
  "desk posture fix exercises",
  "neck pain stretches office workers",
  "how to pose for photos flattering",
  "natural makeup tutorial everyday",
  "contouring for beginners simple",
  "curly hair routine CGM explained",
  "hair care routine damaged hair",
  "beard grooming routine tips",
  "nail art tutorial easy at home",
  "minimalist wardrobe capsule closet",
  "outfit ideas casual chic",
  "sneaker culture explained documentary",
  "watch collecting beginner guide",
  "thrifting vintage fashion tips",
  // Cooking & drinks (global)
  "easy home cooking recipes beginner",
  "knife skills cooking tutorial",
  "Italian pasta from scratch tutorial",
  "French pastry basics beginner",
  "Spanish tapas ideas easy",
  "German bread baking explained",
  "Polish pierogi tutorial beginner",
  "Jewish deli classics explained",
  "sushi at home beginner rolls",
  "ramen hacks upgrade instant noodles",
  "BBQ smoking meat beginner tips",
  "steak doneness explained chef",
  "cast iron skillet care explained",
  "Dutch oven camping recipes",
  "fermentation kimchi sauerkraut science",
  "pickling vegetables beginner jar",
  "chocolate desserts easy recipes",
  "vegan meals high protein easy",
  "meal ideas under 30 minutes",
  "meal prep ideas healthy week",
  "air fryer recipes healthy crispy",
  "instant pot recipes one pot dinner",
  "slow cooker dump meals easy",
  "sheet pan dinners healthy easy",
  "how to cut an onion chef technique",
  "spices explained Indian cooking basics",
  "Mexican street tacos authentic recipe",
  "Korean BBQ at home tips",
  "Japanese wagyu explained worth it",
  "seafood boil recipe beginner",
  "lobster roll recipe explained",
  "wine for beginners tasting tips",
  "natural wine explained trendy",
  "cocktail basics home bar starter",
  "whiskey types explained beginner",
  "coffee brewing methods compared",
  "espresso at home without machine hacks",
  "matcha latte recipe whisk technique",
  "bubble tea recipe at home",
  // Health / mind / relationships
  "intermittent fasting explained simple",
  "gut health microbiome explained simple",
  "longevity habits science explained",
  "brain fog causes explained fixes",
  "ADHD productivity tips that work",
  "burnout recovery steps explained",
  "therapy types CBT DBT explained simple",
  "attachment styles explained relationships",
  "dating advice psychology healthy",
  "long distance relationship tips science",
  "how to apologize repair relationship",
  "narcissism red flags explained psychology",
  "confidence tips public speaking",
  "how to read body language",
  "negotiation skills salary raise tips",
  "stoicism daily life practical",
  "philosophy of happiness explained",
  "existentialism explained simple",
  "meditation for anxiety beginners",
  "breathwork Wim Hof style explained",
  "cold plunge benefits risks explained",
  // Fitness / sports
  "weight loss tips without gym",
  "home workout no equipment",
  "HIIT workout beginner 20 minutes",
  "calisthenics progressions beginner",
  "pilates reformer vs mat explained",
  "yoga for beginners morning routine",
  "stretching routine for flexibility",
  "mobility routine hips ankles",
  "running form for beginners",
  "couch to 5k tips beginner",
  "cycling beginner gear explained",
  "swimming technique freestyle tips",
  "tennis serve beginner slow motion",
  "pickleball rules explained beginner",
  "golf swing beginner mistakes fix",
  "boxing footwork beginner tutorial",
  "Muay Thai basics beginner",
  "Brazilian jiu jitsu positions explained",
  "skateboarding ollie tutorial beginner",
  "surfing pop up tutorial beginner",
  "skiing parallel turns beginner",
  "snowboarding heel toe explained",
  "rock climbing grades explained indoor",
  "hiking gear beginner checklist",
  "camping hacks first time camper",
  // Travel / lifestyle / money
  "travel Japan on a budget tips",
  "Europe backpacking first time tips",
  "solo travel safety tips women",
  "van life pros cons explained",
  "digital nomad lifestyle explained",
  "how to start a side hustle online",
  "passive income myths debunked",
  "investing for beginners explained simple",
  "index funds vs ETFs explained simple",
  "crypto risks explained beginner",
  "real estate investing beginner mistakes",
  "tax tips freelancers USA explained",
  "how credit scores work explained",
  "personal finance habits rich people",
  "renting first apartment checklist",
  "first time home buyer mistakes",
  "how to negotiate car price tips",
  // Home / DIY / garden
  "interior design small apartment hacks",
  "IKEA hacks small space storage",
  "smart home beginner setup explained",
  "LED lights room mood explained",
  "declutter minimalism room by room",
  "laundry hacks stains removal",
  "cleaning hacks speed clean apartment",
  "plants for beginners hard to kill",
  "propagating pothos water soil tips",
  "bonsai care beginner explained",
  "gardening vegetables small space",
  "composting apartment balcony tips",
  "beekeeping hobby beginner explained",
  "chicken coop beginner suburban",
  "aquarium fish beginner tank cycle",
  "hamster care beginner cage setup",
  "reptile terrarium beginner leopard gecko",
  "dog training basics puppy",
  "cat behavior explained",
  "dog separation anxiety tips training",
  // Tech / creator / career skills
  "iPhone camera tips pro tricks",
  "Android hidden features useful",
  "smartphone battery myths debunked",
  "VPN explained should you use one",
  "password manager explained why",
  "ChatGPT tips for work explained",
  "AI art ethics explained simple",
  "Excel tips tricks save time",
  "Google Sheets formulas beginner",
  "Notion templates productivity explained",
  "resume tips ATS explained",
  "job interview STAR method explained",
  "LinkedIn profile tips job search",
  "public speaking tips TED style",
  "how to start a podcast cheap",
  "YouTube algorithm myths debunked",
  "TikTok growth tips algorithm explained",
  "lighting for Zoom calls look better",
  "microphone types streaming explained",
  // Arts / crafts / music
  "watercolor painting beginner tutorial",
  "acrylic pouring art beginner",
  "oil painting glazing explained simple",
  "figure drawing proportions beginner",
  "calligraphy brush pen beginner",
  "hand lettering basics tutorial",
  "origami cool models beginner",
  "pottery throwing tutorial beginner",
  "ceramic glazing basics explained",
  "woodworking project weekend beginner",
  "epoxy river table beginner mistakes",
  "leatherworking beginner wallet",
  "sewing machine basics first project",
  "knitting scarf beginner tutorial",
  "crocheting granny square beginner",
  "embroidery stitches beginner tutorial",
  "3D printing beginner first prints",
  "laser cutter projects beginner ideas",
  "drone photography laws tips beginner",
  "street photography tips composition",
  "film photography developing explained",
  "DJ mixing beginner controller tutorial",
  "beatmaking FL Studio beginner",
  "music theory chords explained simple",
  "singing warm ups beginner daily",
  "ukulele songs beginner three chords",
  "harmonica beginner blues riff",
  "piano practice routine beginner",
  "guitar barre chords finally click",
  "bass guitar groove beginner lesson",
  // Science / history / mystery / pop
  "space news James Webb discoveries",
  "black holes explained simple animation",
  "James Webb vs Hubble explained",
  "ocean mysteries deep sea documentary",
  "megalodon facts vs myths explained",
  "dinosaurs new discoveries documentary",
  "ice age humans explained documentary",
  "ancient Egypt facts documentary",
  "Mayan civilization explained documentary",
  "Vikings facts vs TV myths",
  "Roman Empire daily life documentary",
  "Byzantine empire explained simple",
  "Silk Road history explained",
  "Samurai history explained documentary",
  "ninjas myths vs facts explained",
  "World War 2 stories lesser known",
  "Cold War Berlin Wall explained",
  "moon landing conspiracy debunked",
  "Area 51 facts explained",
  "Bermuda Triangle science explained",
  "true crime documentary psychology",
  "unsolved mysteries explained",
  "serial killer psychology explained ethical",
  "conspiracy theories debunked science",
  "how magic tricks work revealed",
  "escape room puzzle design explained",
  "Rubiks cube beginner method tutorial",
  "speedcubing tips beginner",
  // Cars / bikes / machines
  "how cars work explained simple",
  "manual transmission driving tips beginner",
  "electric cars worth it explained",
  "EV charging levels explained home",
  "motorcycle beginner gear safety tips",
  "bicycle maintenance chain clean tutorial",
  "electric bike laws tips explained",
  // Games / entertainment
  "chess openings explained beginners",
  "chess endgames king pawn explained",
  "poker hands odds explained beginner",
  "Dungeons and Dragons beginner guide",
  "Magic the Gathering formats explained",
  "board games for parties fun",
  "escape board games cooperative",
  "video game lore explained popular",
  "speedrunning explained documentary",
  "eSports career explained realistic",
  "retro gaming collecting beginner",
  "film analysis hidden meanings explained",
  "movie plot twists explained spoilers",
  "Oscar movies breakdown explained",
  "sitcom writing formula explained",
  "standup comedy writing tips",
  // Random viral / curiosity
  "life hacks compilation actually useful",
  "psychology facts about people interesting",
  "things you didn't know everyday objects",
  "why we procrastinate explained science",
  "how habits form neuroscience explained",
  "memory palace technique explained",
  "how to learn any language faster",
  "productivity morning routine successful people",
  "time blocking method explained simple",
  "deep work Cal Newport ideas explained",
  "digital detox tips that work",
  "minimalism lifestyle documentary",
  "slow living movement explained",
  "hygge vs lagom explained Nordic",
  "ASMR sleep relaxation explained",
  "oddly satisfying crafts compilation",
  "soap cutting satisfying explained why",
  "slime ASMR science explained",
  "how fireworks work explained",
  "how neon signs work explained",
  "how elevators safety brakes work",
  "how airplanes fly explained simple",
  "how submarines work explained",
  "how nuclear power works explained simple",
  "how vaccines work explained simple",
  "CRISPR gene editing explained simple",
  "how mRNA vaccines work explained",
  "climate change solutions explained realistic",
  "recycling myths debunked explained",
  "fast fashion environmental impact explained",
  "thrifting environmental benefits explained",
  // Parenting / life stages
  "newborn sleep tips realistic parents",
  "toddler tantrums psychology tips",
  "teen motivation parenting tips science",
  "empty nest syndrome explained coping",
  "caregiver burnout tips explained",
  // Beauty / wellness niche
  "sunscreen SPF explained UVA UVB",
  "retinoid routine beginner dermatologist style",
  "acne types explained treatment basics",
  "laser hair removal explained pros cons",
  "Botox myths facts explained simple",
  // Food science / diet culture
  "sugar addiction science explained",
  "artificial sweeteners explained science",
  "MSG myth debunked science",
  "gluten explained celiac vs trend",
  "lactose intolerance explained simple",
  "carnivore diet science explained critique",
  "Mediterranean diet explained benefits",
  "blue zones longevity habits explained",
  // Niche hobbies
  "birdwatching beginner binoculars tips",
  "foraging mushrooms beginner safety first",
  "metal detecting beginner finds tips",
  "astrophotography beginner Milky Way",
  "telescope buying guide beginner",
  "home automation Raspberry Pi beginner",
  "mechanical keyboard switches explained",
  "pen spinning tutorial beginner",
  "yo-yo tricks beginner responsive",
  "kendama tricks beginner tutorial",
  "fingerboarding tricks beginner",
  "lock picking ethics laws explained hobby",
  "puzzle boxes mechanical explained",
  "model trains HO scale beginner",
  "RC cars beginner brushless explained",
  "Lego technic mechanisms explained",
  "miniature diorama building tutorial",
  "dollhouse miniatures crafting beginner",
  "terrarium closed ecosystem explained",
  "bonsai wiring styling beginner",
  "urban sketching beginner supplies tips",
  // Extra hooks (beauty / life / curiosity — Korea optional)
  "glass skin routine morning versus night dermatologist tips",
  "lip tint versus lipstick staying power science explained",
  "skin barrier repair ceramides explained simple",
  "double cleansing oil then foam why explained",
  "hair oil routine frizz control curly wavy explained",
  "desk lunch ideas no microwave healthy easy",
  "meal deal psychology supermarket explained documentary",
  "late night snack culture why comfort food documentary",
  "one pan dinner lazy cook documentary voiceover",
  "coffee shop work culture laptop etiquette explained",
  "apartment noise neighbor etiquette awkward explained",
  "roommate conflict repair scripts psychology explained",
  "small talk at parties anxiety tips documentary",
  "phone scrolling dopamine explained habit science",
  "K-drama pacing cliffhanger writing explained screenwriting",
  "subtitle timing versus dub philosophy documentary",
  "learn language with TV shows method explained realistic",
  "honorifics in Asian languages politeness layers explained",
  "heritage language forgetting family documentary emotional",
  "TOPIK study tips realistic schedule explained",
  "Korean honorifics 요 versus 입니다 beginner explained",
  "verb endings stack meaning Korean grammar explained simple",
  "why subtitles miss jokes translation documentary",
  "BTS lyrics wordplay Korean learners explained line by line",
  "K-pop lightstick ocean concert psychology explained",
  "fan chant culture stadium energy documentary",
  "Korean office hierarchy unspoken rules documentary",
  "hagwon culture after school academies explained documentary",
  "suneung Korean SAT day documentary pressure explained",
  "Seoul street style district youth fashion documentary candid",
  "Seoul subway rush hour survival tips documentary",
  "Korean age counting system explained simple",
  "year end awards show K-pop voting explained industry",
  "music show wins versus charts explained K-pop",
  "fan cafe culture Korea explained documentary",
  "idol photocard collecting psychology explained hobby",
];

function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Pick `count` distinct random queries from the pool. */
function pickRandomQueries(count) {
  const pool = shuffleInPlace([...TOPIC_QUERY_POOL]);
  const n = Math.min(count, pool.length);
  return pool.slice(0, n);
}

/** True if transcript errors suggest backing off (rate limit, IP block, etc.). */
function looksLikeYoutubeTranscriptIpBlock(reason) {
  const s = String(reason || "");
  return (
    /blocking requests from your ip/i.test(s) ||
    /IP has been blocked/i.test(s) ||
    /RequestBlocked/i.test(s) ||
    /\bIpBlocked\b/i.test(s) ||
    /cloud provider \(like AWS/i.test(s) ||
    /PoTokenRequired/i.test(s) ||
    /limit-exceeded|limit exceeded|too many requests|\b429\b/i.test(s)
  );
}

/** One-line friendly reason (library errors are very verbose). */
function formatDigestFailureReason(raw) {
  const s = String(raw || "");
  const collapsed = s.replace(/\s+/g, " ").trim();

  if (looksLikeYoutubeTranscriptIpBlock(collapsed)) {
    return {
      primary:
        "자막(Supadata) 요청이 제한되었을 수 있음 (IP·호출 과다·플랜 한도 등). 잠시 후 재시도하거나 --query-count를 줄여 보세요.",
      extraLine: null,
    };
  }

  const oneLine = collapsed.length > 520 ? `${collapsed.slice(0, 520)}…` : collapsed;
  return { primary: oneLine, extraLine: null };
}

function useColor() {
  if (process.env.NO_COLOR != null && process.env.NO_COLOR !== "") return false;
  if (process.env.FORCE_COLOR === "0") return false;
  if (process.env.FORCE_COLOR) return true;
  return Boolean(process.stderr.isTTY);
}

const C = useColor()
  ? {
      r: "\x1b[0m",
      b: "\x1b[1m",
      dim: "\x1b[2m",
      red: "\x1b[31m",
      green: "\x1b[32m",
      yellow: "\x1b[33m",
      blue: "\x1b[34m",
      cyan: "\x1b[36m",
      gray: "\x1b[90m",
    }
  : { r: "", b: "", dim: "", red: "", green: "", yellow: "", blue: "", cyan: "", gray: "" };

const log = {
  blank: () => console.error(""),
  divider: () => console.error(`${DIGEST_LOG}${C.dim}${"─".repeat(60)}${C.r}`),
  /** Quiet API / key rotation traces */
  trace: (msg) => console.error(`${DIGEST_LOG}${C.gray}  · ${msg}${C.r}`),
  warn: (msg) => console.error(`${DIGEST_LOG}${C.yellow}${C.b}  ⚠  ${msg}${C.r}`),
  err: (msg) => console.error(`${DIGEST_LOG}${C.red}${C.b}  ✗  ${msg}${C.r}`),

  queryOpen: (q) => {
    log.blank();
    log.divider();
    console.error(`${DIGEST_LOG}${C.cyan}${C.b}  Query${C.r}`);
    console.error(`${DIGEST_LOG}     ${C.b}${q}${C.r}`);
    const durHint =
      process.env.YOUTUBE_DIGEST_SKIP_DURATION_FILTER === "1"
        ? "길이 필터 끔"
        : `길이 ${formatDurationMmSs(digestMinVideoDurationSec())}–${formatDurationMmSs(digestMaxVideoDurationSec())}만`;
    const aiHint =
      process.env.YOUTUBE_DIGEST_SKIP_AI_SCORE === "1"
        ? "AI 사전 판별 끔"
        : `AI 사전 점수 ≥${digestAiScoreMin()}만 자막(Supadata) 시도`;
    console.error(
      `${DIGEST_LOG}${C.dim}     목표 ${PER_QUERY_TARGET}개 · ${aiHint} · 자막 원문 ≥${MIN_TRANSCRIPT_CHARS}자 · 실질 ≥${digestMinMeaningfulTranscriptChars()}자([…] 제거 후) · 후보 상한 ${MAX_CANDIDATES_PER_QUERY} · ${durHint} · search ${SEARCH_REGION_CODE}/${SEARCH_RELEVANCE_LANG}${C.r}`,
    );
    log.blank();
  },

  /** Transcript OK — kept toward per-query target */
  successKeep: ({ n, of, id, title, viewCount, fmt, charCount }) => {
    const head = `${DIGEST_LOG}${C.green}${C.b}  성공${C.r}  ${C.dim}${n}/${of}${C.r}  ${C.b}${id}${C.r}`;
    const meta = `${DIGEST_LOG}${C.gray}     조회수 ${viewCount} · 출처 ${fmt} · 자막 ${charCount.toLocaleString()}자${C.r}`;
    const t = title.length > 72 ? `${title.slice(0, 72)}…` : title;
    log.blank();
    console.error(head);
    console.error(meta);
    console.error(`${DIGEST_LOG}     ${t}`);
    log.blank();
  },

  /** Transcript missing / too short */
  failSkip: ({ id, title, reason }) => {
    const t = title.length > 64 ? `${title.slice(0, 64)}…` : title;
    const { primary, extraLine } = formatDigestFailureReason(reason);
    log.blank();
    console.error(`${DIGEST_LOG}${C.red}${C.b}  실패${C.r}  ${C.gray}${id}${C.r}`);
    console.error(`${DIGEST_LOG}     ${C.dim}${t}${C.r}`);
    console.error(`${DIGEST_LOG}${C.red}     이유  ${primary}${C.r}`);
    if (extraLine) console.error(`${DIGEST_LOG}${C.dim}     참고  ${extraLine}${C.r}`);
    log.blank();
  },

  queryShortfall: (q, accepted, tried, extra) => {
    log.warn(
      `쿼리 "${q}" — 유효 자막 ${accepted}/${PER_QUERY_TARGET}개만 확보 (후보 ${tried}명 시도${extra ? `, ${extra}` : ""})`,
    );
    log.blank();
  },

  searchExhausted: (q) => {
    log.warn(`검색 페이지 소진: "${q}"`);
    log.blank();
  },

  searchEmptyPage: (q) => {
    log.warn(`검색 결과 없음: "${q}"`);
    log.blank();
  },

  bannerDone: (outPath, count) => {
    log.blank();
    log.divider();
    console.error(`${DIGEST_LOG}${C.green}${C.b}  완료${C.r}  ${count}건 저장`);
    console.error(`${DIGEST_LOG}${C.dim}     ${outPath}${C.r}`);
    log.blank();
  },

  resultCard: (r) => {
    console.error(`${DIGEST_LOG}${C.cyan}${C.b}  ◆ ${r.title}${C.r}`);
    console.error(`${DIGEST_LOG}${C.gray}     조회 ${r.viewCount}  ·  ${r.url}${C.r}`);
    console.error(`${DIGEST_LOG}${C.gray}     자막  ${r.transcriptSource}${C.r}`);
    log.blank();
  },
};

function loadEnvLocal() {
  if (!existsSync(ENV_PATH)) return;
  const raw = readFileSync(ENV_PATH, "utf8");
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

function listYoutubeApiKeys() {
  return [
    process.env.YOUTUBE_API_KEY,
    process.env.YOUTUBE_API_KEY1,
    process.env.YOUTUBE_API_KEY2,
    process.env.YOUTUBE_API_KEY3,
    process.env.YOUTUBE_API_KEY4,
    process.env.YOUTUBE_API_KEY5,
    process.env.YOUTUBE_API_KEY6,
    process.env.YOUTUBE_API_KEY7,
  ].filter(Boolean);
}

/** Short label for logs (never print full key) */
function keyLabel(key, index) {
  if (!key || key.length < 10) return `key#${index}`;
  return `key#${index} ${key.slice(0, 4)}…${key.slice(-4)}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function digestSkipAiScore() {
  return process.env.YOUTUBE_DIGEST_SKIP_AI_SCORE === "1";
}

function digestGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || process.env.GMINI_API_KEY?.trim() || "";
}

function readDigestAzureChatConfig() {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT?.trim().replace(/\/+$/, "");
  const apiKey = process.env.AZURE_OPENAI_API_KEY?.trim();
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION?.trim() || "2024-08-01-preview";
  const raw = process.env.AZURE_OPENAI_CHAT_DEPLOYMENTS?.trim();
  let deployments = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : [];
  if (!deployments.length) {
    const single =
      process.env.AZURE_OPENAI_DEPLOYMENT_CHAT?.trim() ||
      process.env.AZURE_OPENAI_DEPLOYMENT?.trim();
    if (single) deployments = [single];
  }
  if (!endpoint || !apiKey || !deployments.length) return null;
  return { endpoint, apiKey, apiVersion, deployments };
}

function digestLlmConfigured() {
  if (digestGeminiApiKey()) return true;
  if (readDigestAzureChatConfig()) return true;
  return false;
}

/** Pull first `{...}` JSON object from model output (allows accidental fences). */
function extractJsonObject(text) {
  const t = String(text || "").trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = fence ? fence[1].trim() : t;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(body.slice(start, end + 1));
  } catch {
    return null;
  }
}

function parsePreTranscriptScoreJson(text) {
  const obj = extractJsonObject(text);
  if (!obj || typeof obj !== "object") return null;
  const score = Number(obj.score);
  if (!Number.isFinite(score)) return null;
  const reason_short =
    typeof obj.reason_short === "string" ? obj.reason_short.trim().slice(0, 200) : "";
  const article_potential = ["low", "medium", "high"].includes(String(obj.article_potential))
    ? obj.article_potential
    : null;
  const format_fit = ["news", "editorial_article", "weak_or_promo"].includes(String(obj.format_fit))
    ? obj.format_fit
    : null;
  const useful = ["low", "medium", "high"].includes(String(obj.useful)) ? obj.useful : null;
  const interesting = ["low", "medium", "high"].includes(String(obj.interesting)) ? obj.interesting : null;
  const primary_topic_risk = [
    "none",
    "product_review_or_shopping",
    "pure_entertainment",
    "clickbait_hype",
    "other_low_value",
  ].includes(String(obj.primary_topic_risk))
    ? obj.primary_topic_risk
    : null;
  return {
    score: Math.min(100, Math.max(0, Math.round(score))),
    reason_short: reason_short || null,
    article_potential,
    format_fit,
    useful,
    interesting,
    primary_topic_risk,
  };
}

/** Extra gate after JSON parse: block thin promos / shopping reviews even if score is high. */
function digestAiTopicHardReject(parsed) {
  if (!parsed) return { reject: true, reason: "parse" };
  if (parsed.article_potential === "low") {
    return { reject: true, reason: "article_potential=low" };
  }
  const hasNewDims =
    parsed.format_fit != null ||
    parsed.useful != null ||
    parsed.interesting != null ||
    parsed.primary_topic_risk != null;
  if (!hasNewDims) {
    return { reject: false, reason: "" };
  }
  const risk = parsed.primary_topic_risk;
  if (risk === "product_review_or_shopping") {
    return { reject: true, reason: "primary_topic_risk=product_review_or_shopping" };
  }
  if (parsed.format_fit === "weak_or_promo") {
    return { reject: true, reason: "format_fit=weak_or_promo" };
  }
  if (parsed.useful === "low" && parsed.interesting === "low") {
    return { reject: true, reason: "useful=low & interesting=low" };
  }
  return { reject: false, reason: "" };
}

const DIGEST_SCORE_SYSTEM = `Your task: judge whether this YouTube video is **worth paying to fetch a full transcript** to turn into a **serious Korean-learning news article** on our site (report-style: context, what happened, why it matters to learners or society — not a shopping post).

Work from **title + description + channel + query intent only** (no transcript). Be **strict**: when in doubt, score low and choose conservative labels.

### A) Topic fit — would this read as *news* or as a *substantive article*, not noise?
- **news**: time-bound or reportable public-interest story (policy, society, science, culture event, industry shift) with information a reader could not get from the title alone.
- **editorial_article**: evergreen deep dive, investigation, or strong instructional narrative that still yields a long standalone piece (not a thin listicle).
- **weak_or_promo**: mostly selling, unboxing, affiliate gear, "best X to buy", sponsored roundups, vague motivation, pure reaction, or content where the *point* is commerce or personality with little transferable insight.

### B) Is it **useful** (beyond entertainment or shopping)?
High only if a learner or general reader would gain **clear ideas, facts, or skills** they did not already have from the thumbnail. Shopping picks and product praise are **not** useful in this sense unless reframed as independent journalism with verifiable claims (rare from metadata).

### C) Is it **interesting** (non-generic)?
High only if there is a plausible **hook**: surprise, stakes, human story, genuine curiosity, or a sharp angle — not generic tips everyone repeats, not pure hype.

### D) Hard negatives (must drive score down and often force risk/format labels)
Treat as **product_review_or_shopping** when the video is mainly: product review, comparison shopping, affiliate links tone, "code in description", unboxing, "top N gadgets", beauty hauls, app sponsorship reads, etc.
Treat as **clickbait_hype** when the description is empty hype / "you won't believe" with no concrete subject.
If the video is **only** entertainment (gameplay, pranks, memes) with no teachable or reportable substance → **pure_entertainment** + low useful.

**Scoring (0–100)**: one holistic score. **Do not** give ≥70 if primary_topic_risk is product_review_or_shopping or if format_fit would be weak_or_promo. **Do not** give ≥75 if both useful and interesting would be "low".

High score only when: (1) format is plausibly **news** or **editorial_article**, (2) **useful** is at least medium OR **interesting** is at least high with medium useful, (3) **not** primarily shopping/review.

Prefer: documentary voiceover, news explainers, interviews with real information, policy/science/culture stories matching the **search query**.
Penalize: music-only, wordless montage, meme dumps, reading on-screen text with no added analysis, filler "watch until end".

Reply with exactly one JSON object (no markdown, no prose outside JSON) with keys:
- score: integer 0–100
- reason_short: one short English phrase, max 140 characters (may cite news vs article + useful/interesting)
- article_potential: "low" | "medium" | "high"
- format_fit: "news" | "editorial_article" | "weak_or_promo"
- useful: "low" | "medium" | "high"
- interesting: "low" | "medium" | "high"
- primary_topic_risk: "none" | "product_review_or_shopping" | "pure_entertainment" | "clickbait_hype" | "other_low_value"`;

function buildPreTranscriptScoreUserPayload(meta) {
  const desc = String(meta.description || "").replace(/\s+/g, " ").trim();
  const descClip = desc.length > 1400 ? `${desc.slice(0, 1400)}…` : desc;
  return `Search query: ${meta.query}

Video ID: ${meta.videoId}
Title: ${meta.title}
Channel: ${meta.channelTitle}
Views: ${meta.viewCount}
Duration: ${meta.durationSec != null ? `${meta.durationSec}s (${formatDurationMmSs(meta.durationSec)})` : "unknown"}

Description:
${descClip || "(empty)"}`;
}

async function geminiDigestScore(userPayload) {
  const key = digestGeminiApiKey();
  if (!key) return null;
  const model = (process.env.YOUTUBE_DIGEST_GEMINI_MODEL || "gemini-2.5-flash-lite").trim();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: DIGEST_SCORE_SYSTEM }] },
      contents: [{ role: "user", parts: [{ text: userPayload }] }],
      generationConfig: { maxOutputTokens: 768, temperature: 0.2 },
    }),
    signal: AbortSignal.timeout(60_000),
  });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  const parts = data?.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts)
    ? parts.map((p) => (p && typeof p.text === "string" ? p.text : "")).join("")
    : "";
  const t = String(text).trim();
  return t || null;
}

async function azureDigestScore(userPayload) {
  const c = readDigestAzureChatConfig();
  if (!c) return null;
  const maxTok = Math.min(
    2048,
    Math.max(
      256,
      Number.parseInt(process.env.YOUTUBE_DIGEST_AZURE_MAX_OUTPUT_TOKENS || "512", 10) || 512,
    ),
  );
  const messages = [
    { role: "system", content: DIGEST_SCORE_SYSTEM },
    { role: "user", content: userPayload },
  ];
  const payload = JSON.stringify({
    messages,
    max_completion_tokens: maxTok,
    temperature: 0.2,
  });
  for (const deployment of c.deployments) {
    const url = `${c.endpoint}/openai/deployments/${encodeURIComponent(deployment)}/chat/completions?api-version=${encodeURIComponent(c.apiVersion)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": c.apiKey,
        "Api-Key": c.apiKey,
      },
      body: payload,
      signal: AbortSignal.timeout(90_000),
    });
    const errText = await res.text().then((t) => t.slice(0, 800)).catch(() => "");
    if (!res.ok) {
      if (res.status === 429 || res.status === 503) await sleep(1200);
      continue;
    }
    let data;
    try {
      data = JSON.parse(errText);
    } catch {
      continue;
    }
    const text = data?.choices?.[0]?.message?.content?.trim();
    if (text) return text;
  }
  return null;
}

/**
 * @returns {Promise<string | null>} raw model text
 */
async function digestLlmScoreRaw(userPayload) {
  const mode = (process.env.YOUTUBE_DIGEST_LLM || "auto").trim().toLowerCase() || "auto";
  if (mode === "azure") {
    return (await azureDigestScore(userPayload)) || null;
  }
  if (mode === "gemini") {
    return (await geminiDigestScore(userPayload)) || null;
  }
  const g = await geminiDigestScore(userPayload);
  if (g) return g;
  return (await azureDigestScore(userPayload)) || null;
}

/**
 * AI gate before Supadata: metadata-only estimate of article-worthy script density.
 * @returns {Promise<{ ok: true, score: number, reason: string | null, article_potential: string | null, skipTranscript?: boolean, skipReason?: string | null, dims?: object | null } | { ok: false, note: string }>}
 */
async function scoreVideoBeforeTranscript(meta) {
  const userPayload = buildPreTranscriptScoreUserPayload(meta);
  let lastRaw = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    const raw = await digestLlmScoreRaw(userPayload);
    lastRaw = raw || "";
    const parsed = parsePreTranscriptScoreJson(raw);
    if (parsed) {
      const gate = digestAiTopicHardReject(parsed);
      return {
        ok: true,
        score: parsed.score,
        reason: parsed.reason_short,
        article_potential: parsed.article_potential,
        skipTranscript: gate.reject,
        skipReason: gate.reject ? gate.reason : null,
        dims: {
          format_fit: parsed.format_fit,
          useful: parsed.useful,
          interesting: parsed.interesting,
          primary_topic_risk: parsed.primary_topic_risk,
        },
      };
    }
    await sleep(350 * (attempt + 1));
  }
  const clip = lastRaw.replace(/\s+/g, " ").trim().slice(0, 120);
  const baseNote = clip
    ? `ai: JSON 파싱 실패 (응답 일부: ${clip}…)`
    : "ai: 모델 응답 없음 또는 빈 응답";

  if (digestAiNoFallback()) {
    return {
      ok: false,
      note: baseNote,
    };
  }

  const fb = digestAiScoreOnFailureFallback();
  log.trace(
    `  · ${baseNote} → fallback score ${fb}/100 (Supadata 시도). 끄려면 YOUTUBE_DIGEST_AI_NO_FALLBACK=1`,
  );
  return {
    ok: true,
    score: fb,
    reason: `${baseNote} → fallback`,
    article_potential: "medium",
    skipTranscript: false,
    skipReason: null,
    dims: null,
  };
}

function transcriptMeetsMin(transcript) {
  const t = transcript?.text?.trim();
  if (!t || t.length < MIN_TRANSCRIPT_CHARS) return false;
  const meaningful = transcriptTextWithoutBracketAnnotations(t);
  if (meaningful.length < digestMinMeaningfulTranscriptChars()) return false;
  return true;
}

function resolveSupadataApiKey() {
  return process.env.SUPADATA_API_KEY?.trim() || "";
}

const SUPADATA_BASE = "https://api.supadata.ai/v1";

/**
 * Supadata transcript API — https://docs.supadata.ai/get-transcript
 * @returns {{ transcript: { format: string, text: string } | null, note: string | null }}
 */
async function fetchTranscriptSupadata(videoId) {
  if (process.env.YOUTUBE_DIGEST_SKIP_SUPADATA === "1") {
    return { transcript: null, note: "supadata skipped (YOUTUBE_DIGEST_SKIP_SUPADATA=1)" };
  }
  const apiKey = resolveSupadataApiKey();
  if (!apiKey) {
    return { transcript: null, note: "supadata: missing SUPADATA_API_KEY" };
  }

  const langPref =
    (process.env.YOUTUBE_TRANSCRIPT_LANGS || "en,ko,hi").split(",")[0]?.trim() || "en";
  const mode = (process.env.SUPADATA_TRANSCRIPT_MODE || "auto").trim() || "auto";
  const headers = {
    "x-api-key": apiKey,
    Accept: "application/json",
  };

  const transcriptRequestUrl = () => {
    const u = new URL(`${SUPADATA_BASE}/transcript`);
    u.searchParams.set("url", `https://www.youtube.com/watch?v=${videoId}`);
    u.searchParams.set("text", "true");
    u.searchParams.set("lang", langPref);
    u.searchParams.set("mode", mode);
    return u.toString();
  };

  const parseContentToText = (json) => {
    const c = json?.content;
    if (typeof c === "string") return c.replace(/\s+/g, " ").trim();
    if (Array.isArray(c)) {
      return c
        .map((seg) => (seg && typeof seg.text === "string" ? seg.text : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return "";
  };

  const noteFromErrorJson = (json, status) => {
    const parts = [`HTTP ${status}`];
    if (json?.error) parts.push(String(json.error));
    if (json?.message) parts.push(String(json.message));
    if (json?.details) parts.push(String(json.details));
    const s = parts.join(" · ");
    return `supadata: ${s.length > 380 ? `${s.slice(0, 380)}…` : s}`;
  };

  try {
    let res = await fetch(transcriptRequestUrl(), {
      headers,
      signal: AbortSignal.timeout(120_000),
    });
    let json = await res.json().catch(() => null);

    if (res.status === 206) {
      return { transcript: null, note: noteFromErrorJson(json, 206) };
    }

    if ((res.status === 202 || res.status === 200) && json && typeof json.jobId === "string") {
      const { jobId } = json;
      const pollDeadline = Date.now() + 180_000;
      while (Date.now() < pollDeadline) {
        await sleep(1000);
        res = await fetch(`${SUPADATA_BASE}/transcript/${jobId}`, {
          headers,
          signal: AbortSignal.timeout(60_000),
        });
        json = await res.json().catch(() => null);
        if (!res.ok) {
          return { transcript: null, note: noteFromErrorJson(json, res.status) };
        }
        if (json?.status === "completed") break;
        if (json?.status === "failed") {
          return {
            transcript: null,
            note: noteFromErrorJson(
              { error: json.error, message: json.message, details: json.details },
              "job_failed",
            ),
          };
        }
      }
      if (!res?.ok || json?.status !== "completed") {
        return { transcript: null, note: "supadata: async job timeout or incomplete" };
      }
    } else if (!res.ok) {
      return { transcript: null, note: noteFromErrorJson(json, res.status) };
    }

    const text = parseContentToText(json);
    if (!text) {
      return { transcript: null, note: "supadata: empty content" };
    }
    return { transcript: { format: "supadata", text }, note: null };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { transcript: null, note: `supadata: ${msg.slice(0, 280)}` };
  }
}

async function searchVideos(apiKey, query, maxResults = 5, pageToken = null) {
  const u = new URL("https://www.googleapis.com/youtube/v3/search");
  u.searchParams.set("part", "snippet");
  u.searchParams.set("type", "video");
  u.searchParams.set("order", "viewCount");
  u.searchParams.set("q", query);
  u.searchParams.set("maxResults", String(maxResults));
  u.searchParams.set("key", apiKey);
  u.searchParams.set("relevanceLanguage", SEARCH_RELEVANCE_LANG);
  u.searchParams.set("regionCode", SEARCH_REGION_CODE);
  if (pageToken) u.searchParams.set("pageToken", pageToken);
  const res = await fetch(u);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`search.list failed: ${msg}`);
  }
  return {
    items: json.items || [],
    nextPageToken: json.nextPageToken ?? null,
  };
}

async function enrichVideoStats(apiKey, videoIds) {
  if (!videoIds.length) return {};
  const u = new URL("https://www.googleapis.com/youtube/v3/videos");
  u.searchParams.set("part", "statistics,snippet,contentDetails");
  u.searchParams.set("id", videoIds.join(","));
  u.searchParams.set("key", apiKey);
  const res = await fetch(u);
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message || res.statusText;
    throw new Error(`videos.list failed: ${msg}`);
  }
  const map = {};
  for (const it of json.items || []) {
    map[it.id] = it;
  }
  return map;
}

async function searchVideosAnyKey(keys, query, maxResults = 5, pageToken = null) {
  let lastErr = null;
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      const { items, nextPageToken } = await searchVideos(
        apiKey,
        query,
        maxResults,
        pageToken,
      );
      log.trace(`search.list  ${keyLabel(apiKey, i)}  ok`);
      return { items, nextPageToken, apiKey, keyIndex: i };
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      log.trace(`search.list  ${keyLabel(apiKey, i)}  실패 — ${msg}`);
      await sleep(250);
    }
  }
  throw lastErr || new Error("search.list: all keys failed");
}

async function enrichVideoStatsAnyKey(keys, videoIds, preferKey) {
  if (!videoIds.length) return { map: {}, apiKey: preferKey || keys[0] };
  const order = preferKey
    ? [preferKey, ...keys.filter((k) => k !== preferKey)]
    : [...keys];
  let lastErr = null;
  for (let i = 0; i < order.length; i++) {
    const apiKey = order[i];
    try {
      const map = await enrichVideoStats(apiKey, videoIds);
      const idx = keys.indexOf(apiKey);
      log.trace(`videos.list  ${keyLabel(apiKey, idx >= 0 ? idx : i)}  ok`);
      return { map, apiKey };
    } catch (e) {
      lastErr = e;
      const msg = e instanceof Error ? e.message : String(e);
      log.trace(`videos.list  ${keyLabel(apiKey, i)}  실패 — ${msg}`);
      await sleep(250);
    }
  }
  throw lastErr || new Error("videos.list: all keys failed");
}

function parseArgs(argv) {
  const candIdx = argv.indexOf("--candidates");
  let candidateCount = DIGEST_TOTAL_STOP_AFTER;
  if (candIdx !== -1 && argv[candIdx + 1]) {
    const parsed = Number.parseInt(argv[candIdx + 1], 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 20) {
      candidateCount = parsed;
    }
  }

  const qi = argv.indexOf("--queries");
  if (qi !== -1 && argv[qi + 1]) {
    return {
      queries: argv[qi + 1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      randomRun: false,
      candidateCount,
    };
  }
  let count = randomQueryCountFromEnv();
  const ci = argv.indexOf("--query-count");
  if (ci !== -1 && argv[ci + 1]) {
    const parsed = Number.parseInt(argv[ci + 1], 10);
    if (Number.isFinite(parsed) && parsed >= 1 && parsed <= 50) count = parsed;
  }
  const picked = pickRandomQueries(count);
  return { queries: picked, randomRun: true, randomCount: count, candidateCount };
}

async function main() {
  loadEnvLocal();
  const keys = listYoutubeApiKeys();
  if (!keys.length) {
    log.blank();
    log.err("YOUTUBE_API_KEY 없음 — .env.local 등에 YOUTUBE_API_KEY ~ YOUTUBE_API_KEY7 중 하나를 설정하세요.");
    log.blank();
    process.exit(1);
  }

  if (process.env.YOUTUBE_DIGEST_SKIP_SUPADATA !== "1" && !resolveSupadataApiKey()) {
    log.blank();
    log.err("SUPADATA_API_KEY가 필요합니다 (.env.local). 자막은 Supadata만 사용합니다.");
    log.blank();
    process.exit(1);
  }

  if (!digestSkipAiScore() && !digestLlmConfigured()) {
    log.blank();
    log.err(
      "트랜스크립트 전 AI 판별을 쓰려면 GEMINI_API_KEY(또는 GMINI_API_KEY) 또는 Azure OpenAI(AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, 배포 이름)을 설정하세요. 끄려면 YOUTUBE_DIGEST_SKIP_AI_SCORE=1",
    );
    log.blank();
    process.exit(1);
  }

  const { queries, randomRun, randomCount, candidateCount } = parseArgs(process.argv);
  const totalStopAfter = candidateCount;
  if (randomRun) {
    log.blank();
    log.trace(
      `이번 실행 주제: 풀에서 무작위 ${queries.length}개 (요청 ${randomCount} · 환경 YOUTUBE_DIGEST_RANDOM_QUERY_COUNT로 기본 변경 가능)`,
    );
    if (totalStopAfter > 1) {
      log.trace(`  · 후보 ${totalStopAfter}개까지 수집 (자막 확보 시 중단)`);
    }
    for (const rq of queries) {
      log.trace(`  → ${rq}`);
    }
    log.blank();
  }

  const seen = new Set();
  const results = [];

  for (const q of queries) {
    if (results.length >= totalStopAfter) break;
    log.queryOpen(q);
    const queue = [];
    let searchPageToken = null;
    let searchKey = null;
    let triedCandidates = 0;
    let acceptedForQuery = 0;
    let searchPagesFetched = 0;
    let steps = 0;

    const refillSearchQueue = async () => {
      const page = await searchVideosAnyKey(
        keys,
        q,
        SEARCH_PAGE_SIZE,
        searchPageToken,
      );
      searchKey = page.apiKey;
      searchPageToken = page.nextPageToken;
      searchPagesFetched++;
      for (const it of page.items) {
        const id = it.id?.videoId;
        if (id) queue.push({ id, searchItem: it });
      }
    };

    while (
      acceptedForQuery < PER_QUERY_TARGET &&
      triedCandidates < MAX_CANDIDATES_PER_QUERY &&
      steps < MAX_STEPS_PER_QUERY
    ) {
      steps++;
      if (!queue.length) {
        const noMorePages = searchPageToken === null && searchPagesFetched > 0;
        if (noMorePages) {
          log.searchExhausted(q);
          break;
        }
        await refillSearchQueue();
        if (!queue.length) {
          log.searchEmptyPage(q);
          break;
        }
      }

      const { id, searchItem: it } = queue.shift();
      if (seen.has(id)) continue;
      triedCandidates++;

      const { map: statsMap } = await enrichVideoStatsAnyKey(keys, [id], searchKey);
      await sleep(400);

      const v = statsMap[id];
      const durIso = v?.contentDetails?.duration;
      const durSec = parseYoutubeIsoDurationSeconds(durIso);
      const minD = digestMinVideoDurationSec();
      const maxD = digestMaxVideoDurationSec();
      if (process.env.YOUTUBE_DIGEST_SKIP_DURATION_FILTER !== "1") {
        if (durSec == null) {
          seen.add(id);
          log.trace(`  · skip ${id}: duration unavailable`);
          await sleep(150);
          continue;
        }
        if (durSec < minD || durSec > maxD) {
          seen.add(id);
          log.trace(
            `  · skip ${id}: length ${formatDurationMmSs(durSec)} (${durSec}s) — transcript only for ${minD}–${maxD}s`,
          );
          await sleep(150);
          continue;
        }
      }

      seen.add(id);
      const viewCount = v?.statistics?.viewCount ?? "?";
      const title = v?.snippet?.title || it.snippet?.title || "";
      const description = v?.snippet?.description || it.snippet?.description || "";
      const channelTitle = v?.snippet?.channelTitle || it.snippet?.channelTitle || "";

      let preAi = null;
      if (!digestSkipAiScore()) {
        const aiRes = await scoreVideoBeforeTranscript({
          query: q,
          videoId: id,
          title,
          description,
          channelTitle,
          viewCount: String(viewCount),
          durationSec: durSec,
        });
        const aiPause =
          Number.parseInt(process.env.YOUTUBE_DIGEST_AI_COOLDOWN_MS || "400", 10) || 400;
        await sleep(Math.max(0, aiPause));

        if (!aiRes.ok) {
          log.failSkip({
            id,
            title: title.slice(0, 120) + (title.length > 120 ? "…" : ""),
            reason: aiRes.note,
          });
          await sleep(500);
          continue;
        }

        if (aiRes.skipTranscript) {
          log.failSkip({
            id,
            title: title.slice(0, 120) + (title.length > 120 ? "…" : ""),
            reason: `ai 주제 게이트: ${aiRes.skipReason ?? "reject"} (점수 ${aiRes.score}/100${aiRes.reason ? ` — ${aiRes.reason}` : ""})`,
          });
          await sleep(400);
          continue;
        }

        preAi = {
          score: aiRes.score,
          reason: aiRes.reason,
          articlePotential: aiRes.article_potential,
          ...(aiRes.dims && typeof aiRes.dims === "object" ? { dims: aiRes.dims } : {}),
        };
        const minScore = digestAiScoreMin();
        if (aiRes.score < minScore) {
          const pot = aiRes.article_potential ? ` · ${aiRes.article_potential}` : "";
          log.failSkip({
            id,
            title: title.slice(0, 120) + (title.length > 120 ? "…" : ""),
            reason: `ai 사전 점수 ${aiRes.score}/100 (기준 ≥${minScore})${pot}${aiRes.reason ? ` — ${aiRes.reason}` : ""}`,
          });
          await sleep(400);
          continue;
        }
        log.trace(
          `  · ai pass ${id}: score ${aiRes.score}/100${aiRes.article_potential ? ` (${aiRes.article_potential})` : ""}${aiRes.reason ? ` — ${aiRes.reason}` : ""}`,
        );
      }

      let transcript = null;
      const sdRes = await fetchTranscriptSupadata(id);
      if (transcriptMeetsMin(sdRes.transcript)) {
        transcript = sdRes.transcript;
      }

      if (!transcriptMeetsMin(transcript)) {
        const base =
          sdRes.note ||
          "supadata: transcript too short, low meaningful text, or empty after filters";
        const reason = preAi ? `${base} (AI 사전 ${preAi.score}/100)` : base;
        log.failSkip({
          id,
          title: title.slice(0, 120) + (title.length > 120 ? "…" : ""),
          reason,
        });
        const pauseMs = looksLikeYoutubeTranscriptIpBlock(reason)
          ? Number.parseInt(process.env.YOUTUBE_DIGEST_IP_BLOCK_COOLDOWN_MS || "5000", 10) || 5000
          : 800;
        await sleep(pauseMs);
        continue;
      }

      const fmt = transcript.format || "unknown";
      const bodyForSummary = transcript.text;

      results.push({
        videoId: id,
        url: `https://www.youtube.com/watch?v=${id}`,
        title,
        channelTitle,
        viewCount,
        query: q,
        preTranscriptAi: preAi,
        durationSeconds: durSec ?? null,
        durationIso: durIso ?? null,
        transcriptSource: fmt,
        transcriptPreview:
          transcript.text.slice(0, 1200) + (transcript.text.length > 1200 ? "…" : ""),
        transcriptError: null,
        descriptionPreview: description.slice(0, 500) + (description.length > 500 ? "…" : ""),
        textForPersonalSummary: bodyForSummary.slice(0, 8000),
      });

      acceptedForQuery++;
      log.successKeep({
        n: acceptedForQuery,
        of: PER_QUERY_TARGET,
        id,
        title,
        viewCount,
        fmt,
        charCount: transcript.text.length,
      });
      await sleep(1200);
      if (results.length >= totalStopAfter) break;
    }

    if (results.length >= totalStopAfter) break;

    if (acceptedForQuery < PER_QUERY_TARGET) {
      const extra =
        steps >= MAX_STEPS_PER_QUERY ? `스텝 상한 ${MAX_STEPS_PER_QUERY} 도달` : "";
      log.queryShortfall(q, acceptedForQuery, triedCandidates, extra);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), "utf8");
  console.log(JSON.stringify({ out: OUT_JSON, count: results.length }, null, 2));
  log.bannerDone(OUT_JSON, results.length);
  for (const r of results) {
    log.resultCard(r);
  }
}

main().catch((e) => {
  log.blank();
  log.err(e instanceof Error ? e.message : String(e));
  if (e instanceof Error && e.stack) console.error(`${DIGEST_LOG}${C.dim}${e.stack}${C.r}`);
  log.blank();
  process.exit(1);
});
