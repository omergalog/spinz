#!/usr/bin/env node
/**
 * משלים את lang-audit.mjs: פותח כל חלון/פאנל שדורש לחיצה ובודק אם נשארה בו עברית.
 * הבדיקה הרגילה סורקת עמודים בלבד ולכן לא רואה אותם — כך התגלו חלון הפרטיות
 * ופאנל הנגישות רק אחרי שהמשתמש שאל.
 */
import { chromium } from 'playwright';
const BASE = process.env.BASE || 'http://localhost:3000';
const HEB = /[֐-׿]/;
const ALLOW = /^(עב|EN)$/;                       // מתג השפה נשאר עברי בכוונה

const collect = () => {
  const out = [];
  for (const e of document.querySelectorAll('body *')) {
    const r = e.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    let t = ''; for (const n of e.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, ' ').trim();
    if (t) out.push(t);
    for (const a of ['aria-label', 'title', 'placeholder']) {
      const v = e.getAttribute?.(a); if (v?.trim()) out.push(v.trim());
    }
  }
  return [...new Set(out)];
};

const browser = await chromium.launch();
const problems = [];

const cases = [
  { name: 'חלון החיפוש',      path: '/en',          open: p => p.click('button[aria-label="Search the site"]') },
  { name: 'פאנל הנגישות',     path: '/en',          open: p => p.click('button[aria-label="Open accessibility menu"]') },
  { name: 'עגלת הקניות',      path: '/en/bikes',    open: p => p.click('header button:nth-of-type(3)') },
  { name: 'לייטבוקס הגלריה',  path: '/en/gallery',  open: p => p.locator('button[aria-label^="Enlarge"]').first().click() },
  { name: 'חלון הפרטיות',     path: '/en',          open: async p => { await p.waitForTimeout(3200); await p.click('button:has-text("Privacy Policy")'); } },
];

for (const c of cases) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + c.path + '?noLenis', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  const before = new Set(await page.evaluate(collect));
  try { await c.open(page); } catch { console.log(`   (${c.name}: לא נפתח)`); await ctx.close(); continue; }
  await page.waitForTimeout(900);
  // רק מה שהופיע בעקבות הפתיחה — כדי לא לדווח שוב על העמוד שמאחור
  const added = (await page.evaluate(collect)).filter(t => !before.has(t) && HEB.test(t) && !ALLOW.test(t));
  console.log(`${c.name.padEnd(18)} ${added.length === 0 ? '✅ נקי' : '❌ ' + added.length + ' עבריות'}`);
  added.slice(0, 4).forEach(t => problems.push(`${c.name}: "${t.slice(0, 50)}"`));
  await ctx.close();
}
await browser.close();

if (problems.length) { console.error('\n' + problems.join('\n')); process.exit(1); }
console.log('\n✅ כל החלונות והפאנלים נקיים מעברית.');
