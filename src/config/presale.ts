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
  deadline: Date;
};

/** ברירת מחדל – מוצגת מיד עד שה-DB עונה (מונע הבהוב) */
export const PRESALE_DEFAULTS: PresaleSettings = {
  active: true,
  regularPrice: 1200,
  presalePrice: 1090,
  presaleUnits: 100,
  arrivalLabel: 'ספטמבר 2026',
  deadline: new Date('2026-09-30T23:59:59'),
};

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
      .select('presale_active, regular_price, presale_price, presale_units, arrival_label, deadline')
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
          deadline: data.deadline ? new Date(data.deadline) : PRESALE_DEFAULTS.deadline,
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
