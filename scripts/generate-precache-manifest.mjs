#!/usr/bin/env node
/**
 * Post-build step: lists every file in the static export, derives a build
 * version from their contents, and writes `out/sw.js` from the template.
 * Run automatically by `npm run build`.
 */
import { createHash } from "node:crypto";
import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outDir = path.join(root, "out");
const templatePath = path.join(root, "scripts", "sw-template.js");

/**
 * Never precached by URL. Not-found pages are served with a 404 status on some
 * hosts, which would make `cache.addAll` fail the whole install; the worker
 * caches `/404.html` separately as its offline fallback.
 */
const EXCLUDED = [/^sw\.js$/, /^404\.html$/, /^404\//, /^_not-found\//, /\.map$/];
/** Keeps the first install reasonable on slow connections; raise deliberately if larger media is added. */
const MAX_TOTAL_BYTES = 25 * 1024 * 1024;

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const full = path.join(dir, entry.name);
      return entry.isDirectory() ? listFiles(full) : [full];
    }),
  );
  return nested.flat();
}

/** `out/lessons/index.html` → `/lessons/`; other files keep their path. */
function toUrl(relativePath) {
  const posix = relativePath.split(path.sep).join("/");
  if (posix === "index.html") return "/";
  if (posix.endsWith("/index.html")) return `/${posix.slice(0, -"index.html".length)}`;
  return `/${posix}`;
}

async function main() {
  try {
    await stat(outDir);
  } catch {
    throw new Error(`Static export not found at ${outDir}. Run "next build" first.`);
  }

  const files = (await listFiles(outDir))
    .map((full) => path.relative(outDir, full))
    .filter((relative) => !EXCLUDED.some((pattern) => pattern.test(relative.split(path.sep).join("/"))))
    .sort();

  const hash = createHash("sha256");
  let totalBytes = 0;
  for (const relative of files) {
    const content = await readFile(path.join(outDir, relative));
    totalBytes += content.byteLength;
    hash.update(relative).update("\0").update(content);
  }
  if (totalBytes > MAX_TOTAL_BYTES) {
    throw new Error(`Precache is ${(totalBytes / 1048576).toFixed(1)} MB, above the ${MAX_TOTAL_BYTES / 1048576} MB budget.`);
  }

  const version = hash.digest("hex").slice(0, 12);
  const urls = files.map(toUrl);
  const template = await readFile(templatePath, "utf8");
  const worker = template
    .replace('"__BUILD_VERSION__"', JSON.stringify(version))
    .replace("__PRECACHE_URLS__", JSON.stringify(urls, null, 2));

  if (worker.includes("__BUILD_VERSION__") || worker.includes("__PRECACHE_URLS__")) {
    throw new Error("Service worker template placeholders were not replaced.");
  }
  await writeFile(path.join(outDir, "sw.js"), worker);
  console.log(`Service worker ${version}: ${urls.length} files, ${(totalBytes / 1024).toFixed(0)} KB precached.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
