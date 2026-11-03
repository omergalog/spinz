/**
 * שיוך הסל למקור התנועה, ברגע פתיחת התשלום.
 *
 * הדפדפן שולח את הכניסה המתויגת האחרונה (קישור או UTM) ואת מזהי המעקב, רק
 * אצל מי שאישר עוגיות מדידה. כאן הערכים מאומתים, נבדק שהכניסה בתוך חלון
 * השיוך, והתוצאה נשמרת על הסל כתמונת מצב: שינוי קישור או הגדרה בעתיד לא
 * ישכתב מכירה שכבר נעשתה.
 *
 * הרכישה עצמה נקבעת בנפרד: הסל מסומן paid רק אחרי אימות מטרנזילה. לכן
 * הכתיבה כאן אף פעם לא חוסמת, לא מעכבת ולא מכשילה תשלום. היא רצה אחרי
 * התשובה (waitUntil), וכל שגיאה נבלעת ונרשמת ביומן.
 */
// deno-lint-ignore-file no-explicit-any

const CODE = /^[a-z0-9][a-z0-9-]{0,39}$/;
const WORD = /^[\w.-]{1,80}$/;
const UUID = /^[0-9a-f-]{36}$/;

export type AttributionInput = {
  ref?: unknown; us?: unknown; um?: unknown; uc?: unknown;
  at?: unknown; vid?: unknown; sid?: unknown; test?: unknown;
};

const pick = (v: unknown, re: RegExp) => (typeof v === 'string' && re.test(v) ? v : null);

export async function recordAttribution(db: any, sessionId: string, raw: unknown, origin: string): Promise<void> {
  const a = (raw && typeof raw === 'object' ? raw : {}) as AttributionInput;
  const isLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const isTest = a.test === true || isLocal;

  const { data: s } = await db.from('analytics_settings')
    .select('mode, attribution_days').eq('id', 1).maybeSingle();
  if (!s) return;                       // הטבלה לא קיימת עדיין: לא נוגעים בכלום
  const env = isTest ? 'test' : s.mode === 'live' ? 'live' : 'prelaunch';

  const ref = pick(a.ref, CODE);
  const us = pick(a.us, WORD)?.toLowerCase() ?? null;
  const at = typeof a.at === 'number' && Number.isFinite(a.at) ? a.at : null;
  const ageDays = at ? (Date.now() - at) / 86_400_000 : null;
  const inWindow = !!(ref || us) && ageDays !== null && ageDays >= -0.01 && ageDays <= s.attribution_days;

  let snapshot: Record<string, unknown> | null = null;
  if (inWindow) {
    let link: any = null;
    if (ref) {
      const { data } = await db.from('tracking_links')
        .select('id, code, kind, source, creator, label').eq('code', ref).maybeSingle();
      link = data ?? null;
    }
    snapshot = {
      source_key: link ? `link:${link.id}` : ref ? `ref:${ref}` : `utm:${us}`,
      link_id: link?.id ?? null, code: link?.code ?? ref, kind: link?.kind ?? null,
      source: link?.source ?? us, creator: link?.creator ?? null, label: link?.label ?? null,
      utm_source: us, utm_medium: pick(a.um, WORD), utm_campaign: pick(a.uc, WORD),
      entered_at: new Date(at!).toISOString(), window_days: s.attribution_days,
    };
  }
  const vid = pick(a.vid, UUID), sid = pick(a.sid, UUID);
  if (sid || vid) snapshot = { ...(snapshot ?? { source_key: 'unattributed' }), visitor_id: vid, session_id: sid };

  const { error } = await db.from('checkout_sessions')
    .update({ attribution: snapshot, analytics_env: env }).eq('id', sessionId);
  if (error) console.error('attribution update', error.message);
}

/** מריץ אחרי התשובה. במקום שאין בו waitUntil (בדיקות מקומיות): ברקע, בלי לחכות. */
export function afterResponse(task: Promise<void>): void {
  const guarded = task.catch(e => console.error('attribution', (e as Error).message));
  (globalThis as any).EdgeRuntime?.waitUntil?.(guarded);
}
