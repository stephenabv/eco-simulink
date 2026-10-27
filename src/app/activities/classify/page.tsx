import type { Metadata } from "next";
import { ActivityPage } from "@/components/activities/activity-page";
import { ClassifyActivity } from "@/components/activities/classify-activity";

export const metadata: Metadata = { title: "Classify Organisms" };

export default function Page() {
  return (
    <ActivityPage slug="classify">
      <ClassifyActivity />
    </ActivityPage>
  );
}
