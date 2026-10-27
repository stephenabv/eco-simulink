/**
 * Simplified educational ecosystem model.
 *
 * A four-level grazing food chain (plants → herbivores → carnivores → top
 * predators) plus a detritus loop (dead matter → decomposers → nutrients for
 * plants). It is a teaching model built on classic predator–prey equations
 * with a few deliberate simplifications; see `MODEL_ASSUMPTIONS` for the
 * plain-language list shown to students and researchers.
 *
 * Values are relative population indices, not real head counts.
 */

export const POPULATION_GROUPS = [
  "plants",
  "herbivores",
  "carnivores",
  "topPredators",
  "decomposers",
] as const;
export type PopulationGroup = (typeof POPULATION_GROUPS)[number];

/** The four groups that form the levels of an ecological pyramid, bottom first. */
export const PYRAMID_GROUPS = ["plants", "herbivores", "carnivores", "topPredators"] as const satisfies readonly PopulationGroup[];

export interface EcosystemState {
  readonly plants: number;
  readonly herbivores: number;
  readonly carnivores: number;
  readonly topPredators: number;
  readonly decomposers: number;
  /** Dead plants, animals and waste waiting to be broken down. */
  readonly deadMatter: number;
}

export type StateKey = keyof EcosystemState;
export const STATE_KEYS = [...POPULATION_GROUPS, "deadMatter"] as const satisfies readonly StateKey[];

export interface EnvironmentConditions {
  /** 1 = normal sunlight, 0 = no sunlight. */
  readonly sunlight: number;
}

export interface ModelParameters {
  /** Plant growth rate under full sunlight and nutrients. */
  readonly plantGrowthRate: number;
  /** Space/crowding limit on plants. */
  readonly plantCarryingCapacity: number;
  readonly plantLitterRate: number;
  /** Fraction of eaten food turned into the eater's own body (biomass). */
  readonly assimilationEfficiency: number;
  readonly herbivoreFeedingRate: number;
  readonly carnivoreFeedingRate: number;
  readonly topPredatorFeedingRate: number;
  readonly herbivoreDeathRate: number;
  readonly carnivoreDeathRate: number;
  readonly topPredatorDeathRate: number;
  /** Competition within the same group (crowding, disease, territory). */
  readonly herbivoreCrowding: number;
  readonly carnivoreCrowding: number;
  readonly topPredatorCrowding: number;
  readonly decompositionRate: number;
  readonly decomposerEfficiency: number;
  readonly decomposerDeathRate: number;
  readonly decomposerCrowding: number;
  /** Decomposer level at which nutrient recycling reaches half its effect. */
  readonly nutrientHalfSaturation: number;
  /** Plant growth multiplier when there are no decomposers recycling nutrients. */
  readonly minimumNutrientFactor: number;
  /** Populations below this value are treated as locally extinct. */
  readonly extinctionThreshold: number;
}

export const DEFAULT_PARAMETERS: ModelParameters = Object.freeze({
  plantGrowthRate: 1,
  plantCarryingCapacity: 1,
  plantLitterRate: 0.05,
  assimilationEfficiency: 0.2,
  herbivoreFeedingRate: 8,
  carnivoreFeedingRate: 15,
  topPredatorFeedingRate: 33,
  herbivoreDeathRate: 0.08,
  carnivoreDeathRate: 0.05,
  topPredatorDeathRate: 0.08,
  herbivoreCrowding: 0.75,
  carnivoreCrowding: 0.55,
  topPredatorCrowding: 1.75,
  decompositionRate: 2,
  decomposerEfficiency: 0.3,
  decomposerDeathRate: 0.05,
  decomposerCrowding: 1,
  nutrientHalfSaturation: 0.05,
  minimumNutrientFactor: 0.4,
  extinctionThreshold: 1e-4,
});

export const NORMAL_CONDITIONS: EnvironmentConditions = Object.freeze({ sunlight: 1 });

/** Rates of change for every state variable. */
export function derivatives(
  state: EcosystemState,
  conditions: EnvironmentConditions,
  p: ModelParameters,
): EcosystemState {
  const { plants: P, herbivores: H, carnivores: C, topPredators: T, decomposers: Dc, deadMatter: D } = state;

  const nutrientFactor = p.minimumNutrientFactor + (1 - p.minimumNutrientFactor) * (Dc / (Dc + p.nutrientHalfSaturation));
  const plantsEaten = p.herbivoreFeedingRate * P * H;
  const herbivoresEaten = p.carnivoreFeedingRate * H * C;
  const carnivoresEaten = p.topPredatorFeedingRate * C * T;
  const decomposed = p.decompositionRate * D * Dc;

  const herbivoreDeaths = p.herbivoreDeathRate * H + p.herbivoreCrowding * H * H;
  const carnivoreDeaths = p.carnivoreDeathRate * C + p.carnivoreCrowding * C * C;
  const topPredatorDeaths = p.topPredatorDeathRate * T + p.topPredatorCrowding * T * T;
  const decomposerDeaths = p.decomposerDeathRate * Dc + p.decomposerCrowding * Dc * Dc;
  const plantLitter = p.plantLitterRate * P;

  const e = p.assimilationEfficiency;
  // Half of the food that is not assimilated leaves as waste; the rest is used for life processes and lost as heat.
  const waste = 0.5 * (1 - e) * (plantsEaten + herbivoresEaten + carnivoresEaten);

  return {
    plants:
      p.plantGrowthRate * conditions.sunlight * nutrientFactor * P -
      (p.plantGrowthRate / p.plantCarryingCapacity) * P * P -
      plantsEaten -
      plantLitter,
    herbivores: e * plantsEaten - herbivoresEaten - herbivoreDeaths,
    carnivores: e * herbivoresEaten - carnivoresEaten - carnivoreDeaths,
    topPredators: e * carnivoresEaten - topPredatorDeaths,
    decomposers: p.decomposerEfficiency * decomposed - decomposerDeaths,
    deadMatter: plantLitter + herbivoreDeaths + carnivoreDeaths + topPredatorDeaths + decomposerDeaths + waste - decomposed,
  };
}

export function mapState(state: EcosystemState, fn: (value: number, key: StateKey) => number): EcosystemState {
  return {
    plants: fn(state.plants, "plants"),
    herbivores: fn(state.herbivores, "herbivores"),
    carnivores: fn(state.carnivores, "carnivores"),
    topPredators: fn(state.topPredators, "topPredators"),
    decomposers: fn(state.decomposers, "decomposers"),
    deadMatter: fn(state.deadMatter, "deadMatter"),
  };
}

function combine(a: EcosystemState, b: EcosystemState, scale: number): EcosystemState {
  return mapState(a, (value, key) => value + scale * b[key]);
}

/** One fourth-order Runge–Kutta step, followed by extinction clamping. */
export function integrateStep(
  state: EcosystemState,
  conditions: EnvironmentConditions,
  p: ModelParameters,
  dt: number,
): EcosystemState {
  const k1 = derivatives(state, conditions, p);
  const k2 = derivatives(combine(state, k1, dt / 2), conditions, p);
  const k3 = derivatives(combine(state, k2, dt / 2), conditions, p);
  const k4 = derivatives(combine(state, k3, dt), conditions, p);
  return mapState(state, (value, key) => {
    const next = value + (dt / 6) * (k1[key] + 2 * k2[key] + 2 * k3[key] + k4[key]);
    if (!Number.isFinite(next)) throw new Error(`Simulation diverged at ${key}`);
    if (key === "deadMatter") return Math.max(0, next);
    return next < p.extinctionThreshold ? 0 : next;
  });
}

export const MODEL_ASSUMPTIONS: readonly string[] = [
  "The ecosystem is closed: no animals move in or out.",
  "Each group (plants, herbivores, carnivores, top predators) stands for many species acting together.",
  "Each animal group eats only the group directly below it, so the model is a single food chain, not a full food web.",
  "Sunlight is the only energy source, and it changes only when you change it.",
  "Only a small part of the food an animal eats becomes part of its body. The rest is used for life processes, lost as heat, or left as waste.",
  "Decomposers break down dead matter and return nutrients that help plants grow.",
  "Numbers are relative population sizes, not real counts of organisms.",
  "When a group becomes very small, it is treated as gone from the ecosystem and does not come back on its own.",
];
