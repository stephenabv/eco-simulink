"use client";

import { useState } from "react";
import { FEEDING_CATEGORY_LABELS } from "@/data/labels";
import { FOOD_CHAINS, FOOD_WEB, describeChain, getOrganism } from "@/data/organisms";
import { EnergyPyramidView } from "./energy-pyramid-view";

const EFFICIENCIES = [0.05, 0.1, 0.2] as const;
const PRODUCER_ENERGY = 10_000;

export function EnergyExplorer() {
  const [chainId, setChainId] = useState(FOOD_CHAINS[0]!.id);
  const [efficiency, setEfficiency] = useState<number>(0.1);
  const chain = FOOD_CHAINS.find((candidate) => candidate.id === chainId) ?? FOOD_CHAINS[0]!;
  const tiers = FOOD_WEB.positionsInChain(chain).map((position) => {
    const organism = getOrganism(position.organismId);
    return {
      label: `${organism.name} (${FEEDING_CATEGORY_LABELS[position.position].toLowerCase()})`,
      emoji: organism.illustration.kind === "emoji" ? organism.illustration.value : "",
    };
  });
  const topEnergy = PRODUCER_ENERGY * efficiency ** (tiers.length - 1);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      <section aria-labelledby="explorer-controls" className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
        <h2 id="explorer-controls" className="text-xl font-extrabold text-forest-900">
          Choose a food chain
        </h2>
        <label htmlFor="chain" className="mt-3 block font-bold">
          Food chain
        </label>
        <select
          id="chain"
          value={chain.id}
          onChange={(event) => setChainId(event.target.value)}
          className="mt-1 min-h-11 w-full rounded-xl border-2 border-forest-100 bg-white px-3"
        >
          {FOOD_CHAINS.map((candidate) => (
            <option key={candidate.id} value={candidate.id}>
              {describeChain(candidate)}
            </option>
          ))}
        </select>

        <fieldset className="mt-5">
          <legend className="font-bold">How much energy passes to the next level?</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {EFFICIENCIES.map((value) => (
              <label key={value} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-sand-50 px-4">
                <input type="radio" name="efficiency" checked={efficiency === value} onChange={() => setEfficiency(value)} />
                {Math.round(value * 100)}%{value === 0.1 ? " (10% rule)" : ""}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 rounded-2xl bg-forest-50 p-4">
          <p>
            The plants capture <strong>{PRODUCER_ENERGY.toLocaleString("en")} units</strong> of energy from the Sun.
          </p>
          <p className="mt-2">
            Only <strong>{topEnergy.toLocaleString("en", { maximumFractionDigits: 2 })} units</strong> reach the{" "}
            {getOrganism(chain.sequence[chain.sequence.length - 1]!).name.toLowerCase()} at the top. That is why there are
            far fewer top predators than plants, and why food chains rarely have more than four or five links.
          </p>
        </div>
      </section>
      <section aria-label="Energy pyramid" className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-3">
        <EnergyPyramidView producerEnergy={PRODUCER_ENERGY} tiers={tiers} efficiency={efficiency} />
      </section>
    </div>
  );
}
