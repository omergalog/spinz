#!/usr/bin/env node
/**
 * בודק שהגרסה האנגלית באמת זורמת שמאל-לימין.
 * שתי הבדיקות האחרות לא תפסו את זה: אחת מוודאת שהעברית לא זזה,
 * השנייה מחפשת מילים בעברית — אף אחת לא בדקה את כיוון הכתיבה בפועל.
 */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:3000';
const ROUTES = ['/', '/bikes', '/specs', '/sizes', '/faq', '/guides', '/gallery', '/community',
  '/reviews', '/contact', '/story', '/terms', '/presale-terms', '/cancel-order',
  '/regulations', '/accessibility', '/guides/assembly'];

// המסמכים המשפטיים מרונדרים מקומפוננטה אנגלית נפרדת ולכן מסומנים ltr במפורש
const probe = () => {
  const bad = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    const cs = getComputedStyle(el);
    if (cs.direction === 'rtl') {
      const txt = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
      bad.push(`${el.tagName.toLowerCase()} "${txt}"`);
    }
  }
  return { rtl: [...new Set(bad)], htmlDir: document.documentElement.dir };
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let failed = 0;

for (const route of ROUTES) {
  await page.goto(`${BASE}/en${route === '/' ? '' : route}?noLenis`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  const { rtl, htmlDir } = await page.evaluate(probe);
  const ok = htmlDir === 'ltr' && rtl.length === 0;
  if (!ok) failed++;
  console.log(`${('/en' + (route === '/' ? '' : route)).padEnd(22)} html=${htmlDir} ${ok ? '✅' : '❌ ' + rtl.length + ' אלמנטים ב-RTL'}`);
  rtl.slice(0, 3).forEach(t => console.log('     ' + t));
}
await browser.close();

if (failed) { console.error(`\n❌ ${failed} עמודים עדיין מציגים RTL באנגלית.`); process.exit(1); }
console.log('\n✅ כל העמודים באנגלית זורמים שמאל-לימין.');
