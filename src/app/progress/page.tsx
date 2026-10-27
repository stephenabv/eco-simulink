import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { ProgressReport } from "@/components/progress/progress-report";

export const metadata: Metadata = { title: "My Progress" };

export default function ProgressPage() {
  return (
    <div>
      <PageHeader title="My Progress" intro="See what you have finished and how you did." backHref="/" backLabel="Dashboard" />
      <ProgressReport />
    </div>
  );
}
