import type { StateKey } from "@/lib/simulation/model";

export interface GroupDisplay {
  readonly label: string;
  readonly examples: string;
  readonly emoji: string;
  /** Tailwind classes for the bar and the chart line (stroke uses the matching CSS variable). */
  readonly barClass: string;
  readonly stroke: string;
}

export const GROUP_DISPLAY: Record<StateKey, GroupDisplay> = {
  plants: { label: "Plants", examples: "grass, shrubs", emoji: "🌿", barClass: "bg-leaf-500", stroke: "var(--color-leaf-500)" },
  herbivores: { label: "Herbivores", examples: "grasshoppers, mice", emoji: "🐁", barClass: "bg-sun-400", stroke: "#c99512" },
  carnivores: { label: "Carnivores", examples: "frogs, snakes", emoji: "🐍", barClass: "bg-earth-500", stroke: "var(--color-earth-500)" },
  topPredators: { label: "Top predators", examples: "eagles", emoji: "🦅", barClass: "bg-forest-900", stroke: "var(--color-forest-900)" },
  decomposers: { label: "Decomposers", examples: "bacteria, fungi", emoji: "🍄", barClass: "bg-forest-500", stroke: "var(--color-forest-500)" },
  deadMatter: { label: "Dead matter", examples: "fallen leaves, waste", emoji: "🍂", barClass: "bg-earth-700", stroke: "var(--color-earth-700)" },
};

/** Model time units are presented as weeks; the model is not calibrated to real time. */
export const TIME_UNIT_LABEL = "weeks";

/** Energy reaching producers under normal sunlight, in arbitrary "energy units". */
export const BASE_PRODUCER_ENERGY = 10_000;
