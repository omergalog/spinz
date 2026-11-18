/**
 * נתונים לגוגל (16.11.2026): נתונים מובנים (JSON-LD) וקובץ מוצרים ל-Merchant Center.
 *
 * - דף הבית: Organization + WebSite.
 * - דף הבית ו-/bikes: ProductGroup של האופניים, וריאנט לכל צבע ומידה.
 * - /merch: ProductGroup לכל חולצה.
 * - dist/merchant-feed.xml: פיד RSS של Google Merchant, שורה לכל slug בטבלת products.
 *
 * המחיר והמלאי נקראים מטבלת products בזמן הבנייה (קריאה ציבורית, אותו מפתח
 * שהאתר משתמש בו). שינוי מחיר או מלאי בטבלה מגיע לגוגל רק בבנייה הבאה של האתר.
 * אם הקריאה נכשלת, הבנייה ממשיכה בלי מוצרים (רק Organization), עם אזהרה.
 *
 * רץ אחרי build-meta, שמעתיק את index.html לכל עמוד, כדי שהמוצרים לא יוכפלו לכל עמוד.
 */
import { readFile, writeFile } from 'node:fs/promises';

const SITE = 'https://www.spinzbikes.com';
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ayrwfyutpbkepnyjkyop.supabase.co';
const ANON = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Yx3yf3sJdBr-I6fE5sQ44Q_BRiOttxN';

const BRAND = 'SPINZ';
const COLORS = {
  mat:   { he: 'שחור מט',  en: 'Matte black', image: '/assets/bike-mat-v3.webp' },
  beige: { he: "בז'",      en: 'Beige',       image: '/assets/bike-beige-v3.webp' },
  olive: { he: 'ירוק זית', en: 'Olive green', image: '/assets/bike-olive-v3.webp' },
};
const SIZES = { '54': { he: 'גובה 170–180 ס״מ', en: 'rider height 170–180 cm' }, '57': { he: 'גובה 180–188 ס״מ', en: 'rider height 180–188 cm' } };
const BIKE = {
  he: { name: 'SPINZ Urban – אופני עיר סינגל ספיד', desc: 'אופני עיר סינגל ספיד עם שלדת אלומיניום, משקל 10 ק״ג, צמיגי Kenda 32 מ״מ נגד פנצ׳רים, 46T/16T עם גלגל חופשי, בלם קדמי ואחורי. כולל פדלים, פעמון ומחזירי אור. משלוח עד הבית כלול במחיר.' },
  en: { name: 'SPINZ Urban – single-speed city bike', desc: 'Single-speed city bike with an aluminum frame, 10 kg, Kenda 32 mm anti-puncture tires, 46T/16T with a freewheel, front and rear brakes. Pedals, bell and reflectors included. Home delivery included in the price.' },
};
const TEES = {
  'merch-bauhaus':   { name: 'CITY RIDE', color: { he: 'לבן', en: 'White' }, image: '/assets/merch-tee-bauhaus-white-v2.webp',
                       he: 'חולצת SPINZ עם הדפס קווי של בניין תל אביבי. גזרה אוברסייז.', en: 'SPINZ tee with a line print of a Tel Aviv building. Oversized fit.' },
  'merch-blueprint': { name: 'NIGHT RIDE', color: { he: 'שחור', en: 'Black' }, image: '/assets/merch-tee-blueprint-black-v2.webp',
                       he: 'חולצת SPINZ עם שרטוט הנדסי של האופניים. גזרה אוברסייז.', en: 'SPINZ tee with the SPINZ engineering drawing. Oversized fit.' },
};

const abs = p => `${SITE}${p}`;
const priceOf = r => Number(r.sale_price ?? r.price);
const inStock = r => Number(r.stock) > 0;

// משלוח חינם לרוב הארץ, עד 5 ימי עסקים (כמו בקופה ובתקנון)
const shippingDetails = {
  '@type': 'OfferShippingDetails',
  shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'ILS' },
  shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'IL' },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 2, unitCode: 'DAY' },
    transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 5, unitCode: 'DAY' },
  },
};

let rows = [];
try {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=slug,price,sale_price,stock,category`, {
    headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  rows = await res.json();
} catch (e) {
  console.warn(`build-google: לא נקראו מוצרים (${e.message}). ממשיכים בלי מוצרים.`);
}

const bikes = rows.filter(r => r.category === 'bike' && /^spinz-[a-z]+-\d+$/.test(r.slug) && COLORS[r.slug.split('-')[1]]);
const tees = rows.filter(r => r.category === 'merch' && TEES[r.slug.replace(/-[a-z]+-[a-z]+$/, '')]);

// מדיניות ההחזרות לפי התקנון (סעיף 4): 14 ימים, החזר מלא, בלי דמי ביטול,
// החזרה בדואר על חשבון הלקוח. זהה למה שהוזן ב-Merchant Center (17.11.2026).
const returnPolicy = {
  '@type': 'MerchantReturnPolicy', applicableCountry: 'IL',
  returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow', merchantReturnDays: 14,
  returnMethod: 'https://schema.org/ReturnByMail', returnFees: 'https://schema.org/ReturnFeesCustomerResponsibility',
  refundType: 'https://schema.org/FullRefund', merchantReturnLink: abs('/regulations'),
};

const offer = (r, url) => ({
  '@type': 'Offer', url, priceCurrency: 'ILS', price: priceOf(r).toFixed(2),
  availability: inStock(r) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
  itemCondition: 'https://schema.org/NewCondition', shippingDetails, hasMerchantReturnPolicy: returnPolicy,
});

const bikeGroup = lang => {
  const url = abs(lang === 'en' ? '/en/bikes' : '/bikes');
  return {
    '@context': 'https://schema.org', '@type': 'ProductGroup',
    name: BIKE[lang].name, description: BIKE[lang].desc, brand: { '@type': 'Brand', name: BRAND },
    productGroupID: 'spinz-urban', url, variesBy: ['https://schema.org/color', 'https://schema.org/size'],
    hasVariant: bikes.map(r => {
      const [, color, size] = r.slug.split('-');
      return {
        '@type': 'Product', sku: r.slug,
        name: `${BIKE[lang].name} – ${COLORS[color][lang]}, ${lang === 'en' ? 'size' : 'מידה'} ${size}`,
        description: BIKE[lang].desc,
        image: abs(COLORS[color].image), color: COLORS[color][lang], size: `${size} (${SIZES[size]?.[lang] ?? ''})`,
        offers: offer(r, url),
      };
    }),
  };
};

const teeGroups = lang => Object.entries(TEES).map(([base, t]) => {
  const url = abs(lang === 'en' ? '/en/merch' : '/merch');
  return {
    '@context': 'https://schema.org', '@type': 'ProductGroup',
    name: `${BRAND} ${t.name}`, description: t[lang], brand: { '@type': 'Brand', name: BRAND },
    productGroupID: base, url, variesBy: ['https://schema.org/size'],
    hasVariant: tees.filter(r => r.slug.startsWith(base + '-')).map(r => {
      const size = r.slug.split('-').pop().toUpperCase();
      return { '@type': 'Product', sku: r.slug, name: `${BRAND} ${t.name} – ${t.color[lang]} ${size}`, description: t[lang],
               image: abs(t.image), color: t.color[lang], size, offers: offer(r, url) };
    }),
  };
});

const org = lang => [
  {
    '@context': 'https://schema.org', '@type': 'Organization', '@id': `${SITE}/#org`,
    name: BRAND, legalName: lang === 'en' ? 'SPINZ BIKES LTD' : 'אופני סיבוב בערבון מוגבל בע״מ',
    url: SITE, logo: abs('/favicon.svg'), email: 'info@spinzbikes.com',
    sameAs: ['https://www.instagram.com/spinzbikes/'],
    contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', email: 'info@spinzbikes.com',
                    url: 'https://wa.me/972557733300', areaServed: 'IL', availableLanguage: ['he', 'en'] },
  },
  { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: BRAND, url: SITE,
    inLanguage: lang === 'en' ? 'en' : 'he', publisher: { '@id': `${SITE}/#org` } },
];

// JSON בתוך <script>: "<" מקודד כדי שטקסט לא יסגור את התגית
const ld = data => `    <script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>\n`;
const inject = async (file, blocks) => {
  const html = await readFile(file, 'utf8');
  if (!html.includes('</head>')) { console.error(`build-google: אין </head> ב-${file}`); process.exit(1); }
  await writeFile(file, html.replace('</head>', blocks.map(ld).join('') + '  </head>'));
};

for (const lang of ['he', 'en']) {
  const pre = lang === 'en' ? 'dist/en' : 'dist';
  await inject(`${pre}/index.html`, [...org(lang), ...(bikes.length ? [bikeGroup(lang)] : [])]);
  if (bikes.length) await inject(`${pre}/bikes/index.html`, [bikeGroup(lang)]);
  if (tees.length) await inject(`${pre}/merch/index.html`, teeGroups(lang));
}

// ── פיד Google Merchant ─────────────────────────────────────────────
const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const item = f => `    <item>\n${Object.entries(f).map(([k, v]) =>
  k === 'g:shipping' ? `      <g:shipping><g:country>IL</g:country><g:price>0.00 ILS</g:price><g:min_handling_time>0</g:min_handling_time><g:max_handling_time>2</g:max_handling_time><g:min_transit_time>1</g:min_transit_time><g:max_transit_time>5</g:max_transit_time></g:shipping>`
  : `      <${k}>${x(v)}</${k}>`).join('\n')}\n    </item>`;

const items = [
  ...bikes.map(r => {
    const [, color, size] = r.slug.split('-');
    return item({
      'g:id': r.slug, 'g:item_group_id': 'spinz-urban',
      'g:title': `אופני עיר סינגל ספיד SPINZ Urban – ${COLORS[color].he}, מידה ${size}`,
      'g:description': `${BIKE.he.desc} מידה ${size} מתאימה ל${SIZES[size]?.he ?? ''}.`,
      'g:link': abs('/bikes'), 'g:image_link': abs(COLORS[color].image),
      'g:availability': inStock(r) ? 'in_stock' : 'out_of_stock', 'g:price': `${priceOf(r).toFixed(2)} ILS`,
      'g:condition': 'new', 'g:brand': BRAND, 'g:mpn': r.slug, 'g:identifier_exists': 'no',
      'g:google_product_category': '3214', 'g:product_type': 'אופניים > אופני עיר > סינגל ספיד',
      'g:color': COLORS[color].he, 'g:size': size, 'g:shipping': '',
    });
  }),
  ...tees.map(r => {
    const base = r.slug.replace(/-[a-z]+-[a-z]+$/, ''); const t = TEES[base]; const size = r.slug.split('-').pop().toUpperCase();
    return item({
      'g:id': r.slug, 'g:item_group_id': base,
      'g:title': `חולצת SPINZ ${t.name} – ${t.color.he}, מידה ${size}`, 'g:description': t.he,
      'g:link': abs('/merch'), 'g:image_link': abs(t.image),
      'g:availability': inStock(r) ? 'in_stock' : 'out_of_stock', 'g:price': `${priceOf(r).toFixed(2)} ILS`,
      'g:condition': 'new', 'g:brand': BRAND, 'g:mpn': r.slug, 'g:identifier_exists': 'no',
      'g:google_product_category': '212', 'g:product_type': 'ביגוד > חולצות',
      'g:color': t.color.he, 'g:size': size, 'g:age_group': 'adult', 'g:gender': 'unisex', 'g:shipping': '',
    });
  }),
];

if (items.length) {
  await writeFile('dist/merchant-feed.xml', `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>SPINZ</title>
    <link>${SITE}</link>
    <description>SPINZ – אופני עיר סינגל ספיד וביגוד</description>
${items.join('\n')}
  </channel>
</rss>
`);
}
console.log(`build-google: ${bikes.length} אופניים, ${tees.length} חולצות, merchant-feed.xml ${items.length ? 'נכתב' : 'לא נכתב'}`);
