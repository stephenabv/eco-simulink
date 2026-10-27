import type { AttemptRecord } from "@/types/progress";

const COLUMNS = ["kind", "activityId", "completedAt", "correct", "total", "scorePercent", "durationMs"] as const;

function escapeCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  // Neutralise spreadsheet formula injection and quote fields that need it.
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** CSV of attempt records for researchers. Contains no personal information. */
export function attemptsToCsv(attempts: readonly AttemptRecord[]): string {
  const rows = attempts.map((attempt) => COLUMNS.map((column) => escapeCell(attempt[column])).join(","));
  return [COLUMNS.join(","), ...rows].join("\n");
}
