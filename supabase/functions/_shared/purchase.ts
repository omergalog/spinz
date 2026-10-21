/**
 * רכישה: מזהה שחי מעבר לחלון התשלום, כדי שלחיצה כפולה, רענון או
 * לשונית שנייה לא ייצרו ניסיון חיוב נוסף על אותה קנייה.
 *
 * הדפדפן מחזיק את המזהה ואת סוד הבעלות. השרת שומר רק את ה-hash של
 * הסוד, ולכן גם מי שקורא את טבלת הרכישות אינו יכול להתחזות ללקוח.
 * פרטי הזמנה (כתובת, ספרות כרטיס, סכום) מוחזרים רק למי שמחזיק בסוד.
 */

type Db = { from: (t: string) => any };

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

export function newToken(): string {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return [...b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** האם הסוד שייך לרכישה שהסל הזה נוצר בה. */
export async function ownsSession(db: Db, purchaseKey: string | null, token: string): Promise<boolean> {
  if (!purchaseKey || !token || token.length < 32 || token.length > 128) return false;
  const { data } = await db.from('purchases').select('owner_hash').eq('key', purchaseKey).maybeSingle();
  if (!data?.owner_hash) return false;
  return data.owner_hash === await sha256Hex(token);
}
