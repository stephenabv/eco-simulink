import { GROUP_DISPLAY, TIME_UNIT_LABEL } from "@/data/simulation";
import type { SimulationSnapshot } from "@/lib/simulation/engine";
import type { EcosystemState, StateKey } from "@/lib/simulation/model";
import { percentOfBalanced } from "./population-bars";

const WIDTH = 600;
const HEIGHT = 220;
const PAD = { left: 40, right: 10, top: 10, bottom: 26 };
/** The y axis grows in steps of 100% so large booms stay visible. */
const MIN_Y_MAX = 200;

/** Line chart of each group over time, as a percentage of the balanced ecosystem. */
export function PopulationChart({
  history,
  baseline,
  keys,
}: {
  history: readonly SimulationSnapshot[];
  baseline: EcosystemState;
  keys: readonly StateKey[];
}) {
  const first = history[0]?.time ?? 0;
  const last = history[history.length - 1]?.time ?? 0;
  const span = Math.max(last - first, 1);
  const x = (time: number) => PAD.left + ((time - first) / span) * (WIDTH - PAD.left - PAD.right);
  const peak = Math.max(
    0,
    ...history.flatMap((point) => keys.map((key) => percentOfBalanced(point.state[key], baseline[key]))),
  );
  const yMax = Math.max(MIN_Y_MAX, Math.ceil(peak / 100) * 100);
  const y = (percent: number) => PAD.top + (1 - Math.min(percent, yMax) / yMax) * (HEIGHT - PAD.top - PAD.bottom);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Line chart of each group's size over time compared with a balanced ecosystem"
      >
        {[0, 100, yMax].map((tick) => (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={WIDTH - PAD.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="currentColor"
              className={tick === 100 ? "text-ink/40" : "text-ink/10"}
              strokeDasharray={tick === 100 ? "4 4" : undefined}
            />
            <text x={PAD.left - 6} y={y(tick) + 4} textAnchor="end" className="fill-ink-muted text-[11px]">
              {tick}%
            </text>
          </g>
        ))}
        <text x={WIDTH - PAD.right} y={HEIGHT - 6} textAnchor="end" className="fill-ink-muted text-[11px]">
          time ({TIME_UNIT_LABEL}) →
        </text>
        {history.length > 1 &&
          keys.map((key) => (
            <polyline
              key={key}
              fill="none"
              stroke={GROUP_DISPLAY[key].stroke}
              strokeWidth={3}
              strokeLinejoin="round"
              points={history.map((point) => `${x(point.time)},${y(percentOfBalanced(point.state[key], baseline[key]))}`).join(" ")}
            />
          ))}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {keys.map((key) => (
          <span key={key} className="inline-flex items-center gap-1">
            <span aria-hidden className="inline-block h-1 w-5 rounded" style={{ background: GROUP_DISPLAY[key].stroke }} />
            {GROUP_DISPLAY[key].label}
          </span>
        ))}
        <span className="text-ink-muted">Dashed line = balanced (100%)</span>
      </figcaption>
    </figure>
  );
}
