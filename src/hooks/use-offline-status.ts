"use client";

import { useEffect, useSyncExternalStore } from "react";
import { serviceWorkerController, type ServiceWorkerStatus } from "@/lib/offline/service-worker-client";

function subscribeToConnectivity(listener: () => void): () => void {
  window.addEventListener("online", listener);
  window.addEventListener("offline", listener);
  return () => {
    window.removeEventListener("online", listener);
    window.removeEventListener("offline", listener);
  };
}

/** `navigator.onLine` only knows whether the device has a network, not whether the internet is reachable; fine for a hint. */
export function useIsOnline(): boolean {
  return useSyncExternalStore(
    subscribeToConnectivity,
    () => navigator.onLine,
    () => true,
  );
}

export function useServiceWorker(): ServiceWorkerStatus & { applyUpdate: () => void } {
  useEffect(() => serviceWorkerController.start(), []);
  const status = useSyncExternalStore(
    serviceWorkerController.subscribe,
    serviceWorkerController.getSnapshot,
    serviceWorkerController.getServerSnapshot,
  );
  return { ...status, applyUpdate: () => serviceWorkerController.applyUpdate() };
}
