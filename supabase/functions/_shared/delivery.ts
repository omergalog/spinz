/**
 * אופן הקבלה של הזמנה.
 *
 * הזמנת איסוף עצמי נשמרת בעמודת ההערות של הסל כטקסט קבוע, כי לסל אין
 * עמודה נפרדת לאופן הקבלה. הטקסט נקבע כאן בלבד: האתר שולח רק
 * delivery: 'pickup', והשרת הוא שכותב את הנוסח. כך מייל האישור מזהה
 * איסוף לפי אותו ערך שנכתב, ולא לפי עותק שלו שעלול להשתנות בנפרד.
 */
export const PICKUP_NOTES = {
  he: 'איסוף עצמי — כפר ויתקין, בתיאום מראש',
  en: 'Self pickup — Kfar Vitkin, by prior arrangement',
} as const;

export const isPickup = (notes?: string | null) =>
  !!notes && Object.values(PICKUP_NOTES).includes(notes.trim() as never);

/** חודש ההגעה נשמר בעברית בלבד ב-site_settings. */
const MONTHS_EN: Record<string, string> = {
  'ינואר': 'January', 'פברואר': 'February', 'מרץ': 'March', 'אפריל': 'April',
  'מאי': 'May', 'יוני': 'June', 'יולי': 'July', 'אוגוסט': 'August',
  'ספטמבר': 'September', 'אוקטובר': 'October', 'נובמבר': 'November', 'דצמבר': 'December',
};

export function arrivalIn(label: string, lang: string): string {
  if (lang !== 'en') return label;
  const [month, ...rest] = label.trim().split(/\s+/);
  const en = MONTHS_EN[month];
  return en ? [en, ...rest].join(' ') : label;
}
