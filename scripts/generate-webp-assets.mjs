import sharp from "sharp";
import { readdir } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const assetDir = join(root, "src", "assets", "vip-2026");
const imageExtensions = new Set([".jpg", ".jpeg", ".png"]);

const files = await readdir(assetDir, { withFileTypes: true });
const sourceFiles = files
  .filter((file) => file.isFile() && imageExtensions.has(extname(file.name).toLowerCase()))
  .map((file) => file.name);

const layerFiles = await readdir(join(assetDir, "layers"), { withFileTypes: true }).catch(() => []);
const sourceLayerFiles = layerFiles
  .filter((file) => file.isFile() && imageExtensions.has(extname(file.name).toLowerCase()))
  .map((file) => join("layers", file.name));

await Promise.all(
  [...sourceFiles, ...sourceLayerFiles].map(async (fileName) => {
    const input = join(assetDir, fileName);
    const output = join(assetDir, fileName.replace(/\.(jpe?g|png)$/i, ".webp"));
    await sharp(input).webp({ quality: 78 }).toFile(output);
  })
);

console.log(`Generated ${sourceFiles.length + sourceLayerFiles.length} WebP asset(s) in src/assets/vip-2026`);
