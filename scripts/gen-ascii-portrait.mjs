// Regenerate public/ascii-portrait.webp from assets/portrait-source.png.
// The source PNG lives outside public/ so it is never served to visitors.
// Run: node scripts/gen-ascii-portrait.mjs
//
// <AsciiArt objectFit="cover"> only ever samples the centred square of the
// source and draws it into at most 500 columns, so a 600 px square crop holds
// all the detail it can use at a fraction of the PNG's weight.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = join(root, "public");
const src = join(root, "assets", "portrait-source.png");

const { width, height } = await sharp(src).metadata();
const side = Math.min(width, height);

await sharp(src)
  .extract({
    left: Math.round((width - side) / 2),
    top: Math.round((height - side) / 2),
    width: side,
    height: side,
  })
  .resize(600, 600, { kernel: "lanczos3" })
  .webp({ quality: 85, alphaQuality: 90, effort: 6 })
  .toFile(join(pub, "ascii-portrait.webp"));

console.log("wrote public/ascii-portrait.webp");
