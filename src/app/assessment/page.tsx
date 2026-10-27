import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { QuizRunner } from "@/components/assessment/quiz-runner";
import { QUIZ_LENGTH } from "@/data/questions";

export const metadata: Metadata = { title: "Quiz" };

export default function AssessmentPage() {
  return (
    <div>
      <PageHeader
        title="Quiz"
        intro={`Answer ${QUIZ_LENGTH} questions about ecosystems and energy flow. You will see if you are right after each one.`}
        backHref="/"
        backLabel="Dashboard"
      />
      <QuizRunner />
    </div>
  );
}
