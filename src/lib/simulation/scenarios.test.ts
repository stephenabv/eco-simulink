import { describe, expect, it } from "vitest";
import { EcosystemSimulation, balancedState } from "./engine";
import { PYRAMID_GROUPS } from "./model";
import { SCENARIOS, classifyTrend, getScenario, runScenario } from "./scenarios";

describe("balanced ecosystem", () => {
  const state = balancedState();

  it("keeps every group alive", () => {
    for (const value of Object.values(state)) expect(value).toBeGreaterThan(0);
  });

  it("forms an upright pyramid: each level is smaller than the one below", () => {
    for (let i = 1; i < PYRAMID_GROUPS.length; i++) {
      const lower = state[PYRAMID_GROUPS[i - 1]!];
      const upper = state[PYRAMID_GROUPS[i]!];
      expect(upper).toBeLessThan(lower);
    }
  });

  it("is a steady state when nothing changes", () => {
    const simulation = new EcosystemSimulation();
    const after = simulation.advance(100).state;
    for (const key of PYRAMID_GROUPS) expect(classifyTrend(state[key], after[key])).toBe("unchanged");
  });
});

describe.each(SCENARIOS.map((scenario) => [scenario.id, scenario] as const))("scenario %s", (_id, scenario) => {
  const result = runScenario(scenario);

  it.each(Object.entries(scenario.expected))("%s %s", (key, trend) => {
    expect(result.changes[key as keyof typeof result.changes].trend).toBe(trend);
  });
});

describe("simulation engine", () => {
  it("is deterministic", () => {
    const a = runScenario(getScenario("more-herbivores")).simulation.snapshot.state;
    const b = runScenario(getScenario("more-herbivores")).simulation.snapshot.state;
    expect(a).toEqual(b);
  });

  it("returns to the balanced state after reset", () => {
    const simulation = new EcosystemSimulation();
    simulation.apply({ type: "set-sunlight", value: 0.2 });
    simulation.advance(50);
    simulation.reset();
    expect(simulation.snapshot.state).toEqual(balancedState());
    expect(simulation.snapshot.time).toBe(0);
  });

  it("clamps out-of-range student inputs", () => {
    const simulation = new EcosystemSimulation();
    simulation.apply({ type: "set-sunlight", value: 99 });
    expect(simulation.snapshot.conditions.sunlight).toBe(1.5);
    simulation.apply({ type: "scale-population", group: "plants", factor: -3 });
    expect(simulation.snapshot.state.plants).toBe(0);
  });

  it("rejects non-finite values", () => {
    const simulation = new EcosystemSimulation();
    expect(() => simulation.apply({ type: "set-population", group: "plants", value: Number.NaN })).toThrow(RangeError);
    expect(() => simulation.advance(Number.POSITIVE_INFINITY)).toThrow(RangeError);
  });

  it("bounds history length", () => {
    const simulation = new EcosystemSimulation({ historyLimit: 3 });
    for (let i = 0; i < 10; i++) simulation.advance(1);
    expect(simulation.snapshots).toHaveLength(3);
  });

  it("does not bring an extinct group back on its own", () => {
    const simulation = new EcosystemSimulation();
    simulation.apply({ type: "set-population", group: "carnivores", value: 0 });
    expect(simulation.advance(200).state.carnivores).toBe(0);
  });
});
