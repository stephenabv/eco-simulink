import { ModuleCard } from "@/components/dashboard/module-card";
import { OfflineGuide } from "@/components/dashboard/offline-guide";
import { ProgressOverview } from "@/components/dashboard/progress-overview";
import { LEARNING_MODULES } from "@/data/modules";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="welcome-heading" className="rounded-3xl bg-forest-700 p-6 text-white sm:p-10">
        <h1 id="welcome-heading" className="text-3xl font-extrabold sm:text-4xl">
          Welcome, young ecologist!
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-forest-50">
          Follow the energy from the Sun to the top predator. Read short lessons, build food chains, run your own
          ecosystem experiments, and test what you know.
        </p>
      </section>

      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className="mb-3 text-2xl font-extrabold text-forest-900">
          My progress
        </h2>
        <ProgressOverview />
      </section>

      <section aria-labelledby="modules-heading">
        <h2 id="modules-heading" className="mb-3 text-2xl font-extrabold text-forest-900">
          Learning modules
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {LEARNING_MODULES.map((module) => (
            <li key={module.id}>
              <ModuleCard module={module} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="offline-heading" className="rounded-3xl bg-white p-6 shadow-sm">
        <h2 id="offline-heading" className="mb-3 text-2xl font-extrabold text-forest-900">
          How to use the app without internet
        </h2>
        <OfflineGuide />
      </section>
    </div>
  );
}
