import {
  trophicPositionForLevel,
  type FeedingRelation,
  type FoodChain,
  type Organism,
  type TrophicPosition,
} from "@/types/ecology";

export class FoodWebError extends Error {
  override readonly name = "FoodWebError";
}

/** A validated chain position: which organism sits at which trophic level. */
export interface ChainPosition {
  readonly organismId: string;
  readonly level: number;
  readonly position: TrophicPosition;
}

/**
 * Immutable, validated graph of feeding relations. Edges point from food to
 * consumer, matching the direction of energy transfer.
 */
export class FoodWeb {
  private readonly organisms: ReadonlyMap<string, Organism>;
  private readonly consumersOf: ReadonlyMap<string, ReadonlySet<string>>;
  private readonly foodsOf: ReadonlyMap<string, ReadonlySet<string>>;

  constructor(organisms: readonly Organism[], relations: readonly FeedingRelation[]) {
    const byId = new Map<string, Organism>();
    for (const organism of organisms) {
      if (byId.has(organism.id)) throw new FoodWebError(`Duplicate organism id: ${organism.id}`);
      byId.set(organism.id, organism);
    }

    const consumersOf = new Map<string, Set<string>>();
    const foodsOf = new Map<string, Set<string>>();
    for (const { food, consumer } of relations) {
      const foodOrganism = byId.get(food);
      const consumerOrganism = byId.get(consumer);
      if (!foodOrganism || !consumerOrganism) {
        throw new FoodWebError(`Relation references unknown organism: ${food} -> ${consumer}`);
      }
      if (consumerOrganism.role !== "consumer") {
        throw new FoodWebError(`Only consumers can eat other organisms in the food web: ${consumer}`);
      }
      if (foodOrganism.role === "decomposer") {
        throw new FoodWebError(`Decomposers are modelled outside grazing food chains: ${food}`);
      }
      getOrCreate(consumersOf, food).add(consumer);
      getOrCreate(foodsOf, consumer).add(food);
    }

    this.organisms = byId;
    this.consumersOf = consumersOf;
    this.foodsOf = foodsOf;
    this.assertAcyclic();
  }

  getOrganism(id: string): Organism {
    const organism = this.organisms.get(id);
    if (!organism) throw new FoodWebError(`Unknown organism: ${id}`);
    return organism;
  }

  eats(consumer: string, food: string): boolean {
    return this.foodsOf.get(consumer)?.has(food) ?? false;
  }

  /** A food chain is valid when it starts with a producer and every link is a real feeding relation. */
  isValidChain(sequence: readonly string[]): boolean {
    if (sequence.length < 2) return false;
    const [first] = sequence;
    if (first === undefined || this.organisms.get(first)?.role !== "producer") return false;
    return sequence.every((id, index) => index === 0 || this.eats(id, sequence[index - 1] as string));
  }

  /** Trophic positions of each organism within a specific chain. */
  positionsInChain(chain: FoodChain): ChainPosition[] {
    if (!this.isValidChain(chain.sequence)) {
      throw new FoodWebError(`Food chain ${chain.id} is not consistent with the food web`);
    }
    return chain.sequence.map((organismId, index) => ({
      organismId,
      level: index + 1,
      position: trophicPositionForLevel(index + 1),
    }));
  }

  /**
   * All trophic levels an organism can occupy in this web (producer = 1).
   * More than one level means the organism's classification depends on the
   * food chain being discussed.
   */
  trophicLevels(organismId: string): number[] {
    const organism = this.getOrganism(organismId);
    if (organism.role === "decomposer") return [];
    if (organism.role === "producer") return [1];
    const levels = new Set<number>();
    for (const food of this.foodsOf.get(organismId) ?? []) {
      for (const level of this.trophicLevels(food)) levels.add(level + 1);
    }
    return [...levels].sort((a, b) => a - b);
  }

  private assertAcyclic(): void {
    const state = new Map<string, "visiting" | "done">();
    const visit = (id: string): void => {
      const current = state.get(id);
      if (current === "done") return;
      if (current === "visiting") throw new FoodWebError(`Feeding cycle detected at ${id}`);
      state.set(id, "visiting");
      for (const next of this.consumersOf.get(id) ?? []) visit(next);
      state.set(id, "done");
    };
    for (const id of this.organisms.keys()) visit(id);
  }
}

function getOrCreate<K, V>(map: Map<K, Set<V>>, key: K): Set<V> {
  let set = map.get(key);
  if (!set) {
    set = new Set<V>();
    map.set(key, set);
  }
  return set;
}
