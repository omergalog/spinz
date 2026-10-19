/**
 * robots.txt, sitemap.xml ו-404.html.
 *
 * עד עכשיו לא היו לאתר robots.txt ומפת אתר בכלל: כל כתובת, כולל
 * אלה, החזירה את עמוד הבית. גם כתובת שלא קיימת החזירה את עמוד הבית
 * עם סטטוס 200, כך שגוגל ראה אינסוף עותקים של אותו עמוד.
 *
 * vercel.json מפנה עכשיו ל-index.html רק כתובות מוכרות. כל השאר מקבל
 * את 404.html עם סטטוס 404, והאפליקציה מציגה בו "העמוד לא נמצא".
 *
 * רשימת העמודים כאן חייבת להתאים למסלולים ב-src/main.tsx ול-vercel.json.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SITE = 'https://www.spinzbikes.com';
const PAGES = ['', 'bikes', 'merch', 'specs', 'sizes', 'faq', 'guides', 'story', 'gallery',
  'community', 'reviews', 'contact', 'terms', 'regulations', 'presale-terms', 'cancel-order', 'accessibility'];

const guidesSrc = await readFile('src/data/guides.ts', 'utf8');
const slugs = [...guidesSrc.matchAll(/^    slug: '([a-z0-9-]+)'/gm)].map(m => m[1]);
if (slugs.length === 0) { console.error('build-seo: לא נמצאו מדריכים ב-guides.ts'); process.exit(1); }

const paths = [...PAGES, ...slugs.map(s => `guides/${s}`)];
const url = (p, en) => `${SITE}${en ? '/en' : ''}${p ? `/${p}` : (en ? '' : '/')}`;

const entry = (p, en) => `  <url>
    <loc>${url(p, en)}</loc>
    <xhtml:link rel="alternate" hreflang="he" href="${url(p, false)}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${url(p, true)}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(p, false)}"/>
  </url>`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${paths.flatMap(p => [entry(p, false), entry(p, true)]).join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /
Disallow: /order/

Sitemap: ${SITE}/sitemap.xml
`;

const index = await readFile('dist/index.html', 'utf8');
// בלי og:url: ב-index.html הוא מצביע על דף הבית, וכתובת שלא קיימת
// לא צריכה להתחזות אליו.
const notFound = index
  .replace(/\s*<meta property="og:url"[^>]*>/, '')
  .replace('</head>', '    <meta name="robots" content="noindex" />\n  </head>');
if (notFound === index) { console.error('build-seo: לא נמצא </head> ב-index.html'); process.exit(1); }

await writeFile('dist/sitemap.xml', sitemap);
await writeFile('dist/robots.txt', robots);
await writeFile('dist/404.html', notFound);
console.log(`build-seo: sitemap.xml (${paths.length * 2} כתובות), robots.txt, 404.html`);
