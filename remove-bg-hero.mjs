import sharp from 'sharp';

const INPUT  = './public/assets/hero-bike.jpg';
const OUTPUT = './public/assets/hero-bike-new.jpg';

const { data, info } = await sharp(INPUT)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const buf = Buffer.from(data);

// Sample the 4 corners to get the background colour
function getPixel(x, y) {
  const off = (y * width + x) * channels;
  return [buf[off], buf[off + 1], buf[off + 2]];
}

const corners = [
  getPixel(0, 0),
  getPixel(width - 1, 0),
  getPixel(0, height - 1),
  getPixel(width - 1, height - 1),
];
const bgR = Math.round(corners.reduce((s, c) => s + c[0], 0) / 4);
const bgG = Math.round(corners.reduce((s, c) => s + c[1], 0) / 4);
const bgB = Math.round(corners.reduce((s, c) => s + c[2], 0) / 4);
console.log(`Detected background colour: rgb(${bgR}, ${bgG}, ${bgB})`);

const THRESHOLD = 42; // tolerance around background colour

function isBackground(x, y) {
  const off = (y * width + x) * channels;
  return Math.abs(buf[off]     - bgR) <= THRESHOLD &&
         Math.abs(buf[off + 1] - bgG) <= THRESHOLD &&
         Math.abs(buf[off + 2] - bgB) <= THRESHOLD;
}

// Flood-fill from all edges
const visited = new Uint8Array(width * height);
const queue   = [];

function seed(x, y) {
  const i = y * width + x;
  if (!visited[i] && isBackground(x, y)) { visited[i] = 1; queue.push(x, y); }
}

for (let x = 0; x < width;  x++) { seed(x, 0); seed(x, height - 1); }
for (let y = 0; y < height; y++) { seed(0, y); seed(width - 1, y); }

let qi = 0;
while (qi < queue.length) {
  const cx = queue[qi++], cy = queue[qi++];
  for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
    const nx = cx + dx, ny = cy + dy;
    if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
    const ni = ny * width + nx;
    if (!visited[ni] && isBackground(nx, ny)) { visited[ni] = 1; queue.push(nx, ny); }
  }
}

// Replace background pixels with white
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    if (visited[y * width + x]) {
      const off = (y * width + x) * channels;
      buf[off] = 255; buf[off + 1] = 255; buf[off + 2] = 255; buf[off + 3] = 255;
    }
  }
}

await sharp(buf, { raw: { width, height, channels } })
  .jpeg({ quality: 95 })
  .toFile(OUTPUT);

console.log(`✓ Saved to ${OUTPUT}`);

import { rename } from 'fs/promises';
await rename(OUTPUT, INPUT);
console.log('✓ Replaced original');
