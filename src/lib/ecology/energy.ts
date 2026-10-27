/**
 * Energy-transfer helpers for the simplified "10% rule".
 *
 * Real ecosystems transfer roughly 5–20% of energy between levels; the
 * lessons use 10% as a teaching approximation and should say so.
 */

export const DEFAULT_TRANSFER_EFFICIENCY = 0.1;

export interface EnergyLevel {
  /** 1 = producers. */
  readonly level: number;
  readonly energy: number;
  /** Share of the producer energy still available at this level (0–1). */
  readonly fractionOfProducerEnergy: number;
  /** Energy not passed on to the next level (used for life processes or lost as heat). */
  readonly energyNotTransferred: number;
}

export function computeEnergyPyramid(
  producerEnergy: number,
  levelCount: number,
  efficiency: number = DEFAULT_TRANSFER_EFFICIENCY,
): EnergyLevel[] {
  if (!Number.isFinite(producerEnergy) || producerEnergy < 0) {
    throw new RangeError("producerEnergy must be a non-negative finite number");
  }
  if (!Number.isInteger(levelCount) || levelCount < 1) {
    throw new RangeError("levelCount must be a positive integer");
  }
  if (!(efficiency > 0 && efficiency < 1)) {
    throw new RangeError("efficiency must be between 0 and 1 (exclusive)");
  }

  return Array.from({ length: levelCount }, (_, index) => {
    const fraction = efficiency ** index;
    const energy = producerEnergy * fraction;
    const isTopLevel = index === levelCount - 1;
    return {
      level: index + 1,
      energy,
      fractionOfProducerEnergy: fraction,
      energyNotTransferred: isTopLevel ? energy : energy * (1 - efficiency),
    };
  });
}
