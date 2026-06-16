// Regenerate all favicon raster assets from public/icon.svg.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const pub = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = readFileSync(join(pub, "icon.svg"));

const render = (size) =>
  sharp(svg, { density: 384 }).resize(size, size, { fit: "contain" }).png().toBuffer();

// Standalone PNGs the metadata references.
const pngs = {
  "icon-16.png": 16,
  "icon-32.png": 32,
  "icon-192.png": 192,
  "apple-icon.png": 180,
  "icon.png": 512,
};
for (const [name, size] of Object.entries(pngs)) {
  writeFileSync(join(pub, name), await render(size));
  console.log("wrote", name, `(${size}px)`);
}

// favicon.ico — a real multi-resolution ICO that embeds PNG frames (16/32/48),
// supported by every modern browser. ICONDIR + ICONDIRENTRY[] + PNG payloads.
const icoSizes = [16, 32, 48];
const frames = await Promise.all(icoSizes.map(render));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(frames.length, 4); // image count

const entries = [];
let offset = 6 + frames.length * 16;
frames.forEach((buf, i) => {
  const e = Buffer.alloc(16);
  const s = icoSizes[i];
  e.writeUInt8(s >= 256 ? 0 : s, 0); // width (0 = 256)
  e.writeUInt8(s >= 256 ? 0 : s, 1); // height
  e.writeUInt8(0, 2); // palette
  e.writeUInt8(0, 3); // reserved
  e.writeUInt16LE(1, 4); // color planes
  e.writeUInt16LE(32, 6); // bits per pixel
  e.writeUInt32LE(buf.length, 8); // size of PNG data
  e.writeUInt32LE(offset, 12); // offset
  offset += buf.length;
  entries.push(e);
});

writeFileSync(join(pub, "favicon.ico"), Buffer.concat([header, ...entries, ...frames]));
console.log("wrote favicon.ico", `(${icoSizes.join("/")}px frames)`);
