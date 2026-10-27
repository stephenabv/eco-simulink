import { describe, expect, it } from "vitest";
import { FEEDING_RELATIONS, FOOD_CHAINS, ORGANISMS } from "@/data/organisms/catalog";
import { computeEnergyPyramid } from "./energy";
import { FoodWeb, FoodWebError } from "./food-web";

const web = new FoodWeb(ORGANISMS, FEEDING_RELATIONS);

describe("organism catalog", () => {
  it("every curated food chain is consistent with the food web", () => {
    for (const chain of FOOD_CHAINS) expect(web.isValidChain(chain.sequence), chain.id).toBe(true);
  });

  it("every chain stays inside its ecosystem", () => {
    for (const chain of FOOD_CHAINS) {
      for (const id of chain.sequence) expect(web.getOrganism(id).ecosystems).toContain(chain.ecosystem);
    }
  });
});

describe("FoodWeb", () => {
  it("labels positions within a chain", () => {
    const chain = FOOD_CHAINS.find((candidate) => candidate.id === "grassland-long")!;
    expect(web.positionsInChain(chain).map((p) => p.position)).toEqual([
      "producer",
      "primary-consumer",
      "secondary-consumer",
      "tertiary-consumer",
      "quaternary-consumer",
    ]);
  });

  it("reports every level a predator with several kinds of prey can feed at", () => {
    expect(web.trophicLevels("eagle")).toEqual([3, 4, 5]);
    expect(web.trophicLevels("grass")).toEqual([1]);
    expect(web.trophicLevels("bacteria")).toEqual([]);
  });

  it("rejects chains in the wrong direction or not starting with a producer", () => {
    expect(web.isValidChain(["eagle", "snake", "frog"])).toBe(false);
    expect(web.isValidChain(["grasshopper", "frog"])).toBe(false);
    expect(web.isValidChain(["grass", "frog"])).toBe(false);
    expect(web.isValidChain(["grass"])).toBe(false);
  });

  it("rejects invalid webs", () => {
    const [grass, grasshopper] = ORGANISMS;
    expect(() => new FoodWeb([grass!, grass!], [])).toThrow(FoodWebError);
    expect(() => new FoodWeb([grass!], [{ food: "grass", consumer: "ghost" }])).toThrow(FoodWebError);
    expect(() => new FoodWeb([grass!, grasshopper!], [{ food: "grasshopper", consumer: "grass" }])).toThrow(FoodWebError);
    const frog = ORGANISMS.find((o) => o.id === "frog")!;
    expect(
      () =>
        new FoodWeb(
          [grasshopper!, frog],
          [
            { food: "grasshopper", consumer: "frog" },
            { food: "frog", consumer: "grasshopper" },
          ],
        ),
    ).toThrow(/cycle/);
  });
});

describe("computeEnergyPyramid", () => {
  it("applies the 10% rule by default", () => {
    const levels = computeEnergyPyramid(10_000, 4);
    expect(levels.map((l) => l.energy)).toEqual([10_000, 1_000, 100, 10].map((n) => expect.closeTo(n, 6)));
    expect(levels[0]!.energyNotTransferred).toBeCloseTo(9_000);
    expect(levels[3]!.energyNotTransferred).toBeCloseTo(10);
  });

  it("validates input", () => {
    expect(() => computeEnergyPyramid(-1, 3)).toThrow(RangeError);
    expect(() => computeEnergyPyramid(100, 0)).toThrow(RangeError);
    expect(() => computeEnergyPyramid(100, 3, 1)).toThrow(RangeError);
  });
});
