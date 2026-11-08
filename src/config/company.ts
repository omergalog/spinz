// ============================================================
//  SPINZ · פרטי החברה – מקור אמת יחיד
//  כל עמוד משפטי (תנאים, פרטיות, נגישות, פרי-סייל) מושך מכאן.
//  שינוי כאן = שינוי בכל האתר.
// ============================================================

export const COMPANY = {
  /** שם רשום – תעודת התאגדות 13/05/2026 */
  legalNameHe: 'אופני סיבוב בערבון מוגבל בע״מ',
  legalNameEn: 'SPINZ BIKES LTD',
  companyNumber: '517343661',
  address: 'התמר 137, בית חרות',
  /** אותה כתובת בתעתיק, לעמודים האנגליים. הכתובת הרשומה נשארת העברית. */
  addressEn: '137 HaTamar St., Beit Herut',

  /** כתובת יצירת קשר רשמית */
  email: 'info@spinzbikes.com',
  /**
   * מספר העסק (מ-8.11.2026). **וואטסאפ בלבד, בלי שיחות** — ולכן באתר
   * ובמיילים הוא מוצג כ"וואטסאפ" ומקשר לצ'אט, לא ל-tel:. אם יתווסף קו
   * לשיחות, מוסיפים שדה נפרד ומחזירים את "טלפון".
   */
  phone: '055-773-3300',
  phoneE164: '972557733300',
  whatsappE164: '972557733300',

  /** רכז הנגישות. מוצג בהצהרת הנגישות, עם הטלפון והמייל שלמעלה. */
  accessibilityCoordinator: 'עומר גל',
  accessibilityCoordinatorEn: 'Omer Gal',
} as const;

/** מחרוזת מלאה לשימוש בסעיפי "פרטי החברה" */
export const COMPANY_LINE =
  `${COMPANY.legalNameHe} (${COMPANY.legalNameEn}), ח.פ. ${COMPANY.companyNumber}, ${COMPANY.address}`;

/** אותה מחרוזת באנגלית — השם הרשום בעברית נשאר בסוגריים, כנדרש במסמך משפטי. */
export const COMPANY_LINE_EN =
  `${COMPANY.legalNameEn} (${COMPANY.legalNameHe}), company no. ${COMPANY.companyNumber}, ${COMPANY.addressEn}`;

/**
 * חשבון האינסטגרם. null = עוד אין חשבון פעיל, וכל הקישורים לאינסטגרם באתר
 * מוסתרים (7.11.2026: הקישור הוביל לחשבון שלא קיים). כשהחשבון נפתח,
 * ממלאים כאן — והכפתורים חוזרים בפוטר, ביצירת קשר, בטופס הלידים ובקהילה.
 */
export const INSTAGRAM: { url: string; handle: string } | null = null;
