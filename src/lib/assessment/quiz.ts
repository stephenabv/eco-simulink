import { shuffle, type RandomSource } from "@/lib/random";

interface QuestionBase {
  readonly id: string;
  readonly prompt: string;
  /** Shown after answering, whether the answer was right or wrong. */
  readonly explanation: string;
  /** Optional link back to the lesson that teaches this, for review. */
  readonly lessonId?: string;
}

export interface MultipleChoiceQuestion extends QuestionBase {
  readonly type: "multiple-choice";
  readonly choices: readonly { readonly id: string; readonly text: string }[];
  readonly correctChoiceId: string;
}

export interface TrueFalseQuestion extends QuestionBase {
  readonly type: "true-false";
  readonly answer: boolean;
}

export interface IdentificationQuestion extends QuestionBase {
  readonly type: "identification";
  /** Accepted spellings; compared case- and spacing-insensitively. */
  readonly acceptedAnswers: readonly string[];
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | IdentificationQuestion;

export type QuestionResponse =
  | { readonly type: "multiple-choice"; readonly choiceId: string }
  | { readonly type: "true-false"; readonly value: boolean }
  | { readonly type: "identification"; readonly text: string };

export interface GradedResponse {
  readonly questionId: string;
  readonly isCorrect: boolean;
  readonly explanation: string;
  /** Human-readable correct answer for feedback. */
  readonly correctAnswer: string;
}

export interface QuizSummary {
  readonly total: number;
  readonly answered: number;
  readonly correct: number;
  readonly scorePercent: number;
  readonly incorrectQuestionIds: readonly string[];
}

/** Lower-cases, trims, collapses internal whitespace and strips trailing punctuation. */
export function normalizeAnswer(text: string): string {
  return text.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ").replace(/[.!?]+$/, "");
}

export function validateQuestion(question: Question): void {
  switch (question.type) {
    case "multiple-choice": {
      const ids = question.choices.map((choice) => choice.id);
      if (ids.length < 2) throw new Error(`${question.id}: needs at least two choices`);
      if (new Set(ids).size !== ids.length) throw new Error(`${question.id}: duplicate choice ids`);
      if (!ids.includes(question.correctChoiceId)) throw new Error(`${question.id}: correct choice is not listed`);
      break;
    }
    case "identification":
      if (question.acceptedAnswers.every((answer) => normalizeAnswer(answer) === "")) {
        throw new Error(`${question.id}: needs at least one accepted answer`);
      }
      break;
    case "true-false":
      break;
  }
}

function correctAnswerText(question: Question): string {
  switch (question.type) {
    case "multiple-choice":
      return question.choices.find((choice) => choice.id === question.correctChoiceId)?.text ?? "";
    case "true-false":
      return question.answer ? "True" : "False";
    case "identification":
      return question.acceptedAnswers[0] ?? "";
  }
}

function isCorrectResponse(question: Question, response: QuestionResponse): boolean {
  if (question.type === "multiple-choice" && response.type === "multiple-choice") {
    return response.choiceId === question.correctChoiceId;
  }
  if (question.type === "true-false" && response.type === "true-false") {
    return response.value === question.answer;
  }
  if (question.type === "identification" && response.type === "identification") {
    const given = normalizeAnswer(response.text);
    return given !== "" && question.acceptedAnswers.some((answer) => normalizeAnswer(answer) === given);
  }
  throw new TypeError(`Response type ${response.type} does not match question ${question.id}`);
}

export function gradeResponse(question: Question, response: QuestionResponse): GradedResponse {
  return {
    questionId: question.id,
    isCorrect: isCorrectResponse(question, response),
    explanation: question.explanation,
    correctAnswer: correctAnswerText(question),
  };
}

/**
 * One attempt at a quiz: fixed (shuffled) question order, each question
 * answered once, with immediate feedback. Immutable; every answer returns a
 * new session.
 */
export class QuizSession {
  private constructor(
    readonly questions: readonly Question[],
    private readonly graded: ReadonlyMap<string, GradedResponse>,
  ) {}

  static start(bank: readonly Question[], options: { random?: RandomSource; shuffleChoices?: boolean } = {}): QuizSession {
    if (bank.length === 0) throw new RangeError("Question bank is empty");
    bank.forEach(validateQuestion);
    if (new Set(bank.map((question) => question.id)).size !== bank.length) throw new Error("Duplicate question ids");
    const random = options.random ?? Math.random;
    const ordered = shuffle(bank, random).map((question) =>
      question.type === "multiple-choice" && options.shuffleChoices !== false
        ? { ...question, choices: shuffle(question.choices, random) }
        : question,
    );
    return new QuizSession(ordered, new Map());
  }

  answer(questionId: string, response: QuestionResponse): { session: QuizSession; result: GradedResponse } {
    const question = this.questions.find((candidate) => candidate.id === questionId);
    if (!question) throw new RangeError(`Unknown question: ${questionId}`);
    if (this.graded.has(questionId)) throw new Error(`Question ${questionId} was already answered`);
    const result = gradeResponse(question, response);
    const graded = new Map(this.graded);
    graded.set(questionId, result);
    return { session: new QuizSession(this.questions, graded), result };
  }

  resultFor(questionId: string): GradedResponse | undefined {
    return this.graded.get(questionId);
  }

  get isFinished(): boolean {
    return this.graded.size === this.questions.length;
  }

  get summary(): QuizSummary {
    const results = [...this.graded.values()];
    const correct = results.filter((result) => result.isCorrect).length;
    return {
      total: this.questions.length,
      answered: results.length,
      correct,
      scorePercent: Math.round((correct / this.questions.length) * 100),
      incorrectQuestionIds: results.filter((result) => !result.isCorrect).map((result) => result.questionId),
    };
  }
}
