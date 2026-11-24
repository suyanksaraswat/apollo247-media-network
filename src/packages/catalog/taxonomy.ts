import type {
  Category,
  Channel,
  City,
  ClaimRule,
  Objective,
  ProductClass,
  StoreFormat,
} from "./types";

export const CATEGORIES: readonly Category[] = [
  { id: "fmcg_food", label: "Food and beverages" },
  { id: "personal_care", label: "Personal care and beauty" },
  { id: "nutrition", label: "Nutrition and supplements" },
  { id: "otc", label: "OTC medicines" },
  { id: "devices", label: "Health devices" },
  { id: "baby", label: "Baby and mother care" },
  { id: "insurance", label: "Insurance and finance" },
  { id: "fitness", label: "Fitness and wellness services" },
];

export const PRODUCT_CLASSES: readonly ProductClass[] = [
  {
    id: "rx",
    label: "Prescription medicine",
    consumerAds: false,
    reason:
      "Prescription medicines are not advertised to the public. They are promoted only to doctors, which is outside this network.",
  },
  { id: "otc", label: "Over-the-counter medicine", consumerAds: true },
  { id: "fmcg", label: "Everyday product", consumerAds: true },
  { id: "device", label: "Health device", consumerAds: true },
  { id: "service", label: "Service", consumerAds: true },
];

export const OBJECTIVES: readonly Objective[] = [
  {
    id: "awareness",
    label: "Awareness",
    description: "Be seen by as many relevant shoppers as possible.",
  },
  { id: "trial", label: "Trial", description: "Get new buyers to try the product." },
  {
    id: "sales",
    label: "Sales",
    description: "Grow sales from people already shopping the category.",
  },
  { id: "loyalty", label: "Loyalty", description: "Bring existing buyers back more often." },
];

export const CITIES: readonly City[] = [
  { id: "hyderabad", label: "Hyderabad", storeShare: 0.2 },
  { id: "chennai", label: "Chennai", storeShare: 0.2 },
  { id: "bengaluru", label: "Bengaluru", storeShare: 0.15 },
  { id: "kolkata", label: "Kolkata", storeShare: 0.1 },
  { id: "delhi_ncr", label: "Delhi NCR", storeShare: 0.1 },
  { id: "mumbai", label: "Mumbai", storeShare: 0.1 },
  { id: "pune", label: "Pune", storeShare: 0.08 },
  { id: "ahmedabad", label: "Ahmedabad", storeShare: 0.07 },
];

export const CHANNELS: readonly Channel[] = [
  { id: "app_shelf", label: "App shelf", description: "Search, category pages and the cart." },
  {
    id: "app_journey",
    label: "App journeys",
    description: "Screens after the shelf: orders, consults, membership.",
  },
  {
    id: "store",
    label: "Stores",
    description: "Screens, shelves, counters, bags and bills in the stores.",
  },
  { id: "doorstep", label: "Doorstep", description: "Home deliveries and opt-in messages." },
  {
    id: "data",
    label: "Data",
    description: "Aggregated insights for brands. Never personal data.",
  },
];

export const STORE_FORMATS: readonly { id: StoreFormat; label: string; share: number }[] = [
  { id: "neighbourhood", label: "Neighbourhood", share: 0.6 },
  { id: "high_street", label: "High street", share: 0.3 },
  { id: "hospital", label: "Next to a hospital", share: 0.1 },
];

export const CLAIM_RULES: readonly ClaimRule[] = [
  {
    id: "cure_claim",
    label: "Cure claim",
    description:
      "Says the product cures, treats or prevents a disease. The Drugs and Magic Remedies (Objectionable Advertisements) Act, 1954 prohibits such claims for listed conditions.",
  },
  {
    id: "guarantee",
    label: "Guaranteed result",
    description: "Promises a certain or instant health outcome.",
  },
  {
    id: "unsupported_superlative",
    label: "Unsupported superlative",
    description: "Claims to be the best, the first or the only one without proof.",
  },
  {
    id: "rx_promotion",
    label: "Prescription promotion",
    description: "Promotes a prescription medicine to the public.",
  },
  {
    id: "condition_targeting",
    label: "Targeting by health condition",
    description: "Picks people by their diagnosis, prescriptions or test results.",
  },
  { id: "other", label: "Other", description: "Any other reason the copy should change." },
];
