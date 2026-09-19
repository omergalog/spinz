/**
 * קטלוג המרצ'נדייז.
 *
 * ה-slug שנבנה כאן חייב להיות זהה לשורה בטבלת products, כי הוא מה
 * שהשרת מתמחר לפיו: `${slugBase}-${color.id}-${size.id}`. שינוי מזהה
 * של צבע או מידה מנתק את המוצר מהמחיר והמלאי שלו.
 *
 * התמונות כאן הן מצייני מקום עד שיגיעו הצילומים.
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
    id: 'tee',
    slugBase: 'merch-tee',
    name: 'חולצת SPINZ',
    nameEn: 'SPINZ Tee',
    tagline: 'כותנה סרוקה, גזרה רגילה',
    taglineEn: 'Combed cotton, regular fit',
    price: 149,
    colors: [
      { id: 'black', label: 'שחור', labelEn: 'Black', hex: '#1A1A1A', image: '/assets/merch-tee-black.jpg' },
      { id: 'white', label: 'לבן',  labelEn: 'White', hex: '#F2F0EB', image: '/assets/merch-tee-white.jpg' },
    ],
    sizes: merchSizes,
  },
];

export const merchSlug = (slugBase: string, colorId: string, sizeId: string) =>
  `${slugBase}-${colorId}-${sizeId}`;
