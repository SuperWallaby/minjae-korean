/**
 * Wave-2 catalog expansion — enough themes to push generation toward ~300 new images.
 * Imported by bundle-catalog.ts (not dropped in vocab-batch-config).
 */
import type { VocabInfographicFormatId } from "./formats";

type BundlePriority = "high" | "medium" | "low";

type VocabBundle = {
  id: string;
  format: VocabInfographicFormatId;
  title: string;
  count: number;
  fit: string;
  priority: BundlePriority;
  tags: string[];
  preview?: string[];
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

const WAVE2_GRID: GridSeed[] = [
  // home & living
  ...[
    ["sofa-living", "Sofa & living room items in Korean"],
    ["desk-study-corner", "Desk & study corner in Korean"],
    ["bathroom-toiletries", "Bathroom toiletries in Korean"],
    ["kitchen-utensils-extra", "Kitchen utensils in Korean"],
    ["fridge-foods", "Fridge foods in Korean"],
    ["pantry-staples", "Pantry staples in Korean"],
    ["cleaning-tools-extra", "Cleaning tools in Korean"],
    ["laundry-verbs-nouns", "Laundry items in Korean"],
    ["bedding-extra", "Bedding & sleep items in Korean"],
    ["home-lighting", "Home lighting in Korean"],
    ["plants-indoor", "Indoor plants in Korean"],
    ["garage-tools", "Garage tools in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["home"], priority: "medium" as BundlePriority })),

  // city & travel
  ...[
    ["subway-signs", "Subway signs in Korean"],
    ["bus-stop-words", "Bus stop words in Korean"],
    ["airport-words", "Airport words in Korean"],
    ["train-station-words", "Train station words in Korean"],
    ["hotel-room-items", "Hotel room items in Korean"],
    ["passport-travel-docs", "Travel documents in Korean"],
    ["luggage-packing", "Luggage & packing in Korean"],
    ["tourist-spots-seoul", "Seoul tourist spots in Korean"],
    ["map-directions-nouns", "Map & direction nouns in Korean"],
    ["weather-travel-gear", "Travel weather gear in Korean"],
    ["souvenir-shop", "Souvenir shop in Korean"],
    ["currency-exchange", "Money exchange words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["travel"], priority: "high" as BundlePriority })),

  // school & study
  ...[
    ["classroom-objects-extra", "Classroom objects in Korean"],
    ["stationery-extra", "Stationery in Korean"],
    ["exam-words", "Exam vocabulary in Korean"],
    ["homework-words", "Homework words in Korean"],
    ["library-words-extra", "Library words in Korean"],
    ["subject-names", "School subjects in Korean"],
    ["club-activities", "School clubs in Korean"],
    ["campus-places", "Campus places in Korean"],
    ["study-tools-digital", "Digital study tools in Korean"],
    ["language-class-words", "Language class words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["school"], priority: "high" as BundlePriority })),

  // work & daily errands
  ...[
    ["office-desk-items", "Office desk items in Korean"],
    ["meeting-room-words", "Meeting room words in Korean"],
    ["post-office-words", "Post office words in Korean"],
    ["bank-words", "Bank vocabulary in Korean"],
    ["pharmacy-words", "Pharmacy words in Korean"],
    ["convenience-store-extra", "Convenience store in Korean"],
    ["supermarket-aisles", "Supermarket aisles in Korean"],
    ["delivery-package", "Delivery & packages in Korean"],
    ["schedule-calendar-words", "Schedule words in Korean"],
    ["commute-words", "Commute words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["daily"], priority: "medium" as BundlePriority })),

  // body, health, feelings
  ...[
    ["face-parts-extra", "Face parts in Korean"],
    ["body-parts-extra", "Body parts in Korean"],
    ["symptoms-extra", "Symptoms in Korean"],
    ["medicine-forms", "Medicine forms in Korean"],
    ["hospital-rooms", "Hospital places in Korean"],
    ["exercise-gear", "Exercise gear in Korean"],
    ["yoga-poses-words", "Yoga words in Korean"],
    ["sleep-words", "Sleep vocabulary in Korean"],
    ["stress-relief-words", "Stress relief words in Korean"],
    ["emotions-basic-extra", "Basic emotions in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["health"], priority: "medium" as BundlePriority })),

  // food extras
  ...[
    ["breakfast-items", "Breakfast items in Korean"],
    ["lunchbox-items", "Lunchbox items in Korean"],
    ["street-snacks-extra", "Street snacks in Korean"],
    ["bbq-sides", "BBQ side dishes in Korean"],
    ["hotpot-ingredients", "Hotpot ingredients in Korean"],
    ["salad-ingredients", "Salad ingredients in Korean"],
    ["smoothie-ingredients", "Smoothie ingredients in Korean"],
    ["spice-levels", "Spice level words in Korean"],
    ["taste-adj-extra", "Taste adjectives in Korean"],
    ["cooking-methods", "Cooking methods in Korean"],
    ["kitchen-verbs-extra", "Kitchen action verbs in Korean"],
    ["restaurant-roles", "Restaurant roles in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["food"], priority: "medium" as BundlePriority })),

  // nature & outdoors
  ...[
    ["park-objects", "Park objects in Korean"],
    ["camping-gear-extra", "Camping gear in Korean"],
    ["hiking-gear", "Hiking gear in Korean"],
    ["beach-items-extra", "Beach items in Korean"],
    ["weather-verbs", "Weather verbs in Korean"],
    ["sky-words-extra", "Sky words in Korean"],
    ["insects-extra", "Insects in Korean"],
    ["flowers-extra", "Flowers in Korean"],
    ["trees-extra", "Trees in Korean"],
    ["seasons-activities", "Seasonal activities in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["nature"], priority: "medium" as BundlePriority })),

  // clothes & shopping
  ...[
    ["winter-clothes-extra", "Winter clothes in Korean"],
    ["summer-clothes-extra", "Summer clothes in Korean"],
    ["shoes-types-extra", "Shoe types in Korean"],
    ["accessories-extra", "Accessories in Korean"],
    ["fabrics-materials", "Fabrics in Korean"],
    ["sizes-fit-words", "Size & fit words in Korean"],
    ["beauty-products", "Beauty products in Korean"],
    ["makeup-basics", "Makeup basics in Korean"],
    ["hair-salon-words", "Hair salon words in Korean"],
    ["jewelry-words", "Jewelry in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["fashion"], priority: "medium" as BundlePriority })),

  // tech & media (learner-safe, not in DROP list)
  ...[
    ["phone-apps-basic", "Phone apps in Korean"],
    ["camera-photo-words", "Camera words in Korean"],
    ["music-listening", "Music listening words in Korean"],
    ["movie-watching", "Movie watching words in Korean"],
    ["social-media-basic", "Social media basics in Korean"],
    ["email-basics-safe", "Email basics in Korean"],
    ["online-shopping-safe", "Online shopping words in Korean"],
    ["wifi-charging", "Wi‑Fi & charging in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["tech"], priority: "low" as BundlePriority })),

  // people & society
  ...[
    ["jobs-hospitality", "Hospitality jobs in Korean"],
    ["jobs-design", "Design jobs in Korean"],
    ["jobs-healthcare-extra", "Healthcare jobs in Korean"],
    ["ages-life-stages", "Life stages in Korean"],
    ["personality-adj", "Personality adjectives in Korean"],
    ["appearance-adj-extra", "Appearance adjectives in Korean"],
    ["hobbies-indoor", "Indoor hobbies in Korean"],
    ["hobbies-outdoor", "Outdoor hobbies in Korean"],
    ["sports-racket", "Racket sports in Korean"],
    ["sports-snow", "Snow sports in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["people"], priority: "medium" as BundlePriority })),

  // time & numbers practice grids
  ...[
    ["clock-times-extra", "Clock times in Korean"],
    ["calendar-months-extra", "Months in Korean"],
    ["frequency-adverbs", "Frequency adverbs in Korean"],
    ["quantity-words", "Quantity words in Korean"],
    ["order-sequence-words", "Order & sequence in Korean"],
    ["comparison-adj", "Comparison adjectives in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["grammar-lite"], priority: "high" as BundlePriority })),

  // verb mini-grids
  ...[
    "opening-closing-verbs",
    "putting-placing-verbs",
    "starting-finishing-verbs",
    "remember-forget-verbs",
    "choose-decide-verbs",
    "invite-visit-verbs",
    "laugh-cry-verbs",
    "wake-sleep-verbs",
    "walk-run-verbs",
    "sit-stand-verbs",
    "ask-answer-verbs",
    "read-write-verbs",
    "listen-speak-verbs",
    "buy-sell-verbs",
    "open-turn-on-verbs",
    "close-turn-off-verbs",
    "arrive-leave-verbs",
    "enter-exit-verbs",
    "rise-fall-verbs",
    "increase-decrease-verbs",
  ].map((slug) => ({
    slug,
    title: `${slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")} in Korean`,
    tags: ["verb"],
    fit: "Parallel verb grid — same conjugation pattern",
    priority: "medium" as BundlePriority,
  })),

  // culture / Korea-specific
  ...[
    ["hanbok-parts", "Hanbok parts in Korean"],
    ["temple-visit-words", "Temple visit words in Korean"],
    ["palace-words", "Palace vocabulary in Korean"],
    ["market-traditional", "Traditional market in Korean"],
    ["festival-foods", "Festival foods in Korean"],
    ["newyear-words", "New Year words in Korean"],
    ["chuseok-foods", "Chuseok foods in Korean"],
    ["pcbang-words", "PC bang words in Korean"],
    ["noraebang-words", "Noraebang words in Korean"],
    ["jimjilbang-words", "Jjimjilbang words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["culture"], priority: "high" as BundlePriority })),
];

const WAVE2B_GRID: GridSeed[] = [
  ...[
    ["bakery-cafe-words", "Bakery café words in Korean"],
    ["ice-cream-flavors", "Ice cream flavors in Korean"],
    ["pizza-toppings", "Pizza toppings in Korean"],
    ["burger-menu", "Burger menu in Korean"],
    ["sushi-words", "Sushi words in Korean"],
    ["chinese-food-kr", "Chinese-Korean dishes in Korean"],
    ["japanese-food-kr", "Japanese-Korean dishes in Korean"],
    ["vegan-menu-words", "Vegan menu words in Korean"],
    ["allergy-foods", "Food allergy words in Korean"],
    ["kid-snacks", "Kids snacks in Korean"],
    ["party-foods", "Party foods in Korean"],
    ["picnic-foods", "Picnic foods in Korean"],
    ["microwave-meals", "Microwave meals in Korean"],
    ["frozen-foods", "Frozen foods in Korean"],
    ["canned-foods", "Canned foods in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["food"], priority: "medium" as BundlePriority })),
  ...[
    ["apartment-amenities", "Apartment amenities in Korean"],
    ["move-in-words", "Moving-in words in Korean"],
    ["utility-bills", "Utility bill words in Korean"],
    ["furniture-extra", "Furniture in Korean"],
    ["window-coverings", "Window coverings in Korean"],
    ["storage-boxes", "Storage items in Korean"],
    ["pet-furniture", "Pet furniture in Korean"],
    ["baby-items", "Baby items in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["home"], priority: "medium" as BundlePriority })),
  ...[
    ["bike-commute", "Bike commute words in Korean"],
    ["taxi-app-words", "Taxi app words in Korean"],
    ["parking-words", "Parking words in Korean"],
    ["toll-highway", "Highway toll words in Korean"],
    ["ferry-words", "Ferry words in Korean"],
    ["cable-car-words", "Cable car words in Korean"],
    ["hiking-trail-signs", "Hiking trail signs in Korean"],
    ["camping-cooking", "Camp cooking in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["travel"], priority: "medium" as BundlePriority })),
  ...[
    ["online-class-words", "Online class words in Korean"],
    ["presentation-basics", "Presentation basics in Korean"],
    ["group-project-words", "Group project words in Korean"],
    ["scholarship-words", "Scholarship words in Korean"],
    ["dorm-words", "Dormitory words in Korean"],
    ["exchange-student", "Exchange student words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["school"], priority: "high" as BundlePriority })),
  ...[
    ["interview-words", "Job interview words in Korean"],
    ["resume-words", "Resume words in Korean"],
    ["salary-words", "Salary words in Korean"],
    ["vacation-leave", "Leave & vacation words in Korean"],
    ["coworker-words", "Coworker words in Korean"],
    ["deadline-words", "Deadline words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["work"], priority: "medium" as BundlePriority })),
  ...[
    ["dentist-words", "Dentist words in Korean"],
    ["eye-clinic-words", "Eye clinic words in Korean"],
    ["skin-care-clinic", "Skin clinic words in Korean"],
    ["first-aid-kit", "First aid kit in Korean"],
    ["vaccine-words", "Vaccine words in Korean"],
    ["fitness-tracker", "Fitness tracker words in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["health"], priority: "medium" as BundlePriority })),
  ...[
    ["spring-clothes-extra", "Spring clothes in Korean"],
    ["fall-clothes-extra", "Fall clothes in Korean"],
    ["umbrella-rain-gear", "Rain gear in Korean"],
    ["bags-types", "Bag types in Korean"],
    ["socks-types", "Socks & tights in Korean"],
    ["hats-caps", "Hats & caps in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["fashion"], priority: "medium" as BundlePriority })),
  ...[
    ["tabletop-games", "Tabletop games in Korean"],
    ["card-games", "Card games in Korean"],
    ["puzzle-words", "Puzzle words in Korean"],
    ["craft-supplies", "Craft supplies in Korean"],
    ["drawing-supplies", "Drawing supplies in Korean"],
    ["music-instruments", "Music instruments in Korean"],
  ].map(([slug, title]) => ({ slug, title, tags: ["hobbies"], priority: "medium" as BundlePriority })),
  ...[
    "push-pull-verbs",
    "lift-carry-verbs",
    "throw-catch-verbs",
    "cut-break-verbs",
    "mix-stir-verbs",
    "wash-dry-verbs",
    "fold-hang-verbs",
    "search-find-verbs",
    "lose-drop-verbs",
    "hide-show-verbs",
    "begin-continue-verbs",
    "stop-pause-verbs",
    "promise-agree-verbs",
    "refuse-deny-verbs",
    "praise-criticize-verbs",
    "worry-relax-verbs",
    "hope-expect-verbs",
    "plan-prepare-verbs",
    "celebrate-cheer-verbs",
    "apologize-forgive-verbs",
  ].map((slug) => ({
    slug,
    title: `${slug
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")} in Korean`,
    tags: ["verb"],
    fit: "Parallel verb grid — same conjugation pattern",
    priority: "medium" as BundlePriority,
  })),
];

export const WAVE2_GRID_BUNDLES: VocabBundle[] = [...WAVE2_GRID, ...WAVE2B_GRID].map(gridBundle);
