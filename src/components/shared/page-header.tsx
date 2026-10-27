import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  intro,
  backHref,
  backLabel = "Back",
  eyebrow,
}: {
  title: string;
  intro?: ReactNode;
  backHref?: string;
  backLabel?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-6">
      {backHref && (
        <Link href={backHref} className="mb-3 inline-flex min-h-11 items-center gap-1 font-semibold text-forest-700 hover:underline">
          <ArrowLeft aria-hidden className="size-4" />
          {backLabel}
        </Link>
      )}
      {eyebrow && <p className="text-sm font-bold uppercase tracking-wide text-earth-700">{eyebrow}</p>}
      <h1 className="text-3xl font-extrabold text-forest-900 sm:text-4xl">{title}</h1>
      {intro && <div className="mt-2 max-w-3xl text-lg text-ink-muted">{intro}</div>}
    </div>
  );
}
