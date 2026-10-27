import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EnergyExplorer } from "@/components/simulation/energy-explorer";

export const metadata: Metadata = { title: "Energy Pyramid" };

export default function PyramidPage() {
  return (
    <div>
      <PageHeader
        title="Energy Pyramid"
        intro="Follow the energy up a food chain and see how much is left at each trophic level."
        backHref="/"
        backLabel="Dashboard"
      />
      <EnergyExplorer />
    </div>
  );
}
