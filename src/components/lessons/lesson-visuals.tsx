import { ArrowRight, Sun } from "lucide-react";
import type { LessonVisual } from "@/data/lessons";
import { FEEDING_CATEGORY_LABELS } from "@/data/labels";
import { FOOD_WEB, getFoodChain, getOrganism } from "@/data/organisms";
import { EnergyPyramidView } from "@/components/simulation/energy-pyramid-view";
import { OrganismArt } from "@/components/shared/organism-figure";

export function LessonVisualView({ visual }: { visual: LessonVisual }) {
  switch (visual) {
    case "living-nonliving":
      return (
        <TwoColumns
          left={{ title: "Living (biotic)", items: ["🌿 Plants", "🐸 Animals", "🍄 Fungi", "🦠 Bacteria"] }}
          right={{ title: "Nonliving (abiotic)", items: ["☀️ Sunlight", "💧 Water", "🌬️ Air", "🪨 Soil and rocks", "🌡️ Temperature"] }}
        />
      );
    case "ecosystem-examples":
      return (
        <TwoColumns
          left={{ title: "Terrestrial (land)", items: ["🌳 Forest", "🌾 Grassland", "🏜️ Desert", "🌾 Rice field"] }}
          right={{ title: "Aquatic (water)", items: ["🐸 Pond", "🏞️ River and lake", "🌊 Ocean", "🪸 Coral reef", "🌱 Mangrove"] }}
        />
      );
    case "roles":
      return (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { title: "Producers", ids: ["grass", "phytoplankton"], text: "Make food from sunlight" },
            { title: "Consumers", ids: ["grasshopper", "frog", "eagle"], text: "Eat other organisms" },
            { title: "Decomposers", ids: ["mushroom", "bacteria"], text: "Break down dead matter" },
          ].map((group) => (
            <div key={group.title} className="rounded-2xl bg-forest-50 p-4">
              <p className="font-extrabold text-forest-900">{group.title}</p>
              <p className="text-sm text-ink-muted">{group.text}</p>
              <ul className="mt-2 space-y-1">
                {group.ids.map((id) => {
                  const organism = getOrganism(id);
                  return (
                    <li key={id} className="flex items-center gap-2">
                      <OrganismArt illustration={organism.illustration} className="text-xl" /> {organism.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      );
    case "consumer-levels":
    case "food-chain":
      return <ChainDiagram chainId={visual === "food-chain" ? "grassland-long" : "grassland-frog"} showLevels={visual === "consumer-levels"} />;
    case "food-web":
      return <FoodWebDiagram />;
    case "energy-pyramid":
      return <EnergyPyramidView producerEnergy={10_000} />;
    case "pyramid-types":
      return <PyramidTypes />;
  }
}

function TwoColumns({ left, right }: { left: { title: string; items: string[] }; right: { title: string; items: string[] } }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[left, right].map((column) => (
        <div key={column.title} className="rounded-2xl bg-forest-50 p-4">
          <p className="font-extrabold text-forest-900">{column.title}</p>
          <ul className="mt-2 space-y-1">
            {column.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function ChainDiagram({ chainId, showLevels }: { chainId: string; showLevels: boolean }) {
  const chain = getFoodChain(chainId);
  const positions = FOOD_WEB.positionsInChain(chain);
  return (
    <ol className="flex flex-wrap items-center gap-2" aria-label="Food chain diagram, arrows show the direction energy flows">
      <li className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-2xl bg-sun-400/30 px-3 py-2 font-bold text-earth-700">
          <Sun aria-hidden className="size-5" /> Sun
        </span>
        <ArrowRight aria-label="gives energy to" className="size-5 text-forest-500" />
      </li>
      {positions.map((position, index) => {
        const organism = getOrganism(position.organismId);
        return (
          <li key={organism.id} className="flex items-center gap-2">
            <span className="flex flex-col items-center rounded-2xl bg-white px-3 py-2 shadow-sm">
              <OrganismArt illustration={organism.illustration} className="text-2xl" />
              <span className="font-bold">{organism.name}</span>
              {showLevels && <span className="text-xs text-ink-muted">{FEEDING_CATEGORY_LABELS[position.position]}</span>}
            </span>
            {index < positions.length - 1 && <ArrowRight aria-label="is eaten by" className="size-5 text-forest-500" />}
          </li>
        );
      })}
    </ol>
  );
}

const WEB_NODES: Record<string, { x: number; y: number }> = {
  eagle: { x: 290, y: 45 },
  snake: { x: 150, y: 110 },
  frog: { x: 60, y: 185 },
  grasshopper: { x: 60, y: 275 },
  mouse: { x: 200, y: 235 },
  rabbit: { x: 330, y: 235 },
  grass: { x: 200, y: 335 },
};
const NODE_RADIUS = 26;

function FoodWebDiagram() {
  const ids = Object.keys(WEB_NODES);
  const edges = ids.flatMap((consumer) => ids.filter((food) => FOOD_WEB.eats(consumer, food)).map((food) => ({ food, consumer })));
  return (
    <figure>
      <svg viewBox="0 0 400 380" className="mx-auto h-auto w-full max-w-md" role="img" aria-labelledby="web-title">
        <title id="web-title">
          Grassland food web. Grass is eaten by grasshoppers, mice and rabbits. Grasshoppers are eaten by frogs. Frogs and mice are
          eaten by snakes. Snakes, mice and rabbits are eaten by eagles.
        </title>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-forest-500)" />
          </marker>
        </defs>
        {edges.map(({ food, consumer }) => {
          const from = WEB_NODES[food]!;
          const to = WEB_NODES[consumer]!;
          const length = Math.hypot(to.x - from.x, to.y - from.y);
          const ux = (to.x - from.x) / length;
          const uy = (to.y - from.y) / length;
          return (
            <line
              key={`${food}-${consumer}`}
              x1={from.x + ux * NODE_RADIUS}
              y1={from.y + uy * NODE_RADIUS}
              x2={to.x - ux * (NODE_RADIUS + 4)}
              y2={to.y - uy * (NODE_RADIUS + 4)}
              stroke="var(--color-forest-500)"
              strokeWidth={2.5}
              markerEnd="url(#arrow)"
            />
          );
        })}
        {ids.map((id) => {
          const { x, y } = WEB_NODES[id]!;
          const organism = getOrganism(id);
          return (
            <g key={id}>
              <circle cx={x} cy={y} r={NODE_RADIUS} fill="white" stroke="var(--color-forest-100)" strokeWidth={2} />
              <text x={x} y={y + 8} textAnchor="middle" fontSize="24" aria-hidden>
                {organism.illustration.kind === "emoji" ? organism.illustration.value : ""}
              </text>
              <text x={x} y={y + NODE_RADIUS + 14} textAnchor="middle" className="fill-ink text-[12px] font-bold">
                {organism.name}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-center text-sm text-ink-muted">Each arrow points from the food to the eater.</figcaption>
    </figure>
  );
}

function PyramidTypes() {
  const pyramids = [
    { title: "Pyramid of numbers", note: "Example: 1 tree → 5,000 insects → 50 birds. It can be upside down!", widths: ["30%", "100%", "55%"] },
    { title: "Pyramid of biomass", note: "Total mass of living things at each level. Usually upright.", widths: ["100%", "55%", "25%"] },
    { title: "Pyramid of energy", note: "Energy at each level. Always upright.", widths: ["100%", "45%", "15%"] },
  ];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {pyramids.map((pyramid) => (
        <div key={pyramid.title} className="rounded-2xl bg-forest-50 p-4">
          <p className="font-extrabold text-forest-900">{pyramid.title}</p>
          <div className="my-3 flex flex-col-reverse items-center gap-1" aria-hidden>
            {pyramid.widths.map((width, index) => (
              <div key={index} className="h-5 rounded bg-leaf-500" style={{ width, opacity: 1 - index * 0.2 }} />
            ))}
          </div>
          <p className="text-sm text-ink-muted">{pyramid.note}</p>
        </div>
      ))}
    </div>
  );
}
