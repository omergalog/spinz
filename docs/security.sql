-- ============================================================
-- SPINZ — הרשאות בסיס נתונים (Supabase)
-- להריץ ב: Supabase → SQL Editor → New query → Run
-- בטוח להריץ יותר מפעם אחת.
-- ============================================================

-- ------------------------------------------------------------
-- 1. מודרציה לביקורות
--    ביקורת נכתבת מהדפדפן ולכן חייבת אישור לפני שהיא מוצגת.
-- ------------------------------------------------------------
alter table public.reviews
  add column if not exists approved boolean not null default false;

-- הביקורות שכבר קיימות ונבדקו על ידך — אשר אותן כדי שלא ייעלמו מהאתר.
-- אם אתה מעדיף לעבור עליהן ידנית, מחק את השורה הבאה.
update public.reviews set approved = true where approved = false;


-- ------------------------------------------------------------
-- 2. הפעלת RLS על כל הטבלאות
--    בלי זה, המפתח הציבורי שבקוד נותן גישה מלאה לכל הנתונים.
-- ------------------------------------------------------------
alter table public.leads          enable row level security;
alter table public.newsletter     enable row level security;
alter table public.reviews        enable row level security;
alter table public.cancellations  enable row level security;
alter table public.orders         enable row level security;
alter table public.products       enable row level security;
alter table public.site_settings  enable row level security;


-- ------------------------------------------------------------
-- 3. מדיניות: מה מותר לגולש אנונימי
-- ------------------------------------------------------------

-- ► לידים: מותר להשאיר פרטים, אסור לקרוא/לשנות/למחוק.
drop policy if exists "anon can submit leads" on public.leads;
create policy "anon can submit leads"
  on public.leads for insert to anon with check (true);

-- ► ניוזלטר: אותו דבר.
drop policy if exists "anon can subscribe" on public.newsletter;
create policy "anon can subscribe"
  on public.newsletter for insert to anon with check (true);

-- ► ביטולי עסקה: אותו דבר.
drop policy if exists "anon can request cancellation" on public.cancellations;
create policy "anon can request cancellation"
  on public.cancellations for insert to anon with check (true);

-- ► ביקורות: מותר לשלוח (תמיד כלא-מאושרת), ולקרוא רק מאושרות.
drop policy if exists "anon can submit reviews" on public.reviews;
create policy "anon can submit reviews"
  on public.reviews for insert to anon with check (approved = false);

drop policy if exists "anyone reads approved reviews" on public.reviews;
create policy "anyone reads approved reviews"
  on public.reviews for select to anon using (approved = true);

-- ► מוצרים והגדרות: קריאה בלבד (המחירים והמלאי מוצגים באתר).
drop policy if exists "anyone reads products" on public.products;
create policy "anyone reads products"
  on public.products for select to anon using (true);

drop policy if exists "anyone reads settings" on public.site_settings;
create policy "anyone reads settings"
  on public.site_settings for select to anon using (true);

-- ► הזמנות: לגולש אנונימי אין שום גישה ישירה. ההזמנה נוצרת רק דרך
--   הפונקציה place_order, שרצה כ-security definer ולכן עוקפת RLS
--   ומחשבת את המחיר בשרת. לכן אין כאן מדיניות ל-anon.


-- ------------------------------------------------------------
-- 4. מדיניות לאדמין (משתמש מחובר)
--    האדמין מתחבר עם Supabase Auth ולכן רץ בתור authenticated.
--    בלי החלק הזה — הפעלת RLS הייתה מרוקנת את כל הדשבורד.
-- ------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'leads','newsletter','reviews','cancellations','orders','products','site_settings'
  ] loop
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format(
      'create policy "admin full access" on public.%I
         for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;


-- ------------------------------------------------------------
-- 5. ודא ש-place_order עוקפת RLS כראוי
--    (SECURITY DEFINER = רצה בהרשאות היוצר, לא של הגולש)
-- ------------------------------------------------------------
-- הרץ כדי לבדוק; אם התוצאה בעמודה security_type היא INVOKER,
-- צריך להגדיר מחדש את הפונקציה כ-SECURITY DEFINER.
select
  p.proname                                as function_name,
  case when p.prosecdef then 'DEFINER ✅' else 'INVOKER ⚠️' end as security_type
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'place_order';


-- ------------------------------------------------------------
-- 6. בדיקה סופית — כל הטבלאות חייבות להראות rls_enabled = true
-- ------------------------------------------------------------
select
  c.relname                    as table_name,
  c.relrowsecurity             as rls_enabled,
  count(pol.polname)           as policy_count
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
left join pg_policy pol on pol.polrelid = c.oid
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('leads','newsletter','reviews','cancellations','orders','products','site_settings')
group by c.relname, c.relrowsecurity
order by c.relname;
