/**
 * Framework-independent answer checking shared by every drag-and-drop and
 * tap-to-place activity. The UI decides how an answer is entered; these
 * evaluators only decide whether it is right.
 */

export type PlacementStatus = "correct" | "incorrect" | "missing";

export interface PlacementFeedback<TSlot extends string = string> {
  /** The slot (sequence position or category) being checked. */
  readonly slot: TSlot;
  readonly expected: string;
  readonly given: string | null;
  readonly status: PlacementStatus;
}

export interface EvaluationResult<TSlot extends string = string> {
  readonly feedback: readonly PlacementFeedback<TSlot>[];
  readonly correctCount: number;
  readonly total: number;
  /** 0–100, rounded. */
  readonly scorePercent: number;
  readonly isComplete: boolean;
  readonly isPerfect: boolean;
}

function summarize<TSlot extends string>(feedback: PlacementFeedback<TSlot>[]): EvaluationResult<TSlot> {
  const total = feedback.length;
  const correctCount = feedback.filter((item) => item.status === "correct").length;
  return {
    feedback,
    correctCount,
    total,
    scorePercent: total === 0 ? 0 : Math.round((correctCount / total) * 100),
    isComplete: feedback.every((item) => item.status !== "missing"),
    isPerfect: total > 0 && correctCount === total,
  };
}

/**
 * Checks an ordered answer (e.g. a food chain) position by position.
 * `answer[i]` is the item placed in slot `i`, or `null` if the slot is empty.
 */
export function evaluateSequence(
  expected: readonly string[],
  answer: readonly (string | null)[],
): EvaluationResult<`${number}`> {
  if (answer.length !== expected.length) {
    throw new RangeError(`Expected ${expected.length} slots, received ${answer.length}`);
  }
  return summarize(
    expected.map((item, index) => {
      const given = answer[index] ?? null;
      return {
        slot: `${index}` as const,
        expected: item,
        given,
        status: given === null ? "missing" : given === item ? "correct" : "incorrect",
      };
    }),
  );
}

/**
 * Checks a categorisation answer (pyramid levels, organism classification).
 * Feedback is reported per item: `slot` is the item id, `expected`/`given` are categories.
 */
export function evaluateCategorization<TCategory extends string>(
  expected: Readonly<Record<string, TCategory>>,
  answer: Readonly<Record<string, TCategory | undefined>>,
): EvaluationResult {
  const unknown = Object.keys(answer).filter((item) => !(item in expected));
  if (unknown.length > 0) throw new RangeError(`Answer contains unknown items: ${unknown.join(", ")}`);

  return summarize(
    Object.entries(expected).map(([item, category]) => {
      const given = answer[item] ?? null;
      return {
        slot: item,
        expected: category,
        given,
        status: given === null ? "missing" : given === category ? "correct" : "incorrect",
      };
    }),
  );
}
