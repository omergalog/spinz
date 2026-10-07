// ============================================================
//  SPINZ · הגדרות קמפיין הפרי-סייל
//  נשלט מהאדמין (טבלת site_settings ב-Supabase). הערכים כאן
//  הם ברירת מחדל / נפילה עד שההגדרות נטענות מהשרת.
// ============================================================

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export type PresaleSettings = {
  active: boolean;
  regularPrice: number;
  presalePrice: number;
  presaleUnits: number;
  arrivalLabel: string;
  /** סיבת ההנחה, כפי שהיא מוצגת ליד המחיר. נשלטת מהדשבורד. */
  discountLabel: string;
  deadline: Date;
  /** מספר התשלומים שהמסוף מאושר אליו. אותו ערך שקובע מה נגבה בפועל. */
  installments: number;
  /** רצפת הסכום לתשלום בודד, כפי שהיא נשלחת לטרנזילה. */
  minInstallment: number;
};

/** ברירת מחדל – מוצגת מיד עד שה-DB עונה (מונע הבהוב) */
export const PRESALE_DEFAULTS: PresaleSettings = {
  active: true,
  regularPrice: 1299,
  presalePrice: 1090,
  presaleUnits: 100,
  // הערכים כאן מוצגים בשבריר השנייה שלפני שהטבלה עונה, ולכן הם
  // חייבים להיות מה שבטבלה. ברירת מחדל ישנה הציגה ללקוח
  // "עד 10 תשלומים ₪109" ו"אוקטובר 2026" לפני שהמספר האמיתי נטען.
  arrivalLabel: 'נובמבר 2026',
  discountLabel: 'מחיר השקה',
  deadline: new Date('2026-10-31T23:59:59'),
  installments: 12,
  minInstallment: 1,
};

/**
 * מועד האספקה באנגלית.
 *
 * הערך נשמר בעברית בלבד ב-site_settings, והעמודים האנגליים הציגו
 * אותו כפי שהוא: "Estimated delivery: אוקטובר 2026". התרגום נעשה
 * כאן ולא בטבלה, כדי שיישאר מקור אמת אחד שמעדכנים ממנו.
 */
const MONTHS_EN: Record<string, string> = {
  'ינואר': 'January', 'פברואר': 'February', 'מרץ': 'March', 'אפריל': 'April',
  'מאי': 'May', 'יוני': 'June', 'יולי': 'July', 'אוגוסט': 'August',
  'ספטמבר': 'September', 'אוקטובר': 'October', 'נובמבר': 'November', 'דצמבר': 'December',
};

/** תווית האספקה בשפת העמוד. תווית שאינה חודש מוכר מוחזרת כמות שהיא. */
export function arrivalLabelIn(label: string, lang: string): string {
  if (lang !== 'en') return label;
  const [month, ...rest] = label.trim().split(/\s+/);
  const en = MONTHS_EN[month];
  return en ? [en, ...rest].join(' ') : label;
}

/** טקסטים קבועים (לא נשלטים מהאדמין) */
export const PRESALE_COPY = {
  barCta: 'להבטחת מקום',
};

/** מלאי לכל צבע – נפילה בלבד; באתר מוצג המלאי האמיתי מ-products */
const STOCK_FALLBACK: Record<string, number> = { mat: 14, beige: 11, olive: 9 };

/**
 * טוען את הגדרות הפרי-סייל מ-Supabase.
 * מחזיר את ברירת המחדל מיידית, ומעדכן כשה-DB עונה.
 */
export function usePresale(): PresaleSettings {
  const [settings, setSettings] = useState<PresaleSettings>(PRESALE_DEFAULTS);

  useEffect(() => {
    let alive = true;
    supabase
      .from('site_settings')
      .select('presale_active, regular_price, presale_price, presale_units, arrival_label, discount_label, deadline, max_installments, min_installment_amount')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (!alive || !data) return;
        setSettings({
          active: data.presale_active ?? PRESALE_DEFAULTS.active,
          regularPrice: data.regular_price ?? PRESALE_DEFAULTS.regularPrice,
          presalePrice: data.presale_price ?? PRESALE_DEFAULTS.presalePrice,
          presaleUnits: data.presale_units ?? PRESALE_DEFAULTS.presaleUnits,
          arrivalLabel: data.arrival_label ?? PRESALE_DEFAULTS.arrivalLabel,
          discountLabel: data.discount_label ?? PRESALE_DEFAULTS.discountLabel,
          deadline: data.deadline ? new Date(data.deadline) : PRESALE_DEFAULTS.deadline,
          // המספר שמוצג ללקוח והמספר שנשלח לטרנזילה חייבים להיות אחד.
          // קודם הוא היה כתוב קשיח בקוד, והבטיח 13 בעוד שנגבה תשלום אחד.
          installments: data.max_installments ?? PRESALE_DEFAULTS.installments,
          minInstallment: data.min_installment_amount ?? PRESALE_DEFAULTS.minInstallment,
        });
      });
    return () => { alive = false; };
  }, []);

  return settings;
}

export function stockFallback(colorId: string): number | null {
  const s = STOCK_FALLBACK[colorId];
  return typeof s === 'number' ? s : null;
}
