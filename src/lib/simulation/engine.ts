import {
  DEFAULT_PARAMETERS,
  NORMAL_CONDITIONS,
  integrateStep,
  mapState,
  type EcosystemState,
  type EnvironmentConditions,
  type ModelParameters,
  type PopulationGroup,
} from "./model";

export type Intervention =
  | { readonly type: "scale-population"; readonly group: PopulationGroup; readonly factor: number }
  | { readonly type: "set-population"; readonly group: PopulationGroup; readonly value: number }
  | { readonly type: "set-sunlight"; readonly value: number };

export interface SimulationSnapshot {
  readonly time: number;
  readonly state: EcosystemState;
  readonly conditions: EnvironmentConditions;
}

export interface SimulationOptions {
  readonly parameters?: ModelParameters;
  readonly initialState?: EcosystemState;
  readonly conditions?: EnvironmentConditions;
  /** Integration step; smaller is more accurate and slower. */
  readonly dt?: number;
  /** Maximum snapshots kept for charts, to bound memory use. */
  readonly historyLimit?: number;
}

const DEFAULT_DT = 0.05;
const DEFAULT_HISTORY_LIMIT = 600;
const SETTLE_TIME = 1500;
const SEED_STATE: EcosystemState = {
  plants: 0.5,
  herbivores: 0.1,
  carnivores: 0.05,
  topPredators: 0.02,
  decomposers: 0.05,
  deadMatter: 0.1,
};

/** Upper bounds keep student-driven interventions inside the range the model was tuned for. */
const MAX_SUNLIGHT = 1.5;
const MAX_POPULATION_FACTOR = 5;

const balancedStateCache = new WeakMap<ModelParameters, EcosystemState>();

/** The steady state reached under normal sunlight; the "balanced ecosystem" starting point. */
export function balancedState(parameters: ModelParameters = DEFAULT_PARAMETERS): EcosystemState {
  const cached = balancedStateCache.get(parameters);
  if (cached) return cached;
  let state = SEED_STATE;
  for (let t = 0; t < SETTLE_TIME; t += DEFAULT_DT) {
    state = integrateStep(state, NORMAL_CONDITIONS, parameters, DEFAULT_DT);
  }
  const settled = Object.freeze(state);
  balancedStateCache.set(parameters, settled);
  return settled;
}

/**
 * Stateful, framework-independent simulation runner. UI code drives it with
 * `advance` and `apply`, and reads snapshots; it never touches the equations.
 */
export class EcosystemSimulation {
  private readonly parameters: ModelParameters;
  private readonly dt: number;
  private readonly historyLimit: number;
  private state: EcosystemState;
  private conditions: EnvironmentConditions;
  private time = 0;
  private history: SimulationSnapshot[] = [];

  constructor(options: SimulationOptions = {}) {
    this.parameters = options.parameters ?? DEFAULT_PARAMETERS;
    this.dt = options.dt ?? DEFAULT_DT;
    this.historyLimit = options.historyLimit ?? DEFAULT_HISTORY_LIMIT;
    if (!(this.dt > 0 && this.dt <= 0.5)) throw new RangeError("dt must be in (0, 0.5]");
    if (!Number.isInteger(this.historyLimit) || this.historyLimit < 1) {
      throw new RangeError("historyLimit must be a positive integer");
    }
    this.state = options.initialState ?? balancedState(this.parameters);
    this.conditions = options.conditions ?? NORMAL_CONDITIONS;
    this.record();
  }

  get snapshot(): SimulationSnapshot {
    return { time: this.time, state: this.state, conditions: this.conditions };
  }

  get snapshots(): readonly SimulationSnapshot[] {
    return this.history;
  }

  /** Runs the model forward by `duration` time units. */
  advance(duration: number): SimulationSnapshot {
    if (!(duration >= 0) || !Number.isFinite(duration)) throw new RangeError("duration must be a non-negative number");
    const steps = Math.round(duration / this.dt);
    for (let i = 0; i < steps; i++) {
      this.state = integrateStep(this.state, this.conditions, this.parameters, this.dt);
    }
    this.time += steps * this.dt;
    this.record();
    return this.snapshot;
  }

  apply(intervention: Intervention): SimulationSnapshot {
    switch (intervention.type) {
      case "scale-population": {
        const factor = clamp(intervention.factor, 0, MAX_POPULATION_FACTOR);
        this.state = mapState(this.state, (value, key) => (key === intervention.group ? value * factor : value));
        break;
      }
      case "set-population": {
        const value = Math.max(0, finiteOrThrow(intervention.value));
        this.state = mapState(this.state, (current, key) => (key === intervention.group ? value : current));
        break;
      }
      case "set-sunlight":
        this.conditions = { ...this.conditions, sunlight: clamp(intervention.value, 0, MAX_SUNLIGHT) };
        break;
      default: {
        const exhaustive: never = intervention;
        throw new Error(`Unknown intervention: ${JSON.stringify(exhaustive)}`);
      }
    }
    this.record();
    return this.snapshot;
  }

  reset(): void {
    this.state = balancedState(this.parameters);
    this.conditions = NORMAL_CONDITIONS;
    this.time = 0;
    this.history = [];
    this.record();
  }

  private record(): void {
    this.history.push(this.snapshot);
    if (this.history.length > this.historyLimit) this.history.splice(0, this.history.length - this.historyLimit);
  }
}

function finiteOrThrow(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("value must be finite");
  return value;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finiteOrThrow(value)));
}
