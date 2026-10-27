/**
 * Core ecological domain types.
 *
 * Trophic level is intentionally NOT a fixed property of an organism: in a
 * food web the same organism can feed at more than one level (an eagle that
 * eats a mouse is a secondary consumer, an eagle that eats a snake is a
 * tertiary or quaternary consumer). Levels are derived from a specific food
 * chain or computed from the food web.
 */

export const ECOLOGICAL_ROLES = ["producer", "consumer", "decomposer"] as const;
export type EcologicalRole = (typeof ECOLOGICAL_ROLES)[number];

export const DIETS = [
  "autotroph",
  "herbivore",
  "carnivore",
  "omnivore",
  "detritivore",
  "saprotroph",
] as const;
export type Diet = (typeof DIETS)[number];

/**
 * Feeding positions used by the lessons, activities and pyramids.
 * Decomposers are a separate category: they feed on dead matter from every
 * level and are not a tier of an ecological pyramid.
 */
export const TROPHIC_POSITIONS = [
  "producer",
  "primary-consumer",
  "secondary-consumer",
  "tertiary-consumer",
  "quaternary-consumer",
] as const;
export type TrophicPosition = (typeof TROPHIC_POSITIONS)[number];

export const FEEDING_CATEGORIES = [...TROPHIC_POSITIONS, "decomposer"] as const;
export type FeedingCategory = (typeof FEEDING_CATEGORIES)[number];

export const ECOSYSTEM_IDS = ["grassland", "pond"] as const;
export type EcosystemId = (typeof ECOSYSTEM_IDS)[number];

/** Visual token; lets researcher-supplied artwork replace placeholders without touching logic. */
export type Illustration =
  | { readonly kind: "emoji"; readonly value: string }
  | { readonly kind: "image"; readonly src: string };

export interface Organism {
  readonly id: string;
  readonly name: string;
  readonly role: EcologicalRole;
  readonly diet: Diet;
  readonly ecosystems: readonly EcosystemId[];
  readonly description: string;
  readonly illustration: Illustration;
}

/** Energy flows from `food` to `consumer`; arrows in diagrams point the same way. */
export interface FeedingRelation {
  readonly food: string;
  readonly consumer: string;
}

export interface FoodChain {
  readonly id: string;
  readonly ecosystem: EcosystemId;
  /** Organism ids ordered producer first. The sun is implied as the energy source. */
  readonly sequence: readonly string[];
}

export interface Ecosystem {
  readonly id: EcosystemId;
  readonly name: string;
  readonly kind: "terrestrial" | "aquatic";
  readonly description: string;
}

/** Converts a 1-based trophic level number to its named position. */
export function trophicPositionForLevel(level: number): TrophicPosition {
  const position = TROPHIC_POSITIONS[level - 1];
  if (!Number.isInteger(level) || position === undefined) {
    throw new RangeError(`Unsupported trophic level: ${level}`);
  }
  return position;
}
