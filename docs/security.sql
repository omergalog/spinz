-- ============================================================
-- SPINZ — נעילת בסיס הנתונים (Supabase)
-- להריץ ב: Supabase → SQL Editor → New query → Run
--
-- בטוח להריץ שוב ושוב. הסקריפט מדלג לבד על טבלאות שלא קיימות,
-- ולכן לא ייעצר באמצע ולא ישאיר טבלה נעולה בלי הרשאות.
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. מודרציה לביקורות
-- ------------------------------------------------------------
alter table public.reviews
  add column if not exists approved boolean not null default false;

-- ביקורות שכבר קיימות — מאשר כדי שלא ייעלמו מהאתר.
-- אם תעדיף לעבור עליהן ידנית באדמין, מחק את השורה הבאה.
update public.reviews set approved = true where approved = false;


-- ------------------------------------------------------------
-- 2. הפעלת RLS על כל טבלה שקיימת בסכימה הציבורית
--    (מדלג בשקט על טבלה שלא קיימת — למשל receipts)
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    -- מול האתר הציבורי
    'leads','newsletter','reviews','cancellations','orders','products','site_settings',
    -- אדמין בלבד (כולל כל הפיננסי)
    'china_expenses','china_settlements','personal_expenses','shared_expenses',
    'shared_settlements','inventory_log','skus','survey_responses','receipts'
  ] loop
    if to_regclass('public.' || quote_ident(t)) is not null then
      execute format('alter table public.%I enable row level security', t);
      -- הרשאות מלאות למשתמש מחובר (האדמין מתחבר עם Supabase Auth)
      execute format('drop policy if exists "admin full access" on public.%I', t);
      execute format(
        'create policy "admin full access" on public.%I
           for all to authenticated using (true) with check (true)', t);
    end if;
  end loop;
end $$;


-- ------------------------------------------------------------
-- 3. מה מותר לגולש אנונימי — ורק זה
--    כל טבלה שלא מופיעה כאן חסומה לחלוטין בפניו.
-- ------------------------------------------------------------

-- ► השארת פרטים: מותר לכתוב, אסור לקרוא.
drop policy if exists "anon can submit leads" on public.leads;
create policy "anon can submit leads" on public.leads
  for insert to anon with check (true);

drop policy if exists "anon can subscribe" on public.newsletter;
create policy "anon can subscribe" on public.newsletter
  for insert to anon with check (true);

drop policy if exists "anon can request cancellation" on public.cancellations;
create policy "anon can request cancellation" on public.cancellations
  for insert to anon with check (true);

-- ► ביקורות: מותר לשלוח (תמיד כלא-מאושרת), ולקרוא רק מאושרות.
drop policy if exists "anon can submit reviews" on public.reviews;
create policy "anon can submit reviews" on public.reviews
  for insert to anon with check (approved = false);

drop policy if exists "anyone reads approved reviews" on public.reviews;
create policy "anyone reads approved reviews" on public.reviews
  for select to anon using (approved = true);

-- ► קטלוג: קריאה בלבד (מחירים ומלאי מוצגים באתר).
drop policy if exists "anyone reads products" on public.products;
create policy "anyone reads products" on public.products
  for select to anon using (true);

drop policy if exists "anyone reads settings" on public.site_settings;
create policy "anyone reads settings" on public.site_settings
  for select to anon using (true);

-- ► סקר הצבעים: מותר לענות בלבד (אם הסקר עדיין פעיל באתר).
drop policy if exists "anon can answer survey" on public.survey_responses;
create policy "anon can answer survey" on public.survey_responses
  for insert to anon with check (true);

-- ► הזמנות והכספים: אין שום מדיניות ל-anon = חסום לחלוטין.
--   הזמנה נוצרת רק דרך place_order, שרצה כ-security definer.

commit;


-- ============================================================
-- בדיקה — להריץ אחרי ה-COMMIT ולהסתכל על הפלט
-- ============================================================
select
  c.relname                                          as "טבלה",
  c.relrowsecurity                                   as "rls_enabled",
  count(pol.polname) filter (where pol.polroles::text like '%anon%')          as "הרשאות_לגולש",
  count(pol.polname) filter (where pol.polroles::text not like '%anon%')      as "הרשאות_לאדמין"
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy pol on pol.polrelid = c.oid
where n.nspname = 'public' and c.relkind = 'r'
group by c.relname, c.relrowsecurity
order by c.relrowsecurity, c.relname;


-- ============================================================
-- שלב 2 (הורץ 25.7.2026) — הסרת מדיניות ישנות שנתנו ל-PUBLIC
-- גישה מלאה. מדיניות ב-Postgres מתחברות ב-OR, ולכן מדיניות
-- פתוחה אחת ביטלה את כל ההגבלות שהוגדרו מעליה.
-- ============================================================
begin;

drop policy if exists "all access" on public.china_expenses;
drop policy if exists "all access" on public.china_settlements;
drop policy if exists "all access" on public.personal_expenses;
drop policy if exists "all access" on public.shared_expenses;
drop policy if exists "allow all"  on public.shared_settlements;
drop policy if exists "authenticated users can do everything" on public.skus;
drop policy if exists "read only"  on public.inventory_log;

-- הזמנות נוצרות רק דרך place_order (security definer)
drop policy if exists "read own"             on public.orders;
drop policy if exists "insert only"          on public.orders;
drop policy if exists "public_insert_orders" on public.orders;

-- ביטלה את המודרציה: אפשרה הכנסת ביקורת עם approved = true
drop policy if exists "insert only" on public.reviews;

drop policy if exists "allow select" on public.survey_responses;
drop policy if exists "allow delete" on public.survey_responses;
drop policy if exists "allow insert" on public.survey_responses;

-- כפילויות שכוסו במדיניות anon החדשות
drop policy if exists "insert only"                    on public.leads;
drop policy if exists "public_insert_leads"            on public.leads;
drop policy if exists "anyone can subscribe"           on public.newsletter;
drop policy if exists "anyone can submit cancellation" on public.cancellations;
drop policy if exists "read only"                      on public.products;
drop policy if exists "public_read_products"           on public.products;
drop policy if exists "read settings"                  on public.site_settings;

commit;
