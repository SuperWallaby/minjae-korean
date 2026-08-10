/**
 * Pronunciation-unit 2×4 flashcard grids — 8 words sharing one Hangul sound batch.
 * Visual north star: kids alphabet chart (letter badge + illustrated word tiles).
 * Merged into ALL_VOCAB_BUNDLES from bundle-catalog.ts.
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

type PronunciationCell = {
  hangul: string;
  romanization: string;
  english: string;
  icon: string;
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
  pronunciationUnit?: {
    hangulUnit: string;
    romanUnit: string;
    unitLabel: string;
    cells: PronunciationCell[];
  };
};

function Cell(
  hangul: string,
  romanization: string,
  english: string,
  icon: string,
): PronunciationCell {
  return { hangul, romanization, english, icon };
}

function pron(
  slug: string,
  title: string,
  unit: NonNullable<VocabBundle["pronunciationUnit"]>,
  tags: string[] = [],
  priority: BundlePriority = "high",
): VocabBundle {
  if (unit.cells.length !== 8) {
    throw new Error(`pron-${slug}: need exactly 8 cells (got ${unit.cells.length})`);
  }
  return {
    id: `pron-${slug}`,
    format: "pronunciation_grid",
    title,
    count: 8,
    fit: `2×4 flashcards — all words share ${unit.hangulUnit} (${unit.unitLabel})`,
    priority,
    tags: ["pronunciation", "hangul", "flashcard", "sound-batch", ...tags],
    preview: unit.cells.slice(0, 4).map((c) => c.hangul),
    pronunciationUnit: unit,
  };
}

/** Seed wave — common initial consonants / sound batches learners drill. */
export const PRONUNCIATION_GRID_WAVE_BUNDLES: VocabBundle[] = [
  pron(
    "s-sound",
    "ㅅ words in Korean",
    {
      hangulUnit: "ㅅ",
      romanUnit: "S · s",
      unitLabel: "S sound",
      cells: [
        Cell("사과", "sagwa", "apple", "red apple"),
        Cell("수박", "subak", "watermelon", "watermelon slice"),
        Cell("산", "san", "mountain", "simple mountain peak"),
        Cell("손", "son", "hand", "waving hand"),
        Cell("신발", "sinbal", "shoes", "sneakers"),
        Cell("시계", "sigye", "clock / watch", "round wall clock"),
        Cell("섬", "seom", "island", "tiny island with palm"),
        Cell("숲", "sup", "forest", "cluster of trees"),
      ],
    },
    ["consonant", "ㅅ"],
  ),
  pron(
    "g-sound",
    "ㄱ words in Korean",
    {
      hangulUnit: "ㄱ",
      romanUnit: "G · g",
      unitLabel: "G/K sound",
      cells: [
        Cell("가방", "gabang", "bag", "school backpack"),
        Cell("고기", "gogi", "meat", "grilled meat plate"),
        Cell("고양이", "goyangi", "cat", "sitting cat"),
        Cell("구름", "gureum", "cloud", "fluffy cloud"),
        Cell("기차", "gicha", "train", "simple train"),
        Cell("과일", "gwail", "fruit", "fruit bowl"),
        Cell("거울", "geoul", "mirror", "handheld mirror"),
        Cell("껌", "kkeom", "gum", "chewing gum pack"),
      ],
    },
    ["consonant", "ㄱ"],
  ),
  pron(
    "n-sound",
    "ㄴ words in Korean",
    {
      hangulUnit: "ㄴ",
      romanUnit: "N · n",
      unitLabel: "N sound",
      cells: [
        Cell("나무", "namu", "tree", "simple tree"),
        Cell("나비", "nabi", "butterfly", "butterfly"),
        Cell("눈", "nun", "eye / snow", "eye and snowflake"),
        Cell("노래", "norae", "song", "music note"),
        Cell("노트북", "noteubuk", "laptop", "open laptop"),
        Cell("뉴스", "nyuseu", "news", "newspaper"),
        Cell("낚시", "nakksi", "fishing", "fishing rod"),
        Cell("냄비", "naembi", "pot", "cooking pot"),
      ],
    },
    ["consonant", "ㄴ"],
  ),
  pron(
    "m-sound",
    "ㅁ words in Korean",
    {
      hangulUnit: "ㅁ",
      romanUnit: "M · m",
      unitLabel: "M sound",
      cells: [
        Cell("물", "mul", "water", "glass of water"),
        Cell("모자", "moja", "hat", "simple hat"),
        Cell("문", "mun", "door", "closed door"),
        Cell("망고", "mango", "mango", "mango fruit"),
        Cell("맛", "mat", "taste / flavor", "tongue with sparkles"),
        Cell("마음", "maeum", "heart / mind", "heart icon"),
        Cell("머리", "meori", "head / hair", "head silhouette"),
        Cell("목", "mok", "neck / throat", "scarf on neck"),
      ],
    },
    ["consonant", "ㅁ"],
  ),
  pron(
    "b-sound",
    "ㅂ words in Korean",
    {
      hangulUnit: "ㅂ",
      romanUnit: "B · b",
      unitLabel: "B/P sound",
      cells: [
        Cell("밥", "bap", "rice / meal", "bowl of rice"),
        Cell("버스", "beoseu", "bus", "city bus"),
        Cell("비", "bi", "rain", "rain cloud"),
        Cell("바지", "baji", "pants", "pair of pants"),
        Cell("병원", "byeongwon", "hospital", "hospital building"),
        Cell("배", "bae", "boat / pear / belly", "small boat"),
        Cell("불", "bul", "fire", "campfire"),
        Cell("빵", "ppang", "bread", "loaf of bread"),
      ],
    },
    ["consonant", "ㅂ"],
  ),
  pron(
    "j-sound",
    "ㅈ words in Korean",
    {
      hangulUnit: "ㅈ",
      romanUnit: "J · j",
      unitLabel: "J sound",
      cells: [
        Cell("집", "jip", "house", "cute house"),
        Cell("자동차", "jadongcha", "car", "simple car"),
        Cell("전화", "jeonhwa", "phone", "smartphone"),
        Cell("종이", "jongi", "paper", "stack of paper"),
        Cell("주스", "juseu", "juice", "juice glass"),
        Cell("지도", "jido", "map", "folded map"),
        Cell("자전거", "jajeongeo", "bike", "bicycle"),
        Cell("주말", "jumal", "weekend", "calendar weekend"),
      ],
    },
    ["consonant", "ㅈ"],
  ),
  pron(
    "a-vowel",
    "ㅏ words in Korean",
    {
      hangulUnit: "ㅏ",
      romanUnit: "A · a",
      unitLabel: "A vowel",
      cells: [
        Cell("아이", "ai", "child", "small child waving"),
        Cell("아침", "achim", "morning", "sunrise"),
        Cell("아빠", "appa", "dad", "dad figure"),
        Cell("바다", "bada", "sea", "ocean waves"),
        Cell("사자", "saja", "lion", "lion face"),
        Cell("가방", "gabang", "bag", "tote bag"),
        Cell("나라", "nara", "country", "globe"),
        Cell("사과", "sagwa", "apple", "apple"),
      ],
    },
    ["vowel", "ㅏ"],
  ),
  pron(
    "batchim-ng",
    "받침 ㅇ words in Korean",
    {
      hangulUnit: "ㅇ",
      romanUnit: "-ng",
      unitLabel: "batchim ng",
      cells: [
        Cell("강", "gang", "river", "river"),
        Cell("방", "bang", "room", "empty room"),
        Cell("빵", "ppang", "bread", "bread loaf"),
        Cell("공", "gong", "ball", "soccer ball"),
        Cell("성", "seong", "castle / star", "castle tower"),
        Cell("공원", "gongwon", "park", "park bench"),
        Cell("공항", "gonghang", "airport", "airplane"),
        Cell("생일", "saengil", "birthday", "birthday cake"),
      ],
    },
    ["batchim", "ㅇ"],
  ),
  pron(
    "ch-sound",
    "ㅊ words in Korean",
    {
      hangulUnit: "ㅊ",
      romanUnit: "Ch · ch",
      unitLabel: "Ch sound",
      cells: [
        Cell("친구", "chingu", "friend", "two friends"),
        Cell("책", "chaek", "book", "open book"),
        Cell("차", "cha", "tea / car", "tea cup"),
        Cell("창문", "changmun", "window", "window"),
        Cell("초콜릿", "chokollit", "chocolate", "chocolate bar"),
        Cell("치마", "chima", "skirt", "skirt"),
        Cell("추위", "chuwi", "cold weather", "person shivering"),
        Cell("축제", "chukje", "festival", "festival lanterns"),
      ],
    },
    ["consonant", "ㅊ"],
  ),
  pron(
    "h-sound",
    "ㅎ words in Korean",
    {
      hangulUnit: "ㅎ",
      romanUnit: "H · h",
      unitLabel: "H sound",
      cells: [
        Cell("하늘", "haneul", "sky", "blue sky"),
        Cell("학교", "hakgyo", "school", "school building"),
        Cell("호수", "hosu", "lake", "calm lake"),
        Cell("핸드폰", "haendeupon", "phone", "phone"),
        Cell("휴지", "hyuji", "tissue", "tissue pack"),
        Cell("호텔", "hotel", "hotel", "hotel building"),
        Cell("행복", "haengbok", "happiness", "smiling face"),
        Cell("하루", "haru", "one day", "sun and moon"),
      ],
    },
    ["consonant", "ㅎ"],
  ),
];
