import type { Metadata } from "next";
import { ActivityPage } from "@/components/activities/activity-page";
import { FoodChainActivity } from "@/components/activities/food-chain-activity";

export const metadata: Metadata = { title: "Build a Food Chain" };

export default function Page() {
  return (
    <ActivityPage slug="food-chain">
      <FoodChainActivity />
    </ActivityPage>
  );
}
