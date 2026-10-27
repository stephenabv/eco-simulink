import type { FeedingCategory } from "@/types/ecology";

export const FEEDING_CATEGORY_LABELS: Record<FeedingCategory, string> = {
  producer: "Producer",
  "primary-consumer": "Primary consumer",
  "secondary-consumer": "Secondary consumer",
  "tertiary-consumer": "Tertiary consumer",
  "quaternary-consumer": "Quaternary consumer",
  decomposer: "Decomposer",
};

export const FEEDING_CATEGORY_HINTS: Record<FeedingCategory, string> = {
  producer: "Makes its own food using sunlight",
  "primary-consumer": "Eats producers (herbivore)",
  "secondary-consumer": "Eats primary consumers",
  "tertiary-consumer": "Eats secondary consumers",
  "quaternary-consumer": "Eats tertiary consumers",
  decomposer: "Breaks down dead organisms and waste",
};
