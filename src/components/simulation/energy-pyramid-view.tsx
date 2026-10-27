import { computeEnergyPyramid, DEFAULT_TRANSFER_EFFICIENCY } from "@/lib/ecology/energy";

export interface EnergyTier {
  readonly label: string;
  readonly emoji: string;
}

const DEFAULT_TIERS: readonly EnergyTier[] = [
  { label: "Producers", emoji: "🌿" },
  { label: "Primary consumers", emoji: "🦗" },
  { label: "Secondary consumers", emoji: "🐸" },
  { label: "Tertiary consumers", emoji: "🐍" },
];

/** Tier widths are drawn as a pyramid shape; the numbers carry the real 10× drop at each step. */
const TIER_WIDTHS = ["100%", "75%", "52%", "32%", "20%"];

const formatter = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });

export function EnergyPyramidView({
  producerEnergy,
  tiers = DEFAULT_TIERS,
  efficiency = DEFAULT_TRANSFER_EFFICIENCY,
}: {
  producerEnergy: number;
  tiers?: readonly EnergyTier[];
  efficiency?: number;
}) {
  const levels = computeEnergyPyramid(producerEnergy, tiers.length, efficiency);
  return (
    <figure>
      <ol className="flex flex-col-reverse items-center gap-1" aria-label="Energy available at each trophic level">
        {levels.map((level, index) => {
          const tier = tiers[index]!;
          return (
            <li
              key={level.level}
              className="max-w-full rounded-xl bg-gradient-to-r from-leaf-300 to-leaf-500 px-2 py-2 text-center text-sm font-bold text-forest-900"
              style={{ width: `max(${TIER_WIDTHS[index] ?? "20%"}, 13rem)` }}
            >
              <span aria-hidden>{tier.emoji} </span>
              {tier.label}: {formatter.format(level.energy)} units
            </li>
          );
        })}
      </ol>
      <figcaption className="mt-3 text-sm text-ink-muted">
        Only about {Math.round(efficiency * 100)}% of the energy at one level passes to the next. The rest
        is used for living (moving, breathing, growing) or lost as heat. Real ecosystems pass on roughly 5–20%; 10% is a
        simple rule to remember.
      </figcaption>
    </figure>
  );
}
