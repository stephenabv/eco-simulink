import { FoodWeb } from "@/lib/ecology/food-web";
import type { FoodChain, Organism } from "@/types/ecology";
import { FEEDING_RELATIONS, FOOD_CHAINS, ORGANISMS } from "./catalog";

export { ECOSYSTEMS, FEEDING_RELATIONS, FOOD_CHAINS, ORGANISMS } from "./catalog";

/** Validated once at module load: a content mistake fails the build instead of confusing students. */
export const FOOD_WEB = new FoodWeb(ORGANISMS, FEEDING_RELATIONS);

export function getOrganism(id: string): Organism {
  return FOOD_WEB.getOrganism(id);
}

export function getFoodChain(id: string): FoodChain {
  const chain = FOOD_CHAINS.find((candidate) => candidate.id === id);
  if (!chain) throw new RangeError(`Unknown food chain: ${id}`);
  return chain;
}

export function describeChain(chain: FoodChain): string {
  return chain.sequence.map((id) => getOrganism(id).name).join(" → ");
}
