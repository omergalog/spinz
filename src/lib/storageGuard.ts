/**
 * אחסון דפדפן שאפשר לסמוך עליו שלא יזרוק.
 *
 * כשהדפדפן חוסם אחסון של אתרים (למשל כרום עם חסימת עוגיות), כבר הקריאה
 * של window.sessionStorage עצמה זורקת SecurityError — לא רק getItem.
 * ספריית Supabase קוראת אותה בבנאי של Realtime (phoenix:
 * `opts.sessionStorage || global.sessionStorage`), עוד לפני שקוד האתר רץ,
 * ובגרסה 2.101 אין דרך להעביר לה אחסון חלופי. התוצאה: עמוד ריק.
 *
 * לכן כאן, לפני כל ייבוא אחר, בודקים את שני האחסונים. אם הגישה זורקת
 * (או שהכתיבה זורקת), מחליפים את המאפיין בחלון באחסון בזיכרון. האתר
 * עובד כרגיל, ופשוט לא זוכר כלום אחרי רענון.
 *
 * חייב להיות הייבוא הראשון ב-main.tsx.
 */

class MemoryStorage implements Storage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  clear() { this.m.clear(); }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  removeItem(k: string) { this.m.delete(k); }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
}

function usable(name: 'localStorage' | 'sessionStorage'): boolean {
  try {
    const s = window[name];
    if (!s) return false;
    const probe = '__spinz_probe__';
    s.setItem(probe, '1');
    s.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

export const storageFallback: { localStorage: boolean; sessionStorage: boolean } = {
  localStorage: false,
  sessionStorage: false,
};

if (typeof window !== 'undefined') {
  for (const name of ['localStorage', 'sessionStorage'] as const) {
    if (usable(name)) continue;
    try {
      Object.defineProperty(window, name, { value: new MemoryStorage(), configurable: true, writable: false });
      storageFallback[name] = true;
    } catch {
      // לא הצלחנו להחליף. הקוד של האתר עצמו עטוף ב-try, אבל ספריות לא.
    }
  }
}
