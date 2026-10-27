import { EcosystemSimulation, type Intervention } from "./engine";
import { STATE_KEYS, type EcosystemState, type ModelParameters, type StateKey } from "./model";

export type Trend = "increased" | "decreased" | "unchanged" | "disappeared";

export interface ScenarioDefinition {
  readonly id: string;
  readonly question: string;
  readonly interventions: readonly Intervention[];
  /** How long to run the model after the change before comparing. */
  readonly observeFor: number;
  /** Outcomes the lesson teaches; automated tests check the model really produces them. */
  readonly expected: Readonly<Partial<Record<StateKey, Trend>>>;
  readonly explanation: string;
}

export interface GroupChange {
  readonly key: StateKey;
  readonly before: number;
  readonly after: number;
  /** Relative change, e.g. -0.25 for a 25% drop. `null` when there was nothing before. */
  readonly relativeChange: number | null;
  readonly trend: Trend;
}

export interface ScenarioResult {
  readonly scenario: ScenarioDefinition;
  readonly changes: Readonly<Record<StateKey, GroupChange>>;
  readonly simulation: EcosystemSimulation;
}

/** Changes smaller than this are reported as "unchanged" so tiny numerical drift is not over-interpreted. */
export const SIGNIFICANT_CHANGE = 0.05;

export const SCENARIOS: readonly ScenarioDefinition[] = [
  {
    id: "fewer-plants",
    question: "What happens when the number of plants decreases?",
    interventions: [{ type: "scale-population", group: "plants", factor: 0.4 }],
    observeFor: 4,
    expected: { herbivores: "decreased", carnivores: "decreased" },
    explanation:
      "Herbivores have less food, so fewer of them survive. With fewer herbivores to eat, carnivores also decrease. Every consumer depends on producers.",
  },
  {
    id: "more-herbivores",
    question: "What happens when herbivores increase?",
    interventions: [{ type: "scale-population", group: "herbivores", factor: 2 }],
    observeFor: 3,
    expected: { plants: "decreased", carnivores: "increased" },
    explanation:
      "More herbivores eat more plants, so plants decrease. Carnivores find more food, so they increase. Over time the extra carnivores and the smaller food supply bring herbivores back down.",
  },
  {
    id: "no-top-predators",
    question: "What happens when top predators disappear?",
    interventions: [{ type: "set-population", group: "topPredators", value: 0 }],
    observeFor: 300,
    expected: { topPredators: "disappeared", carnivores: "increased", herbivores: "decreased", plants: "increased" },
    explanation:
      "Without top predators, carnivores are no longer hunted and increase. More carnivores eat more herbivores, and with fewer herbivores, plants grow back. A change at the top spreads down the whole food chain.",
  },
  {
    id: "limited-sunlight",
    question: "What happens when sunlight becomes limited?",
    interventions: [{ type: "set-sunlight", value: 0.4 }],
    observeFor: 300,
    expected: { plants: "decreased", herbivores: "decreased", carnivores: "decreased", topPredators: "disappeared" },
    explanation:
      "Plants capture less energy, so there is less energy for every level above them. Top predators are affected most because they receive the smallest share of the energy.",
  },
  {
    id: "no-decomposers",
    question: "What happens when decomposers disappear?",
    interventions: [{ type: "set-population", group: "decomposers", value: 0 }],
    observeFor: 300,
    expected: { deadMatter: "increased", plants: "decreased" },
    explanation:
      "Dead matter piles up because nothing breaks it down. Nutrients are no longer returned to the soil, so plants grow less, and the animals that depend on plants are affected too.",
  },
];

export function classifyTrend(before: number, after: number): Trend {
  if (before > 0 && after === 0) return "disappeared";
  if (before === 0) return after > 0 ? "increased" : "unchanged";
  const relative = (after - before) / before;
  if (relative > SIGNIFICANT_CHANGE) return "increased";
  if (relative < -SIGNIFICANT_CHANGE) return "decreased";
  return "unchanged";
}

export function compareStates(before: EcosystemState, after: EcosystemState): Record<StateKey, GroupChange> {
  return Object.fromEntries(
    STATE_KEYS.map((key) => {
      const b = before[key];
      const a = after[key];
      return [key, { key, before: b, after: a, relativeChange: b > 0 ? (a - b) / b : null, trend: classifyTrend(b, a) }];
    }),
  ) as Record<StateKey, GroupChange>;
}

export function runScenario(scenario: ScenarioDefinition, parameters?: ModelParameters): ScenarioResult {
  const simulation = new EcosystemSimulation({ parameters });
  const before = simulation.snapshot.state;
  for (const intervention of scenario.interventions) simulation.apply(intervention);
  const after = simulation.advance(scenario.observeFor).state;
  return { scenario, changes: compareStates(before, after), simulation };
}

export function getScenario(id: string): ScenarioDefinition {
  const scenario = SCENARIOS.find((candidate) => candidate.id === id);
  if (!scenario) throw new RangeError(`Unknown scenario: ${id}`);
  return scenario;
}
