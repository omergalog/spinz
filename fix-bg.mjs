import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

// Target beige = #F5F2EC
const TARGET_R = 245, TARGET_G = 242, TARGET_B = 236;

async function fixBackground(inputPath, outputPath) {
  console.log(`Processing: ${inputPath}`);

  const image = sharp(inputPath);
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const channels = 4; // RGBA after ensureAlpha
  const buf = Buffer.from(data);

  let replaced = 0;

  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    const r = buf[o], g = buf[o + 1], b = buf[o + 2];

    // Brightness 0–1
    const brightness = (r + g + b) / (3 * 255);

    // Saturation (HSV)
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const saturation = max === 0 ? 0 : (max - min) / max;

    // Background = bright (>80%) AND near-neutral (<12% saturation)
    if (brightness > 0.80 && saturation < 0.12) {
      buf[o]     = TARGET_R;
      buf[o + 1] = TARGET_G;
      buf[o + 2] = TARGET_B;
      // keep alpha as-is
      replaced++;
    }
  }

  const total = width * height;
  console.log(`  Replaced ${replaced}/${total} pixels (${(replaced/total*100).toFixed(1)}%)`);

  await sharp(buf, { raw: { width, height, channels } })
    .jpeg({ quality: 95 })
    .toFile(outputPath);

  console.log(`  Saved → ${outputPath}`);
}

const assets = 'public/assets';
const files = ['model-1', 'model-2', 'model-3'];

for (const name of files) {
  await fixBackground(`${assets}/${name}.jpg`, `${assets}/${name}-fixed.jpg`);
}

console.log('\nDone. Renaming...');

import { renameSync } from 'fs';
for (const name of files) {
  renameSync(`${assets}/${name}.jpg`, `${assets}/${name}-orig.jpg`);
  renameSync(`${assets}/${name}-fixed.jpg`, `${assets}/${name}.jpg`);
}

console.log('All done!');
