"use client";

import { useMemo, useState } from "react";
import { FEEDING_CATEGORY_HINTS, FEEDING_CATEGORY_LABELS } from "@/data/labels";
import { FOOD_WEB, describeChain, getFoodChain, getOrganism } from "@/data/organisms";
import { evaluateCategorization, itemStatusesFromCategorization } from "@/lib/activities/evaluation";
import { seededRandom, shuffle } from "@/lib/random";
import { useClientSeed } from "@/hooks/use-client-seed";
import type { FeedingCategory } from "@/types/ecology";
import { ActivityLoading } from "./activity-loading";
import { PlacementActivity } from "./placement-activity";

export const PYRAMID_ACTIVITY_ID = "organise-food-pyramid";

/** Four-level chains so each organism has exactly one tier. */
const PYRAMID_ROUNDS = [
  { chainId: "grassland-frog", decomposerId: "mushroom" },
  { chainId: "pond-fish", decomposerId: "bacteria" },
  { chainId: "grassland-mouse", decomposerId: "earthworm" },
] as const;

/** Top tier first, as drawn. */
const TIERS: readonly FeedingCategory[] = ["tertiary-consumer", "secondary-consumer", "primary-consumer", "producer"];

export function PyramidActivity() {
  const seed = useClientSeed();
  const [round, setRound] = useState(0);

  const setup = useMemo(() => {
    if (seed === null) return null;
    const random = seededRandom(seed + round);
    const { chainId, decomposerId } = PYRAMID_ROUNDS[(Math.floor(random() * 1000) + round) % PYRAMID_ROUNDS.length]!;
    const chain = getFoodChain(chainId);
    const expected: Record<string, FeedingCategory> = Object.fromEntries(
      FOOD_WEB.positionsInChain(chain).map((position) => [position.organismId, position.position]),
    );
    expected[decomposerId] = "decomposer";
    const items = shuffle(Object.keys(expected), random).map((id) => {
      const organism = getOrganism(id);
      return { id, name: organism.name, illustration: organism.illustration };
    });
    return { chain, expected, items };
  }, [seed, round]);

  if (!setup) return <ActivityLoading />;
  const { chain, expected, items } = setup;
  const slots = [...TIERS, "decomposer" as const].map((category) => ({
    id: category,
    label: category === "decomposer" ? "Decomposers (beside the pyramid)" : FEEDING_CATEGORY_LABELS[category],
    hint: FEEDING_CATEGORY_HINTS[category],
  }));

  return (
    <div className="space-y-4">
      <p className="rounded-2xl bg-forest-50 p-3 font-semibold text-forest-900">
        Food chain: {describeChain(chain)}
      </p>
      <PlacementActivity
        key={`${chain.id}-${round}`}
        activityId={PYRAMID_ACTIVITY_ID}
        items={items}
        slots={slots}
        layout="pyramid"
        evaluate={(board) => {
          const result = evaluateCategorization(expected, board.placements as Record<string, FeedingCategory>);
          return { result, itemStatus: itemStatusesFromCategorization(result) };
        }}
        explain={(itemId, status) => {
          const category = expected[itemId]!;
          const name = getOrganism(itemId).name;
          const where =
            category === "decomposer"
              ? `${name} is a decomposer. Decomposers break down dead matter from every level, so they sit beside the pyramid, not in it.`
              : `${name} belongs on the ${FEEDING_CATEGORY_LABELS[category].toLowerCase()} level. ${FEEDING_CATEGORY_HINTS[category]}.`;
          return status === "correct" ? where : `Not quite. ${where}`;
        }}
        onNewRound={() => setRound((current) => current + 1)}
      />
    </div>
  );
}
