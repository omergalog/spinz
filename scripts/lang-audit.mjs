#!/usr/bin/env node
/**
 * עובר על כל עמוד באנגלית ומחפש עברית שנשכחה.
 * נועד לתפוס מחרוזות שלא חולצו למילון — בלי להסתמך על קריאה אנושית.
 *
 *   node scripts/lang-audit.mjs
 *
 * דורש שרת פיתוח פעיל.
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3000';

const ROUTES = [
  '/', '/bikes', '/specs', '/sizes', '/faq', '/guides', '/gallery', '/community',
  '/reviews', '/contact', '/story', '/terms', '/presale-terms', '/cancel-order',
  '/regulations', '/accessibility',
  '/guides/assembly', '/guides/sizing', '/guides/maintenance',
  '/guides/brakes-drivetrain', '/guides/city-safety', '/guides/tel-aviv-routes',
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile',  width: 390,  height: 844 },
];

/** כל טקסט גלוי בעמוד, כולל תוויות נגישות שקוראי מסך מקריאים. */
const COLLECT = () => {
  const found = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;

    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, ' ').trim();
    if (t) found.push({ what: el.tagName.toLowerCase(), text: t });

    for (const attr of ['aria-label', 'title', 'placeholder', 'alt']) {
      const v = el.getAttribute?.(attr);
      if (v && v.trim()) found.push({ what: `${el.tagName.toLowerCase()}[${attr}]`, text: v.trim() });
    }
  }
  found.push({ what: '<title>', text: document.title });
  const md = document.querySelector('meta[name="description"]');
  if (md) found.push({ what: 'meta[description]', text: md.getAttribute('content') || '' });
  return found;
};

const HEBREW = /[֐-׿]/;

const browser = await chromium.launch();
const leaks = [];
let checked = 0;

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const route of ROUTES) {
    const url = `${BASE}/en${route === '/' ? '' : route}?noLenis`;
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(400);
    for (const item of await page.evaluate(COLLECT)) {
      checked++;
      if (HEBREW.test(item.text)) {
        leaks.push(`${vp.name} /en${route === '/' ? '' : route} · ${item.what} · "${item.text.slice(0, 70)}"`);
      }
    }
    process.stdout.write('.');
  }
  await page.close();
}
await browser.close();
process.stdout.write('\n');

// מחרוזות זהות חוזרות בכל עמוד (ניווט, פוטר) — מקבצים כדי שהדוח יהיה קריא
const unique = [...new Set(leaks.map(l => l.split(' · ').slice(1).join(' · ')))];

if (leaks.length === 0) {
  console.log(`✅ אין עברית באף עמוד אנגלי. נבדקו ${checked} מחרוזות.`);
  process.exit(0);
}
console.error(`❌ נמצאה עברית ב-${leaks.length} מקומות (${unique.length} מחרוזות ייחודיות) מתוך ${checked}:\n`);
unique.slice(0, 60).forEach(u => console.error('   ' + u));
if (unique.length > 60) console.error(`   ...ועוד ${unique.length - 60}`);
process.exit(1);
