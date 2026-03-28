import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join } from 'path';

const ASSETS = './public/assets';
const THRESHOLD = 30; // how close to white counts as background

const files = [
  'model-1.jpg',
  'model-2.jpg',
  'model-3.jpg',
  'hero-bike.jpg',
  'gallery-1.jpg',
  'gallery-2.jpg',
  'gallery-3.jpg',
  'gallery-4.jpg',
  'gallery-5.jpg',
  'gallery-6.jpg',
];

async function removeBackground(filename) {
  const inPath = join(ASSETS, filename);
  const outName = filename.replace('.jpg', '.png');
  const outPath = join(ASSETS, outName);

  const { data, info } = await sharp(inPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const buf = Buffer.from(data);

  // Flood-fill from all 4 edges to find connected white/near-white pixels
  const visited = new Uint8Array(width * height);
  const queue = [];

  function idx(x, y) { return y * width + x; }
  function pixelOffset(x, y) { return (y * width + x) * channels; }

  function isWhitish(x, y) {
    const off = pixelOffset(x, y);
    return buf[off] >= 255 - THRESHOLD &&
           buf[off + 1] >= 255 - THRESHOLD &&
           buf[off + 2] >= 255 - THRESHOLD;
  }

  // Seed from edges
  for (let x = 0; x < width; x++) {
    if (isWhitish(x, 0) && !visited[idx(x, 0)]) { visited[idx(x, 0)] = 1; queue.push([x, 0]); }
    if (isWhitish(x, height - 1) && !visited[idx(x, height - 1)]) { visited[idx(x, height - 1)] = 1; queue.push([x, height - 1]); }
  }
  for (let y = 0; y < height; y++) {
    if (isWhitish(0, y) && !visited[idx(0, y)]) { visited[idx(0, y)] = 1; queue.push([0, y]); }
    if (isWhitish(width - 1, y) && !visited[idx(width - 1, y)]) { visited[idx(width - 1, y)] = 1; queue.push([width - 1, y]); }
  }

  const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
  let i = 0;
  while (i < queue.length) {
    const [cx, cy] = queue[i++];
    for (const [dx, dy] of dirs) {
      const nx = cx + dx, ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      if (visited[idx(nx, ny)]) continue;
      if (isWhitish(nx, ny)) {
        visited[idx(nx, ny)] = 1;
        queue.push([nx, ny]);
      }
    }
  }

  // Make visited pixels transparent
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (visited[idx(x, y)]) {
        buf[pixelOffset(x, y) + 3] = 0;
      }
    }
  }

  await sharp(buf, { raw: { width, height, channels } })
    .png()
    .toFile(outPath);

  console.log(`✓ ${filename} → ${outName}`);
}

for (const f of files) {
  await removeBackground(f);
}
console.log('Done!');
