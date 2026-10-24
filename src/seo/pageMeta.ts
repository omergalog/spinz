import { getDict } from '../i18n/dict';
import { getGuide, guides } from '../data/guides';
import type { Lang } from '../i18n/LanguageContext';

/**
 * כותרת ותיאור לכל עמוד פנימי, ב-HTML הראשוני.
 *
 * הסורקים של וואטסאפ, פייסבוק וטלגרם לא מריצים JavaScript. כל העמודים
 * הוגשו מאותו index.html, ולכן קישור ל-/faq או ל-/en/cancel-order הוצג
 * עם הכותרת וה-og:url של דף הבית. scripts/build-meta.mjs טוען את הקובץ
 * הזה בזמן הבנייה וכותב עותק של index.html לכל נתיב.
 *
 * המקורות זהים למה ש-PageShell ו-GuideDetail כותבים בדפדפן. בעמודים
 * המשפטיים הכותרת כתובה בקוד העמוד עצמו, ואת הקוד שם לא נוגעים (הנוסח
 * העברי מחייב), ולכן היא מועתקת כאן. test-harness/page-meta-check.mjs
 * משווה כל נתיב מול מה שהאפליקציה כותבת בפועל.
 */

export const PAGES = ['bikes', 'merch', 'specs', 'sizes', 'faq', 'guides', 'story', 'gallery',
  'community', 'reviews', 'contact', 'terms', 'regulations', 'presale-terms', 'cancel-order', 'accessibility'] as const;

export const GUIDE_SLUGS = guides.map(g => g.slug);

type Meta = { title: string; description: string };

// כמו PageShell: נקודה בסוף כותרת נחתכת, ו-" | SPINZ" מתווסף.
const shell = (title: string, sub: string): Meta => ({
  title: `${title.replace(/[.。]\s*$/, '').trim()} | SPINZ`,
  description: sub.trim(),
});

const LEGAL: Record<Lang, Record<'terms' | 'presale-terms' | 'regulations', [string, string] | null>> = {
  he: {
    terms: ['מדיניות פרטיות', 'איזה מידע אנחנו אוספים, למה, אצל מי הוא נשמר ולכמה זמן.'],
    'presale-terms': ['תנאי מכירה מוקדמת', 'מה חשוב לדעת לפני שמזמינים במחיר השקה: מועדי אספקה, זכות ביטול והחזרים.'],
    regulations: ['תקנון ותנאי שימוש', 'ההסכם המשפטי המלא בין SPINZ ללקוחותיה: הרכבה ובטיחות, אחריות, ביטול עסקה, משלוח וסמכות שיפוט.'],
  },
  en: {
    terms: ['Privacy Policy', 'What information we collect, why, where it is kept and for how long.'],
    'presale-terms': ['Pre-Sale Terms', 'What to know before ordering at the launch price: delivery dates, right of cancellation and refunds.'],
    regulations: null, // RegulationsEn קורא מהמילון
  },
};

/** path: נתיב בלי קידומת שפה, למשל 'faq' או 'guides/bike-assembly'. */
export function pageMeta(lang: Lang, path: string): Meta | null {
  const t = getDict(lang);
  if (path.startsWith('guides/')) {
    const g = getGuide(path.slice('guides/'.length), lang);
    return g ? { title: g.metaTitle, description: g.metaDescription } : null;
  }
  if (path in LEGAL[lang]) {
    const l = LEGAL[lang][path as keyof (typeof LEGAL)['he']];
    if (l) return shell(l[0], l[1]);
  }
  const p = t.pages;
  switch (path) {
    case 'bikes': return shell(p.bikes.title, p.bikes.sub);
    case 'merch': return shell(p.merch.title, p.merch.sub);
    case 'specs': return shell(p.specs.title, p.specs.sub);
    case 'sizes': return shell(p.sizes.title, p.sizes.sub);
    case 'faq': return shell(p.faq.title, p.faq.sub);
    case 'guides': return shell(p.guides.title, p.guides.sub);
    case 'story': return shell(p.story.title, p.story.sub);
    case 'gallery': return shell(p.gallery.title, p.gallery.sub);
    case 'community': return shell(p.community.title, p.community.sub);
    case 'reviews': return shell(t.reviews.title, t.reviews.pageSub);
    case 'contact': return shell(p.contact.title, p.contact.sub);
    case 'regulations': return shell(p.regulations.title, p.regulations.sub);
    case 'cancel-order': return shell(p.cancel.title, p.cancel.sub);
    case 'accessibility': return shell(p.accessibility.title, p.accessibility.sub);
  }
  return null;
}
