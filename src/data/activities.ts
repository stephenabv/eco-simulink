export interface ActivityInfo {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly instructions: string;
}

/** Activity ids match the ids stored with each attempt. */
export const ACTIVITIES: readonly ActivityInfo[] = [
  {
    id: "build-food-chain",
    slug: "food-chain",
    title: "Build a Food Chain",
    summary: "Put organisms in order to show how energy moves from the Sun.",
    instructions:
      "Drag each card to the right step, starting with the organism that gets energy from the Sun. You can also tap a card, then tap a step.",
  },
  {
    id: "organise-food-pyramid",
    slug: "pyramid",
    title: "Organise the Food Pyramid",
    summary: "Place each organism on its trophic level.",
    instructions:
      "Producers go at the wide bottom and the top consumer at the narrow top. Decomposers go beside the pyramid. Drag, or tap a card and then a level.",
  },
  {
    id: "classify-organisms",
    slug: "classify",
    title: "Classify Organisms",
    summary: "Sort organisms into producers, consumers and decomposers.",
    instructions:
      "Each card tells you which food chain to think about, because an animal's level can change from chain to chain. Drag or tap to sort.",
  },
];

export function getActivity(slug: string): ActivityInfo {
  const activity = ACTIVITIES.find((candidate) => candidate.slug === slug);
  if (!activity) throw new RangeError(`Unknown activity: ${slug}`);
  return activity;
}
