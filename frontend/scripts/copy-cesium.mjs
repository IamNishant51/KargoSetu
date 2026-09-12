import { cp, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const src = join(root, "node_modules", "cesium", "Build", "Cesium");
const dest = join(root, "public", "cesium");

if (!existsSync(src)) {
  console.error(`[copy-cesium] missing ${src} — run npm install first`);
  process.exit(1);
}
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });
console.log(`[copy-cesium] copied Cesium static assets to public/cesium`);
