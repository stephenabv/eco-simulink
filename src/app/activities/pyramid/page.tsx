import type { Metadata } from "next";
import { ActivityPage } from "@/components/activities/activity-page";
import { PyramidActivity } from "@/components/activities/pyramid-activity";

export const metadata: Metadata = { title: "Organise the Food Pyramid" };

export default function Page() {
  return (
    <ActivityPage slug="pyramid">
      <PyramidActivity />
    </ActivityPage>
  );
}
