import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EcosystemLab } from "@/components/simulation/ecosystem-lab";

export const metadata: Metadata = { title: "Ecosystem Lab" };

export default function SimulationPage() {
  return (
    <div>
      <PageHeader
        title="Ecosystem Lab"
        intro="Experiment with a simple ecosystem. Change sunlight or the number of organisms and see how every level is connected."
        backHref="/"
        backLabel="Dashboard"
      />
      <EcosystemLab />
    </div>
  );
}
