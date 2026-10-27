import { CheckCircle2, CircleDashed, XCircle } from "lucide-react";
import type { PlacementStatus } from "@/lib/activities/evaluation";

const STATUS = {
  correct: { text: "Correct", Icon: CheckCircle2, className: "text-forest-700" },
  incorrect: { text: "Not quite", Icon: XCircle, className: "text-danger-600" },
  missing: { text: "Not placed", Icon: CircleDashed, className: "text-earth-700" },
} as const;

/** Correctness is always conveyed by icon and text, never colour alone. */
export function StatusLabel({ status, compact = false }: { status: PlacementStatus; compact?: boolean }) {
  const { text, Icon, className } = STATUS[status];
  return (
    <span className={`inline-flex items-center gap-1 text-sm font-bold ${className}`}>
      <Icon aria-hidden className="size-4 shrink-0" />
      <span className={compact ? "sr-only" : undefined}>{text}</span>
    </span>
  );
}
