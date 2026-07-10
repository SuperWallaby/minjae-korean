import type { VocabInfographicFormatId } from "./formats";

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
export const SUPER_LIST_BUNDLES: VocabBundle[] = SUPER_LIST_SEEDS.map(superListBundle);
export const QUIZ_COMMENT_BUNDLES: VocabBundle[] = QUIZ_SEEDS.map(quizBundle);

export const ALL_VOCAB_BUNDLES: VocabBundle[] = [
  ...GRID_CLUSTER_BUNDLES,
  ...ANTONYM_SPLIT_BUNDLES,
  ...SUPER_LIST_BUNDLES,
  ...QUIZ_COMMENT_BUNDLES,
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
    grid_cluster: GRID_CLUSTER_BUNDLES.length,
    antonym_split: ANTONYM_SPLIT_BUNDLES.length,
    super_list: SUPER_LIST_BUNDLES.length,
    quiz_comment: QUIZ_COMMENT_BUNDLES.length,
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
