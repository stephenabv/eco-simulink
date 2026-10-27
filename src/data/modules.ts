import type { ProgressCatalog } from "@/lib/progress/summary";

/** Stages of the learning progression from the project brief; each builds on the one before. */
export const LEARNING_STAGES = ["Discover", "Understand", "Explore", "Experiment", "Apply", "Evaluate"] as const;
export type LearningStage = (typeof LEARNING_STAGES)[number];

export type ModuleIcon = "book" | "puzzle" | "flask" | "pyramid" | "quiz" | "chart";

export interface LearningModule {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly stage: LearningStage;
  readonly icon: ModuleIcon;
  /** Route once the module is built; `null` while it is still in development so no dead link is shown. */
  readonly href: string | null;
}

export const LESSON_IDS = [
  "understanding-ecosystems",
  "producers-consumers-decomposers",
  "food-chains-and-webs",
  "energy-flow",
  "ecological-pyramids",
] as const;

export const QUIZ_IDS = ["final-assessment"] as const;

export const PROGRESS_CATALOG: ProgressCatalog = { lessonIds: LESSON_IDS, quizIds: QUIZ_IDS };

export const LEARNING_MODULES: readonly LearningModule[] = [
  {
    id: "lessons",
    title: "Lessons",
    summary: "Ecosystems, producers and consumers, food chains and webs, energy flow, and ecological pyramids.",
    stage: "Understand",
    icon: "book",
    href: "/lessons/",
  },
  {
    id: "activities",
    title: "Build and Sort",
    summary: "Build a food chain, organise a food pyramid, and classify organisms by dragging or tapping.",
    stage: "Explore",
    icon: "puzzle",
    href: "/activities/",
  },
  {
    id: "simulation",
    title: "Ecosystem Lab",
    summary: "Change sunlight and populations, then watch how the whole ecosystem responds.",
    stage: "Experiment",
    icon: "flask",
    href: "/simulation/",
  },
  {
    id: "pyramid",
    title: "Energy Pyramid",
    summary: "See how much energy is left at each trophic level and why the top is so small.",
    stage: "Apply",
    icon: "pyramid",
    href: "/pyramid/",
  },
  {
    id: "assessment",
    title: "Quiz",
    summary: "Check what you have learned with instant feedback and explanations.",
    stage: "Evaluate",
    icon: "quiz",
    href: "/assessment/",
  },
  {
    id: "progress",
    title: "My Progress",
    summary: "See finished lessons, scores, points and badges saved on this device.",
    stage: "Evaluate",
    icon: "chart",
    href: "/progress/",
  },
];
