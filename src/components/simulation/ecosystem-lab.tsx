"use client";

import { CheckCircle2, Minus, Pause, Play, Plus, RotateCcw, Sun, Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import { BASE_PRODUCER_ENERGY, GROUP_DISPLAY, TIME_UNIT_LABEL } from "@/data/simulation";
import { useSimulation, type ScenarioRun } from "@/hooks/use-simulation";
import { MODEL_ASSUMPTIONS, POPULATION_GROUPS, PYRAMID_GROUPS, type StateKey } from "@/lib/simulation/model";
import { SCENARIOS, type ScenarioDefinition, type Trend } from "@/lib/simulation/scenarios";
import { Button } from "@/components/shared/button";
import { EnergyPyramidView } from "./energy-pyramid-view";
import { PopulationBars } from "./population-bars";
import { PopulationChart } from "./population-chart";

const CHART_KEYS: readonly StateKey[] = [...PYRAMID_GROUPS, "decomposers"];
const BAR_KEYS: readonly StateKey[] = [...POPULATION_GROUPS, "deadMatter"];

const TREND_TEXT: Record<Trend, string> = {
  increased: "increased",
  decreased: "decreased",
  unchanged: "stayed about the same",
  disappeared: "disappeared",
};

export function EcosystemLab() {
  const lab = useSimulation();
  const { snapshot, history, baseline, playing, scenarioRun, scenarioActive } = lab;
  const [prediction, setPrediction] = useState<string>("");
  const [selected, setSelected] = useState<ScenarioDefinition | null>(null);
  const awaitingRun = selected !== null && scenarioRun?.scenario.id !== selected.id;
  const sunlightPercent = Math.round(snapshot.conditions.sunlight * 100);
  const plantRatio = baseline.plants > 0 ? snapshot.state.plants / baseline.plants : 0;
  const producerEnergy = BASE_PRODUCER_ENERGY * snapshot.conditions.sunlight * Math.min(plantRatio, 2);

  return (
    <div className="space-y-6">
      <section aria-labelledby="scenarios-heading" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="scenarios-heading" className="text-xl font-extrabold text-forest-900">
          Ask a question
        </h2>
        <p className="mt-1 text-ink-muted">Pick a question. The ecosystem starts balanced, the change happens, and you watch what follows.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {SCENARIOS.map((scenario) => (
            <Button
              key={scenario.id}
              variant={selected?.id === scenario.id ? "primary" : "secondary"}
              aria-pressed={selected?.id === scenario.id}
              onClick={() => {
                setPrediction("");
                lab.clearScenario();
                setSelected(scenario);
              }}
              disabled={scenarioActive}
              className="text-left"
            >
              {scenario.question}
            </Button>
          ))}
        </div>
        {awaitingRun && (
          <PredictPanel
            scenario={selected}
            prediction={prediction}
            onPredict={setPrediction}
            onRun={() => lab.runScenario(selected)}
          />
        )}
        {!awaitingRun && scenarioRun && (
          <ScenarioResult
            run={scenarioRun}
            prediction={prediction}
            onClose={() => {
              lab.clearScenario();
              setSelected(null);
            }}
          />
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <section aria-labelledby="ecosystem-heading" className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="ecosystem-heading" className="text-xl font-extrabold text-forest-900">
              Your ecosystem
            </h2>
            <span className="text-sm font-semibold text-ink-muted tabular-nums">
              Time: {Math.round(snapshot.time)} {TIME_UNIT_LABEL}
            </span>
          </div>
          <div className="mt-4">
            <PopulationBars state={snapshot.state} baseline={baseline} keys={BAR_KEYS} />
          </div>
          <div className="mt-6">
            <PopulationChart history={history} baseline={baseline} keys={CHART_KEYS} />
          </div>
        </section>

        <section aria-labelledby="controls-heading" className="rounded-3xl bg-white p-5 shadow-sm lg:col-span-2">
          <h2 id="controls-heading" className="text-xl font-extrabold text-forest-900">
            Change the ecosystem
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={() => lab.setPlaying(!playing)} disabled={scenarioActive}>
              {playing ? <Pause aria-hidden className="size-4" /> : <Play aria-hidden className="size-4" />}
              {playing ? "Pause" : "Play"}
            </Button>
            <Button variant="secondary" onClick={lab.reset}>
              <RotateCcw aria-hidden className="size-4" /> Reset to balanced
            </Button>
          </div>

          <label htmlFor="sunlight" className="mt-5 flex items-center justify-between gap-2 font-bold">
            <span className="inline-flex items-center gap-1">
              <Sun aria-hidden className="size-5 text-earth-700" /> Sunlight
            </span>
            <span className="tabular-nums">{sunlightPercent}%</span>
          </label>
          <input
            id="sunlight"
            type="range"
            min={0}
            max={150}
            step={10}
            value={sunlightPercent}
            disabled={scenarioActive}
            onChange={(event) => lab.apply({ type: "set-sunlight", value: Number(event.target.value) / 100 })}
            className="mt-2 h-11 w-full accent-forest-700"
            aria-valuetext={`${sunlightPercent} percent of normal sunlight`}
          />

          <ul className="mt-4 space-y-2">
            {POPULATION_GROUPS.map((group) => {
              const label = GROUP_DISPLAY[group].label;
              return (
                <li key={group} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sand-50 p-2">
                  <span className="font-bold">
                    <span aria-hidden className="mr-1">
                      {GROUP_DISPLAY[group].emoji}
                    </span>
                    {label}
                  </span>
                  <span className="flex gap-1">
                    <IconButton
                      label={`Remove half of the ${label.toLowerCase()}`}
                      disabled={scenarioActive}
                      onClick={() => lab.apply({ type: "scale-population", group, factor: 0.5 })}
                    >
                      <Minus aria-hidden className="size-4" />
                    </IconButton>
                    <IconButton
                      label={`Add 50% more ${label.toLowerCase()}`}
                      disabled={scenarioActive || snapshot.state[group] === 0}
                      onClick={() => lab.apply({ type: "scale-population", group, factor: 1.5 })}
                    >
                      <Plus aria-hidden className="size-4" />
                    </IconButton>
                    <IconButton
                      label={`Remove all ${label.toLowerCase()}`}
                      disabled={scenarioActive || snapshot.state[group] === 0}
                      onClick={() => lab.apply({ type: "set-population", group, value: 0 })}
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </IconButton>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-sm text-ink-muted">
            Make a change, then press Play to see what happens over time. A group that is gone does not come back by itself.
          </p>
        </section>
      </div>

      <section aria-labelledby="energy-heading" className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 id="energy-heading" className="text-xl font-extrabold text-forest-900">
          Where does the energy go?
        </h2>
        <p className="mt-1 mb-4 text-ink-muted">
          Energy enters through sunlight captured by plants. Change the sunlight or the plants and watch every level change.
        </p>
        <EnergyPyramidView producerEnergy={producerEnergy} />
      </section>

      <details className="rounded-3xl bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-xl font-extrabold text-forest-900">How this simulation is simplified</summary>
        <p className="mt-2 text-ink-muted">
          Real ecosystems are much more complex. This model follows simple rules so you can see cause and effect clearly:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {MODEL_ASSUMPTIONS.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid size-11 place-items-center rounded-full border-2 border-forest-100 bg-white text-forest-900 hover:border-forest-500 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

const PREDICTION_OPTIONS = ["increase", "decrease", "stay the same"] as const;

/** The group students are asked to predict: the first expected change other than the group directly removed. */
function focusOf(scenario: ScenarioDefinition): StateKey | undefined {
  const keys = Object.keys(scenario.expected) as StateKey[];
  return keys.find((key) => scenario.expected[key] !== "disappeared") ?? keys[0];
}

function PredictPanel({
  scenario,
  prediction,
  onPredict,
  onRun,
}: {
  scenario: ScenarioDefinition;
  prediction: string;
  onPredict: (value: string) => void;
  onRun: () => void;
}) {
  const focusKey = focusOf(scenario);
  const focusLabel = focusKey ? GROUP_DISPLAY[focusKey].label.toLowerCase() : "";
  return (
    <div className="mt-4 rounded-2xl bg-forest-50 p-4">
      <h3 className="font-extrabold text-forest-900">{scenario.question}</h3>
      <fieldset className="mt-2">
        <legend className="font-bold">Predict first: what will happen to the {focusLabel}?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREDICTION_OPTIONS.map((option) => (
            <label key={option} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white px-4">
              <input type="radio" name="prediction" value={option} checked={prediction === option} onChange={() => onPredict(option)} />
              They will {option}
            </label>
          ))}
        </div>
      </fieldset>
      <Button className="mt-3" onClick={onRun}>
        <Play aria-hidden className="size-4" /> Run the experiment
      </Button>
    </div>
  );
}

function ScenarioResult({ run, prediction, onClose }: { run: ScenarioRun; prediction: string; onClose: () => void }) {
  const { scenario, changes, remainingTicks } = run;
  const expectedEntries = Object.entries(scenario.expected) as [StateKey, Trend][];
  const focusKey = focusOf(scenario);
  const focusLabel = focusKey ? GROUP_DISPLAY[focusKey].label.toLowerCase() : "";

  return (
    <div className="mt-4 rounded-2xl bg-forest-50 p-4" aria-live="polite">
      <h3 className="font-extrabold text-forest-900">{scenario.question}</h3>
      {changes === null ? (
        <p className="mt-1">Watch the bars and the chart below… {Math.round(((50 - remainingTicks) / 50) * 100)}%</p>
      ) : (
        <>
          <ul className="mt-2 space-y-1">
            {expectedEntries.map(([key]) => {
              const change = changes[key];
              const percent = change.relativeChange === null ? null : Math.round(change.relativeChange * 100);
              return (
                <li key={key}>
                  <span aria-hidden className="mr-1">
                    {GROUP_DISPLAY[key].emoji}
                  </span>
                  <strong>{GROUP_DISPLAY[key].label}</strong> {TREND_TEXT[change.trend]}
                  {percent !== null && change.trend !== "disappeared" && change.trend !== "unchanged"
                    ? ` (${percent > 0 ? "+" : ""}${percent}%)`
                    : ""}
                </li>
              );
            })}
          </ul>
          {prediction && focusKey && <PredictionFeedback prediction={prediction} trend={changes[focusKey].trend} label={focusLabel} />}
          <p className="mt-3">{scenario.explanation}</p>
          <Button variant="ghost" className="mt-2" onClick={onClose}>
            Close
          </Button>
        </>
      )}
    </div>
  );
}

function PredictionFeedback({ prediction, trend, label }: { prediction: string; trend: Trend; label: string }) {
  const actual = trend === "increased" ? "increase" : trend === "unchanged" ? "stay the same" : "decrease";
  const correct = prediction === actual;
  return (
    <p className={`mt-3 inline-flex items-center gap-2 font-bold ${correct ? "text-forest-700" : "text-danger-600"}`}>
      {correct ? <CheckCircle2 aria-hidden className="size-5" /> : <XCircle aria-hidden className="size-5" />}
      {correct
        ? `Your prediction was right: the ${label} did ${actual}.`
        : `You predicted the ${label} would ${prediction}, but they did ${actual === "stay the same" ? "stay about the same" : actual}.`}
    </p>
  );
}
