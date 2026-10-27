"use client";

import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { QUESTION_BANK, QUIZ_LENGTH } from "@/data/questions";
import { QUIZ_IDS } from "@/data/modules";
import { LESSONS } from "@/data/lessons";
import { useClientSeed } from "@/hooks/use-client-seed";
import { QuizSession, type GradedResponse, type Question, type QuestionResponse } from "@/lib/assessment/quiz";
import { progressService } from "@/lib/progress/progress-service";
import { seededRandom, shuffle } from "@/lib/random";
import { SCORING_RULES } from "@/lib/progress/summary";
import { ActivityLoading } from "@/components/activities/activity-loading";
import { Button, ButtonLink } from "@/components/shared/button";

const QUIZ_ID = QUIZ_IDS[0];

export function QuizRunner() {
  const seed = useClientSeed();
  const [attempt, setAttempt] = useState(0);
  if (seed === null) return <ActivityLoading />;
  return <QuizAttempt key={attempt} seed={seed + attempt} onRetry={() => setAttempt((current) => current + 1)} />;
}

function QuizAttempt({ seed, onRetry }: { seed: number; onRetry: () => void }) {
  const initial = useMemo(() => {
    const random = seededRandom(seed);
    return QuizSession.start(shuffle(QUESTION_BANK, random).slice(0, QUIZ_LENGTH), { random });
  }, [seed]);
  const [session, setSession] = useState(initial);
  const [index, setIndex] = useState(0);
  const [saveError, setSaveError] = useState(false);
  const [startedAt] = useState(() => Date.now());

  const question = session.questions[index];
  const result = question ? session.resultFor(question.id) : undefined;
  const isLast = index === session.questions.length - 1;
  const showSummary = session.isFinished && index >= session.questions.length;

  const submit = (response: QuestionResponse) => {
    if (!question) return;
    const { session: next } = session.answer(question.id, response);
    setSession(next);
    if (next.isFinished) {
      const { correct, total } = next.summary;
      progressService
        .recordAttempt("quiz", QUIZ_ID, { correct, total, durationMs: Date.now() - startedAt })
        .catch((error: unknown) => {
          console.error("Could not save quiz result.", error);
          setSaveError(true);
        });
    }
  };

  if (showSummary) {
    return <QuizSummaryView session={session} onRetry={onRetry} saveError={saveError} />;
  }
  if (!question) return null;

  return (
    <section aria-labelledby="question-heading" className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-2 text-sm font-bold text-ink-muted">
        <span>
          Question {index + 1} of {session.questions.length}
        </span>
        <span>Score so far: {session.summary.correct}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-forest-50" aria-hidden>
        <div className="h-full bg-forest-500 transition-[width]" style={{ width: `${(index / session.questions.length) * 100}%` }} />
      </div>
      <h2 id="question-heading" className="mt-4 text-xl font-extrabold text-forest-900 sm:text-2xl">
        {question.prompt}
      </h2>
      <QuestionInput key={question.id} question={question} answered={result} onSubmit={submit} />
      {result && (
        <div className="mt-4 space-y-3">
          <Feedback result={result} />
          <Button onClick={() => setIndex((current) => current + 1)}>
            {isLast ? "See my results" : "Next question"} <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      )}
    </section>
  );
}

function QuestionInput({
  question,
  answered,
  onSubmit,
}: {
  question: Question;
  answered: GradedResponse | undefined;
  onSubmit: (response: QuestionResponse) => void;
}) {
  const [choice, setChoice] = useState<string>("");
  const [text, setText] = useState("");
  const locked = answered !== undefined;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (locked) return;
    if (question.type === "multiple-choice" && choice) onSubmit({ type: "multiple-choice", choiceId: choice });
    if (question.type === "true-false" && choice) onSubmit({ type: "true-false", value: choice === "true" });
    if (question.type === "identification" && text.trim()) onSubmit({ type: "identification", text });
  };

  const options =
    question.type === "multiple-choice"
      ? question.choices.map((c) => ({ value: c.id, label: c.text }))
      : question.type === "true-false"
        ? [
            { value: "true", label: "True" },
            { value: "false", label: "False" },
          ]
        : [];

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {question.type === "identification" ? (
        <div>
          <label htmlFor="answer" className="font-bold">
            Type your answer
          </label>
          <input
            id="answer"
            type="text"
            autoComplete="off"
            maxLength={80}
            value={text}
            disabled={locked}
            onChange={(event) => setText(event.target.value)}
            className="mt-1 min-h-11 w-full rounded-xl border-2 border-forest-100 px-3 text-lg disabled:bg-sand-50"
          />
        </div>
      ) : (
        <fieldset>
          <legend className="sr-only">Choose one answer</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.value}
                className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-2 font-semibold ${
                  choice === option.value ? "border-forest-500 bg-forest-50" : "border-forest-100 bg-white"
                } ${locked ? "cursor-default" : ""}`}
              >
                <input
                  type="radio"
                  name="choice"
                  value={option.value}
                  checked={choice === option.value}
                  disabled={locked}
                  onChange={() => setChoice(option.value)}
                  className="size-5 accent-forest-700"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {!locked && (
        <Button type="submit" className="mt-4" disabled={question.type === "identification" ? !text.trim() : !choice}>
          Check answer
        </Button>
      )}
    </form>
  );
}

function Feedback({ result }: { result: GradedResponse }) {
  return (
    <div
      role="status"
      className={`rounded-2xl p-4 ${result.isCorrect ? "bg-forest-50" : "bg-red-50"}`}
    >
      <p className={`flex items-center gap-2 font-extrabold ${result.isCorrect ? "text-forest-700" : "text-danger-600"}`}>
        {result.isCorrect ? <CheckCircle2 aria-hidden className="size-5" /> : <XCircle aria-hidden className="size-5" />}
        {result.isCorrect ? "Correct!" : `Not quite. The answer is: ${result.correctAnswer}`}
      </p>
      <p className="mt-1">{result.explanation}</p>
    </div>
  );
}

function QuizSummaryView({ session, onRetry, saveError }: { session: QuizSession; onRetry: () => void; saveError: boolean }) {
  const { correct, total, scorePercent, incorrectQuestionIds } = session.summary;
  const passed = scorePercent >= SCORING_RULES.quizPassPercent;
  const missed = session.questions.filter((question) => incorrectQuestionIds.includes(question.id));
  const lessonsToReview = [...new Set(missed.map((question) => question.lessonId).filter(Boolean))]
    .map((id) => LESSONS.find((lesson) => lesson.id === id))
    .filter((lesson) => lesson !== undefined);

  return (
    <section aria-labelledby="summary-heading" className="space-y-4">
      <div className="rounded-3xl bg-forest-700 p-6 text-white">
        <h2 id="summary-heading" className="text-2xl font-extrabold">
          {passed ? "Great work!" : "Good try! Keep learning."}
        </h2>
        <p className="mt-2 text-4xl font-extrabold tabular-nums">
          {correct} / {total} <span className="text-2xl">({scorePercent}%)</span>
        </p>
        {saveError && <p className="mt-2 text-sm">Your score could not be saved on this device.</p>}
      </div>

      {missed.length > 0 && (
        <div className="rounded-3xl bg-white p-5 shadow-sm">
          <h3 className="text-xl font-extrabold text-forest-900">Review what you missed</h3>
          <ul className="mt-3 space-y-3">
            {missed.map((question) => {
              const graded = session.resultFor(question.id)!;
              return (
                <li key={question.id} className="rounded-2xl bg-sand-50 p-3">
                  <p className="font-bold">{question.prompt}</p>
                  <p className="mt-1">
                    Answer: <strong>{graded.correctAnswer}</strong>. {graded.explanation}
                  </p>
                </li>
              );
            })}
          </ul>
          {lessonsToReview.length > 0 && (
            <div className="mt-4">
              <p className="font-bold">Lessons to review:</p>
              <ul className="mt-1 flex flex-wrap gap-2">
                {lessonsToReview.map((lesson) => (
                  <li key={lesson.id}>
                    <Link href={`/lessons/${lesson.id}/`} className="inline-flex min-h-11 items-center font-semibold text-forest-700 underline">
                      Lesson {lesson.number}: {lesson.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={onRetry}>
          <RotateCcw aria-hidden className="size-4" /> Try a new quiz
        </Button>
        <ButtonLink href="/progress/" variant="secondary">
          See my progress
        </ButtonLink>
      </div>
    </section>
  );
}
