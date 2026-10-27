"use client";

import { CloudOff, DownloadCloud, Wifi, WifiOff } from "lucide-react";
import { useIsOnline, useServiceWorker } from "@/hooks/use-offline-status";

const READINESS_LABEL = {
  ready: { text: "Saved for offline use", Icon: DownloadCloud },
  installing: { text: "Saving for offline use…", Icon: DownloadCloud },
  unsupported: { text: "Offline mode not available here", Icon: CloudOff },
  error: { text: "Offline mode could not be set up", Icon: CloudOff },
} as const;

export function ConnectionStatus() {
  const isOnline = useIsOnline();
  const { readiness, updateAvailable, applyUpdate } = useServiceWorker();
  const readinessLabel = READINESS_LABEL[readiness];

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm" role="status" aria-live="polite">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
          isOnline ? "bg-forest-100 text-forest-900" : "bg-earth-100 text-earth-700"
        }`}
      >
        {isOnline ? <Wifi aria-hidden className="size-4" /> : <WifiOff aria-hidden className="size-4" />}
        {isOnline ? "Online" : "Offline"}
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-ink-muted">
        <readinessLabel.Icon aria-hidden className="size-4" />
        {readinessLabel.text}
      </span>
      {updateAvailable && (
        <button
          type="button"
          onClick={applyUpdate}
          className="min-h-11 rounded-full bg-sun-400 px-4 font-bold text-ink shadow-sm hover:brightness-95"
        >
          New version ready. Update now
        </button>
      )}
    </div>
  );
}
