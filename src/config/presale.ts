// ============================================================
//  SPINZ · הגדרות קמפיין הפרי-סייל
//  כל השליטה על הקמפיין ממקום אחד. שנה כאן — משתנה בכל האתר.
// ============================================================

export const PRESALE = {
  /** מתג ראשי — כבה כדי לחזור למצב אתר רגיל */
  active: true,

  /** מחירים (בשקלים) */
  regularPrice: 1200,
  presalePrice: 1090,

  /** תאריך יעד — סוף הפרי-סייל / הגעת הסחורה (חודש 0-11) */
  arrivalLabel: 'ספטמבר 2026',
  deadline: new Date('2026-09-30T23:59:59'),

  /** מלאי מוצג לכל צבע (id → כמות שנשארה). ערוך ידנית ככל שנמכר. */
  stockByColor: {
    mat:   14,
    beige: 11,
    olive: 9,
  } as Record<string, number>,

  /** מכסת מחיר ההשקה */
  presaleUnits: 100,

  /** טקסטים */
  barText: 'spinz. Pre-Sale — מחיר השקה ל-100 הראשונים',
  barCta: 'להבטחת מקום',
} as const;

export function stockFor(colorId: string): number | null {
  if (!PRESALE.active) return null;
  const s = PRESALE.stockByColor[colorId];
  return typeof s === 'number' ? s : null;
}
