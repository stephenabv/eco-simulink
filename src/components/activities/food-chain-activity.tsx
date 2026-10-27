"use client";

import { Sun } from "lucide-react";
import { useMemo, useState } from "react";
import { FEEDING_CATEGORY_LABELS } from "@/data/labels";
import { FOOD_CHAINS, FOOD_WEB, getOrganism } from "@/data/organisms";
import { evaluateSequence, itemStatusesFromSequence } from "@/lib/activities/evaluation";
import { sequenceAnswer } from "@/lib/activities/placement-board";
import { seededRandom, shuffle } from "@/lib/random";
import { useClientSeed } from "@/hooks/use-client-seed";
import { ActivityLoading } from "./activity-loading";
import { PlacementActivity } from "./placement-activity";

export const FOOD_CHAIN_ACTIVITY_ID = "build-food-chain";

export function FoodChainActivity() {
  const seed = useClientSeed();
  const [round, setRound] = useState(0);

  const setup = useMemo(() => {
    if (seed === null) return null;
    const random = seededRandom(seed + round);
    const chain = FOOD_CHAINS[Math.floor(random() * FOOD_CHAINS.length)]!;
    const positions = FOOD_WEB.positionsInChain(chain);
    return {
      chain,
      positions,
      items: shuffle(chain.sequence, random).map((id) => {
        const organism = getOrganism(id);
        return { id, name: organism.name, illustration: organism.illustration };
      }),
      slots: chain.sequence.map((_, index) => ({ id: `${index}`, label: `Step ${index + 1}` })),
    };
  }, [seed, round]);

  if (!setup) return <ActivityLoading />;
  const { chain, positions, items, slots } = setup;

  return (
    <PlacementActivity
      key={`${chain.id}-${round}`}
      activityId={FOOD_CHAIN_ACTIVITY_ID}
      items={items}
      slots={slots}
      layout="chain"
      chainStart={
        <div className="flex min-h-16 items-center gap-2 rounded-3xl bg-sun-400/30 px-4 py-3 font-extrabold text-earth-700">
          <Sun aria-hidden className="size-7 text-earth-700" /> Sun
        </div>
      }
      evaluate={(board) => {
        const result = evaluateSequence(chain.sequence, sequenceAnswer(board));
        return { result, itemStatus: itemStatusesFromSequence(result) };
      }}
      explain={(itemId, status) => {
        const position = positions.find((candidate) => candidate.organismId === itemId)!;
        const organism = getOrganism(itemId);
        const role = FEEDING_CATEGORY_LABELS[position.position].toLowerCase();
        const step = position.level === 1
          ? "It comes first because it captures energy from the Sun."
          : `It eats the ${getOrganism(chain.sequence[position.level - 2]!).name.toLowerCase()}, so it goes in step ${position.level}.`;
        const prefix = status === "correct" ? "" : `This goes in step ${position.level}. `;
        return `${prefix}${organism.name} is the ${role} in this chain. ${step}`;
      }}
      onNewRound={() => setRound((current) => current + 1)}
    />
  );
}
