"use client";

import { useMemo, useState } from "react";
import { FEEDING_CATEGORY_HINTS, FEEDING_CATEGORY_LABELS } from "@/data/labels";
import { FOOD_CHAINS, FOOD_WEB, ORGANISMS, describeChain, getFoodChain, getOrganism } from "@/data/organisms";
import { buildClassificationRound } from "@/lib/activities/classification";
import { evaluateCategorization, itemStatusesFromCategorization } from "@/lib/activities/evaluation";
import { seededRandom } from "@/lib/random";
import { useClientSeed } from "@/hooks/use-client-seed";
import type { FeedingCategory } from "@/types/ecology";
import { ActivityLoading } from "./activity-loading";
import { PlacementActivity } from "./placement-activity";

export const CLASSIFY_ACTIVITY_ID = "classify-organisms";
const ROUND_SIZE = 6;

const CATEGORIES: readonly FeedingCategory[] = [
  "producer",
  "primary-consumer",
  "secondary-consumer",
  "tertiary-consumer",
  "decomposer",
];

/** The activity covers producer to tertiary consumer, so longer chains are cut to four links. */
const CHAINS = FOOD_CHAINS.map((chain) => ({ ...chain, sequence: chain.sequence.slice(0, 4) }));
const DECOMPOSERS = ORGANISMS.filter((organism) => organism.role === "decomposer");

export function ClassifyActivity() {
  const seed = useClientSeed();
  const [round, setRound] = useState(0);

  const setup = useMemo(() => {
    if (seed === null) return null;
    const questions = buildClassificationRound(FOOD_WEB, CHAINS, DECOMPOSERS, ROUND_SIZE, seededRandom(seed + round));
    const expected = Object.fromEntries(questions.map((question) => [question.organismId, question.expected]));
    const items = questions.map((question) => {
      const organism = getOrganism(question.organismId);
      const chain = question.chainId ? CHAINS.find((candidate) => candidate.id === question.chainId) : undefined;
      return {
        id: organism.id,
        name: organism.name,
        illustration: organism.illustration,
        detail: chain ? `In: ${describeChain(chain)}` : "Feeds on dead matter",
      };
    });
    return { questions, expected, items };
  }, [seed, round]);

  if (!setup) return <ActivityLoading />;
  const { questions, expected, items } = setup;

  return (
    <PlacementActivity
      key={round}
      activityId={CLASSIFY_ACTIVITY_ID}
      items={items}
      slots={CATEGORIES.map((category) => ({
        id: category,
        label: FEEDING_CATEGORY_LABELS[category],
        hint: FEEDING_CATEGORY_HINTS[category],
      }))}
      layout="bins"
      evaluate={(board) => {
        const result = evaluateCategorization(expected, board.placements as Record<string, FeedingCategory>);
        return { result, itemStatus: itemStatusesFromCategorization(result) };
      }}
      explain={(itemId, status) => {
        const question = questions.find((candidate) => candidate.organismId === itemId)!;
        const organism = getOrganism(itemId);
        const label = FEEDING_CATEGORY_LABELS[question.expected].toLowerCase();
        let reason: string;
        if (question.chainId === null) {
          reason = `${organism.description}`;
        } else {
          const chain = getFoodChain(question.chainId);
          const index = chain.sequence.indexOf(itemId);
          reason =
            index === 0
              ? `${organism.name} makes its own food using sunlight.`
              : `In this chain it eats the ${getOrganism(chain.sequence[index - 1]!).name.toLowerCase()}.`;
        }
        return `${status === "correct" ? "" : "Not quite. "}${organism.name} is a ${label}. ${reason}`;
      }}
      onNewRound={() => setRound((current) => current + 1)}
    />
  );
}
