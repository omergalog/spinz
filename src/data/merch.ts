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
