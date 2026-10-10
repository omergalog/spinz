/**
 * קטלוג המרצ'נדייז.
 *
 * ה-slug שנבנה כאן חייב להיות זהה לשורה בטבלת products, כי הוא מה
 * שהשרת מתמחר לפיו: `${slugBase}-${color.id}-${size.id}`. שינוי מזהה
 * של צבע או מידה מנתק את המוצר מהמחיר והמלאי שלו.
 */

export interface MerchColor {
  id: string;
  label: string;
  labelEn: string;
  hex: string;
  image: string;
}

export interface MerchSize {
  id: string;
  label: string;
}

export interface MerchProduct {
  id: string;
  /** מוצר שטרם נפתח למכירה. "אזל" אומר שהיה ונגמר, וזה לא המצב. */
  comingSoon?: boolean;
  slugBase: string;
  name: string;
  nameEn: string;
  tagline: string;
  taglineEn: string;
  price: number;
  colors: MerchColor[];
  sizes: MerchSize[];
}

export const merchSizes: MerchSize[] = [
  { id: 's',  label: 'S'  },
  { id: 'm',  label: 'M'  },
  { id: 'l',  label: 'L'  },
  { id: 'xl', label: 'XL' },
];

export const merchProducts: MerchProduct[] = [
  {
    id: 'bauhaus',
    comingSoon: true,
    slugBase: 'merch-bauhaus',
    name: 'חולצת באוהאוס',
    nameEn: 'Bauhaus Tee',
    tagline: 'הדפס קווי של בניין תל אביבי. גזרה אוברסייז',
    taglineEn: 'A line print of a Tel Aviv building. Oversized fit',
    price: 149,
    colors: [
      { id: 'white', label: 'לבן', labelEn: 'White', hex: '#F2F0EB',
        image: '/assets/merch-tee-bauhaus-white.jpg' },
    ],
    sizes: merchSizes,
  },
  {
    id: 'blueprint',
    comingSoon: true,
    slugBase: 'merch-blueprint',
    name: 'חולצת שרטוט',
    nameEn: 'Blueprint Tee',
    tagline: 'שרטוט הנדסי של SPINZ. גזרה אוברסייז',
    taglineEn: 'The SPINZ engineering drawing. Oversized fit',
    price: 149,
    colors: [
      { id: 'black', label: 'שחור', labelEn: 'Black', hex: '#1A1A1A',
        image: '/assets/merch-tee-blueprint-black.webp' },
    ],
    sizes: merchSizes,
  },
];

export const merchSlug = (slugBase: string, colorId: string, sizeId: string) =>
  `${slugBase}-${colorId}-${sizeId}`;

/**
 * שם התצוגה של פריט מרצ'נדייז, בשפה הנוכחית.
 *
 * העגלה שמרה את השם כפי שהיה ברגע ההוספה, ולכן מעבר לאנגלית הותיר
 * שם בעברית בתוך עגלה אנגלית. מכאן הוא נבנה מחדש בכל רינדור לפי
 * ה-slug, שהוא ממילא מה שמזהה את השורה גם בשרת.
 * מחזיר null ל-slug שאינו בקטלוג, והקורא נופל לשם השמור.
 */
export function merchLabel(slug: string, lang: string): string | null {
  for (const p of merchProducts) {
    if (!slug.startsWith(`${p.slugBase}-`)) continue;
    const rest = slug.slice(p.slugBase.length + 1);
    for (const c of p.colors) {
      if (!rest.startsWith(`${c.id}-`)) continue;
      const sizeId = rest.slice(c.id.length + 1);
      const s = p.sizes.find(x => x.id === sizeId);
      if (!s) continue;
      const name  = lang === 'en' ? p.nameEn : p.name;
      const color = lang === 'en' ? c.labelEn : c.label;
      return `${name} — ${color} ${s.label}`;
    }
  }
  return null;
}
