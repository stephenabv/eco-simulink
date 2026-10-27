import type { ReactNode } from "react";
import { Hand, MousePointerClick, Keyboard } from "lucide-react";
import { getActivity } from "@/data/activities";
import { PageHeader } from "@/components/shared/page-header";

export function ActivityPage({ slug, children }: { slug: string; children: ReactNode }) {
  const activity = getActivity(slug);
  return (
    <div>
      <PageHeader title={activity.title} intro={activity.instructions} backHref="/activities/" backLabel="All activities" />
      <ul className="mb-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted" aria-label="Ways to play">
        <li className="inline-flex items-center gap-1"><Hand aria-hidden className="size-4" /> Drag with finger or mouse</li>
        <li className="inline-flex items-center gap-1"><MousePointerClick aria-hidden className="size-4" /> Or tap a card, then tap a place</li>
        <li className="inline-flex items-center gap-1"><Keyboard aria-hidden className="size-4" /> Or use Tab and Enter</li>
      </ul>
      {children}
    </div>
  );
}
