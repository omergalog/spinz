/**
 * הרשאת גישה לפונקציות, לפי מקור הבקשה.
 *
 * האתר מוגש מ-www.spinzbikes.com ומפנה אליו גם את מי שנכנס בלי
 * הקידומת. כרום מסתיר את www בשורת הכתובת, ולכן קל להניח שהמקור הוא
 * spinzbikes.com — ולהחזיר הרשאה לכתובת שאף דפדפן לא נמצא בה. התוצאה
 * היא בקשה שמצליחה בשרת ונחסמת אצל הלקוח.
 *
 * לכן ההרשאה אינה כתובת קבועה אלא רשימה, והתשובה מחזירה את המקור
 * שממנו הבקשה באמת הגיעה.
 */

const SITE = Deno.env.get('SITE_URL') ?? 'https://www.spinzbikes.com';

export const ALLOWED_ORIGINS = [
  SITE,
  'https://www.spinzbikes.com',
  'https://spinzbikes.com',
  'http://localhost:3000',
  'http://localhost:5173',
];

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? '';
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : SITE;

  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Headers': 'authorization, content-type, apikey',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Vary': 'Origin',
  };
}
