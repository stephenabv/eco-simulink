"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EcosystemSimulation, type Intervention, type SimulationSnapshot } from "@/lib/simulation/engine";
import { compareStates, type GroupChange, type ScenarioDefinition } from "@/lib/simulation/scenarios";
import type { EcosystemState, StateKey } from "@/lib/simulation/model";

const TICK_MS = 100;
/** Model time advanced per tick while playing freely. */
const FREE_RUN_STEP = 0.5;
/** A scenario plays out over this many ticks, whatever its length in model time. */
const SCENARIO_TICKS = 50;

export interface ScenarioRun {
  readonly scenario: ScenarioDefinition;
  readonly remainingTicks: number;
  readonly startState: EcosystemState;
  /** Set once the scenario has finished running. */
  readonly changes: Readonly<Record<StateKey, GroupChange>> | null;
}

/**
 * React adapter for the simulation engine: owns one `EcosystemSimulation`,
 * drives it on a timer, and re-renders with immutable snapshots.
 */
export function useSimulation() {
  const [simulation] = useState(() => new EcosystemSimulation({ historyLimit: 300 }));
  const [baseline] = useState(() => simulation.snapshot.state);
  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(() => simulation.snapshot);
  const [history, setHistory] = useState<readonly SimulationSnapshot[]>(() => [...simulation.snapshots]);
  const [playing, setPlaying] = useState(false);
  const [scenarioRun, setScenarioRunState] = useState<ScenarioRun | null>(null);
  // The timer reads the latest run from a ref so state updaters stay pure.
  const runRef = useRef<ScenarioRun | null>(null);

  const setScenarioRun = useCallback((run: ScenarioRun | null) => {
    runRef.current = run;
    setScenarioRunState(run);
  }, []);

  const publish = useCallback(() => {
    setSnapshot(simulation.snapshot);
    setHistory([...simulation.snapshots]);
  }, [simulation]);

  const scenarioActive = scenarioRun !== null && scenarioRun.remainingTicks > 0;
  const running = playing || scenarioActive;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const run = runRef.current;
      if (run && run.remainingTicks > 0) {
        simulation.advance(run.scenario.observeFor / SCENARIO_TICKS);
        const remainingTicks = run.remainingTicks - 1;
        setScenarioRun({
          ...run,
          remainingTicks,
          changes: remainingTicks === 0 ? compareStates(run.startState, simulation.snapshot.state) : null,
        });
      } else {
        simulation.advance(FREE_RUN_STEP);
      }
      publish();
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, [running, simulation, publish, setScenarioRun]);

  const apply = useCallback(
    (intervention: Intervention) => {
      simulation.apply(intervention);
      publish();
    },
    [simulation, publish],
  );

  const reset = useCallback(() => {
    simulation.reset();
    setPlaying(false);
    setScenarioRun(null);
    publish();
  }, [simulation, publish, setScenarioRun]);

  const runScenario = useCallback(
    (scenario: ScenarioDefinition) => {
      simulation.reset();
      const startState = simulation.snapshot.state;
      scenario.interventions.forEach((intervention) => simulation.apply(intervention));
      setPlaying(false);
      setScenarioRun({ scenario, remainingTicks: SCENARIO_TICKS, startState, changes: null });
      publish();
    },
    [simulation, publish, setScenarioRun],
  );

  const clearScenario = useCallback(() => setScenarioRun(null), [setScenarioRun]);

  return { snapshot, history, baseline, playing, scenarioRun, scenarioActive, setPlaying, apply, reset, runScenario, clearScenario };
}
