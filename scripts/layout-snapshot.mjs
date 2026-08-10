#!/usr/bin/env node
/**
 * מצלם "טביעת אצבע" של כל עמוד באתר — המיקום והגודל של כל אלמנט, וכל הטקסטים.
 * נועד להוכיח שהגרסה העברית לא זזה אף פיקסל בזמן העבודה על האנגלית.
 *
 *   node scripts/layout-snapshot.mjs baseline    ← לפני שינויים
 *   node scripts/layout-snapshot.mjs check       ← אחרי, משווה ומדווח
 *
 * דורש שרת פיתוח פעיל (npm run dev) על הפורט שב-BASE.
 */
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.env.BASE || 'http://localhost:3000';
const OUT  = join(ROOT, '.layout-snapshots');

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

/** נמדד בתוך הדפדפן: כל אלמנט נראה → תגית, מלבן, וטקסט ישיר. */
const CAPTURE = () => {
  const layout = [];
  const texts  = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    layout.push([
      el.tagName,
      Math.round(r.left), Math.round(r.top + window.scrollY),
      Math.round(r.width), Math.round(r.height),
    ].join(','));

    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    t = t.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    // הספירה לאחור משתנה כל שנייה — ממסכים את הספרות שלה בלבד
    if (el.closest('.presale-countdown')) t = t.replace(/\d/g, '#');
    texts.push(t);
  }
  return {
    layout, texts,
    dir: document.documentElement.getAttribute('dir')
         || getComputedStyle(document.body).direction,
    docHeight: Math.round(document.documentElement.scrollHeight),
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  };
};

async function capture(page, url) {
  // באנר העוגיות מופיע אחרי 2.6 שניות ומרים איתו את הכפתורים הצפים, כך
  // שלכידה אחת תופסת אותו ואחרת לא. מסמנים אותו כנצפה כדי שהמדידה תהיה קבועה.
  await page.addInitScript(() => {
    try { localStorage.setItem('spinz-cookies', '1'); } catch { /* ignore */ }
  });
  await page.goto(url, { waitUntil: 'networkidle' });

  // אנימציות רצות הופכות כל מדידה לאקראית: נקודה מהבהבת משנה גודל בכל פריים,
  // וכפתור שנכנס באנימציה מ-scale(0) נמדד כרוחב 0 ולכן "נעלם" מהרשימה.
  // כיבוי גורף הופך את המדידה לדטרמיניסטית — ובאותה מידה לפני ואחרי.
  await page.addStyleTag({
    content: `*, *::before, *::after {
      animation: none !important;
      transition: none !important;
    }`,
  });

  // הכפתורים הצפים נכנסים בהשהיה של 1.5 שניות — ממתינים שיהיו בגודל מלא
  await page.waitForFunction(() => {
    const els = [
      document.querySelector('a[aria-label="פנה אלינו ב-WhatsApp"]'),
      document.querySelector('button[aria-label="פתח תפריט נגישות"]'),
    ];
    return els.every(e => e && e.getBoundingClientRect().width > 0);
  }, null, { timeout: 15000 });

  // כותרת ההירו נעה לפי currentTime של הסרטון (דהייה מונעת-וידאו), ולכן כל
  // לכידה הייתה תופסת אותה במקום אחר. עוצרים את הסרטון בהתחלה כדי שהמדידה
  // תהיה זהה בכל הרצה.
  await page.evaluate(() => {
    for (const v of document.querySelectorAll('video')) {
      v.pause();
      try { v.currentTime = 0; } catch { /* ignore */ }
    }
  });

  await page.evaluate(() => window.scrollTo(0, 0));

  // ממתין עד ששתי דגימות רצופות זהות — כלומר הרינדור התייצב
  let prev = null;
  for (let i = 0; i < 25; i++) {
    const snap = await page.evaluate(CAPTURE);
    const key = JSON.stringify([snap.layout, snap.texts]);
    if (key === prev) return snap;
    prev = key;
    await page.waitForTimeout(120);
  }
  throw new Error(`העמוד לא התייצב: ${url}`);
}

const mode = process.argv[2] === 'check' ? 'check' : 'baseline';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = {};

for (const vp of VIEWPORTS) {
  const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
  for (const route of ROUTES) {
    // ?noLenis מכבה גלילה חלקה כדי שהמדידה תהיה דטרמיניסטית
    results[`${vp.name}${route}`] = await capture(page, `${BASE}${route}?noLenis`);
    process.stdout.write('.');
  }
  await page.close();
}
await browser.close();
process.stdout.write('\n');

const file = join(OUT, 'he.json');

if (mode === 'baseline') {
  writeFileSync(file, JSON.stringify(results, null, 1));
  const pages = Object.keys(results).length;
  const els   = Object.values(results).reduce((s, r) => s + r.layout.length, 0);
  const txt   = Object.values(results).reduce((s, r) => s + r.texts.length, 0);
  console.log(`✅ נשמר קו ייחוס: ${pages} לכידות · ${els} אלמנטים · ${txt} מחרוזות`);
  console.log(`   ${file}`);
  process.exit(0);
}

if (!existsSync(file)) {
  console.error('❌ אין קו ייחוס. הרץ קודם: node scripts/layout-snapshot.mjs baseline');
  process.exit(1);
}

const base = JSON.parse(readFileSync(file, 'utf8'));
const problems = [];

for (const key of Object.keys(base)) {
  const b = base[key], c = results[key];
  if (!c) { problems.push(`${key} — העמוד נעלם`); continue; }

  if (b.dir !== c.dir)               problems.push(`${key} — כיוון השתנה: ${b.dir} → ${c.dir}`);
  if (b.docHeight !== c.docHeight)   problems.push(`${key} — גובה העמוד: ${b.docHeight} → ${c.docHeight}`);
  if (b.overflowX !== c.overflowX)   problems.push(`${key} — גלישה אופקית: ${b.overflowX} → ${c.overflowX}`);

  // טקסטים שנעלמו / השתנו / נוספו
  const gone  = b.texts.filter(t => !c.texts.includes(t));
  const added = c.texts.filter(t => !b.texts.includes(t));
  for (const t of gone.slice(0, 5))  problems.push(`${key} — טקסט נעלם: "${t.slice(0, 60)}"`);
  for (const t of added.slice(0, 5)) problems.push(`${key} — טקסט חדש:  "${t.slice(0, 60)}"`);
  if (gone.length > 5)  problems.push(`${key} — ...ועוד ${gone.length - 5} טקסטים שנעלמו`);

  // אלמנטים שזזו
  const moved = [];
  const n = Math.min(b.layout.length, c.layout.length);
  for (let i = 0; i < n; i++) if (b.layout[i] !== c.layout[i]) moved.push(i);
  if (b.layout.length !== c.layout.length)
    problems.push(`${key} — מספר אלמנטים: ${b.layout.length} → ${c.layout.length}`);
  for (const i of moved.slice(0, 5))
    problems.push(`${key} — אלמנט זז: ${b.layout[i]}  →  ${c.layout[i]}`);
  if (moved.length > 5) problems.push(`${key} — ...ועוד ${moved.length - 5} אלמנטים שזזו`);
}

if (problems.length === 0) {
  console.log('✅ הגרסה העברית זהה לחלוטין — לא זז פיקסל ולא השתנתה מילה.');
  process.exit(0);
}
console.error(`❌ נמצאו ${problems.length} שינויים בגרסה העברית:\n`);
problems.forEach(p => console.error('   ' + p));
process.exit(1);
