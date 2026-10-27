/**
 * Browser-side service worker lifecycle, exposed as a tiny observable store
 * so React (or any UI) can subscribe without knowing the Service Worker API.
 */

export type OfflineReadiness =
  /** Browser cannot install a service worker (unsupported, insecure origin, or dev server). */
  | "unsupported"
  /** First visit: files are downloading. */
  | "installing"
  /** Every file is saved; the app works offline. */
  | "ready"
  | "error";

export interface ServiceWorkerStatus {
  readonly readiness: OfflineReadiness;
  /** A newer version finished downloading and is waiting for the student to accept it. */
  readonly updateAvailable: boolean;
}

type Listener = () => void;

const SERVICE_WORKER_URL = "/sw.js";
const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export class ServiceWorkerController {
  private status: ServiceWorkerStatus = { readiness: "installing", updateAvailable: false };
  private readonly listeners = new Set<Listener>();
  private registration: ServiceWorkerRegistration | null = null;
  private started = false;

  readonly getSnapshot = (): ServiceWorkerStatus => this.status;
  readonly getServerSnapshot = (): ServiceWorkerStatus => SERVER_STATUS;

  readonly subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Idempotent; safe to call from effects that run twice in development. */
  start(): void {
    if (this.started) return;
    this.started = true;
    if (!("serviceWorker" in navigator) || !window.isSecureContext || process.env.NODE_ENV !== "production") {
      this.update({ readiness: "unsupported" });
      return;
    }
    void this.register();
  }

  /** Activates the waiting version and reloads once it takes control. */
  applyUpdate(): void {
    const waiting = this.registration?.waiting;
    if (!waiting) return;
    navigator.serviceWorker.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    waiting.postMessage({ type: "SKIP_WAITING" });
  }

  private async register(): Promise<void> {
    try {
      const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: "/", updateViaCache: "none" });
      this.registration = registration;
      this.watch(registration);
      await navigator.serviceWorker.ready;
      this.update({ readiness: "ready" });
      window.setInterval(() => void registration.update().catch(() => undefined), UPDATE_CHECK_INTERVAL_MS);
    } catch (error) {
      console.error("Offline mode could not be set up.", error);
      this.update({ readiness: "error" });
    }
  }

  private watch(registration: ServiceWorkerRegistration): void {
    const markIfWaiting = () => {
      // A waiting worker while another one controls the page means a newer build is ready.
      if (registration.waiting && navigator.serviceWorker.controller) this.update({ updateAvailable: true });
    };
    markIfWaiting();
    registration.addEventListener("updatefound", () => {
      const incoming = registration.installing;
      incoming?.addEventListener("statechange", () => {
        if (incoming.state === "installed") markIfWaiting();
        if (incoming.state === "redundant" && !registration.active) this.update({ readiness: "error" });
      });
    });
  }

  private update(patch: Partial<ServiceWorkerStatus>): void {
    this.status = { ...this.status, ...patch };
    this.listeners.forEach((listener) => listener());
  }
}

const SERVER_STATUS: ServiceWorkerStatus = Object.freeze({ readiness: "installing", updateAvailable: false });

export const serviceWorkerController = new ServiceWorkerController();
