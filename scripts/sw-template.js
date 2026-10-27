/* eslint-disable */
/**
 * Service worker template. `scripts/generate-precache-manifest.mjs` replaces
 * the two placeholders after `next build` and writes the result to `out/sw.js`.
 *
 * Strategy:
 *   - Install: download every file of this build into a versioned cache.
 *   - Fetch: serve this build's files cache-first, so the whole app works offline
 *     and every page comes from the same build. Other same-origin GETs go to the
 *     network and fall back to the cache.
 *   - Update: a new build installs in the background and waits; the page asks the
 *     student before switching (message "SKIP_WAITING"), then old caches are deleted.
 *   - Student progress lives in IndexedDB, which this worker never touches.
 */
const BUILD_VERSION = "__BUILD_VERSION__";
const PRECACHE_URLS = __PRECACHE_URLS__;

const CACHE_PREFIX = "eco-simulink-";
const PRECACHE = `${CACHE_PREFIX}precache-${BUILD_VERSION}`;
const RUNTIME = `${CACHE_PREFIX}runtime-${BUILD_VERSION}`;
const OFFLINE_FALLBACK = "/404.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      // `cache: "reload"` bypasses the HTTP cache so a stale file never ends up in a new build's cache.
      await cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: "reload" })));
      // Stored whatever its status: hosts may serve the not-found page as a 404.
      const fallback = await fetch(new Request(OFFLINE_FALLBACK, { cache: "reload" }));
      await cache.put(OFFLINE_FALLBACK, fallback);
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== PRECACHE && key !== RUNTIME)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.origin && event.origin !== self.location.origin) return;
  const type = event.data && event.data.type;
  if (type === "SKIP_WAITING") self.skipWaiting();
  if (type === "GET_VERSION" && event.ports[0]) event.ports[0].postMessage({ version: BUILD_VERSION });
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(handle(request, url));
});

async function handle(request, url) {
  const precache = await caches.open(PRECACHE);
  // Next.js adds a `_rsc` query to client-side navigation requests; the file is the same.
  const cached = await precache.match(normalizePath(url.pathname), { ignoreSearch: true });
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      const runtime = await caches.open(RUNTIME);
      await runtime.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const fallback = (await caches.match(request, { ignoreSearch: true })) ||
      (request.mode === "navigate" ? await precache.match(OFFLINE_FALLBACK) : undefined);
    if (fallback) return fallback;
    return new Response("You are offline and this content has not been saved yet.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/** Maps `/lessons` and `/lessons/index.html` to the cached `/lessons/` entry. */
function normalizePath(pathname) {
  if (pathname.endsWith("/index.html")) return pathname.slice(0, -"index.html".length);
  if (!pathname.endsWith("/") && !/\.[a-z0-9]+$/i.test(pathname.split("/").pop() || "")) return `${pathname}/`;
  return pathname;
}
