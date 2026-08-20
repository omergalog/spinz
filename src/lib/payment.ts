/**
 * צד הלקוח של הסליקה.
 *
 * כאן אין מחירים ואין מפתחות. הדפדפן מבקש מהשרת לפתוח סל, מקבל בחזרה
 * טופס מוכן, ומגיש אותו לתוך ה-iframe של טרנזילה. פרטי הכרטיס נכנסים
 * בתוך ה-iframe ולעולם אינם עוברים דרך העמוד שלנו — זה מה שמשאיר את
 * החברה מחוץ לתקן PCI המחמיר.
 */
import { supabase } from './supabase';

const FUNCTIONS = 'https://ayrwfyutpbkepnyjkyop.supabase.co/functions/v1';

export type CheckoutItem = {
  color: string;
  size: string;
  quantity: number;
  colorSkuCode: string;
};

export type CheckoutSession = {
  session_id: string;
  total: number;
  action: string;
  fields: Record<string, string>;
};

export class OutOfStockError extends Error {
  constructor(public left: number) { super('OUT_OF_STOCK'); }
}

export async function openCheckout(input: {
  items: CheckoutItem[];
  name: string;
  phone: string;
  email?: string;
  address?: string;
}): Promise<CheckoutSession> {
  const { data: { session } } = await supabase.auth.getSession();

  const res = await fetch(`${FUNCTIONS}/tranzila-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // המפתח הציבורי של Supabase, כפי שכל קריאה אחרת מהאתר שולחת
      apikey: (supabase as unknown as { supabaseKey: string }).supabaseKey,
      Authorization: `Bearer ${session?.access_token ??
        (supabase as unknown as { supabaseKey: string }).supabaseKey}`,
    },
    body: JSON.stringify(input),
  });

  const body = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (body?.error === 'OUT_OF_STOCK') throw new OutOfStockError(Number(body.left ?? 0));
    throw new Error(body?.error ?? 'SERVER');
  }
  return body as CheckoutSession;
}

/**
 * מגיש את הטופס אל תוך ה-iframe.
 *
 * טרנזילה ממליצה על POST ולא על GET, ולכן זה טופס מוסתר ולא כתובת עם
 * פרמטרים: כך הנתונים אינם נשמרים בהיסטוריית הדפדפן ואינם מודלפים
 * בכותרת Referer.
 */
export function submitToIframe(s: CheckoutSession, iframeName: string) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = s.action;
  form.target = iframeName;
  form.style.display = 'none';

  for (const [name, value] of Object.entries(s.fields)) {
    if (value === '') continue;
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export type PaymentStatus =
  | 'pending' | 'paid' | 'expired' | 'failed' | 'overbooked';

export async function fetchStatus(sessionId: string): Promise<{
  status: PaymentStatus; total: number; last4?: string; orders: number;
} | null> {
  const res = await fetch(`${FUNCTIONS}/tranzila-status?s=${encodeURIComponent(sessionId)}`);
  if (!res.ok) return null;
  return res.json();
}
