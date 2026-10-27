import { GROUP_DISPLAY } from "@/data/simulation";
import type { EcosystemState, StateKey } from "@/lib/simulation/model";

const MAX_PERCENT = 200;

export function percentOfBalanced(value: number, balanced: number): number {
  return balanced > 0 ? (value / balanced) * 100 : 0;
}

/** Current size of each group compared with the balanced ecosystem (100%). */
export function PopulationBars({
  state,
  baseline,
  keys,
}: {
  state: EcosystemState;
  baseline: EcosystemState;
  keys: readonly StateKey[];
}) {
  return (
    <ul className="space-y-3">
      {keys.map((key) => {
        const display = GROUP_DISPLAY[key];
        const percent = percentOfBalanced(state[key], baseline[key]);
        const gone = state[key] === 0;
        return (
          <li key={key}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-bold">
                <span aria-hidden className="mr-1">
                  {display.emoji}
                </span>
                {display.label}
                <span className="ml-1 text-sm font-normal text-ink-muted">({display.examples})</span>
              </span>
              <span className="text-sm font-bold tabular-nums">{gone ? "Gone" : `${Math.round(percent)}%`}</span>
            </div>
            <div
              className="relative mt-1 h-4 overflow-hidden rounded-full bg-forest-50"
              role="meter"
              aria-label={`${display.label} compared with a balanced ecosystem`}
              aria-valuemin={0}
              aria-valuemax={MAX_PERCENT}
              aria-valuenow={Math.round(Math.min(percent, MAX_PERCENT))}
              aria-valuetext={gone ? "gone" : `${Math.round(percent)} percent`}
            >
              <div
                className={`h-full rounded-full ${display.barClass} transition-[width] duration-150`}
                style={{ width: `${Math.min(percent, MAX_PERCENT) / 2}%` }}
              />
              {/* Marker at 100% = balanced */}
              <div aria-hidden className="absolute inset-y-0 left-1/2 w-0.5 bg-ink/40" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
