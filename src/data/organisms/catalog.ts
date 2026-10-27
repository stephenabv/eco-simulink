import type { Ecosystem, FeedingRelation, FoodChain, Organism } from "@/types/ecology";

/**
 * Draft content pending researcher review. Organism selection and wording
 * should be replaced or confirmed against the approved learning competencies
 * and the researchers' brief. Emoji illustrations are placeholders for the
 * researchers' artwork.
 */

export const ECOSYSTEMS: readonly Ecosystem[] = [
  {
    id: "grassland",
    name: "Grassland",
    kind: "terrestrial",
    description: "An open land ecosystem covered mostly by grasses and small plants.",
  },
  {
    id: "pond",
    name: "Pond",
    kind: "aquatic",
    description: "A small freshwater ecosystem where tiny floating organisms feed larger animals.",
  },
];

export const ORGANISMS: readonly Organism[] = [
  {
    id: "grass",
    name: "Grass",
    role: "producer",
    diet: "autotroph",
    ecosystems: ["grassland"],
    description: "Makes its own food from sunlight, water and carbon dioxide through photosynthesis.",
    illustration: { kind: "emoji", value: "🌿" },
  },
  {
    id: "grasshopper",
    name: "Grasshopper",
    role: "consumer",
    diet: "herbivore",
    ecosystems: ["grassland"],
    description: "An insect that eats grass leaves.",
    illustration: { kind: "emoji", value: "🦗" },
  },
  {
    id: "mouse",
    name: "Field mouse",
    role: "consumer",
    diet: "herbivore",
    ecosystems: ["grassland"],
    description: "A small mammal that eats seeds and grass.",
    illustration: { kind: "emoji", value: "🐁" },
  },
  {
    id: "rabbit",
    name: "Rabbit",
    role: "consumer",
    diet: "herbivore",
    ecosystems: ["grassland"],
    description: "A mammal that eats grass and leafy plants.",
    illustration: { kind: "emoji", value: "🐇" },
  },
  {
    id: "frog",
    name: "Frog",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["grassland", "pond"],
    description: "Catches insects with its sticky tongue.",
    illustration: { kind: "emoji", value: "🐸" },
  },
  {
    id: "snake",
    name: "Snake",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["grassland"],
    description: "Hunts frogs and mice.",
    illustration: { kind: "emoji", value: "🐍" },
  },
  {
    id: "eagle",
    name: "Eagle",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["grassland"],
    description: "A top predator that hunts snakes, mice and rabbits.",
    illustration: { kind: "emoji", value: "🦅" },
  },
  {
    id: "phytoplankton",
    name: "Phytoplankton",
    role: "producer",
    diet: "autotroph",
    ecosystems: ["pond"],
    description: "Tiny floating algae that make food through photosynthesis.",
    illustration: { kind: "emoji", value: "🟢" },
  },
  {
    id: "zooplankton",
    name: "Zooplankton",
    role: "consumer",
    diet: "herbivore",
    ecosystems: ["pond"],
    description: "Tiny floating animals that eat phytoplankton.",
    illustration: { kind: "emoji", value: "🦐" },
  },
  {
    id: "small-fish",
    name: "Small fish",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["pond"],
    description: "Eats zooplankton.",
    illustration: { kind: "emoji", value: "🐟" },
  },
  {
    id: "large-fish",
    name: "Large fish",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["pond"],
    description: "Eats smaller fish.",
    illustration: { kind: "emoji", value: "🐠" },
  },
  {
    id: "heron",
    name: "Heron",
    role: "consumer",
    diet: "carnivore",
    ecosystems: ["pond"],
    description: "A wading bird that catches fish and frogs.",
    illustration: { kind: "emoji", value: "🪶" },
  },
  {
    id: "mushroom",
    name: "Mushroom",
    role: "decomposer",
    diet: "saprotroph",
    ecosystems: ["grassland"],
    description: "A fungus that breaks down dead plants and animals.",
    illustration: { kind: "emoji", value: "🍄" },
  },
  {
    id: "bacteria",
    name: "Bacteria",
    role: "decomposer",
    diet: "saprotroph",
    ecosystems: ["grassland", "pond"],
    description: "Microscopic organisms that break down dead matter and return nutrients to the soil and water.",
    illustration: { kind: "emoji", value: "🦠" },
  },
  {
    id: "earthworm",
    name: "Earthworm",
    role: "decomposer",
    diet: "detritivore",
    ecosystems: ["grassland"],
    description: "Eats dead leaves and helps break them down into soil.",
    illustration: { kind: "emoji", value: "🪱" },
  },
];

export const FEEDING_RELATIONS: readonly FeedingRelation[] = [
  { food: "grass", consumer: "grasshopper" },
  { food: "grass", consumer: "mouse" },
  { food: "grass", consumer: "rabbit" },
  { food: "grasshopper", consumer: "frog" },
  { food: "frog", consumer: "snake" },
  { food: "mouse", consumer: "snake" },
  { food: "snake", consumer: "eagle" },
  { food: "mouse", consumer: "eagle" },
  { food: "rabbit", consumer: "eagle" },
  { food: "phytoplankton", consumer: "zooplankton" },
  { food: "zooplankton", consumer: "small-fish" },
  { food: "small-fish", consumer: "large-fish" },
  { food: "small-fish", consumer: "heron" },
  { food: "large-fish", consumer: "heron" },
  { food: "frog", consumer: "heron" },
];

export const FOOD_CHAINS: readonly FoodChain[] = [
  { id: "grassland-long", ecosystem: "grassland", sequence: ["grass", "grasshopper", "frog", "snake", "eagle"] },
  { id: "grassland-mouse", ecosystem: "grassland", sequence: ["grass", "mouse", "snake", "eagle"] },
  { id: "grassland-short", ecosystem: "grassland", sequence: ["grass", "rabbit", "eagle"] },
  { id: "pond-long", ecosystem: "pond", sequence: ["phytoplankton", "zooplankton", "small-fish", "large-fish", "heron"] },
  { id: "pond-short", ecosystem: "pond", sequence: ["phytoplankton", "zooplankton", "small-fish", "heron"] },
];
