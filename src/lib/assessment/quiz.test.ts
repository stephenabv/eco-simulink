import { describe, expect, it } from "vitest";
import { seededRandom } from "@/lib/random";
import { QuizSession, gradeResponse, normalizeAnswer, validateQuestion, type Question } from "./quiz";

const bank: Question[] = [
  {
    id: "q1",
    type: "multiple-choice",
    prompt: "Which organism is a producer?",
    choices: [
      { id: "a", text: "Grass" },
      { id: "b", text: "Frog" },
    ],
    correctChoiceId: "a",
    explanation: "Grass makes its own food through photosynthesis.",
  },
  {
    id: "q2",
    type: "true-false",
    prompt: "Arrows in a food chain point from the eaten to the eater.",
    answer: true,
    explanation: "Arrows show the direction energy moves.",
  },
  {
    id: "q3",
    type: "identification",
    prompt: "What is the main source of energy for most ecosystems?",
    acceptedAnswers: ["the sun", "sun", "sunlight"],
    explanation: "Producers capture energy from sunlight.",
  },
];

describe("grading", () => {
  it("grades each question type", () => {
    expect(gradeResponse(bank[0]!, { type: "multiple-choice", choiceId: "a" }).isCorrect).toBe(true);
    expect(gradeResponse(bank[1]!, { type: "true-false", value: false }).isCorrect).toBe(false);
    expect(gradeResponse(bank[2]!, { type: "identification", text: "  The   SUN. " }).isCorrect).toBe(true);
    expect(gradeResponse(bank[2]!, { type: "identification", text: "" }).isCorrect).toBe(false);
  });

  it("returns the explanation and correct answer for feedback", () => {
    const result = gradeResponse(bank[0]!, { type: "multiple-choice", choiceId: "b" });
    expect(result).toMatchObject({ isCorrect: false, correctAnswer: "Grass", explanation: bank[0]!.explanation });
  });

  it("rejects a response of the wrong type", () => {
    expect(() => gradeResponse(bank[0]!, { type: "true-false", value: true })).toThrow(TypeError);
  });

  it("normalises identification answers", () => {
    expect(normalizeAnswer("  Primary   Consumer!")).toBe("primary consumer");
  });

  it("validates malformed questions", () => {
    expect(() => validateQuestion({ ...(bank[0] as Extract<Question, { type: "multiple-choice" }>), correctChoiceId: "z" })).toThrow();
    expect(() => validateQuestion({ ...(bank[2] as Extract<Question, { type: "identification" }>), acceptedAnswers: [" "] })).toThrow();
  });
});

describe("QuizSession", () => {
  it("shuffles reproducibly and keeps every question", () => {
    const a = QuizSession.start(bank, { random: seededRandom(7) });
    const b = QuizSession.start(bank, { random: seededRandom(7) });
    expect(a.questions.map((q) => q.id)).toEqual(b.questions.map((q) => q.id));
    expect(new Set(a.questions.map((q) => q.id))).toEqual(new Set(["q1", "q2", "q3"]));
  });

  it("scores a full attempt and lists mistakes", () => {
    let session = QuizSession.start(bank, { random: seededRandom(3) });
    session = session.answer("q1", { type: "multiple-choice", choiceId: "a" }).session;
    session = session.answer("q2", { type: "true-false", value: false }).session;
    expect(session.isFinished).toBe(false);
    session = session.answer("q3", { type: "identification", text: "sunlight" }).session;
    expect(session.isFinished).toBe(true);
    expect(session.summary).toEqual({ total: 3, answered: 3, correct: 2, scorePercent: 67, incorrectQuestionIds: ["q2"] });
  });

  it("does not allow answering a question twice", () => {
    const session = QuizSession.start(bank).answer("q2", { type: "true-false", value: true }).session;
    expect(() => session.answer("q2", { type: "true-false", value: false })).toThrow();
  });

  it("rejects empty banks and duplicate ids", () => {
    expect(() => QuizSession.start([])).toThrow(RangeError);
    expect(() => QuizSession.start([bank[1]!, bank[1]!])).toThrow();
  });
});
