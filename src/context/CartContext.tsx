import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { BikeModel } from '../data/models';
import { supabase } from '../lib/supabase';

export interface CartItem {
  model: BikeModel;
  quantity: number;
  colorId: string;
  colorLabel: string;
  colorSkuCode: string;
  size: string;
  /**
   * שורת המוצר שהפריט מתומחר לפיה. אופניים שנשמרו בעגלה לפני
   * שנוסף המרצ'נדייז אינם נושאים אותו, ולכן הוא אופציונלי והנוסחה
   * הישנה משמשת כברירת מחדל.
   */
  slug?: string;
  kind?: 'bike' | 'merch';
  /** כמה יחידות מהפריט הזה עוד נכנסות למכסת ההשקה, ומה המחיר המלא.
   *  בלעדיהם העגלה הציגה מחיר השקה לכל הכמות, בעוד השרת מתמחר רק
   *  את מה שבתוך המכסה. */
  presaleLeft?: number;
  fullPrice?: number;
}

/** ה-slug שהשרת מתמחר לפיו. חייב להיות זהה לשורה בטבלת products. */
export const itemSlug = (i: Pick<CartItem, 'slug' | 'colorId' | 'size'>) =>
  i.slug ?? `spinz-${i.colorId}-${i.size}`;

interface CartContextType {
  items: CartItem[];
  addItem: (
    model: BikeModel, colorId: string, colorLabel: string, colorSkuCode: string, size: string,
    opts?: { slug?: string; kind?: 'bike' | 'merch' },
  ) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  isOpen: boolean;
  /** קוד הקופון שהוזן. ההנחה עצמה מחושבת בשרת בלבד. */
  coupon: string;
  setCoupon: (code: string) => void;
  openCart: () => void;
  closeCart: () => void;
}

/** תקרת היחידות לשורה, כפי שהשרת אוכף אותה. */
export const MAX_PER_LINE = 5;

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('spinz-cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return parsed.filter((i: CartItem) => i.colorId && i.size);
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  // הקופון חי כאן ולא בקומפוננטה, כדי שיעבור מעמוד המוצר לצ׳קאאוט.
  //
  // בכוונה בזיכרון בלבד ולא בדפדפן: קוד ששורד רענון היה מופיע מוחל
  // מעצמו בביקור הבא, בלי שהלקוח הקליד דבר — וזו בדיוק הדרך לחיוב
  // לא צפוי, לשני הכיוונים. רענון מחזיר את המחיר המקורי.
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    localStorage.setItem('spinz-cart', JSON.stringify(items));
  }, [items]);

  // ריקון שנעשה מחוץ לקומפוננטה — למשל בעמוד תוצאת התשלום, אחרי
  // שהשרת אישר שהעסקה שולמה. בלי ההאזנה הזו העגלה שבמצב הרכיב הייתה
  // נכתבת בחזרה לאחסון, והמוצר היה חוזר להופיע אחרי שכבר שולם עליו.
  // מטפל גם בלשונית שנייה שפתוחה באותו זמן.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== 'spinz-cart') return;
      if (e.newValue === null) { setItems([]); setCoupon(''); return; }
      try {
        const next = JSON.parse(e.newValue);
        if (Array.isArray(next)) setItems(next);
      } catch { /* ערך פגום — משאירים את הקיים */ }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  /**
   * תמחור העגלה מול הטבלה.
   *
   * המחירים נקראים פעם אחת, והחלת התמחור רצה בכל שינוי בעגלה. קודם
   * שניהם רצו יחד פעם אחת בטעינה, ולכן פריט שנוסף אחריה נשאר בלי
   * מכסת ההשקה שנותרה לו — והעגלה הציגה מחיר השקה לכל הכמות.
   */
  const [pricing, setPricing] = useState<{
    presaleActive: boolean; presalePrice: number | null;
    rows: { slug: string; price: number | null; sale_price: number | null; presale_qty: number | null }[];
  } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data: settings }, { data: products }] = await Promise.all([
        supabase.from('site_settings').select('presale_active, presale_price').eq('id', 1).single(),
        supabase.from('products').select('slug, price, sale_price, presale_qty'),
      ]);
      if (!alive) return;
      setPricing({
        presaleActive: !!settings?.presale_active,
        presalePrice: settings?.presale_price ?? null,
        rows: (products ?? []) as never,
      });
    })();
    return () => { alive = false; };
  }, []);

  const pricingKey = pricing
    ? `${pricing.presaleActive}|${pricing.presalePrice}|${pricing.rows.length}`
    : '';

  useEffect(() => {
    if (!pricing) return;
    setItems(prev => {
      let changed = false;
      const next = prev.map(i => {
        const row = pricing.rows.find(r => r.slug === itemSlug(i));
        if (!row) return i;
        const full = row.sale_price ?? row.price ?? null;
        // מחיר ההשקה שייך לאופניים בלבד, וחל על המכסה שנשארה בלבד —
        // אותה נוסחה בדיוק שהשרת מתמחר לפיה.
        const inPresale = i.kind !== 'merch' && pricing.presaleActive;
        const left = inPresale ? Math.max(0, row.presale_qty ?? 0) : 0;
        const price = left > 0 ? (pricing.presalePrice ?? full) : full;
        if (price == null) return i;
        if (price === i.model.price && left === i.presaleLeft && (full ?? undefined) === i.fullPrice) return i;
        changed = true;
        return { ...i, model: { ...i.model, price }, presaleLeft: left, fullPrice: full ?? undefined };
      });
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingKey, items.map(i => `${itemSlug(i)}:${i.quantity}`).join('|')]);

  const addItem = (
    model: BikeModel, colorId: string, colorLabel: string, colorSkuCode: string, size: string,
    opts?: { slug?: string; kind?: 'bike' | 'merch' },
  ) => {
    setItems(prev => {
      const existing = prev.find(i => i.model.id === model.id);
      if (existing) {
        return prev.map(i => i.model.id === model.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, {
        model, quantity: 1, colorId, colorLabel, colorSkuCode, size,
        slug: opts?.slug, kind: opts?.kind ?? 'bike',
      }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.model.id !== id));
  };

  /**
   * השרת דוחה שורה של יותר מחמש יחידות (INVALID_QUANTITY), והעגלה
   * אפשרה להעלות בלי גבול. הלקוח היה מגיע לתשלום ונדחה בלי הסבר.
   */
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.model.id !== id));
    } else {
      const capped = Math.min(quantity, MAX_PER_LINE);
      setItems(prev => prev.map(i => i.model.id === id ? { ...i, quantity: capped } : i));
    }
  };

  const clearCart = () => setItems([]);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalCount, isOpen, coupon, setCoupon, openCart: () => setIsOpen(true), closeCart: () => setIsOpen(false) }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
