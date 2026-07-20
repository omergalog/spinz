// ============================================================
//  SPINZ · פרטי החברה — מקור אמת יחיד
//  כל עמוד משפטי (תנאים, פרטיות, נגישות, פרי-סייל) מושך מכאן.
//  שינוי כאן = שינוי בכל האתר.
// ============================================================

export const COMPANY = {
  /** שם רשום — תעודת התאגדות 13/05/2026 */
  legalNameHe: 'אופני סיבוב בערבון מוגבל בע״מ',
  legalNameEn: 'SPINZ BIKES LTD',
  companyNumber: '517343661',
  address: 'התמר 137, בית חרות',

  /** כתובת יצירת קשר רשמית */
  email: 'info@spinzbikes.com',
  phone: '052-756-5262',
  phoneE164: '972527565262',
} as const;

/** מחרוזת מלאה לשימוש בסעיפי "פרטי החברה" */
export const COMPANY_LINE =
  `${COMPANY.legalNameHe} (${COMPANY.legalNameEn}), ח.פ. ${COMPANY.companyNumber}, ${COMPANY.address}`;
