/**
 * כתובת הלקוח, לצורך מכסות.
 *
 * x-forwarded-for היא רשימה שכל שרת בדרך מוסיף לה, והערך הראשון בה
 * הוא מה שהלקוח עצמו שלח — כלומר בוט יכול לכתוב שם כתובת אחרת בכל
 * בקשה ולעקוף מכסה לכתובת. cf-connecting-ip נכתב על ידי הרשת שבקצה
 * ודורס כל ערך שהגיע מהלקוח, ולכן הוא קודם.
 */
export function clientIp(req: Request): string {
  const cf = (req.headers.get('cf-connecting-ip') ?? '').trim();
  if (cf) return cf;
  return (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim();
}
