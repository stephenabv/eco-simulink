#!/usr/bin/env node
/** Regenerates the PWA icons in public/ from the SVG sources in assets/. Run after editing the artwork. Uses sharp, which is installed with Next.js. */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const targets = [
  { source: "assets/icon.svg", output: "public/icons/icon-192.png", size: 192 },
  { source: "assets/icon.svg", output: "public/icons/icon-512.png", size: 512 },
  { source: "assets/icon-maskable.svg", output: "public/icons/icon-maskable-512.png", size: 512 },
  { source: "assets/icon.svg", output: "public/icons/apple-touch-icon.png", size: 180 },
];

for (const { source, output, size } of targets) {
  await sharp(path.join(root, source)).resize(size, size).png({ compressionLevel: 9 }).toFile(path.join(root, output));
  console.log(`${output} (${size}px)`);
}
