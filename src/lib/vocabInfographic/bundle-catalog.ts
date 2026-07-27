import type { VocabInfographicFormatId } from "./formats";
import { WAVE2_GRID_BUNDLES } from "./bundle-catalog-wave2";
import {
  EXPR_WAVE_BUNDLES,
  EXPR_WAVE_CONCEPT_BUNDLES,
  EXPR_WAVE_PHRASE_BUNDLES,
  EXPR_WAVE_SIMILAR_BUNDLES,
  EXPR_WAVE_TOPIK_BUNDLES,
} from "./bundle-catalog-expr-wave";

export type BundlePriority = "high" | "medium" | "low";

export type QuizOption = {
  hangul: string;
  romanization: string;
};

export type QuizBundleData = {
  badge?: string;
  level?: string;
  direction?: string;
  question: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
  correctIndex: 1 | 2 | 3 | 4;
};

/** One pedagogical row for concept_rows diagrams. */
export type ConceptRow = {
  english: string;
  hangul: string;
  romanization: string;
  /** How the right-side diagram should look (for the image model). */
  visual: string;
};

/** One line for phrase_stack cards. */
export type PhraseLine = {
  hangul: string;
  romanization: string;
  english: string;
};

/** Locked pair for similar_split (near-synonym / confusable). */
export type SimilarPairData = {
  leftEnglish: string;
  rightEnglish: string;
  leftHangul: string;
  rightHangul: string;
  leftRom: string;
  rightRom: string;
  leftNuance: string;
  rightNuance: string;
};

/** One aligned row for topik_upgrade (beginner → advanced Hangul). */
export type TopikUpgradeRow = {
  english: string;
  topikI: { hangul: string; romanization: string };
  topikII: { hangul: string; romanization: string };
};

export type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
  quiz?: QuizBundleData;
  conceptRows?: ConceptRow[];
  phraseLines?: PhraseLine[];
  similarPair?: SimilarPairData;
  topikRows?: TopikUpgradeRow[];
};

type GridSeed = {
  slug: string;
  title: string;
  count?: 4 | 9 | 16;
  priority?: BundlePriority;
  tags: string[];
  fit?: string;
};

function gridBundle(seed: GridSeed): VocabBundle {
  const count = seed.count ?? 9;
  return {
    id: `grid-${seed.slug}`,
    format: "grid_cluster",
    title: seed.title,
    count,
    fit: seed.fit ?? `Homogeneous ${count}-cell grid — same part of speech, one theme`,
    priority: seed.priority ?? "medium",
    tags: seed.tags,
  };
}

type AntonymSeed = {
  slug: string;
  left: string;
  right: string;
  theme: string;
  priority?: BundlePriority;
  tags?: string[];
};

function antonymBundle(seed: AntonymSeed): VocabBundle {
  return {
    id: `ant-${seed.slug}`,
    format: "antonym_split",
    title: `${seed.left} vs ${seed.right}`,
    count: 2,
    fit: `Antonym pair — ${seed.theme}`,
    priority: seed.priority ?? "medium",
    tags: seed.tags ?? ["antonym", seed.theme],
  };
}

type SimilarSeed = {
  slug: string;
  leftEnglish: string;
  rightEnglish: string;
  leftHangul: string;
  rightHangul: string;
  leftRom: string;
  rightRom: string;
  leftNuance: string;
  rightNuance: string;
  theme: string;
  priority?: BundlePriority;
  tags?: string[];
};

function similarBundle(seed: SimilarSeed): VocabBundle {
  return {
    id: `sim-${seed.slug}`,
    format: "similar_split",
    title: `${seed.leftEnglish} vs ${seed.rightEnglish}`,
    count: 2,
    fit: `Near-synonyms — ${seed.theme}: ${seed.leftNuance} / ${seed.rightNuance}`,
    priority: seed.priority ?? "high",
    tags: seed.tags ?? ["similar", seed.theme],
    similarPair: {
      leftEnglish: seed.leftEnglish,
      rightEnglish: seed.rightEnglish,
      leftHangul: seed.leftHangul,
      rightHangul: seed.rightHangul,
      leftRom: seed.leftRom,
      rightRom: seed.rightRom,
      leftNuance: seed.leftNuance,
      rightNuance: seed.rightNuance,
    },
    preview: [seed.leftEnglish, seed.rightEnglish],
  };
}

type SuperListSeed = {
  slug: string;
  title: string;
  count: number;
  orderKey: string;
  priority?: BundlePriority;
  tags: string[];
};

function superListBundle(seed: SuperListSeed): VocabBundle {
  return {
    id: `list-${seed.slug}`,
    format: "super_list",
    title: seed.title,
    count: seed.count,
    fit: `Ordered list — ${seed.orderKey}`,
    priority: seed.priority ?? "medium",
    tags: seed.tags,
  };
}

type QuizSeed = {
  slug: string;
  title: string;
  question: string;
  options: [QuizOption, QuizOption, QuizOption, QuizOption];
  correctIndex: 1 | 2 | 3 | 4;
  level?: string;
  priority?: BundlePriority;
  tags: string[];
  fit?: string;
};

function quizBundle(seed: QuizSeed): VocabBundle {
  return {
    id: `quiz-${seed.slug}`,
    format: "quiz_comment",
    title: seed.title,
    count: 4,
    fit: seed.fit ?? "4-choice near-synonym quiz — comment bait",
    priority: seed.priority ?? "high",
    tags: seed.tags,
    quiz: {
      badge: "KOREAN WORD QUIZ",
      level: seed.level ?? "Beginner",
      direction: "English → Korean",
      question: seed.question,
      options: seed.options,
      correctIndex: seed.correctIndex,
    },
  };
}

type ConceptRowsSeed = {
  slug: string;
  title: string;
  rows: ConceptRow[];
  priority?: BundlePriority;
  tags: string[];
  fit?: string;
};

function conceptRowsBundle(seed: ConceptRowsSeed): VocabBundle {
  return {
    id: `concept-${seed.slug}`,
    format: "concept_rows",
    title: seed.title,
    count: seed.rows.length,
    fit: seed.fit ?? "Concept diagram rows — shared pictograms + accent markup",
    priority: seed.priority ?? "high",
    tags: seed.tags,
    conceptRows: seed.rows,
    preview: seed.rows.map((r) => r.english),
  };
}

type PhraseStackSeed = {
  slug: string;
  title: string;
  lines: PhraseLine[];
  priority?: BundlePriority;
  tags: string[];
  fit?: string;
  /** Optional header vibe for the image model. */
  headerMood?: string;
};

function phraseStackBundle(seed: PhraseStackSeed): VocabBundle {
  return {
    id: `phrase-${seed.slug}`,
    format: "phrase_stack",
    title: seed.title,
    count: seed.lines.length,
    fit:
      seed.fit ??
      `Polished ${seed.lines.length}-phrase stack — spoken Korean, designed card`,
    priority: seed.priority ?? "high",
    tags: seed.tags,
    phraseLines: seed.lines,
    preview: seed.lines.map((l) => l.english),
  };
}

type TopikUpgradeSeed = {
  slug: string;
  title: string;
  rows: TopikUpgradeRow[];
  priority?: BundlePriority;
  tags: string[];
  fit?: string;
};

function topikUpgradeBundle(seed: TopikUpgradeSeed): VocabBundle {
  return {
    id: `topik-${seed.slug}`,
    format: "topik_upgrade",
    title: seed.title,
    count: seed.rows.length,
    fit:
      seed.fit ??
      `TOPIK I→II upgrade table — ${seed.rows.length} aligned Hangul pairs`,
    priority: seed.priority ?? "high",
    tags: seed.tags,
    topikRows: seed.rows,
    preview: seed.rows.map((r) => r.english),
  };
}

/** Format 1 — grid themes by domain (target ~210). */
const GRID_SEEDS = [
  // food & drink (38)
  ...[
    ["fruits-tropical", "Tropical fruits in Korean", "high"],
    ["fruits-temperate", "Temperate fruits in Korean", "high"],
    ["fruits-berries", "Berries in Korean", "medium"],
    ["fruits-citrus", "Citrus fruits in Korean", "medium"],
    ["fruits-stone", "Stone fruits in Korean", "medium"],
    ["fruits-dried", "Dried fruits in Korean", "low"],
    ["vegetables-leafy", "Leafy vegetables in Korean", "medium"],
    ["vegetables-root", "Root vegetables in Korean", "medium"],
    ["vegetables-nightshade", "Nightshade vegetables in Korean", "low"],
    ["vegetables-gourd", "Gourd vegetables in Korean", "low"],
    ["mushrooms-edible", "Mushrooms in Korean", "medium"],
    ["herbs-spices", "Herbs & spices in Korean", "high"],
    ["grains-cereals", "Grains & cereals in Korean", "medium"],
    ["noodles-types", "Noodle types in Korean", "medium"],
    ["rice-dishes", "Rice dishes in Korean", "high"],
    ["soups-korean", "Korean soups in Korean", "high"],
    ["stews-jjigae", "Korean stews in Korean", "high"],
    ["banchan-common", "Common banchan in Korean", "medium"],
    ["kimchi-varieties", "Kimchi varieties in Korean", "medium"],
    ["street-food-korea", "Korean street food in Korean", "high"],
    ["snacks-korea", "Korean snacks in Korean", "high"],
    ["desserts-korea", "Korean desserts in Korean", "medium"],
    ["desserts-western", "Western desserts in Korean", "medium"],
    ["bakery-items", "Bakery items in Korean", "medium"],
    ["candies-sweets", "Candies & sweets in Korean", "low"],
    ["condiments-sauces", "Condiments & sauces in Korean", "high"],
    ["fermented-foods", "Fermented foods in Korean", "medium"],
    ["bbq-grill-items", "BBQ & grill items in Korean", "medium"],
    ["seafood-fish", "Fish in Korean", "medium"],
    ["seafood-shellfish", "Shellfish in Korean", "medium"],
    ["meats-common", "Meats in Korean", "medium"],
    ["drinks-soft", "Soft drinks in Korean", "medium"],
    ["drinks-hot", "Hot drinks in Korean", "medium"],
    ["coffee-menu", "Coffee shop menu in Korean", "high"],
    ["tea-types", "Tea types in Korean", "medium"],
    ["alcohol-drinks", "Alcoholic drinks in Korean", "medium"],
    ["fast-food", "Fast food in Korean", "medium"],
    ["popular-kfood-icons", "Iconic Korean foods in Korean", "high"],
  ].map(([slug, title, priority]) => ({
    slug,
    title,
    priority: priority as BundlePriority,
    tags: ["food"],
  })),

  // animals (26)
  ...[
    "pets-common",
    "pets-exotic",
    "farm-animals",
    "wild-mammals",
    "birds-backyard",
    "birds-waterfowl",
    "insects-garden",
    "insects-household",
    "reptiles",
    "amphibians",
    "sea-creatures",
    "sea-mammals",
    "zoo-animals",
    "baby-animals",
    "dinosaurs",
    "arctic-animals",
    "desert-animals",
    "jungle-animals",
    "australian-animals",
    "african-safari",
    "pet-supplies",
    "aquarium-fish",
    "horse-riding",
    "bugs-kids-learn",
    "animal-groups",
    "nocturnal-animals",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["animals", "noun"],
  })),

  // nature & environment (18)
  ...[
    "trees-common",
    "flowers-spring",
    "flowers-year-round",
    "plants-houseplant",
    "plants-wild",
    "landscape-features",
    "weather-events",
    "natural-disasters",
    "beach-nature",
    "forest-nature",
    "mountain-nature",
    "river-lake",
    "sky-phenomena",
    "rocks-gems",
    "seasonal-nature",
    "garden-plants",
    "eco-green-living",
    "park-outdoors",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["nature"],
  })),

  // home & living (26)
  ...[
    "living-room",
    "bedroom",
    "bathroom-items",
    "kitchen-tools",
    "kitchen-appliances",
    "cookware",
    "tableware",
    "cutlery",
    "cleaning-supplies",
    "laundry-items",
    "furniture-basic",
    "lighting-home",
    "home-decor",
    "storage-organizing",
    "tools-diy",
    "garden-tools",
    "bedding",
    "curtains-blinds",
    "doors-windows",
    "flooring-materials",
    "household-chemicals",
    "garage-items",
    "moving-packing",
    "smart-home-devices",
    "baby-room",
    "pet-home-items",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["home", "noun"],
  })),

  // body, health & beauty (22)
  ...[
    "body-head",
    "body-torso",
    "body-limbs",
    "internal-organs",
    "five-senses",
    "symptoms-common",
    "illnesses-common",
    "medicine-types",
    "hospital-departments",
    "dental-care",
    "skincare-products",
    "makeup-cosmetics",
    "haircare",
    "hygiene-products",
    "first-aid",
    "fitness-equipment",
    "yoga-wellness",
    "vitamins-supplements",
    "mental-health-words",
    "sleep-rest",
    "spa-massage",
    "beauty-salon",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["health", "body"],
  })),

  // clothing & fashion (18)
  ...[
    "tops-clothing",
    "bottoms-clothing",
    "outerwear",
    "shoes-footwear",
    "accessories-fashion",
    "jewelry",
    "bags-purses",
    "winter-clothes",
    "summer-clothes",
    "hanbok-traditional",
    "uniforms",
    "sportswear",
    "sleepwear",
    "fabrics-textiles",
    "patterns-prints",
    "laundry-clothing-care",
    "shoe-types",
    "hat-headwear",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["fashion", "noun"],
  })),

  // travel & places (22)
  ...[
    "airport",
    "airplane-cabin",
    "train-station",
    "subway-metro",
    "bus-transit",
    "taxi-ridehare",
    "hotel-stay",
    "hostel-guesthouse",
    "landmarks-korea",
    "landmarks-seoul",
    "landmarks-world",
    "beach-travel",
    "camping-outdoors",
    "hiking-trail",
    "passport-immigration",
    "souvenirs",
    "travel-documents",
    "resort-pool",
    "theme-park",
    "museum-gallery",
    "city-places",
    "countryside-village",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["travel", "noun"],
  })),

  // school, work & office (20)
  ...[
    "school-subjects",
    "classroom-objects",
    "stationery",
    "university-campus",
    "science-lab",
    "library",
    "office-supplies",
    "meeting-business",
    "email-words",
    "presentation-words",
    "jobs-common",
    "jobs-medical",
    "jobs-creative",
    "jobs-service",
    "jobs-tech",
    "workplace-rooms",
    "factory-warehouse",
    "construction-site",
    "farm-work",
    "remote-work",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["school", "work"],
  })),

  // technology & digital (14)
  ...[
    "phone-parts",
    "computer-hardware",
    "software-ui",
    "social-media",
    "internet-terms",
    "gaming-words",
    "streaming-media",
    "smartphone-apps",
    "cybersecurity-basic",
    "ai-tech-terms",
    "photography-digital",
    "video-editing",
    "ecommerce-shopping",
    "coding-basics",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["technology"],
  })),

  // entertainment, sports & hobbies (22)
  ...[
    "musical-instruments",
    "music-genres",
    "movie-genres",
    "kpop-fan-words",
    "kdrama-words",
    "sports-ball",
    "sports-water",
    "sports-winter",
    "sports-martial",
    "olympic-sports",
    "hobbies-craft",
    "board-games",
    "video-game-terms",
    "dance-styles",
    "art-supplies",
    "photography-hobby",
    "camping-hobby",
    "fishing-hobby",
    "reading-books",
    "collecting-hobby",
    "party-celebration",
    "concert-live",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["entertainment", "hobby"],
  })),

  // emotions, personality & attitudes (14)
  ...[
    "emotions-basic",
    "emotions-advanced",
    "personality-positive",
    "personality-negative",
    "social-feelings",
    "attitudes-mindset",
    "mood-swings",
    "stress-anxiety",
    "confidence-self",
    "empathy-kindness",
    "anger-frustration",
    "surprise-shock",
    "boredom-interest",
    "gratitude-pride",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["emotion", "adjective"],
  })),

  // adjective sets (16)
  ...[
    "taste-flavor-adj",
    "texture-food-adj",
    "texture-touch-adj",
    "weather-adj",
    "temperature-adj",
    "size-adj",
    "shape-adj",
    "color-impression-adj",
    "speed-adj",
    "difficulty-adj",
    "beauty-appearance-adj",
    "cleanliness-adj",
    "sound-volume-adj",
    "smell-adj",
    "age-appearance-adj",
    "weight-density-adj",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["adjective"],
    fit: "Parallel adjective grid — same grammar slot",
  })),

  // verb sets (24)
  ...[
    "daily-routine-verbs",
    "morning-routine-verbs",
    "cooking-verbs",
    "cleaning-verbs",
    "movement-verbs",
    "communication-verbs",
    "study-verbs",
    "work-verbs",
    "shopping-verbs",
    "travel-verbs",
    "emotion-verbs",
    "perception-verbs",
    "giving-taking-verbs",
    "wearing-dressing-verbs",
    "fixing-repair-verbs",
    "playing-fun-verbs",
    "sports-action-verbs",
    "driving-verbs",
    "phone-call-verbs",
    "internet-verbs",
    "health-body-verbs",
    "garden-plant-verbs",
    "photo-video-verbs",
    "payment-money-verbs",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["verb"],
    fit: "Parallel verb grid — same conjugation pattern",
  })),

  // social & relationships (12)
  ...[
    ["relationship-romantic-4", "Relationship words in Korean", 4, "high"],
    ["family-nuclear", "Immediate family in Korean", 9, "high"],
    ["family-extended", "Extended family in Korean", 9, "medium"],
    ["greetings-social", "Social greetings in Korean", 9, "high"],
    ["courtesy-polite", "Courtesy phrases in Korean", 9, "medium"],
    ["apology-phrases", "Apology phrases in Korean", 4, "medium"],
    ["request-phrases", "Request phrases in Korean", 4, "medium"],
    ["compliment-phrases", "Compliments in Korean", 9, "medium"],
    ["friendship-words", "Friendship words in Korean", 9, "medium"],
    ["dating-words", "Dating vocabulary in Korean", 9, "medium"],
    ["wedding-words", "Wedding vocabulary in Korean", 9, "low"],
    ["neighbor-community", "Neighborhood words in Korean", 9, "low"],
  ].map(([slug, title, count, priority]) => ({
    slug,
    title,
    count: count as 4 | 9,
    priority: priority as BundlePriority,
    tags: ["social", "phrase"],
  })),

  // daily expressions & phrases (18)
  ...[
    ["cafe-order-phrases", "Café order phrases in Korean", 9, "high"],
    ["restaurant-phrases", "Restaurant phrases in Korean", 9, "high"],
    ["taxi-phrases", "Taxi phrases in Korean", 9, "high"],
    ["hotel-phrases", "Hotel phrases in Korean", 9, "medium"],
    ["shopping-phrases-grid", "Shopping phrases in Korean", 9, "high"],
    ["phone-text-phrases", "Phone & text phrases in Korean", 9, "medium"],
    ["small-talk-openers", "Small talk openers in Korean", 9, "medium"],
    ["agreeing-phrases", "Agreeing phrases in Korean", 9, "medium"],
    ["disagreeing-politely", "Polite disagreement in Korean", 4, "medium"],
    ["encouragement-phrases", "Encouragement phrases in Korean", 9, "medium"],
    ["farewell-phrases", "Farewell phrases in Korean", 9, "medium"],
    ["introduction-phrases", "Self-introduction phrases in Korean", 9, "high"],
    ["asking-directions-phrases", "Asking directions in Korean", 9, "high"],
    ["doctor-visit-phrases", "Doctor visit phrases in Korean", 9, "medium"],
    ["emergency-phrases", "Emergency phrases in Korean", 9, "high"],
    ["korean-reactions", "Common Korean reactions in Korean", 9, "high"],
    ["thanks-gratitude-phrases", "Thanks & gratitude in Korean", 9, "high"],
    ["excuse-me-phrases", "Excuse me phrases in Korean", 9, "medium"],
  ].map(([slug, title, count, priority]) => ({
    slug,
    title,
    count: count as 4 | 9,
    priority: priority as BundlePriority,
    tags: ["phrase", "daily"],
    fit: "Useful spoken phrase grid — same conversational slot",
  })),

  // extra verb grids (8)
  ...[
    "eating-drinking-verbs",
    "thinking-verbs",
    "waiting-patience-verbs",
    "helping-verbs",
    "borrowing-lending-verbs",
    "speaking-listening-verbs",
    "looking-searching-verbs",
    "deciding-choosing-verbs",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["verb"],
    fit: "Parallel verb grid — same conjugation pattern",
    priority: "medium" as const,
  })),

  // extra adjective / situation grids (8)
  ...[
    "situation-adj",
    "convenience-adj",
    "awkward-comfort-adj",
    "intensity-adj",
    "opinion-adj",
    "attitude-casual-adj",
    "reaction-adj",
    "memory-learning-adj",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["adjective"],
    fit: "Parallel adjective grid — same grammar slot",
    priority: "medium" as const,
  })),

  // Korean culture (12)
  ...[
    "holidays-korean",
    "traditions-korean",
    "historical-figures-korea",
    "palaces-korea",
    "temples-korea",
    "folk-games-korea",
    "korean-crafts",
    "korean-instruments-traditional",
    "seasonal-festivals-korea",
    "korean-etiquette",
    "chuseok-words",
    "seollal-words",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug)} in Korean`,
    tags: ["culture", "korea"],
  })),

  // 16-cell extended grids (8)
  ...[
    "office-supplies-16",
    "vegetables-market-16",
    "emoji-feelings-16",
    "kitchen-16",
    "tools-16",
    "school-16",
    "clothing-16",
    "nature-16",
  ].map((slug) => ({
    slug,
    title: `${titleCase(slug.replace("-16", ""))} in Korean (extended)`,
    count: 16 as const,
    tags: ["noun", "extended"],
    priority: "low" as const,
    fit: "16-cell grid — only when each icon stays readable",
  })),
] as GridSeed[];

/** Format 2 — antonym pairs (target ~78). */
const ANTONYM_SEEDS: AntonymSeed[] = [
  ["early-late", "Early", "Late", "time", "high"],
  ["hot-cold", "Hot", "Cold", "temperature", "high"],
  ["big-small", "Big", "Small", "size", "high"],
  ["fast-slow", "Fast", "Slow", "speed", "high"],
  ["expensive-cheap", "Expensive", "Cheap", "money", "high"],
  ["clean-dirty", "Clean", "Dirty", "state", "medium"],
  ["full-empty", "Full", "Empty", "container", "medium"],
  ["light-dark", "Light", "Dark", "brightness", "high"],
  ["easy-hard", "Easy", "Difficult", "difficulty", "high"],
  ["open-closed", "Open", "Closed", "state", "medium"],
  ["high-low", "High", "Low", "height", "medium"],
  ["new-old-thing", "New", "Old (thing)", "objects", "medium"],
  ["young-old-age", "Young", "Old (age)", "people", "medium"],
  ["strong-weak", "Strong", "Weak", "strength", "medium"],
  ["near-far", "Near", "Far", "distance", "medium"],
  ["loud-quiet", "Loud", "Quiet", "sound", "medium"],
  ["dry-wet", "Dry", "Wet", "moisture", "medium"],
  ["thick-thin", "Thick", "Thin", "thickness", "medium"],
  ["long-short", "Long", "Short", "length", "medium"],
  ["right-wrong", "Right", "Wrong", "correctness", "high"],
  ["safe-dangerous", "Safe", "Dangerous", "safety", "low"],
  ["inside-outside", "Inside", "Outside", "location", "medium"],
  ["before-after", "Before", "After", "time order", "medium"],
  ["more-less", "More", "Less", "quantity", "medium"],
  ["heavy-light-weight", "Heavy", "Light", "weight", "medium"],
  ["wide-narrow", "Wide", "Narrow", "width", "medium"],
  ["deep-shallow", "Deep", "Shallow", "depth", "low"],
  ["sharp-dull", "Sharp", "Dull", "edge", "low"],
  ["sweet-salty", "Sweet", "Salty", "taste", "medium"],
  ["sweet-bitter", "Sweet", "Bitter", "taste", "low"],
  ["spicy-mild", "Spicy", "Mild", "taste", "medium"],
  ["fresh-stale", "Fresh", "Stale", "food", "medium"],
  ["raw-cooked", "Raw", "Cooked", "food", "low"],
  ["rich-poor-money", "Rich", "Poor", "wealth", "medium"],
  ["happy-sad", "Happy", "Sad", "emotion", "high"],
  ["angry-calm", "Angry", "Calm", "emotion", "medium"],
  ["excited-bored", "Excited", "Bored", "emotion", "medium"],
  ["brave-scared", "Brave", "Scared", "emotion", "medium"],
  ["confident-shy", "Confident", "Shy", "personality", "medium"],
  ["kind-mean", "Kind", "Mean", "personality", "medium"],
  ["polite-rude", "Polite", "Rude", "manners", "high"],
  ["honest-dishonest", "Honest", "Dishonest", "character", "low"],
  ["busy-free", "Busy", "Free", "schedule", "high"],
  ["early-bird-night-owl", "Early bird", "Night owl", "habit", "low"],
  ["win-lose", "Win", "Lose", "competition", "medium"],
  ["success-fail", "Success", "Fail", "outcome", "medium"],
  ["start-stop", "Start", "Stop", "action", "medium"],
  ["push-pull", "Push", "Pull", "force", "low"],
  ["give-take", "Give", "Take", "transfer", "medium"],
  ["buy-sell", "Buy", "Sell", "commerce", "medium"],
  ["lend-borrow", "Lend", "Borrow", "loan", "medium"],
  ["borrow-return", "Borrow", "Return", "loan", "low"],
  ["arrive-leave", "Arrive", "Leave", "travel", "medium"],
  ["enter-exit", "Enter", "Exit", "movement", "medium"],
  ["up-down", "Up", "Down", "direction", "high"],
  ["left-right", "Left", "Right", "direction", "high"],
  ["front-back", "Front", "Back", "position", "medium"],
  ["top-bottom", "Top", "Bottom", "position", "medium"],
  ["north-south", "North", "South", "compass", "low"],
  ["east-west", "East", "West", "compass", "low"],
  ["public-private", "Public", "Private", "access", "low"],
  ["formal-casual", "Formal", "Casual", "register", "high"],
  ["literary-spoken", "Literary", "Spoken", "register", "low"],
  ["singular-plural", "One", "Many", "quantity", "medium"],
  ["same-different", "Same", "Different", "comparison", "high"],
  ["together-apart", "Together", "Apart", "relationship", "medium"],
  ["married-single", "Married", "Single", "status", "low"],
  ["employed-unemployed", "Employed", "Unemployed", "work", "low"],
  ["awake-asleep", "Awake", "Asleep", "sleep", "medium"],
  ["healthy-sick", "Healthy", "Sick", "health", "high"],
  ["full-hungry", "Full", "Hungry", "appetite", "medium"],
  ["thirsty-hydrated", "Thirsty", "Hydrated", "drink", "low"],
  ["tight-loose", "Tight", "Loose", "fit", "medium"],
  ["straight-curly-hair", "Straight hair", "Curly hair", "appearance", "low"],
  ["smooth-rough-touch", "Smooth", "Rough", "texture", "medium"],
  ["soft-hard-touch", "Soft", "Hard", "texture", "medium"],
  ["loud-silent-place", "Noisy place", "Silent place", "environment", "low"],
  ["crowded-empty-place", "Crowded", "Empty", "place", "medium"],
  ["modern-traditional", "Modern", "Traditional", "culture", "medium"],
  ["urban-rural", "Urban", "Rural", "area", "low"],
  ["local-foreign", "Local", "Foreign", "origin", "medium"],
].map(([slug, left, right, theme, priority]) => ({
  slug,
  left,
  right,
  theme,
  priority: priority as BundlePriority,
}));

/** Format 2b — near-synonym / confusable pairs (antonym-like split). */
const SIMILAR_SEEDS: SimilarSeed[] = [
  {
    slug: "know-understand",
    leftEnglish: "Know",
    rightEnglish: "Understand",
    leftHangul: "알다",
    rightHangul: "이해하다",
    leftRom: "alda",
    rightRom: "ihae-hada",
    leftNuance: "know a fact / info",
    rightNuance: "grasp the meaning",
    theme: "cognition",
    priority: "high",
  },
  {
    slug: "see-appear",
    leftEnglish: "See",
    rightEnglish: "Be seen / appear",
    leftHangul: "보다",
    rightHangul: "보이다",
    leftRom: "boda",
    rightRom: "boida",
    leftNuance: "I look / watch",
    rightNuance: "it looks / is visible",
    theme: "perception",
    priority: "high",
  },
  {
    slug: "hear-be-heard",
    leftEnglish: "Hear / listen",
    rightEnglish: "Be heard",
    leftHangul: "듣다",
    rightHangul: "들리다",
    leftRom: "deutda",
    rightRom: "deullida",
    leftNuance: "I listen",
    rightNuance: "it sounds / is audible",
    theme: "perception",
    priority: "high",
  },
  {
    slug: "see-meet-humble",
    leftEnglish: "See (plain)",
    rightEnglish: "See (humble)",
    leftHangul: "보다",
    rightHangul: "뵙다",
    leftRom: "boda",
    rightRom: "boepda",
    leftNuance: "casual / neutral",
    rightNuance: "humble to senior",
    theme: "honorific",
    priority: "high",
  },
  {
    slug: "give-give-humble",
    leftEnglish: "Give",
    rightEnglish: "Give (humble)",
    leftHangul: "주다",
    rightHangul: "드리다",
    leftRom: "juda",
    rightRom: "deurida",
    leftNuance: "give to anyone",
    rightNuance: "give to senior",
    theme: "honorific",
    priority: "high",
  },
  {
    slug: "eat-eat-honorific",
    leftEnglish: "Eat",
    rightEnglish: "Eat (honorific)",
    leftHangul: "먹다",
    rightHangul: "드시다",
    leftRom: "meokda",
    rightRom: "deusida",
    leftNuance: "plain",
    rightNuance: "honorific",
    theme: "honorific",
    priority: "high",
  },
  {
    slug: "speak-speak-honorific",
    leftEnglish: "Speak",
    rightEnglish: "Speak (honorific)",
    leftHangul: "말하다",
    rightHangul: "말씀하다",
    leftRom: "malhada",
    rightRom: "malsseumhada",
    leftNuance: "plain speak",
    rightNuance: "honorific / polite",
    theme: "honorific",
    priority: "high",
  },
  {
    slug: "exist-exist-honorific",
    leftEnglish: "Be / have",
    rightEnglish: "Be (honorific)",
    leftHangul: "있다",
    rightHangul: "계시다",
    leftRom: "itda",
    rightRom: "gyesida",
    leftNuance: "things / plain",
    rightNuance: "people (honorific)",
    theme: "honorific",
    priority: "high",
  },
  {
    slug: "meet-meet-humble",
    leftEnglish: "Meet",
    rightEnglish: "Meet (humble)",
    leftHangul: "만나다",
    rightHangul: "뵙다",
    leftRom: "mannada",
    rightRom: "boepda",
    leftNuance: "meet anyone",
    rightNuance: "meet a senior",
    theme: "honorific",
    priority: "medium",
  },
  {
    slug: "borrow-lend",
    leftEnglish: "Borrow",
    rightEnglish: "Lend",
    leftHangul: "빌리다",
    rightHangul: "빌려주다",
    leftRom: "billida",
    rightRom: "billyeojuda",
    leftNuance: "I take temporarily",
    rightNuance: "I give temporarily",
    theme: "direction",
    priority: "high",
  },
  {
    slug: "teach-learn",
    leftEnglish: "Teach",
    rightEnglish: "Learn",
    leftHangul: "가르치다",
    rightHangul: "배우다",
    leftRom: "gareuchida",
    rightRom: "baeuda",
    leftNuance: "I teach others",
    rightNuance: "I study / learn",
    theme: "direction",
    priority: "high",
  },
  {
    slug: "go-come",
    leftEnglish: "Go",
    rightEnglish: "Come",
    leftHangul: "가다",
    rightHangul: "오다",
    leftRom: "gada",
    rightRom: "oda",
    leftNuance: "move away from here",
    rightNuance: "move toward here",
    theme: "direction",
    priority: "high",
  },
  {
    slug: "small-few",
    leftEnglish: "Small (size)",
    rightEnglish: "Few (amount)",
    leftHangul: "작다",
    rightHangul: "적다",
    leftRom: "jakda",
    rightRom: "jeokda",
    leftNuance: "physical size",
    rightNuance: "quantity / amount",
    theme: "size-quantity",
    priority: "high",
  },
  {
    slug: "spicy-hot",
    leftEnglish: "Spicy",
    rightEnglish: "Hot (temp)",
    leftHangul: "맵다",
    rightHangul: "뜨겁다",
    leftRom: "maepda",
    rightRom: "tteugeopda",
    leftNuance: "chili heat",
    rightNuance: "temperature heat",
    theme: "taste-temp",
    priority: "high",
  },
  {
    slug: "hot-warm",
    leftEnglish: "Hot",
    rightEnglish: "Warm",
    leftHangul: "뜨겁다",
    rightHangul: "따뜻하다",
    leftRom: "tteugeopda",
    rightRom: "ttatteuthada",
    leftNuance: "burning hot",
    rightNuance: "pleasantly warm",
    theme: "temperature",
    priority: "medium",
  },
  {
    slug: "cold-cool",
    leftEnglish: "Cold",
    rightEnglish: "Cool / refreshing",
    leftHangul: "춥다",
    rightHangul: "시원하다",
    leftRom: "chupda",
    rightRom: "siwonhada",
    leftNuance: "weather / body cold",
    rightNuance: "refreshing cool",
    theme: "temperature",
    priority: "medium",
  },
  {
    slug: "tired-sleepy",
    leftEnglish: "Tired",
    rightEnglish: "Sleepy",
    leftHangul: "피곤하다",
    rightHangul: "졸리다",
    leftRom: "pigonhada",
    rightRom: "jollida",
    leftNuance: "exhausted / fatigue",
    rightNuance: "want to sleep",
    theme: "body",
    priority: "high",
  },
  {
    slug: "difficult-hard",
    leftEnglish: "Difficult",
    rightEnglish: "Hard / tough",
    leftHangul: "어렵다",
    rightHangul: "힘들다",
    leftRom: "eoryeopda",
    rightRom: "himdeulda",
    leftNuance: "hard to understand",
    rightNuance: "physically / mentally tough",
    theme: "difficulty",
    priority: "high",
  },
  {
    slug: "easy-simple",
    leftEnglish: "Easy",
    rightEnglish: "Simple",
    leftHangul: "쉽다",
    rightHangul: "간단하다",
    leftRom: "swipda",
    rightRom: "gandanhada",
    leftNuance: "not hard for me",
    rightNuance: "not complicated",
    theme: "difficulty",
    priority: "medium",
  },
  {
    slug: "pretty-beautiful",
    leftEnglish: "Pretty",
    rightEnglish: "Beautiful",
    leftHangul: "예쁘다",
    rightHangul: "아름답다",
    leftRom: "yeppeuda",
    rightRom: "areumdapda",
    leftNuance: "cute / pretty look",
    rightNuance: "deeper beauty",
    theme: "appearance",
    priority: "medium",
  },
  {
    slug: "like-love",
    leftEnglish: "Like",
    rightEnglish: "Love",
    leftHangul: "좋아하다",
    rightHangul: "사랑하다",
    leftRom: "joahada",
    rightRom: "saranghada",
    leftNuance: "enjoy / prefer",
    rightNuance: "deep love",
    theme: "emotion",
    priority: "high",
  },
  {
    slug: "fun-interesting",
    leftEnglish: "Fun",
    rightEnglish: "Interesting",
    leftHangul: "재미있다",
    rightHangul: "흥미롭다",
    leftRom: "jaemiitda",
    rightRom: "heungmiropda",
    leftNuance: "entertaining / funny",
    rightNuance: "curious / intriguing",
    theme: "emotion",
    priority: "medium",
  },
  {
    slug: "okay-good",
    leftEnglish: "Okay / fine",
    rightEnglish: "Good",
    leftHangul: "괜찮다",
    rightHangul: "좋다",
    leftRom: "gwaenchanta",
    rightRom: "jota",
    leftNuance: "acceptable / alright",
    rightNuance: "positively good",
    theme: "evaluation",
    priority: "medium",
  },
  {
    slug: "wear-clothes-shoes",
    leftEnglish: "Wear (clothes)",
    rightEnglish: "Wear (shoes)",
    leftHangul: "입다",
    rightHangul: "신다",
    leftRom: "ipda",
    rightRom: "sinda",
    leftNuance: "shirts, pants…",
    rightNuance: "shoes, socks…",
    theme: "wear-verbs",
    priority: "high",
  },
  {
    slug: "wear-clothes-hat",
    leftEnglish: "Wear (clothes)",
    rightEnglish: "Wear (hat / glasses)",
    leftHangul: "입다",
    rightHangul: "쓰다",
    leftRom: "ipda",
    rightRom: "sseuda",
    leftNuance: "on the body",
    rightNuance: "on the head / face",
    theme: "wear-verbs",
    priority: "high",
  },
  {
    slug: "open-turn-on",
    leftEnglish: "Open",
    rightEnglish: "Turn on",
    leftHangul: "열다",
    rightHangul: "켜다",
    leftRom: "yeolda",
    rightRom: "kyeoda",
    leftNuance: "door / book / bag",
    rightNuance: "light / device",
    theme: "actions",
    priority: "high",
  },
  {
    slug: "close-turn-off",
    leftEnglish: "Close",
    rightEnglish: "Turn off",
    leftHangul: "닫다",
    rightHangul: "끄다",
    leftRom: "datda",
    rightRom: "kkeuda",
    leftNuance: "door / lid",
    rightNuance: "light / device",
    theme: "actions",
    priority: "high",
  },
  {
    slug: "send-mail",
    leftEnglish: "Send",
    rightEnglish: "Mail / ship",
    leftHangul: "보내다",
    rightHangul: "부치다",
    leftRom: "bonaeda",
    rightRom: "buchida",
    leftNuance: "send generally",
    rightNuance: "post / courier",
    theme: "actions",
    priority: "medium",
  },
  {
    slug: "look-for-find",
    leftEnglish: "Look for",
    rightEnglish: "Find / discover",
    leftHangul: "찾다",
    rightHangul: "발견하다",
    leftRom: "chatda",
    rightRom: "balgyeonhada",
    leftNuance: "searching",
    rightNuance: "spot / discover",
    theme: "actions",
    priority: "medium",
  },
  {
    slug: "think-feel",
    leftEnglish: "Think",
    rightEnglish: "Feel",
    leftHangul: "생각하다",
    rightHangul: "느끼다",
    leftRom: "saenggakhada",
    rightRom: "neukkida",
    leftNuance: "in the mind",
    rightNuance: "emotion / sense",
    theme: "cognition",
    priority: "medium",
  },
  {
    slug: "ask-question",
    leftEnglish: "Ask",
    rightEnglish: "Ask a question",
    leftHangul: "물어보다",
    rightHangul: "질문하다",
    leftRom: "mureoboda",
    rightRom: "jilmunhada",
    leftNuance: "everyday ask",
    rightNuance: "formal / quiz ask",
    theme: "speech",
    priority: "medium",
  },
  {
    slug: "speak-chat",
    leftEnglish: "Speak / say",
    rightEnglish: "Talk / chat",
    leftHangul: "말하다",
    rightHangul: "이야기하다",
    leftRom: "malhada",
    rightRom: "iyagihada",
    leftNuance: "say words",
    rightNuance: "have a conversation",
    theme: "speech",
    priority: "medium",
  },
  {
    slug: "receive-obtain",
    leftEnglish: "Receive",
    rightEnglish: "Obtain / get",
    leftHangul: "받다",
    rightHangul: "얻다",
    leftRom: "batda",
    rightRom: "eotda",
    leftNuance: "be given something",
    rightNuance: "gain / acquire",
    theme: "possession",
    priority: "medium",
  },
  {
    slug: "buy-purchase",
    leftEnglish: "Buy",
    rightEnglish: "Purchase",
    leftHangul: "사다",
    rightHangul: "구입하다",
    leftRom: "sada",
    rightRom: "guiphada",
    leftNuance: "everyday buy",
    rightNuance: "formal / written",
    theme: "shopping",
    priority: "low",
  },
  {
    slug: "laugh-smile",
    leftEnglish: "Laugh",
    rightEnglish: "Smile",
    leftHangul: "웃다",
    rightHangul: "미소짓다",
    leftRom: "utda",
    rightRom: "misojitda",
    leftNuance: "audible laugh",
    rightNuance: "quiet smile",
    theme: "emotion",
    priority: "medium",
  },
  {
    slug: "kind-affectionate",
    leftEnglish: "Kind",
    rightEnglish: "Affectionate",
    leftHangul: "친절하다",
    rightHangul: "다정하다",
    leftRom: "chinjeolhada",
    rightRom: "dajeonghada",
    leftNuance: "polite / helpful",
    rightNuance: "warm / tender",
    theme: "personality",
    priority: "low",
  },
  {
    slug: "fast-urgent",
    leftEnglish: "Fast",
    rightEnglish: "Urgent / rushed",
    leftHangul: "빠르다",
    rightHangul: "급하다",
    leftRom: "ppareuda",
    rightRom: "geuphada",
    leftNuance: "high speed",
    rightNuance: "in a hurry",
    theme: "speed",
    priority: "medium",
  },
  {
    slug: "late-slow",
    leftEnglish: "Late",
    rightEnglish: "Slow",
    leftHangul: "늦다",
    rightHangul: "느리다",
    leftRom: "neutda",
    rightRom: "neurida",
    leftNuance: "after the time",
    rightNuance: "low speed",
    theme: "speed",
    priority: "high",
  },
  {
    slug: "hurt-uncomfortable",
    leftEnglish: "Hurt / sick",
    rightEnglish: "Uncomfortable",
    leftHangul: "아프다",
    rightHangul: "불편하다",
    leftRom: "apeuda",
    rightRom: "bulpyeonhada",
    leftNuance: "pain / illness",
    rightNuance: "awkward / not comfy",
    theme: "body",
    priority: "medium",
  },
  {
    slug: "eye-snow-homonym",
    leftEnglish: "Eye",
    rightEnglish: "Snow",
    leftHangul: "눈",
    rightHangul: "눈",
    leftRom: "nun",
    rightRom: "nun",
    leftNuance: "body part",
    rightNuance: "weather",
    theme: "homonym",
    priority: "high",
    tags: ["similar", "homonym"],
  },
].map((s) => ({
  ...s,
  tags: s.tags ?? ["similar", s.theme],
}));

/** Format 3 — ordered super lists (target ~72). */
const SUPER_LIST_SEEDS = [
  // numbers & counting (12)
  ...[
    ["numbers-powers-ten", "Numbers in Korean (powers of 10)", 10, "magnitude", "high", ["numbers"]],
    ["numbers-1-20", "Numbers 1–20 in Korean", 20, "ascending count", "high", ["numbers", "beginner"]],
    ["numbers-tens", "Tens in Korean (10–100)", 10, "×10 steps", "medium", ["numbers"]],
    ["native-korean-numbers", "Native Korean numbers 1–10", 10, "native counter set", "high", ["numbers"]],
    ["sino-korean-numbers", "Sino-Korean numbers 1–10", 10, "sino set", "high", ["numbers"]],
    ["ordinal-numbers", "Ordinal numbers in Korean", 10, "1st–10th", "medium", ["numbers"]],
    ["math-symbols-words", "Math terms in Korean", 12, "operator order", "low", ["numbers", "school"]],
    ["percent-fraction-words", "Percent & fractions in Korean", 9, "math speech", "low", ["numbers"]],
    ["large-number-units", "Large number units in Korean", 9, "만·억·조", "high", ["numbers"]],
    ["phone-number-phrases", "Phone number phrases in Korean", 9, "0–9 speech", "medium", ["numbers", "daily"]],
    ["age-expressions", "Age expressions in Korean", 10, "years old pattern", "high", ["numbers", "daily"]],
    ["counting-practice-1-12", "Counting practice 1–12 in Korean", 12, "drill order", "medium", ["numbers"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // money & commerce (8)
  ...[
    ["money-krw", "Korean money in Korean", 8, "denomination value", "high", ["money"]],
    ["payment-methods", "Payment methods in Korean", 9, "cash→mobile pay", "high", ["money"]],
    ["shopping-phrases-short", "Shopping phrases in Korean", 10, "store flow", "medium", ["money", "phrase"]],
    ["bank-words", "Bank vocabulary in Korean", 12, "service order", "medium", ["money"]],
    ["receipt-invoice-words", "Receipt & invoice words in Korean", 9, "document fields", "low", ["money"]],
    ["tax-tip-words", "Tax & tip words in Korean", 9, "fee types", "low", ["money"]],
    ["currency-world-major", "World currencies in Korean", 12, "region group", "low", ["money", "travel"]],
    ["discount-sale-words", "Discount & sale words in Korean", 10, "promo types", "medium", ["money"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // colors & appearance (6)
  ...[
    ["colors-basic", "Basic colors in Korean", 12, "spectrum + neutrals", "high", ["colors"]],
    ["colors-extended", "Extended colors in Korean", 16, "hue family", "medium", ["colors"]],
    ["hair-colors", "Hair colors in Korean", 9, "shade order", "low", ["colors"]],
    ["eye-colors", "Eye colors in Korean", 9, "shade order", "low", ["colors"]],
    ["skin-tones-descriptive", "Skin tone words in Korean", 9, "descriptive scale", "low", ["colors"]],
    ["makeup-shades", "Makeup shade words in Korean", 10, "tone scale", "low", ["colors", "beauty"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // time & calendar (14)
  ...[
    ["weekdays", "Days of the week in Korean", 7, "Mon→Sun", "high", ["time"]],
    ["months", "Months in Korean", 12, "Jan→Dec", "high", ["time"]],
    ["seasons", "Seasons in Korean", 4, "spring cycle", "high", ["time"]],
    ["seasons-plus-weather", "Seasons & weather in Korean", 9, "season + weather", "medium", ["time", "weather"]],
    ["time-hours-12", "Hours 1–12 in Korean", 12, "clock order", "medium", ["time"]],
    ["time-minutes-phrases", "Minutes & time phrases in Korean", 10, "minute blocks", "medium", ["time"]],
    ["time-day-parts", "Parts of the day in Korean", 9, "dawn→night", "high", ["time"]],
    ["frequency-adverbs", "Frequency adverbs in Korean", 10, "always→never scale", "high", ["grammar"]],
    ["past-present-future", "Time tense words in Korean", 9, "time axis", "medium", ["grammar"]],
    ["calendar-holidays-kr", "Korean public holidays in Korean", 12, "calendar year", "medium", ["culture", "time"]],
    ["zodiac-animals", "Zodiac animals in Korean", 12, "12-year cycle", "low", ["culture"]],
    ["zodiac-signs-western", "Western zodiac in Korean", 12, "sign order", "low", ["culture"]],
    ["decades-centuries", "Decade & century words in Korean", 9, "time scale", "low", ["time"]],
    ["appointment-scheduling", "Scheduling words in Korean", 10, "booking flow", "medium", ["time", "daily"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // hangul & pronunciation (8)
  ...[
    ["hangul-consonants", "Korean consonants", 14, "ㄱ→ㅎ chart", "high", ["hangul"]],
    ["hangul-vowels", "Korean vowels", 10, "vowel chart", "high", ["hangul"]],
    ["hangul-double-consonants", "Korean double consonants", 5, "tense set", "medium", ["hangul"]],
    ["hangul-diphthongs", "Korean vowel combinations", 11, "combo chart", "medium", ["hangul"]],
    ["batchim-basics", "Batchim (final consonant) basics in Korean", 9, "consonant coda", "medium", ["hangul"]],
    ["romanization-guide", "Romanization patterns in Korean", 10, "rule list", "low", ["hangul"]],
    ["pronunciation-mistakes", "Common pronunciation tips in Korean", 10, "learner order", "medium", ["hangul"]],
    ["keyboard-hangul-layout", "Hangul keyboard order in Korean", 10, "layout row", "low", ["hangul"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // grammar & function words (10)
  ...[
    ["counters-common", "Korean counters", 12, "frequency rank", "high", ["grammar"]],
    ["counters-people-objects", "More Korean counters", 12, "category group", "medium", ["grammar"]],
    ["question-words", "Question words in Korean", 9, "who→how", "high", ["grammar"]],
    ["demonstratives", "This/that in Korean", 9, "near→far", "high", ["grammar"]],
    ["particles-topic-subject", "Topic & subject particles in Korean", 9, "grammar set", "high", ["grammar"]],
    ["particles-object-location", "Object & location particles in Korean", 10, "grammar set", "high", ["grammar"]],
    ["connectors-sentences", "Sentence connectors in Korean", 12, "discourse order", "medium", ["grammar"]],
    ["honorific-levels", "Honorific speech levels in Korean", 9, "formality scale", "medium", ["grammar"]],
    ["endings-formal-informal", "Sentence endings in Korean", 10, "speech level", "medium", ["grammar"]],
    ["negation-patterns", "Negation patterns in Korean", 9, "pattern list", "medium", ["grammar"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // body, family, directions (8)
  ...[
    ["body-parts-full", "Body parts in Korean", 15, "head→toe", "high", ["body"]],
    ["family-members", "Family members in Korean", 12, "generation tree", "high", ["family"]],
    ["family-inlaw", "In-law family terms in Korean", 10, "relation tree", "medium", ["family"]],
    ["directions-compass", "Directions in Korean", 9, "NSEW + up/down", "medium", ["location"]],
    ["position-words", "Position words in Korean", 12, "above/between/behind", "medium", ["location"]],
    ["emergency-numbers-kr", "Emergency numbers in Korea", 9, "service priority", "high", ["travel", "daily"]],
    ["symptoms-body-order", "Body symptoms in Korean", 12, "head→toe check", "medium", ["health"]],
    ["allergies-diet-labels", "Allergy & diet labels in Korean", 10, "label type", "medium", ["food", "health"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),

  // geography & culture lists (6)
  ...[
    ["korean-provinces", "Korean regions in Korean", 17, "admin order", "low", ["culture", "korea"]],
    ["seoul-districts", "Seoul districts in Korean", 25, "district list", "low", ["culture", "korea"]],
    ["korean-food-unesco", "Famous Korean foods in Korean", 12, "fame rank", "medium", ["food", "culture"]],
    ["kpop-generations", "K-pop generation terms in Korean", 9, "era order", "low", ["culture"]],
    ["korean-ingredients-staples", "Korean pantry staples in Korean", 12, "cook order", "medium", ["food"]],
    ["traditional-crafts-order", "Traditional crafts in Korean", 10, "craft type", "low", ["culture"]],
  ].map(([slug, title, count, orderKey, priority, tags]) => ({
    slug,
    title,
    count: count as number,
    orderKey,
    priority: priority as BundlePriority,
    tags: tags as string[],
  })),
] as SuperListSeed[];

/** Format 4 — comment-bait multiple choice (~12+ seeds). */
const QUIZ_SEEDS: QuizSeed[] = [
  {
    slug: "consider-vs-think",
    title: "Consider vs think quiz",
    question: 'Which Korean word means "to consider / think carefully about"?',
    options: [
      { hangul: "생각하다", romanization: "saenggakhada" },
      { hangul: "고려하다", romanization: "goryeohada" },
      { hangul: "알다", romanization: "alda" },
      { hangul: "이해하다", romanization: "ihaehada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs", "nuance"],
    fit: "Think vs consider vs know vs understand",
  },
  {
    slug: "pretty-vs-beautiful",
    title: "Pretty vs beautiful quiz",
    question: 'Which Korean word means "pretty / cute-looking" (often for people)?',
    options: [
      { hangul: "예쁘다", romanization: "yeppeuda" },
      { hangul: "아름답다", romanization: "areumdapda" },
      { hangul: "멋지다", romanization: "meotjida" },
      { hangul: "귀엽다", romanization: "gwiyeopda" },
    ],
    correctIndex: 1,
    tags: ["quiz", "adjectives"],
    fit: "Pretty vs beautiful vs cool vs cute",
  },
  {
    slug: "want-vs-need",
    title: "Want vs need quiz",
    question: 'Which Korean word means "to need / require"?',
    options: [
      { hangul: "원하다", romanization: "wonhada" },
      { hangul: "필요하다", romanization: "piryohada" },
      { hangul: "바라다", romanization: "barada" },
      { hangul: "희망하다", romanization: "huimanghada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs"],
    fit: "Want vs need vs wish vs hope",
  },
  {
    slug: "learn-vs-study",
    title: "Learn vs study quiz",
    question: 'Which Korean word means "to study (academic)"?',
    options: [
      { hangul: "배우다", romanization: "baeuda" },
      { hangul: "공부하다", romanization: "gongbuhada" },
      { hangul: "연습하다", romanization: "yeonseuphada" },
      { hangul: "외우다", romanization: "oeuda" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs", "study"],
    fit: "Learn vs study vs practice vs memorize",
  },
  {
    slug: "like-vs-love",
    title: "Like vs love quiz",
    question: 'Which Korean word means "to love (romantic/deep)"?',
    options: [
      { hangul: "좋아하다", romanization: "joahada" },
      { hangul: "사랑하다", romanization: "saranghada" },
      { hangul: "즐기다", romanization: "jeulgida" },
      { hangul: "선호하다", romanization: "seonhohada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs", "emotions"],
    fit: "Like vs love vs enjoy vs prefer",
  },
  {
    slug: "see-vs-look",
    title: "See vs look quiz",
    question: 'Which Korean word means "to look at / gaze at"?',
    options: [
      { hangul: "보다", romanization: "boda" },
      { hangul: "바라보다", romanization: "baraboda" },
      { hangul: "구경하다", romanization: "gugyeonghada" },
      { hangul: "살피다", romanization: "salpida" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs"],
    fit: "See vs look at vs sightsee vs examine",
  },
  {
    slug: "hear-vs-listen",
    title: "Hear vs listen quiz",
    question: 'Which Korean word means "to be heard / audible"?',
    options: [
      { hangul: "듣다", romanization: "deutda" },
      { hangul: "들리다", romanization: "deullida" },
      { hangul: "귀 기울이다", romanization: "gwi giurida" },
      { hangul: "알아듣다", romanization: "aradeutda" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs"],
    fit: "Hear vs be heard vs listen vs understand speech",
  },
  {
    slug: "go-vs-come",
    title: "Go vs come quiz",
    question: 'Which Korean word means "to come (toward speaker)"?',
    options: [
      { hangul: "가다", romanization: "gada" },
      { hangul: "오다", romanization: "oda" },
      { hangul: "떠나다", romanization: "tteonada" },
      { hangul: "도착하다", romanization: "dochakhada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs", "direction"],
    fit: "Go vs come vs leave vs arrive",
  },
  {
    slug: "ask-vs-request",
    title: "Ask vs request quiz",
    question: 'Which Korean word means "to ask a question"?',
    options: [
      { hangul: "묻다", romanization: "mutda" },
      { hangul: "질문하다", romanization: "jilmunhada" },
      { hangul: "부탁하다", romanization: "butakhada" },
      { hangul: "요청하다", romanization: "yocheonghada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "verbs"],
    fit: "Ask vs question vs ask favor vs request",
  },
  {
    slug: "speak-vs-say",
    title: "Speak vs say quiz",
    question: 'Which Korean word means "to speak / talk (in a language)"?',
    options: [
      { hangul: "말하다", romanization: "malhada" },
      { hangul: "이야기하다", romanization: "iyagihada" },
      { hangul: "대화하다", romanization: "daehwahada" },
      { hangul: "말씀하다", romanization: "malsseumhada" },
    ],
    correctIndex: 1,
    tags: ["quiz", "verbs"],
    fit: "Say vs chat vs converse vs speak honorific",
  },
  {
    slug: "big-vs-large",
    title: "Big vs large quiz",
    question: 'Which Korean word means "huge / enormous"?',
    options: [
      { hangul: "크다", romanization: "keuda" },
      { hangul: "넓다", romanization: "neolda" },
      { hangul: "거대하다", romanization: "geodaehada" },
      { hangul: "많다", romanization: "manta" },
    ],
    correctIndex: 3,
    tags: ["quiz", "adjectives"],
    fit: "Big vs wide vs huge vs many",
  },
  {
    slug: "sad-vs-lonely",
    title: "Sad vs lonely quiz",
    question: 'Which Korean word means "lonely / lonesome"?',
    options: [
      { hangul: "슬프다", romanization: "seulpeuda" },
      { hangul: "외롭다", romanization: "oeropda" },
      { hangul: "실망하다", romanization: "silmanghada" },
      { hangul: "화나다", romanization: "hwanada" },
    ],
    correctIndex: 2,
    tags: ["quiz", "adjectives", "emotions"],
    fit: "Sad vs lonely vs disappointed vs angry",
  },
];

const CONCEPT_ROWS_SEEDS: ConceptRowsSeed[] = [
  {
    slug: "indefinite-pronouns",
    title: "Indefinite pronouns in Korean",
    priority: "high",
    tags: ["grammar", "pronouns", "concept", "beginner"],
    fit: "2×2 simple scene panels — minimal props, never stick-figure oval charts",
    rows: [
      {
        english: "everybody",
        hangul: "모두",
        romanization: "modu",
        visual: "Three simple smiling people standing together on empty cream background",
      },
      {
        english: "somebody",
        hangul: "누군가",
        romanization: "nugunga",
        visual: "One silhouette person with a small question mark, empty background",
      },
      {
        english: "anybody",
        hangul: "누구든지",
        romanization: "nugudeunji",
        visual: "One open door and a single welcome arrow, empty background",
      },
      {
        english: "nobody",
        hangul: "아무도",
        romanization: "amudo",
        visual: "One empty bench, no people, soft empty park background",
      },
    ],
  },
  {
    slug: "demonstratives",
    title: "This that these those in Korean",
    priority: "high",
    tags: ["grammar", "demonstratives", "concept", "beginner"],
    fit: "Near/far object panels — simple props only",
    rows: [
      {
        english: "this",
        hangul: "이것",
        romanization: "igeot",
        visual: "One hand holding a snack close to camera, empty background",
      },
      {
        english: "that (near you)",
        hangul: "그것",
        romanization: "geugeot",
        visual: "One snack on a table near a second person, empty background",
      },
      {
        english: "that (over there)",
        hangul: "저것",
        romanization: "jeogeot",
        visual: "One small snack icon farther away with a distance arrow, empty background",
      },
      {
        english: "these",
        hangul: "이것들",
        romanization: "igeotdeul",
        visual: "Two hands holding a few snacks close up, empty background",
      },
    ],
  },
  {
    slug: "polite-vs-casual",
    title: "Polite vs casual endings in Korean",
    priority: "medium",
    tags: ["grammar", "speech-level", "concept", "beginner"],
    fit: "Simple two-person greeting/thanks panels",
    rows: [
      {
        english: "polite hello",
        hangul: "안녕하세요",
        romanization: "annyeonghaseyo",
        visual: "Two people, one small bow, empty background",
      },
      {
        english: "casual hello",
        hangul: "안녕",
        romanization: "annyeong",
        visual: "Two friends waving casually, empty background",
      },
      {
        english: "polite thanks",
        hangul: "감사합니다",
        romanization: "gamsahamnida",
        visual: "Customer and barista, polite nod, empty background",
      },
      {
        english: "casual thanks",
        hangul: "고마워",
        romanization: "gomawo",
        visual: "Friend handing a drink, casual smile, empty background",
      },
    ],
  },  {
    slug: "topic-vs-subject",
    title: "Topic vs subject particles in Korean",
    priority: "high",
    tags: ["grammar", "particles", "concept", "beginner"],
    fit: "Conversation spotlight vs identity label scenes",
    rows: [
      {
        english: "as for me… (topic)",
        hangul: "나는",
        romanization: "naneun",
        visual:
          "Soft spotlight on a student starting a story about themselves at a study table",
      },
      {
        english: "I (do)… (subject)",
        hangul: "내가",
        romanization: "naega",
        visual: "Same student raising a hand to answer — the doer of the action",
      },
      {
        english: "as for coffee…",
        hangul: "커피는",
        romanization: "keopineun",
        visual: "Menu board with coffee circled as the conversation topic",
      },
      {
        english: "coffee is…",
        hangul: "커피가",
        romanization: "keopiga",
        visual: "Steaming coffee cup as the thing being described (hot/delicious)",
      },
    ],
  },
  {
    slug: "location-particles",
    title: "Location particles in Korean",
    priority: "high",
    tags: ["grammar", "particles", "concept", "place"],
    fit: "Where you go / where you are / path you take",
    rows: [
      {
        english: "to / at (destination)",
        hangul: "에",
        romanization: "e",
        visual: "Person arriving at a library entrance with an arrow pointing to the door",
      },
      {
        english: "at / in (doing there)",
        hangul: "에서",
        romanization: "eseo",
        visual: "Same person reading books inside the library (action happens there)",
      },
      {
        english: "toward / by means of",
        hangul: "으로",
        romanization: "euro",
        visual: "Person walking toward a subway entrance / choosing a path",
      },
      {
        english: "from (starting point)",
        hangul: "부터",
        romanization: "buteo",
        visual: "Train platform clock and a person starting a journey from station A",
      },
    ],
  },
  {
    slug: "time-words",
    title: "Time words in Korean",
    priority: "high",
    tags: ["grammar", "time", "concept", "beginner"],
    fit: "Clock / calendar vignettes across a day",
    rows: [
      {
        english: "now",
        hangul: "지금",
        romanization: "jigeum",
        visual: "Phone lock screen showing the current time, person checking it",
      },
      {
        english: "a while ago",
        hangul: "아까",
        romanization: "akka",
        visual: "Empty coffee cup and a clock slightly in the past (recent moment)",
      },
      {
        english: "later",
        hangul: "나중에",
        romanization: "najunge",
        visual: "Calendar sticky note saying later, person postponing a task",
      },
      {
        english: "tomorrow",
        hangul: "내일",
        romanization: "naeil",
        visual: "Sunrise over a desk with tomorrow’s schedule open",
      },
    ],
  },
  {
    slug: "counters-people-things",
    title: "Counters for people and things",
    priority: "high",
    tags: ["grammar", "counters", "concept", "beginner"],
    fit: "Same number, different counter depending on what you count",
    rows: [
      {
        english: "two people",
        hangul: "두 명",
        romanization: "du myeong",
        visual: "Two friends standing side by side with a soft ‘2’ badge",
      },
      {
        english: "two things",
        hangul: "두 개",
        romanization: "du gae",
        visual: "Two apples on a plate with a soft ‘2’ badge",
      },
      {
        english: "two animals",
        hangul: "두 마리",
        romanization: "du mari",
        visual: "Two cute cats sitting together with a soft ‘2’ badge",
      },
      {
        english: "two books",
        hangul: "두 권",
        romanization: "du gwon",
        visual: "Two hardcover books stacked, soft ‘2’ badge",
      },
    ],
  },
  {
    slug: "want-vs-like",
    title: "Want vs like in Korean",
    priority: "high",
    tags: ["grammar", "verbs", "concept", "beginner"],
    fit: "Desire vs preference mini-scenes",
    rows: [
      {
        english: "I want to eat",
        hangul: "먹고 싶어요",
        romanization: "meokgo sipeoyo",
        visual: "Hungry person looking at a menu, thought bubble of noodles",
      },
      {
        english: "I like noodles",
        hangul: "국수를 좋아해요",
        romanization: "guksureul joahaeyo",
        visual: "Happy person eating noodles with a heart over the bowl (preference)",
      },
      {
        english: "I want to go",
        hangul: "가고 싶어요",
        romanization: "gago sipeoyo",
        visual: "Person packing a small bag, looking at a travel map",
      },
      {
        english: "I like traveling",
        hangul: "여행을 좋아해요",
        romanization: "yeohaengeul joahaeyo",
        visual: "Person smiling with passport stickers / souvenirs (hobby vibe)",
      },
    ],
  },
  {
    slug: "before-vs-after",
    title: "Before vs after in Korean",
    priority: "medium",
    tags: ["grammar", "time", "concept", "beginner"],
    fit: "Split timeline scenes: before action / after action",
    rows: [
      {
        english: "before class",
        hangul: "수업 전에",
        romanization: "sueop jeone",
        visual: "Student reviewing notes outside a classroom door before it starts",
      },
      {
        english: "after class",
        hangul: "수업 후에",
        romanization: "sueop hue",
        visual: "Students leaving the classroom chatting after the lesson",
      },
      {
        english: "before eating",
        hangul: "먹기 전에",
        romanization: "meokgi jeone",
        visual: "Hands washing / saying thanks over untouched food",
      },
      {
        english: "after eating",
        hangul: "먹은 후에",
        romanization: "meogeun hue",
        visual: "Empty plates and a content person leaning back",
      },
    ],
  },
  {
    slug: "give-vs-receive",
    title: "Give vs receive in Korean",
    priority: "medium",
    tags: ["grammar", "verbs", "concept", "beginner"],
    fit: "Gift exchange from both perspectives",
    rows: [
      {
        english: "to give",
        hangul: "주다",
        romanization: "juda",
        visual: "Person handing a wrapped gift toward a friend",
      },
      {
        english: "to receive",
        hangul: "받다",
        romanization: "batda",
        visual: "Friend accepting the gift with both hands, surprised smile",
      },
      {
        english: "please give me…",
        hangul: "주세요",
        romanization: "juseyo",
        visual: "Customer politely asking a shopkeeper for an item",
      },
      {
        english: "I received it",
        hangul: "받았어요",
        romanization: "badasseoyo",
        visual: "Person holding an opened package at home, happy",
      },
    ],
  },
];

const PHRASE_STACK_SEEDS: PhraseStackSeed[] = [
  {
    slug: "how-are-you-feeling",
    title: "How are you feeling? in Korean",
    priority: "high",
    tags: ["phrase", "questions", "feelings", "spoken", "beginner"],
    fit: "8 clean check-in questions — polished stack, not a text dump",
    headerMood: "soft chat bubbles and a cozy evening phone glow",
    lines: [
      { hangul: "괜찮아?", romanization: "gwaenchana?", english: "Are you okay?" },
      { hangul: "진심이야?", romanization: "jinsimiya?", english: "Are you serious?" },
      { hangul: "긴장돼?", romanization: "ginjangdwae?", english: "Are you nervous?" },
      { hangul: "화났어?", romanization: "hwanasseo?", english: "Are you angry?" },
      { hangul: "무서워?", romanization: "museowo?", english: "Are you scared?" },
      { hangul: "피곤해?", romanization: "pigonhae?", english: "Are you tired?" },
      { hangul: "배고파?", romanization: "baegopa?", english: "Are you hungry?" },
      { hangul: "확실해?", romanization: "hwaksilhae?", english: "Are you sure?" },
    ],
  },
  {
    slug: "plans-and-availability",
    title: "Plans & availability in Korean",
    priority: "high",
    tags: ["phrase", "questions", "meetup", "spoken", "beginner"],
    fit: "8 meetup / schedule openers",
    headerMood: "calendar stickers and a coffee cup on a café table",
    lines: [
      { hangul: "바빠?", romanization: "bappa?", english: "Are you busy?" },
      { hangul: "시간 있어?", romanization: "sigan isseo?", english: "Do you have time?" },
      { hangul: "오늘 어때?", romanization: "oneul eottae?", english: "How about today?" },
      { hangul: "언제 돼?", romanization: "eonje dwae?", english: "When works for you?" },
      { hangul: "어디야?", romanization: "eodiya?", english: "Where are you?" },
      { hangul: "집이야?", romanization: "jibiya?", english: "Are you home?" },
      { hangul: "준비됐어?", romanization: "junbidwaesseo?", english: "Are you ready?" },
      { hangul: "갈까?", romanization: "galkka?", english: "Shall we go?" },
    ],
  },
  {
    slug: "cafe-orders",
    title: "Café order phrases in Korean",
    priority: "medium",
    tags: ["phrase", "cafe", "spoken", "beginner"],
    fit: "8 café counter lines",
    headerMood: "iced americano and pastry on a tray",
    lines: [
      { hangul: "주문할게요", romanization: "jumunhalgeyo", english: "I'd like to order" },
      { hangul: "아메리카노 주세요", romanization: "amerikano juseyo", english: "Americano, please" },
      { hangul: "아이스로 해주세요", romanization: "aiseuro haejuseyo", english: "Make it iced" },
      { hangul: "덜 달게 해주세요", romanization: "deol dalge haejuseyo", english: "Less sweet, please" },
      { hangul: "여기요", romanization: "yeogiyo", english: "Excuse me (to staff)" },
      { hangul: "포장해주세요", romanization: "pojanghaejuseyo", english: "To go, please" },
      { hangul: "카드로 할게요", romanization: "kadeuro halgeyo", english: "I'll pay by card" },
      { hangul: "감사합니다", romanization: "gamsahamnida", english: "Thank you" },
    ],
  },
];

/** Format — TOPIK I ↔ II upgrade tables (beginner → formal/exam Hangul). */
const TOPIK_UPGRADE_SEEDS: TopikUpgradeSeed[] = [
  {
    slug: "speaking-verbs",
    title: "Speaking verbs: TOPIK I → II",
    priority: "high",
    tags: ["topik", "verbs", "speech", "upgrade"],
    fit: "Everyday say/talk → more formal / exam wording",
    rows: [
      {
        english: "say",
        topikI: { hangul: "말하다", romanization: "malhada" },
        topikII: { hangul: "말씀하다", romanization: "malsseumhada" },
      },
      {
        english: "talk about",
        topikI: { hangul: "이야기하다", romanization: "iyagihada" },
        topikII: { hangul: "논의하다", romanization: "nonuihada" },
      },
      {
        english: "ask",
        topikI: { hangul: "물어보다", romanization: "mureoboda" },
        topikII: { hangul: "문의하다", romanization: "munuihada" },
      },
      {
        english: "answer",
        topikI: { hangul: "대답하다", romanization: "daedaphada" },
        topikII: { hangul: "답변하다", romanization: "dapbyeonhada" },
      },
      {
        english: "explain",
        topikI: { hangul: "설명하다", romanization: "seolmyeonghada" },
        topikII: { hangul: "해명하다", romanization: "haemyeonghada" },
      },
      {
        english: "tell / inform",
        topikI: { hangul: "알려 주다", romanization: "allyeo juda" },
        topikII: { hangul: "통보하다", romanization: "tongbohada" },
      },
      {
        english: "introduce",
        topikI: { hangul: "소개하다", romanization: "sogaehada" },
        topikII: { hangul: "소개해 드리다", romanization: "sogaehae deurida" },
      },
      {
        english: "promise",
        topikI: { hangul: "약속하다", romanization: "yaksokhada" },
        topikII: { hangul: "약속드리다", romanization: "yaksokdeurida" },
      },
    ],
  },
  {
    slug: "thinking-verbs",
    title: "Thinking verbs: TOPIK I → II",
    priority: "high",
    tags: ["topik", "verbs", "cognition", "upgrade"],
    rows: [
      {
        english: "think",
        topikI: { hangul: "생각하다", romanization: "saenggakhada" },
        topikII: { hangul: "고려하다", romanization: "goryeohada" },
      },
      {
        english: "know",
        topikI: { hangul: "알다", romanization: "alda" },
        topikII: { hangul: "인지하다", romanization: "injihada" },
      },
      {
        english: "understand",
        topikI: { hangul: "이해하다", romanization: "ihae-hada" },
        topikII: { hangul: "파악하다", romanization: "paakhada" },
      },
      {
        english: "remember",
        topikI: { hangul: "기억하다", romanization: "gieokhada" },
        topikII: { hangul: "상기하다", romanization: "sanggihada" },
      },
      {
        english: "forget",
        topikI: { hangul: "잊다", romanization: "itda" },
        topikII: { hangul: "망각하다", romanization: "manggakhada" },
      },
      {
        english: "believe",
        topikI: { hangul: "믿다", romanization: "mitda" },
        topikII: { hangul: "신뢰하다", romanization: "sinroehadа" },
      },
      {
        english: "decide",
        topikI: { hangul: "정하다", romanization: "jeonghada" },
        topikII: { hangul: "결정하다", romanization: "gyeoljeonghada" },
      },
      {
        english: "expect",
        topikI: { hangul: "기대하다", romanization: "gidaehada" },
        topikII: { hangul: "예상하다", romanization: "yesanghada" },
      },
    ],
  },
  {
    slug: "action-verbs",
    title: "Everyday actions: TOPIK I → II",
    priority: "high",
    tags: ["topik", "verbs", "daily", "upgrade"],
    rows: [
      {
        english: "do / make",
        topikI: { hangul: "하다", romanization: "hada" },
        topikII: { hangul: "실시하다", romanization: "silsihada" },
      },
      {
        english: "start",
        topikI: { hangul: "시작하다", romanization: "sijakhada" },
        topikII: { hangul: "개시하다", romanization: "gaesihada" },
      },
      {
        english: "finish",
        topikI: { hangul: "끝내다", romanization: "kkeunnaeda" },
        topikII: { hangul: "완료하다", romanization: "wanryohada" },
      },
      {
        english: "use",
        topikI: { hangul: "쓰다", romanization: "sseuda" },
        topikII: { hangul: "사용하다", romanization: "sayonghada" },
      },
      {
        english: "change",
        topikI: { hangul: "바꾸다", romanization: "bakkuda" },
        topikII: { hangul: "변경하다", romanization: "byeongyeonghada" },
      },
      {
        english: "help",
        topikI: { hangul: "도와주다", romanization: "dowajuda" },
        topikII: { hangul: "지원하다", romanization: "jiwonhada" },
      },
      {
        english: "get / obtain",
        topikI: { hangul: "받다", romanization: "batda" },
        topikII: { hangul: "수령하다", romanization: "suryeonghada" },
      },
      {
        english: "give",
        topikI: { hangul: "주다", romanization: "juda" },
        topikII: { hangul: "제공하다", romanization: "jegonghada" },
      },
    ],
  },
  {
    slug: "study-work",
    title: "Study & work: TOPIK I → II",
    priority: "high",
    tags: ["topik", "school", "work", "upgrade"],
    rows: [
      {
        english: "study",
        topikI: { hangul: "공부하다", romanization: "gongbuhada" },
        topikII: { hangul: "학습하다", romanization: "hakseuphada" },
      },
      {
        english: "work",
        topikI: { hangul: "일하다", romanization: "ilhada" },
        topikII: { hangul: "근무하다", romanization: "geunmuhada" },
      },
      {
        english: "prepare",
        topikI: { hangul: "준비하다", romanization: "junbihada" },
        topikII: { hangul: "대비하다", romanization: "daebihada" },
      },
      {
        english: "practice",
        topikI: { hangul: "연습하다", romanization: "yeonseuphada" },
        topikII: { hangul: "훈련하다", romanization: "hullyeonhada" },
      },
      {
        english: "review",
        topikI: { hangul: "복습하다", romanization: "bokseuphada" },
        topikII: { hangul: "점검하다", romanization: "jeomgeomhada" },
      },
      {
        english: "research",
        topikI: { hangul: "찾아보다", romanization: "chajaboda" },
        topikII: { hangul: "조사하다", romanization: "josahada" },
      },
      {
        english: "apply (job)",
        topikI: { hangul: "지원하다", romanization: "jiwonhada" },
        topikII: { hangul: "지원하다", romanization: "jiwonhada" },
      },
      {
        english: "graduate",
        topikI: { hangul: "졸업하다", romanization: "joreophada" },
        topikII: { hangul: "수료하다", romanization: "suryohada" },
      },
    ],
  },
  {
    slug: "opinions",
    title: "Opinions: TOPIK I → II",
    priority: "high",
    tags: ["topik", "opinion", "adjectives", "upgrade"],
    rows: [
      {
        english: "good",
        topikI: { hangul: "좋다", romanization: "jota" },
        topikII: { hangul: "우수하다", romanization: "usuhada" },
      },
      {
        english: "bad",
        topikI: { hangul: "나쁘다", romanization: "nappeuda" },
        topikII: { hangul: "부적절하다", romanization: "bujeoljeolhada" },
      },
      {
        english: "important",
        topikI: { hangul: "중요하다", romanization: "jungyohada" },
        topikII: { hangul: "핵심적이다", romanization: "haeksimjeogida" },
      },
      {
        english: "interesting",
        topikI: { hangul: "재미있다", romanization: "jaemiitda" },
        topikII: { hangul: "흥미롭다", romanization: "heungmiropda" },
      },
      {
        english: "difficult",
        topikI: { hangul: "어렵다", romanization: "eoryeopda" },
        topikII: { hangul: "난해하다", romanization: "nanhaehada" },
      },
      {
        english: "easy",
        topikI: { hangul: "쉽다", romanization: "swipda" },
        topikII: { hangul: "용이하다", romanization: "yongihada" },
      },
      {
        english: "necessary",
        topikI: { hangul: "필요하다", romanization: "piryohada" },
        topikII: { hangul: "필수적이다", romanization: "pilsujeogida" },
      },
      {
        english: "possible",
        topikI: { hangul: "가능하다", romanization: "ganeunghada" },
        topikII: { hangul: "실현 가능하다", romanization: "silhyeon ganeunghada" },
      },
    ],
  },
  {
    slug: "polite-upgrades",
    title: "Polite upgrades: TOPIK I → II",
    priority: "high",
    tags: ["topik", "honorific", "polite", "upgrade"],
    rows: [
      {
        english: "sorry",
        topikI: { hangul: "미안해요", romanization: "mianhaeyo" },
        topikII: { hangul: "죄송합니다", romanization: "joesonghamnida" },
      },
      {
        english: "thank you",
        topikI: { hangul: "고마워요", romanization: "gomawoyo" },
        topikII: { hangul: "감사합니다", romanization: "gamsahamnida" },
      },
      {
        english: "please (request)",
        topikI: { hangul: "해 주세요", romanization: "hae juseyo" },
        topikII: { hangul: "부탁드리겠습니다", romanization: "butakdeurigetseumnida" },
      },
      {
        english: "meet you",
        topikI: { hangul: "만나서 반가워요", romanization: "mannaseo bangawoyo" },
        topikII: { hangul: "뵙게 되어 영광입니다", romanization: "boepge doeeo yeonggwangimnida" },
      },
      {
        english: "I understand",
        topikI: { hangul: "알겠어요", romanization: "algesseoyo" },
        topikII: { hangul: "알겠습니다", romanization: "algetseumnida" },
      },
      {
        english: "excuse me",
        topikI: { hangul: "저기요", romanization: "jeogiyo" },
        topikII: { hangul: "실례합니다", romanization: "sillyehamnida" },
      },
      {
        english: "yes (agree)",
        topikI: { hangul: "네, 맞아요", romanization: "ne, majayo" },
        topikII: { hangul: "네, 동의합니다", romanization: "ne, donguihamnida" },
      },
      {
        english: "please wait",
        topikI: { hangul: "잠깐만요", romanization: "jamkkanmanyo" },
        topikII: { hangul: "잠시만 기다려 주십시오", romanization: "jamsiman gidaryeo jusipsio" },
      },
    ],
  },
  {
    slug: "show-look",
    title: "Show & look: TOPIK I → II",
    priority: "medium",
    tags: ["topik", "verbs", "perception", "upgrade"],
    rows: [
      {
        english: "show",
        topikI: { hangul: "보여 주다", romanization: "boyeo juda" },
        topikII: { hangul: "제시하다", romanization: "jesihada" },
      },
      {
        english: "look at",
        topikI: { hangul: "보다", romanization: "boda" },
        topikII: { hangul: "살펴보다", romanization: "salpyeoboda" },
      },
      {
        english: "watch",
        topikI: { hangul: "구경하다", romanization: "gugyeonghada" },
        topikII: { hangul: "관람하다", romanization: "gwanramhada" },
      },
      {
        english: "find",
        topikI: { hangul: "찾다", romanization: "chatda" },
        topikII: { hangul: "발견하다", romanization: "balgyeonhada" },
      },
      {
        english: "check",
        topikI: { hangul: "확인하다", romanization: "hwaginhada" },
        topikII: { hangul: "점검하다", romanization: "jeomgeomhada" },
      },
      {
        english: "compare",
        topikI: { hangul: "비교하다", romanization: "bigyohada" },
        topikII: { hangul: "대조하다", romanization: "daejo hada" },
      },
      {
        english: "choose",
        topikI: { hangul: "고르다", romanization: "goreuda" },
        topikII: { hangul: "선정하다", romanization: "seonjeonghada" },
      },
      {
        english: "prove",
        topikI: { hangul: "증명하다", romanization: "jeungmyeonghada" },
        topikII: { hangul: "입증하다", romanization: "ipjeunghada" },
      },
    ],
  },
  {
    slug: "emotion-words",
    title: "Emotions: TOPIK I → II",
    priority: "medium",
    tags: ["topik", "emotion", "upgrade"],
    rows: [
      {
        english: "happy",
        topikI: { hangul: "기쁘다", romanization: "gippeuda" },
        topikII: { hangul: "행복하다", romanization: "haengbokhada" },
      },
      {
        english: "sad",
        topikI: { hangul: "슬프다", romanization: "seulpeuda" },
        topikII: { hangul: "우울하다", romanization: "uulhada" },
      },
      {
        english: "angry",
        topikI: { hangul: "화나다", romanization: "hwanada" },
        topikII: { hangul: "분노하다", romanization: "bunnohada" },
      },
      {
        english: "surprised",
        topikI: { hangul: "놀라다", romanization: "nollada" },
        topikII: { hangul: "경악하다", romanization: "gyeongakhada" },
      },
      {
        english: "worried",
        topikI: { hangul: "걱정하다", romanization: "geokjeonghada" },
        topikII: { hangul: "우려하다", romanization: "uryeohada" },
      },
      {
        english: "tired",
        topikI: { hangul: "피곤하다", romanization: "pigonhada" },
        topikII: { hangul: "피로하다", romanization: "pirohada" },
      },
      {
        english: "nervous",
        topikI: { hangul: "긴장하다", romanization: "ginjanghada" },
        topikII: { hangul: "불안하다", romanization: "buranhada" },
      },
      {
        english: "proud",
        topikI: { hangul: "자랑스럽다", romanization: "jarangseureopda" },
        topikII: { hangul: "긍지를 느끼다", romanization: "geungjireul neukkida" },
      },
    ],
  },
  {
    slug: "daily-life",
    title: "Daily life verbs: TOPIK I → II",
    priority: "medium",
    tags: ["topik", "daily", "verbs", "upgrade"],
    rows: [
      {
        english: "eat",
        topikI: { hangul: "먹다", romanization: "meokda" },
        topikII: { hangul: "식사하다", romanization: "siksahada" },
      },
      {
        english: "sleep",
        topikI: { hangul: "자다", romanization: "jada" },
        topikII: { hangul: "취침하다", romanization: "chwichimhada" },
      },
      {
        english: "wake up",
        topikI: { hangul: "일어나다", romanization: "ireonada" },
        topikII: { hangul: "기상하다", romanization: "gisanghada" },
      },
      {
        english: "go",
        topikI: { hangul: "가다", romanization: "gada" },
        topikII: { hangul: "방문하다", romanization: "bangmunhada" },
      },
      {
        english: "come",
        topikI: { hangul: "오다", romanization: "oda" },
        topikII: { hangul: "내방하다", romanization: "naebanghada" },
      },
      {
        english: "buy",
        topikI: { hangul: "사다", romanization: "sada" },
        topikII: { hangul: "구입하다", romanization: "guiphada" },
      },
      {
        english: "live",
        topikI: { hangul: "살다", romanization: "salda" },
        topikII: { hangul: "거주하다", romanization: "geoju hada" },
      },
      {
        english: "rest",
        topikI: { hangul: "쉬다", romanization: "swida" },
        topikII: { hangul: "휴식하다", romanization: "hyusikhada" },
      },
    ],
  },
  {
    slug: "connectors",
    title: "Connectors: TOPIK I → II",
    priority: "medium",
    tags: ["topik", "grammar", "connectors", "upgrade"],
    rows: [
      {
        english: "but",
        topikI: { hangul: "그런데", romanization: "geureonde" },
        topikII: { hangul: "그러나", romanization: "geureona" },
      },
      {
        english: "so / therefore",
        topikI: { hangul: "그래서", romanization: "geuraeseo" },
        topikII: { hangul: "따라서", romanization: "ddaraseo" },
      },
      {
        english: "because",
        topikI: { hangul: "왜냐하면", romanization: "waenyahamyeon" },
        topikII: { hangul: "그 이유로", romanization: "geu iyuro" },
      },
      {
        english: "and / also",
        topikI: { hangul: "그리고", romanization: "geurigo" },
        topikII: { hangul: "또한", romanization: "ttohan" },
      },
      {
        english: "for example",
        topikI: { hangul: "예를 들어", romanization: "yereul deureo" },
        topikII: { hangul: "예컨대", romanization: "yereukonde" },
      },
      {
        english: "in conclusion",
        topikI: { hangul: "마지막으로", romanization: "majimageuro" },
        topikII: { hangul: "결론적으로", romanization: "gyeollonjeogeuro" },
      },
      {
        english: "however",
        topikI: { hangul: "하지만", romanization: "hajiman" },
        topikII: { hangul: "반면에", romanization: "banmyeone" },
      },
      {
        english: "in other words",
        topikI: { hangul: "다시 말해", romanization: "dasi malhae" },
        topikII: { hangul: "즉", romanization: "jeuk" },
      },
    ],
  },
  {
    slug: "problem-solution",
    title: "Problems & solutions: TOPIK I → II",
    priority: "medium",
    tags: ["topik", "verbs", "problem", "upgrade"],
    rows: [
      {
        english: "problem",
        topikI: { hangul: "문제", romanization: "munje" },
        topikII: { hangul: "쟁점", romanization: "jaengjeom" },
      },
      {
        english: "solve",
        topikI: { hangul: "해결하다", romanization: "haegyeolhada" },
        topikII: { hangul: "해소하다", romanization: "haesohada" },
      },
      {
        english: "improve",
        topikI: { hangul: "나아지다", romanization: "naajida" },
        topikII: { hangul: "개선하다", romanization: "gaeseonhada" },
      },
      {
        english: "increase",
        topikI: { hangul: "늘다", romanization: "neulda" },
        topikII: { hangul: "증가하다", romanization: "jeunggahada" },
      },
      {
        english: "decrease",
        topikI: { hangul: "줄다", romanization: "julda" },
        topikII: { hangul: "감소하다", romanization: "gamsohada" },
      },
      {
        english: "affect",
        topikI: { hangul: "영향을 주다", romanization: "yeonghyangeul juda" },
        topikII: { hangul: "영향을 미치다", romanization: "yeonghyangeul michida" },
      },
      {
        english: "cause",
        topikI: { hangul: "일으키다", romanization: "ireukida" },
        topikII: { hangul: "초래하다", romanization: "choraehada" },
      },
      {
        english: "prevent",
        topikI: { hangul: "막다", romanization: "makda" },
        topikII: { hangul: "예방하다", romanization: "yebanghada" },
      },
    ],
  },
  {
    slug: "people-society",
    title: "People & society: TOPIK I → II",
    priority: "low",
    tags: ["topik", "society", "nouns", "upgrade"],
    rows: [
      {
        english: "person",
        topikI: { hangul: "사람", romanization: "saram" },
        topikII: { hangul: "인물", romanization: "inmul" },
      },
      {
        english: "friend",
        topikI: { hangul: "친구", romanization: "chingu" },
        topikII: { hangul: "지인", romanization: "jiin" },
      },
      {
        english: "job",
        topikI: { hangul: "일", romanization: "il" },
        topikII: { hangul: "직업", romanization: "jigeop" },
      },
      {
        english: "money",
        topikI: { hangul: "돈", romanization: "don" },
        topikII: { hangul: "자금", romanization: "jageum" },
      },
      {
        english: "house",
        topikI: { hangul: "집", romanization: "jip" },
        topikII: { hangul: "거주지", romanization: "geojuji" },
      },
      {
        english: "country",
        topikI: { hangul: "나라", romanization: "nara" },
        topikII: { hangul: "국가", romanization: "gukga" },
      },
      {
        english: "news",
        topikI: { hangul: "뉴스", romanization: "nyuseu" },
        topikII: { hangul: "보도", romanization: "bodo" },
      },
      {
        english: "idea",
        topikI: { hangul: "생각", romanization: "saenggak" },
        topikII: { hangul: "견해", romanization: "gyeonhae" },
      },
    ],
  },
];

function titleCase(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bKorean\b/g, "Korean")
    .replace(/\bKorea\b/g, "Korea")
    .replace(/\bBbq\b/g, "BBQ")
    .replace(/\bKpop\b/g, "K-pop")
    .replace(/\bKdrama\b/g, "K-drama")
    .replace(/\bAi\b/g, "AI")
    .replace(/\bUi\b/g, "UI")
    .replace(/\bHanbok\b/g, "Hanbok")
    .replace(/\bJjigae\b/g, "Jjigae")
    .replace(/\bBanchan\b/g, "Banchan")
    .replace(/\bKimchi\b/g, "Kimchi")
    .replace(/\bSeollal\b/g, "Seollal")
    .replace(/\bChuseok\b/g, "Chuseok");
}

export const GRID_CLUSTER_BUNDLES: VocabBundle[] = GRID_SEEDS.map(gridBundle);
export const ANTONYM_SPLIT_BUNDLES: VocabBundle[] = ANTONYM_SEEDS.map(antonymBundle);
export const SIMILAR_SPLIT_BUNDLES: VocabBundle[] = SIMILAR_SEEDS.map(similarBundle);
export const SUPER_LIST_BUNDLES: VocabBundle[] = SUPER_LIST_SEEDS.map(superListBundle);
export const QUIZ_COMMENT_BUNDLES: VocabBundle[] = QUIZ_SEEDS.map(quizBundle);
export const CONCEPT_ROWS_BUNDLES: VocabBundle[] = CONCEPT_ROWS_SEEDS.map(conceptRowsBundle);
export const PHRASE_STACK_BUNDLES: VocabBundle[] = PHRASE_STACK_SEEDS.map(phraseStackBundle);
export const TOPIK_UPGRADE_BUNDLES: VocabBundle[] = TOPIK_UPGRADE_SEEDS.map(topikUpgradeBundle);

export const ALL_VOCAB_BUNDLES: VocabBundle[] = [
  ...GRID_CLUSTER_BUNDLES,
  ...ANTONYM_SPLIT_BUNDLES,
  ...SIMILAR_SPLIT_BUNDLES,
  ...SUPER_LIST_BUNDLES,
  ...QUIZ_COMMENT_BUNDLES,
  ...CONCEPT_ROWS_BUNDLES,
  ...PHRASE_STACK_BUNDLES,
  ...TOPIK_UPGRADE_BUNDLES,
  ...WAVE2_GRID_BUNDLES,
  ...(EXPR_WAVE_BUNDLES as VocabBundle[]),
];

export type BundleCatalogValidation = {
  total: number;
  byFormat: Record<VocabInfographicFormatId, number>;
  duplicateIds: string[];
  duplicateTitles: string[];
  highPriority: number;
  ok: boolean;
};

export function validateBundleCatalog(minTotal = 300): BundleCatalogValidation {
  const ids = ALL_VOCAB_BUNDLES.map((b) => b.id);
  const titles = ALL_VOCAB_BUNDLES.map((b) => b.title.toLowerCase());

  const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  const duplicateTitles = titles.filter((t, i) => titles.indexOf(t) !== i);

  const byFormat = {
    grid_cluster: GRID_CLUSTER_BUNDLES.length + WAVE2_GRID_BUNDLES.length,
    antonym_split: ANTONYM_SPLIT_BUNDLES.length,
    similar_split: SIMILAR_SPLIT_BUNDLES.length + EXPR_WAVE_SIMILAR_BUNDLES.length,
    super_list: SUPER_LIST_BUNDLES.length,
    quiz_comment: QUIZ_COMMENT_BUNDLES.length,
    concept_rows: CONCEPT_ROWS_BUNDLES.length + EXPR_WAVE_CONCEPT_BUNDLES.length,
    phrase_stack: PHRASE_STACK_BUNDLES.length + EXPR_WAVE_PHRASE_BUNDLES.length,
    topik_upgrade: TOPIK_UPGRADE_BUNDLES.length + EXPR_WAVE_TOPIK_BUNDLES.length,
  };

  const total = ALL_VOCAB_BUNDLES.length;
  const ok = duplicateIds.length === 0 && duplicateTitles.length === 0 && total >= minTotal;

  return {
    total,
    byFormat,
    duplicateIds: [...new Set(duplicateIds)],
    duplicateTitles: [...new Set(duplicateTitles)],
    highPriority: ALL_VOCAB_BUNDLES.filter((b) => b.priority === "high").length,
    ok,
  };
}

export function bundlesByFormat(format: VocabInfographicFormatId): VocabBundle[] {
  return ALL_VOCAB_BUNDLES.filter((b) => b.format === format);
}

export function bundleStats() {
  const v = validateBundleCatalog();
  return {
    total: v.total,
    byFormat: v.byFormat,
    highPriority: v.highPriority,
    valid: v.ok,
  };
}

// Dev-time assertion when module loads in Node scripts
if (typeof process !== "undefined" && process.env.VOCAB_BUNDLE_ASSERT === "1") {
  const v = validateBundleCatalog(300);
  if (!v.ok) {
    console.error("Bundle catalog validation failed:", v);
    process.exit(1);
  }
}
