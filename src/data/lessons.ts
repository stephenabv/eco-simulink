import { LESSON_IDS } from "./modules";

/**
 * Draft lesson content written for Grade 7 learners, pending researcher
 * review against the approved learning competencies and references.
 */

export type LessonVisual =
  | "living-nonliving"
  | "ecosystem-examples"
  | "roles"
  | "consumer-levels"
  | "food-chain"
  | "food-web"
  | "energy-pyramid"
  | "pyramid-types";

export interface LessonSection {
  readonly heading: string;
  readonly paragraphs: readonly string[];
  readonly visual?: LessonVisual;
}

export interface Lesson {
  readonly id: (typeof LESSON_IDS)[number];
  readonly number: number;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly LessonSection[];
  readonly keyPoints: readonly string[];
  /** A practice activity or module that applies this lesson. */
  readonly practice?: { readonly label: string; readonly href: string };
}

export const LESSONS: readonly Lesson[] = [
  {
    id: "understanding-ecosystems",
    number: 1,
    title: "Understanding Ecosystems",
    summary: "What an ecosystem is, and the living and nonliving things in it.",
    sections: [
      {
        heading: "What is an ecosystem?",
        paragraphs: [
          "An ecosystem is a community of living things interacting with each other and with the nonliving things around them in one place.",
          "A pond, a forest, a rice field and even a rotting log can each be an ecosystem.",
        ],
      },
      {
        heading: "Living and nonliving parts",
        paragraphs: [
          "The living parts of an ecosystem are called biotic factors: plants, animals, fungi and bacteria.",
          "The nonliving parts are called abiotic factors: sunlight, water, air, soil, temperature and minerals.",
          "Living things depend on nonliving things. Plants need sunlight, water and soil to grow, and animals need air and water.",
        ],
        visual: "living-nonliving",
      },
      {
        heading: "Ecosystems on land and in water",
        paragraphs: [
          "Terrestrial ecosystems are on land, like forests, grasslands and deserts.",
          "Aquatic ecosystems are in water. Freshwater ecosystems include ponds, lakes and rivers. Marine ecosystems include oceans and coral reefs.",
        ],
        visual: "ecosystem-examples",
      },
    ],
    keyPoints: [
      "An ecosystem includes living (biotic) and nonliving (abiotic) parts that interact.",
      "Ecosystems can be terrestrial (on land) or aquatic (in water).",
    ],
  },
  {
    id: "producers-consumers-decomposers",
    number: 2,
    title: "Producers, Consumers and Decomposers",
    summary: "The three roles organisms play in getting and passing on energy.",
    sections: [
      {
        heading: "Producers make their own food",
        paragraphs: [
          "Producers, like plants and algae, make their own food through photosynthesis. They use energy from sunlight, carbon dioxide and water to make sugar.",
          "Producers are also called autotrophs, which means self-feeders.",
        ],
      },
      {
        heading: "Consumers eat other organisms",
        paragraphs: [
          "Consumers cannot make their own food, so they get energy by eating other organisms. They are also called heterotrophs.",
          "Herbivores eat plants, carnivores eat animals, and omnivores eat both plants and animals.",
        ],
        visual: "roles",
      },
      {
        heading: "Levels of consumers",
        paragraphs: [
          "Primary consumers eat producers. Secondary consumers eat primary consumers. Tertiary consumers eat secondary consumers.",
          "The same animal can be a different kind of consumer in different food chains, depending on what it eats.",
        ],
        visual: "consumer-levels",
      },
      {
        heading: "Decomposers recycle",
        paragraphs: [
          "Decomposers, like bacteria and fungi, break down dead plants, dead animals and wastes.",
          "They return nutrients to the soil and water so producers can use them again. Without decomposers, dead matter would pile up and plants would run out of nutrients.",
        ],
      },
    ],
    keyPoints: [
      "Producers make their own food using sunlight.",
      "Consumers get energy by eating other organisms: primary, secondary and tertiary consumers.",
      "Decomposers break down dead matter and recycle nutrients.",
    ],
    practice: { label: "Practise: Classify Organisms", href: "/activities/classify/" },
  },
  {
    id: "food-chains-and-webs",
    number: 3,
    title: "Food Chains and Food Webs",
    summary: "How organisms depend on each other for food and energy.",
    sections: [
      {
        heading: "Food chains",
        paragraphs: [
          "A food chain shows one path that energy takes as one organism eats another.",
          "Every food chain starts with a producer, because producers capture the Sun's energy.",
        ],
        visual: "food-chain",
      },
      {
        heading: "What do the arrows mean?",
        paragraphs: [
          "The arrows point from the organism that is eaten to the organism that eats it. They show the direction energy moves.",
          "So “grass → grasshopper” means energy moves from the grass to the grasshopper when the grasshopper eats the grass.",
        ],
      },
      {
        heading: "Food webs",
        paragraphs: [
          "Most animals eat more than one kind of food, and are eaten by more than one kind of animal. Many food chains connect to form a food web.",
          "A food web shows that organisms depend on each other. If one population changes, many others can be affected.",
        ],
        visual: "food-web",
      },
    ],
    keyPoints: [
      "A food chain is one path of energy; a food web is many connected food chains.",
      "Arrows point in the direction energy flows: from the eaten to the eater.",
      "Food chains begin with producers.",
    ],
    practice: { label: "Practise: Build a Food Chain", href: "/activities/food-chain/" },
  },
  {
    id: "energy-flow",
    number: 4,
    title: "Energy Flow",
    summary: "Why energy decreases as it moves up the food chain.",
    sections: [
      {
        heading: "Energy enters from the Sun",
        paragraphs: [
          "In most ecosystems, energy enters as sunlight. Producers capture it and store it in the food they make.",
          "When a consumer eats, it takes in some of that stored energy.",
        ],
      },
      {
        heading: "Trophic levels",
        paragraphs: [
          "Each step in a food chain is a trophic level. Producers are the first trophic level, primary consumers the second, secondary consumers the third, and so on.",
        ],
      },
      {
        heading: "The 10% rule",
        paragraphs: [
          "Organisms use most of the energy they take in to live: to move, breathe, grow and keep warm. Much of it is lost as heat.",
          "Only a small part, about 10%, is stored in their bodies and can pass to the next trophic level. This is called the 10% rule.",
          "The 10% rule is a simplified model. In real ecosystems, the amount passed on is usually between about 5% and 20%.",
        ],
        visual: "energy-pyramid",
      },
      {
        heading: "Why are there fewer top predators?",
        paragraphs: [
          "Because energy decreases at every level, there is much less energy available at the top. That is why there are usually fewer top predators than plants, and why food chains rarely have more than four or five levels.",
        ],
      },
    ],
    keyPoints: [
      "Energy flows in one direction: from the Sun to producers to consumers.",
      "At each trophic level, most energy is used or lost as heat; only about 10% passes on.",
      "Less energy at higher levels means fewer organisms there.",
    ],
    practice: { label: "Explore: Energy Pyramid", href: "/pyramid/" },
  },
  {
    id: "ecological-pyramids",
    number: 5,
    title: "Ecological Pyramids",
    summary: "Three ways to picture the trophic levels of an ecosystem.",
    sections: [
      {
        heading: "What is an ecological pyramid?",
        paragraphs: [
          "An ecological pyramid is a diagram that shows the trophic levels of an ecosystem stacked on top of each other, with producers at the bottom.",
          "Decomposers are not part of the pyramid. They work at every level, breaking down dead organisms.",
        ],
      },
      {
        heading: "Three kinds of pyramids",
        paragraphs: [
          "A pyramid of numbers shows how many organisms are at each level.",
          "A pyramid of biomass shows the total mass of living material at each level.",
          "A pyramid of energy shows how much energy is available at each level.",
        ],
        visual: "pyramid-types",
      },
      {
        heading: "Not every pyramid is upright",
        paragraphs: [
          "A pyramid of numbers can be upside down. For example, one large tree can feed thousands of insects.",
          "A pyramid of energy is always upright, because energy is always lost from one level to the next.",
        ],
      },
    ],
    keyPoints: [
      "Ecological pyramids show trophic levels with producers at the base.",
      "There are pyramids of numbers, biomass and energy.",
      "Only the pyramid of energy is always upright.",
    ],
    practice: { label: "Practise: Organise the Food Pyramid", href: "/activities/pyramid/" },
  },
];

export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id);
}
