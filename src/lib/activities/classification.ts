import type { FoodWeb } from "@/lib/ecology/food-web";
import { shuffle, type RandomSource } from "@/lib/random";
import type { FeedingCategory, FoodChain, Organism } from "@/types/ecology";

export interface ClassificationItem {
  readonly organismId: string;
  /**
   * The chain that gives this organism its level. Consumers can sit at
   * different levels in different chains, so each question names one.
   * `null` for decomposers, whose category does not depend on a chain.
   */
  readonly chainId: string | null;
  readonly expected: FeedingCategory;
}

/**
 * Builds a randomised classification round: consumers and producers are
 * taken from real chains (so the expected level is unambiguous), and
 * decomposers are mixed in.
 */
export function buildClassificationRound(
  web: FoodWeb,
  chains: readonly FoodChain[],
  decomposers: readonly Organism[],
  size: number,
  random: RandomSource = Math.random,
): ClassificationItem[] {
  if (!Number.isInteger(size) || size < 1) throw new RangeError("size must be a positive integer");

  const candidates: ClassificationItem[] = [
    ...chains.flatMap((chain) =>
      web.positionsInChain(chain).map((position) => ({
        organismId: position.organismId,
        chainId: chain.id,
        expected: position.position as FeedingCategory,
      })),
    ),
    ...decomposers
      .filter((organism) => organism.role === "decomposer")
      .map((organism) => ({ organismId: organism.id, chainId: null, expected: "decomposer" as const })),
  ];

  // One question per organism so the same animal never appears twice with different answers in a round.
  const seen = new Set<string>();
  const unique = shuffle(candidates, random).filter((item) => {
    if (seen.has(item.organismId)) return false;
    seen.add(item.organismId);
    return true;
  });
  return unique.slice(0, size);
}
