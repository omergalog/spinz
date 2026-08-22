/**
 * מעטפת HTML נפרדת לאנגלית.
 *
 * תגיות השיתוף מתעדכנות ב-React אחרי שהדף נטען, אבל הסורקים של
 * וואטסאפ ופייסבוק לא מריצים JavaScript — הם קוראים את ה-HTML כפי
 * שהשרת החזיר אותו. לכן קישור באנגלית הוצג עם הכותרת העברית.
 *
 * כאן נבנה עותק סטטי של index.html עם התגיות באנגלית, ו-vercel.json
 * מפנה אליו כל כתובת שמתחילה ב-/en.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';

const SITE = 'https://spinzbikes.com';
const EN = {
  title: 'Spinz Bikes | The quiet revolution of riding in the city',
  description: 'Spinz — urban single-speed city bikes. Built for the street, designed to stand out.',
  ogDescription: 'Everyone will ask where it is from. Meet the single-speed brand that changes the way you ride the city.',
};

const src = await readFile('dist/index.html', 'utf8');

let out = src
  .replace('<html lang="he" dir="rtl">', '<html lang="en" dir="ltr">')
  .replace(/<title>[^<]*<\/title>/, `<title>${EN.title}</title>`)
  .replace(/(<meta name="description" content=")[^"]*/, `$1${EN.description}`)
  .replace(/(<meta property="og:title" content=")[^"]*/, `$1${EN.title}`)
  .replace(/(<meta property="og:description" content=")[^"]*/, `$1${EN.ogDescription}`)
  .replace(/(<meta property="og:url" content=")[^"]*/, `$1${SITE}/en`);

out = out.replace('content="he_IL"', 'content="en_US"');

if (out === src) {
  console.error('build-en: לא בוצעה שום החלפה — המבנה של index.html השתנה');
  process.exit(1);
}

await mkdir('dist/en', { recursive: true });
await writeFile('dist/en/index.html', out);
console.log('build-en: dist/en/index.html נכתב');
