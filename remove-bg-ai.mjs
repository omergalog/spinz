import { removeBackground } from '@imgly/background-removal-node';
import { readFileSync, writeFileSync } from 'fs';
import sharp from 'sharp';

const INPUT = './public/assets/hero-bike.jpg';

// Restore original first
import { copyFileSync } from 'fs';
copyFileSync('./תמונות אופניים/PHOTO-2026-03-25-14-13-29.jpg', INPUT);
console.log('Restored original image');

console.log('Running AI background removal (may take a minute)...');

const imageData = readFileSync(INPUT);
const blob = new Blob([imageData], { type: 'image/jpeg' });

const resultBlob = await removeBackground(blob, {
  publicPath: `file://${process.cwd()}/node_modules/@imgly/background-removal-node/dist/`,
});

const arrayBuffer = await resultBlob.arrayBuffer();
const pngBuffer = Buffer.from(arrayBuffer);

// Composite onto white background and save as JPG
await sharp(pngBuffer)
  .flatten({ background: { r: 255, g: 255, b: 255 } })
  .jpeg({ quality: 95 })
  .toFile(INPUT);

console.log('✓ Done! Hero image now has white background.');
