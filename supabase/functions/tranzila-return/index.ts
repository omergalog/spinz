/**
 * מקבל את החזרה של הלקוח מעמוד התשלום ומחזיר אותו לאתר.
 *
 * הדף הזה נטען בתוך המסגרת שבה בוצע התשלום, ולכן הוא אינו יכול פשוט
 * להפנות: הפניה רגילה הייתה טוענת את האתר בתוך המסגרת, והאתר חוסם
 * את עצמו מלהיטען כך (frame-ancestors 'none'). הלקוח היה רואה מסך
 * ריק מיד אחרי שחויב.
 *
 * לכן במקום הפניה מוחזר דף זעיר שמודיע לעמוד שמעליו שהתשלום הסתיים,
 * והעמוד עצמו מנווט. שלוש דרכים, מהבטוחה לגסה, כי כישלון כאן מתרחש
 * בדיוק אחרי שנלקח כסף:
 *   1. הודעה לחלון האב — עובד גם בין מקורות שונים
 *   2. ניווט של החלון העליון — עשוי להיחסם בלי אינטראקציה
 *   3. קישור גלוי, אם שני הראשונים נכשלו
 *
 * זו אינה נקודת האמת. ההזמנה נוצרת ב-tranzila-notify בלבד.
 */
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { ALLOWED_ORIGINS } from '../_shared/cors.ts';

const SITE = Deno.env.get('SITE_URL') ?? 'https://spinzbikes.com';

const page = (target: string, outcome: string, sessionId: string) => `<!doctype html>
<html lang="he" dir="rtl"><head><meta charset="utf-8">
<title>מעבירים אותך חזרה…</title>
<style>
  body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;
       font-family:Arial,Helvetica,sans-serif;background:#F5F2EC;color:#1C1C1C;text-align:center}
  a{color:#8A6D3B;font-weight:700}
</style></head>
<body>
  <div>
    <p>מעבירים אותך חזרה לאתר…</p>
    <p><a id="go" href="${target}" target="_top">להמשך לחצו כאן</a></p>
  </div>
<script>
(function () {
  var target = ${JSON.stringify(target)};
  // ההודעה נשלחת לכל המקורות המורשים ולא לאחד. הדפדפן מוסר אותה רק
  // למקור שתואם באמת, והשאר נזרקות בשקט — כך הודעה אינה הולכת לאיבוד
  // רק בגלל www.
  var msg = { source: 'spinz-tranzila', outcome: ${JSON.stringify(outcome)},
              sessionId: ${JSON.stringify(sessionId)}, url: target };
  ${JSON.stringify(ALLOWED_ORIGINS)}.forEach(function (o) {
    try { window.parent.postMessage(msg, o); } catch (e) {}
  });
  try { window.top.location.replace(target); } catch (e) {}
})();
</script>
</body></html>`;

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const outcome = url.searchParams.get('r') === 'fail' ? 'failed' : 'success';

  let payload: Record<string, string> = {};
  try {
    const raw = await req.text();
    payload = Object.fromEntries(new URLSearchParams(raw || url.search));
  } catch { /* חזרה בלי גוף — עדיין מחזירים את הלקוח */ }

  const sessionId = url.searchParams.get('s') || payload.sessionid || '';

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // הכתובת ציבורית. רושמים רק כשהמזהה שייך לסל אמיתי, כדי שלא יהיה
    // כאן ערוץ להצפת הטבלה.
    const valid = /^[0-9a-f-]{36}$/i.test(sessionId) &&
      !!(await db.from('checkout_sessions').select('id').eq('id', sessionId).maybeSingle()).data;

    if (valid) {
      await db.from('payment_events').insert({
        session_id: sessionId,
        source: outcome === 'failed' ? 'fail' : 'success',
        payload,
        note: 'הלקוח חזר מעמוד התשלום',
      });
    }
  } catch (e) {
    console.error('return log', e);
  }

  const to = new URL(`${SITE}/order/${outcome}`);
  if (sessionId) to.searchParams.set('s', sessionId);

  return new Response(page(to.toString(), outcome, sessionId), {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
});
