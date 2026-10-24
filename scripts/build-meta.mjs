/**
 * עותק של index.html לכל עמוד פנימי, עם הכותרת, התיאור ו-og:url שלו.
 *
 * עד עכשיו כל הנתיבים הוגשו מ-index.html (או מ-en/index.html), וסורקי
 * השיתוף, שלא מריצים JavaScript, ראו בכל קישור את דף הבית. הנתונים
 * מגיעים מ-src/seo/pageMeta.ts, שנטען כאן דרך vite כדי לקרוא את המילון
 * ואת המדריכים בלי להעתיק אותם.
 *
 * vercel.json מפנה כל נתיב לקובץ שלו. רשימת המדריכים שם חייבת להתאים
 * ל-guides.ts, והבנייה נכשלת אם לא.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createServer } from 'vite';

const SITE = 'https://www.spinzbikes.com';

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });
const { PAGES, GUIDE_SLUGS, pageMeta } = await vite.ssrLoadModule('/src/seo/pageMeta.ts');
await vite.close();

const esc = s => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const base = { he: await readFile('dist/index.html', 'utf8'), en: await readFile('dist/en/index.html', 'utf8') };

const fail = msg => { console.error(`build-meta: ${msg}`); process.exit(1); };

let count = 0;
for (const lang of ['he', 'en']) {
  for (const path of [...PAGES, ...GUIDE_SLUGS.map(s => `guides/${s}`)]) {
    const m = pageMeta(lang, path);
    if (!m) fail(`אין כותרת ל-${lang}/${path}`);
    const url = `${SITE}${lang === 'en' ? '/en' : ''}/${path}`;
    const src = base[lang];
    const out = src
      .replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta property="og:title" content=")[^"]*/, `$1${esc(m.title)}`)
      .replace(/(<meta property="og:description" content=")[^"]*/, `$1${esc(m.description)}`)
      .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`);
    // כל אחת מחמש ההחלפות חייבת לקרות. אם התבנית השתנתה, עדיף שהבנייה תיכשל
    for (const needle of [`<title>${esc(m.title)}</title>`, `content="${esc(m.description)}"`, `content="${url}"`])
      if (!out.includes(needle)) fail(`החלפה לא בוצעה ב-${lang}/${path}`);
    const dir = `dist/${lang === 'en' ? 'en/' : ''}${path}`;
    await mkdir(dir, { recursive: true });
    await writeFile(`${dir}/index.html`, out);
    count++;
  }
}

// vercel.json: כל מדריך צריך כלל משלו, אחרת יוגש index.html עם כותרת דף הבית
// נקרא כ-JSON ולא בחיפוש טקסט: ב-Vercel החיפוש לא מצא אף כלל, אף שהקובץ זהה.
const sources = (JSON.parse(await readFile('vercel.json', 'utf8')).rewrites ?? []).map(r => r.source);
const listed = prefix => {
  const head = `${prefix}/guides/(`;
  const src = sources.find(s => s.startsWith(head) && s.endsWith(')'));
  return src ? src.slice(head.length, -1).split('|') : [];
};
const missing = ['', '/en'].flatMap(pre => GUIDE_SLUGS.filter(s => !listed(pre).includes(s)).map(s => `${pre}/guides/${s}`));
if (missing.length) {
  console.error(`build-meta: ${sources.length} כללים ב-vercel.json; כללי מדריכים: ${sources.filter(s => s.includes('/guides/')).join(' ; ') || 'אין'}`);
  fail(`מדריכים בלי כלל ב-vercel.json: ${missing.join(', ')}`);
}

console.log(`build-meta: ${count} עמודים`);
