import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ACTIVITIES } from "@/data/activities";
import { PageHeader } from "@/components/shared/page-header";

export const metadata: Metadata = { title: "Activities" };

export default function ActivitiesPage() {
  return (
    <div>
      <PageHeader title="Build and Sort" intro="Practise what you learned. You can try each activity as many times as you like." backHref="/" backLabel="Dashboard" />
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ACTIVITIES.map((activity) => (
          <li key={activity.id}>
            <Link href={`/activities/${activity.slug}/`} className="flex h-full flex-col rounded-3xl border border-forest-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <h2 className="text-xl font-extrabold text-forest-900">{activity.title}</h2>
              <p className="mt-1 flex-1 text-ink-muted">{activity.summary}</p>
              <span className="mt-4 inline-flex items-center gap-1 font-bold text-forest-700">Start <ArrowRight aria-hidden className="size-4" /></span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
