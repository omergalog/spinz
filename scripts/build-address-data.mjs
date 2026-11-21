/**
 * נתוני כתובות לטופס המשלוח (21.11.2026): ישובים ורחובות מהמאגר הרשמי של
 * משרד הפנים ב-data.gov.il. מריצים ידנית כשרוצים לרענן (לא בכל בנייה):
 *   node scripts/build-address-data.mjs
 *
 * פלט (נשמר ב-git ומוגש כקבצים סטטיים, בלי קריאה לצד שלישי בזמן הקנייה):
 *   public/addr/cities.json   — [{ c: סמל, n: שם, e: שם לועזי }]
 *   public/addr/s/<סמל>.json — [שמות רחובות], בלי הרשומה שזהה לשם הישוב
 *                               (ישוב בלי רחובות = מערך ריק)
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';

const API = 'https://data.gov.il/api/3/action/datastore_search';
const STREETS = '9ad3862c-8391-4b2f-84a4-2d4c68625f4b';
const CITIES = '5c78e9fa-c2e2-4771-93ff-7f400a12f7ba';

async function all(resource) {
  const out = []; let offset = 0;
  for (;;) {
    const res = await fetch(`${API}?resource_id=${resource}&limit=10000&offset=${offset}`);
    if (!res.ok) throw new Error(`${resource}: HTTP ${res.status}`);
    const { result } = await res.json();
    out.push(...result.records);
    offset += result.records.length;
    if (!result.records.length || offset >= result.total) return out;
  }
}

// רווחים כפולים ורווחים סביב סוגריים/מקפים, כפי שמופיעים במאגר
const clean = s => String(s ?? '').replace(/\s+/g, ' ').replace(/\(\s+/g, '(').replace(/\s+\)/g, ')').trim();
const title = s => clean(s).toLowerCase().replace(/(^|[\s\-(])([a-z])/g, (_, a, b) => a + b.toUpperCase());

const [streetRows, cityRows] = await Promise.all([all(STREETS), all(CITIES)]);
console.log(`streets: ${streetRows.length}, cities: ${cityRows.length}`);

const en = new Map(cityRows.map(r => [Number(r['סמל_ישוב']), title(r['שם_ישוב_לועזי'])]));
const byCity = new Map();
for (const r of streetRows) {
  const code = Number(r['סמל_ישוב']);
  const city = clean(r['שם_ישוב']);
  if (!code || !city) continue;
  if (!byCity.has(code)) byCity.set(code, { n: city, s: new Set() });
  const street = clean(r['שם_רחוב']);
  if (street && street !== city) byCity.get(code).s.add(street);
}

await rm('public/addr', { recursive: true, force: true });
await mkdir('public/addr/s', { recursive: true });
const cities = [...byCity.entries()]
  .map(([c, v]) => ({ c, n: v.n, ...(en.get(c) ? { e: en.get(c) } : {}) }))
  .sort((a, b) => a.n.localeCompare(b.n, 'he'));
await writeFile('public/addr/cities.json', JSON.stringify(cities));
let total = 0;
for (const [c, v] of byCity) {
  const list = [...v.s].sort((a, b) => a.localeCompare(b, 'he'));
  total += list.length;
  await writeFile(`public/addr/s/${c}.json`, JSON.stringify(list));
}
console.log(`wrote ${cities.length} cities, ${total} streets`);
