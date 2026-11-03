-- ═════════════════════════════════════════════════════════════════════
-- מעקב ושיוך (תוכנית v2): מנהלים, קישורים, אירועים, הגדרות, החזרים, דוחות
--
-- להרצה ב-SQL Editor, בבלוק אחד. חזרה לאחור: ROLLBACK-tracking-1.sql
--
-- מה נוצר: טבלאות ופונקציות חדשות בלבד, ושתי עמודות חדשות ב-checkout_sessions
-- (ריקות, בלי ערך ברירת מחדל שמשנה שורות קיימות). שום policy קיים לא משתנה.
--
-- לפני ההרצה: לעבור על שלב 1 (מי המנהלים). בלי מנהל אחד לפחות ההרצה
-- נעצרת ולא משנה כלום.
-- ═════════════════════════════════════════════════════════════════════
begin;

-- ── 1. מנהלים ────────────────────────────────────────────────────────
-- משמש רק את האובייקטים בקובץ הזה. שאר המסד נשאר על authenticated, כמו היום.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  role       text not null check (role in ('owner', 'workshop')),
  created_at timestamptz not null default now(),
  note       text
);
alter table public.admins enable row level security;
drop policy if exists "own admin row" on public.admins;
create policy "own admin row" on public.admins for select to authenticated using (user_id = auth.uid());
revoke all on public.admins from anon;
revoke insert, update, delete on public.admins from authenticated;

-- שלב 1: המנהלים. שלושת החשבונות נשלפו בקריאה בלבד ב-3.11.2026, ועומר גל אישר
-- ב-3.11.2026 בצ'אט הרשאת owner מלאה לשלושתם: עומר גל, עומר דונוביץ' ואורי שחר.
-- רק הם מקבלים הרשאה. חשבון אחר, גם אם קיים, לא מקבל.
-- אם אחד מהם לא קיים, ההרצה נעצרת ולא משנה כלום.
--   0bc59fff-5d6d-4873-85b9-8eef3d2c2001  עומר גל         (נוצר 1.4.2026)
--   0a574d25-941a-4499-b94e-bd4e6befebae  עומר דונוביץ'   (נוצר 1.4.2026)
--   cb115a56-62e2-40bb-8e72-a8ac4773ca45  אורי שחר        (נוצר 1.4.2026)
-- לבדיקה לפני הרצה:
--   select id, email from auth.users where id in ('0bc59fff-5d6d-4873-85b9-8eef3d2c2001',
--     '0a574d25-941a-4499-b94e-bd4e6befebae', 'cb115a56-62e2-40bb-8e72-a8ac4773ca45');
do $$
declare
  approved uuid[] := array['0bc59fff-5d6d-4873-85b9-8eef3d2c2001', '0a574d25-941a-4499-b94e-bd4e6befebae',
                           'cb115a56-62e2-40bb-8e72-a8ac4773ca45']::uuid[];
  found int;
begin
  select count(*) into found from auth.users where id = any (approved);
  if found <> array_length(approved, 1) then
    raise exception 'ADMINS_CHECK: נמצאו % מתוך % החשבונות שאושרו. לא ממשיכים', found, array_length(approved, 1);
  end if;
  insert into public.admins (user_id, role, note)
    select u, 'owner', 'אושר על ידי עומר גל, 3.11.2026, להקמת מערכת המעקב' from unnest(approved) as u
    on conflict (user_id) do nothing;
end $$;

create or replace function public.is_admin(p_roles text[] default array['owner'])
 returns boolean language sql stable security definer set search_path to 'public'
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid() and a.role = any (p_roles))
$$;
revoke all on function public.is_admin(text[]) from public, anon;
grant execute on function public.is_admin(text[]) to authenticated, service_role;

-- ── 2. הגדרות ────────────────────────────────────────────────────────
create table public.analytics_settings (
  id                 int primary key default 1 check (id = 1),
  attribution_days   int  not null default 10 check (attribution_days between 1 and 90),
  mode               text not null default 'prelaunch' check (mode in ('prelaunch', 'live')),
  mode_changed_at    timestamptz not null default now(),
  mode_changed_by    uuid,
  launch_at          timestamptz,
  ingest_enabled     boolean not null default true,
  daily_event_cap    int not null default 50000 check (daily_event_cap > 0),
  session_hour_cap   int not null default 300   check (session_hour_cap > 0),
  net_hour_cap       int not null default 3000  check (net_hour_cap > 0),
  -- בסיס לחישוב ההתראות. המכסה האמיתית נקראת במסך Usage של Supabase.
  billing_cycle_day  int not null default 27 check (billing_cycle_day between 1 and 28),
  invocation_quota   int not null default 500000,
  raw_retention_days int not null default 90 check (raw_retention_days between 30 and 400),
  db_quota_mb        int not null default 500,
  -- מאיזה יום ההחזרים נקלטים מדוח טרנזילה. null = עוד לא פעיל, ונטו לא מוצג.
  refunds_tracked_from date,
  -- תחילת המדידה: רכישה מכאן והלאה שייכת לתקופת המעקב, גם אם שמירת השיוך שלה נכשלה
  measurement_started_at timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
insert into public.analytics_settings (id) values (1);

-- היסטוריית המצב (טרום-פתיחה / אמת), כדי לסווג רכישה לפי המצב שהיה בזמן פתיחת התשלום
create table public.analytics_mode_log (
  at   timestamptz not null default now(),
  mode text not null check (mode in ('prelaunch', 'live')),
  by   uuid
);
insert into public.analytics_mode_log (mode) values ('prelaunch');

create or replace function public.analytics_env_at(p_at timestamptz)
 returns text language sql stable security definer set search_path to 'public'
as $$
  select coalesce((select mode from public.analytics_mode_log where at <= p_at order by at desc limit 1), 'prelaunch')
$$;
revoke all on function public.analytics_env_at(timestamptz) from public, anon, authenticated;

-- ── 3. קישורים ───────────────────────────────────────────────────────
create table public.tracking_links (
  id           uuid primary key default gen_random_uuid(),
  code         text not null unique check (code ~ '^[a-z0-9][a-z0-9-]{2,39}$'),
  kind         text not null check (kind in ('creator', 'channel')),
  source       text not null check (length(source) between 1 and 60),   -- instagram / google / tiktok ...
  creator      text check (length(creator) <= 80),
  label        text not null check (length(label) between 1 and 120),
  target_path  text not null default '/' check (target_path ~ '^/[A-Za-z0-9/_-]*$' and length(target_path) <= 120),
  utm_source   text check (length(utm_source) <= 80),
  utm_medium   text check (length(utm_medium) <= 80),
  utm_campaign text check (length(utm_campaign) <= 120),
  utm_content  text check (length(utm_content) <= 120),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  created_by   uuid default auth.uid()
);

-- ── 4. אירועים גולמיים (נמחקים אחרי raw_retention_days) ──────────────
create table public.analytics_events (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  env         text not null check (env in ('test', 'prelaunch', 'live')),
  type        text not null check (type in ('session_start', 'page_view', 'product_view', 'add_to_cart', 'begin_checkout')),
  visitor_id  uuid not null,
  session_id  uuid not null,
  path        text,
  product     text,
  value       numeric(10,2),
  link_id     uuid references public.tracking_links(id) on delete set null,
  ref         text,
  utm_source  text, utm_medium text, utm_campaign text,
  referrer    text,          -- רק שם מארח (google.com), לא כתובת מלאה
  device      text check (device in ('mobile', 'desktop'))
);
create index analytics_events_at_idx      on public.analytics_events (at);
create index analytics_events_session_idx on public.analytics_events (session_id, at);
create index analytics_events_link_idx    on public.analytics_events (link_id, at) where link_id is not null;

-- סיכום יומי: נשמר לטווח ארוך, אחרי שהגולמיים נמחקים.
create table public.analytics_daily (
  day            date not null,
  env            text not null,
  source_key     text not null,          -- link:<id> / ref:<code> / utm:<source> / ref-host:<host> / direct
  link_id        uuid,
  sessions       int not null default 0,
  visitors       int not null default 0, -- ייחודיים ביום. סכום של ימים אינו ייחודיים לטווח
  page_views     int not null default 0,
  product_views  int not null default 0,
  add_to_cart    int not null default 0,
  begin_checkout int not null default 0,
  primary key (day, env, source_key)
);

-- מונים לקליטה: הם גם הבסיס להתראות. נמדד = בקשות שהגיעו למסד.
create table public.analytics_ingest_daily (
  day              date primary key,
  batches_ok       int not null default 0,
  events_ok        int not null default 0,
  rejected_off     int not null default 0,
  rejected_day_cap int not null default 0,
  rejected_net     int not null default 0,
  events_dropped_session int not null default 0,
  early_rejected   int not null default 0   -- נדחו בפונקציה לפני המסד (בוטים, גודל, מבנה). דיווח מצטבר, לא מלא
);
create table public.analytics_ingest_net (
  day  date not null,
  hour int  not null,
  net  text not null,      -- גיבוב של כתובת הרשת עם מלח יומי. הכתובת עצמה לא נשמרת
  n    int  not null default 0,
  primary key (day, hour, net)
);

-- ── 5. שיוך על הסל ───────────────────────────────────────────────────
-- תמונת מצב ברגע פתיחת התשלום. שורות קיימות נשארות null = "לפני המערכת".
alter table public.checkout_sessions add column if not exists attribution jsonb;
alter table public.checkout_sessions add column if not exists analytics_env text
  check (analytics_env in ('test', 'prelaunch', 'live'));

-- ── 6. החזרים כספיים (מוכן; נקלט רק אחרי אימות מבנה הזיכויים) ─────────
create table public.payment_refunds (
  id                   uuid primary key default gen_random_uuid(),
  tranzila_index       bigint not null unique,
  amount               numeric(10,2) not null check (amount > 0),
  refunded_at          timestamptz not null,
  raw                  jsonb not null,
  -- שיוך: הצעה אינה אישור. רק confirmed נכנס לדוחות לפי מקור.
  link_status          text not null default 'unlinked' check (link_status in ('unlinked', 'suggested', 'confirmed')),
  suggested_session_id uuid references public.checkout_sessions(id),
  session_id           uuid references public.checkout_sessions(id),
  link_method          text check (link_method in ('reference', 'admin')),
  confirmed_by         uuid,
  confirmed_at         timestamptz,
  created_at           timestamptz not null default now(),
  check ((link_status = 'confirmed') = (session_id is not null and link_method is not null))
);

-- ── 7. הרשאות: מנהלים בלבד. לציבור אין גישה ישירה ─────────────────────
do $$
declare t text;
begin
  foreach t in array array['analytics_settings','analytics_mode_log','tracking_links','analytics_events','analytics_daily',
                           'analytics_ingest_daily','analytics_ingest_net','payment_refunds'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end $$;
-- קריאה למנהלים בלבד (כולל גישה ישירה ל-REST)
grant select on public.analytics_settings, public.tracking_links, public.analytics_events, public.analytics_daily,
               public.analytics_ingest_daily, public.payment_refunds to authenticated;
create policy "admins read" on public.analytics_settings    for select to authenticated using (public.is_admin());
create policy "admins read" on public.tracking_links        for select to authenticated using (public.is_admin());
create policy "admins read" on public.analytics_events      for select to authenticated using (public.is_admin());
create policy "admins read" on public.analytics_daily       for select to authenticated using (public.is_admin());
create policy "admins read" on public.analytics_ingest_daily for select to authenticated using (public.is_admin());
create policy "admins read" on public.payment_refunds       for select to authenticated using (public.is_admin());
-- קישורים: מנהלים יוצרים ומעדכנים. מחיקה לא אפשרית (השבתה במקום)
grant insert (code, kind, source, creator, label, target_path, utm_source, utm_medium, utm_campaign, utm_content)
  on public.tracking_links to authenticated;
grant update (label, active, creator) on public.tracking_links to authenticated;
create policy "admins insert" on public.tracking_links for insert to authenticated with check (public.is_admin());
create policy "admins update" on public.tracking_links for update to authenticated using (public.is_admin()) with check (public.is_admin());
-- הגדרות: עדכון רק דרך analytics_update_settings (שם נבדקים הערכים ונרשם מי שינה)

-- ── 8. קליטה: נקראת רק מהפונקציה track (service_role) ──────────────────
create or replace function public.analytics_ingest(p_net text, p_events jsonb, p_early_rejected int default 0)
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  s     public.analytics_settings;
  d     date := (now() at time zone 'Asia/Jerusalem')::date;
  h     int  := extract(hour from now() at time zone 'Asia/Jerusalem')::int;
  c     public.analytics_ingest_daily;
  n_net int;
  n_in  int;
  n_ok  int := 0;
  n_drop int := 0;
begin
  if jsonb_typeof(p_events) <> 'array' then return jsonb_build_object('ok', false, 'reason', 'shape'); end if;
  n_in := jsonb_array_length(p_events);
  if n_in = 0 or n_in > 50 then return jsonb_build_object('ok', false, 'reason', 'size'); end if;

  select * into s from public.analytics_settings where id = 1;
  insert into public.analytics_ingest_daily (day) values (d) on conflict (day) do nothing;
  if coalesce(p_early_rejected, 0) > 0 then
    update public.analytics_ingest_daily set early_rejected = early_rejected + least(p_early_rejected, 100000) where day = d;
  end if;
  select * into c from public.analytics_ingest_daily where day = d;

  if not s.ingest_enabled then
    update public.analytics_ingest_daily set rejected_off = rejected_off + 1 where day = d;
    return jsonb_build_object('ok', false, 'stop', true, 'reason', 'off');
  end if;
  if c.events_ok >= s.daily_event_cap then
    update public.analytics_ingest_daily set rejected_day_cap = rejected_day_cap + 1 where day = d;
    return jsonb_build_object('ok', false, 'stop', true, 'reason', 'day_cap');
  end if;

  insert into public.analytics_ingest_net (day, hour, net, n) values (d, h, left(coalesce(p_net, '?'), 64), n_in)
    on conflict (day, hour, net) do update set n = public.analytics_ingest_net.n + excluded.n
    returning n into n_net;
  if n_net > s.net_hour_cap then
    update public.analytics_ingest_daily set rejected_net = rejected_net + 1 where day = d;
    return jsonb_build_object('ok', false, 'stop', true, 'reason', 'net_cap');
  end if;

  with raw as (
    select e, ord from jsonb_array_elements(p_events) with ordinality as x(e, ord)
  ), parsed as (
    select
      e->>'type' as type,
      case when e->>'vid' ~ '^[0-9a-f-]{36}$' then (e->>'vid')::uuid end as visitor_id,
      case when e->>'sid' ~ '^[0-9a-f-]{36}$' then (e->>'sid')::uuid end as session_id,
      case when e->>'path' ~ '^/[^\s]{0,199}$' then e->>'path' end as path,
      case when e->>'product' ~ '^[a-z0-9-]{1,60}$' then e->>'product' end as product,
      case when e->>'value' ~ '^\d{1,6}(\.\d{1,2})?$' then (e->>'value')::numeric end as value,
      case when e->>'ref' ~ '^[a-z0-9][a-z0-9-]{0,39}$' then e->>'ref' end as ref,
      case when e->>'us' ~ '^[\w.-]{1,80}$' then lower(e->>'us') end as utm_source,
      case when e->>'um' ~ '^[\w.-]{1,80}$' then lower(e->>'um') end as utm_medium,
      case when e->>'uc' ~ '^[\w.-]{1,120}$' then e->>'uc' end as utm_campaign,
      case when e->>'rh' ~ '^[a-z0-9.-]{1,100}$' then lower(e->>'rh') end as referrer,
      case when e->>'dev' in ('mobile', 'desktop') then e->>'dev' end as device,
      coalesce((e->>'test')::boolean, false) as is_test,
      ord
    from raw
  ), valid as (
    select * from parsed
    where type in ('session_start', 'page_view', 'product_view', 'add_to_cart', 'begin_checkout')
      and visitor_id is not null and session_id is not null
  ), capped as (
    -- תקרה לסשן לשעה: מה שכבר נקלט בשעה האחרונה + מיקום באצווה
    select v.*,
      (select count(*) from public.analytics_events a
        where a.session_id = v.session_id and a.at > now() - interval '1 hour')
      + row_number() over (partition by v.session_id order by v.ord) as n_session
    from valid v
  ), ins as (
    insert into public.analytics_events
      (env, type, visitor_id, session_id, path, product, value, link_id, ref, utm_source, utm_medium, utm_campaign, referrer, device)
    select
      case when c2.is_test then 'test' when s.mode = 'prelaunch' then 'prelaunch' else 'live' end,
      c2.type, c2.visitor_id, c2.session_id, c2.path, c2.product, c2.value,
      (select l.id from public.tracking_links l where l.code = c2.ref),
      c2.ref, c2.utm_source, c2.utm_medium, c2.utm_campaign, c2.referrer, c2.device
    from capped c2
    where c2.n_session <= s.session_hour_cap
    returning 1
  )
  select count(*) into n_ok from ins;

  n_drop := n_in - n_ok;
  update public.analytics_ingest_daily
     set batches_ok = batches_ok + 1, events_ok = events_ok + n_ok,
         events_dropped_session = events_dropped_session + n_drop
   where day = d;
  return jsonb_build_object('ok', true, 'accepted', n_ok, 'dropped', n_drop);
end $$;
revoke all on function public.analytics_ingest(text, jsonb, int) from public, anon, authenticated;
grant execute on function public.analytics_ingest(text, jsonb, int) to service_role;

-- ── 9. סיכום יומי וניקוי (cron) ───────────────────────────────────────
create or replace function public.analytics_source_key(p_link uuid, p_ref text, p_utm text, p_host text)
 returns text language sql immutable as $$
  select case
    when p_link is not null then 'link:' || p_link
    when p_ref  is not null then 'ref:'  || p_ref
    when p_utm  is not null then 'utm:'  || p_utm
    when p_host is not null and p_host !~ '(^|\.)spinzbikes\.com$' then 'ref-host:' || p_host
    else 'direct' end
$$;

create or replace function public.analytics_rollup(p_day date)
 returns void language plpgsql security definer set search_path to 'public'
as $$
begin
  delete from public.analytics_daily where day = p_day;
  insert into public.analytics_daily (day, env, source_key, link_id, sessions, visitors, page_views, product_views, add_to_cart, begin_checkout)
  with ev as (
    select e.*, (e.at at time zone 'Asia/Jerusalem')::date as d from public.analytics_events e
    where e.at >= (p_day::timestamp at time zone 'Asia/Jerusalem')
      and e.at <  ((p_day + 1)::timestamp at time zone 'Asia/Jerusalem')
  ), src as (
    select distinct on (session_id) session_id,
      public.analytics_source_key(link_id, ref, utm_source, referrer) as source_key, link_id
    from ev where type = 'session_start' order by session_id, at
  )
  select p_day, ev.env, coalesce(src.source_key, 'direct'), max(src.link_id::text)::uuid,
    count(*) filter (where ev.type = 'session_start'),
    count(distinct ev.visitor_id) filter (where ev.type = 'session_start'),
    count(*) filter (where ev.type = 'page_view'),
    count(*) filter (where ev.type = 'product_view'),
    count(*) filter (where ev.type = 'add_to_cart'),
    count(*) filter (where ev.type = 'begin_checkout')
  from ev left join src using (session_id)
  group by ev.env, coalesce(src.source_key, 'direct');
end $$;
revoke all on function public.analytics_rollup(date) from public, anon, authenticated;

create or replace function public.analytics_maintenance()
 returns jsonb language plpgsql security definer set search_path to 'public'
as $$
declare
  keep int;
  y date := (now() at time zone 'Asia/Jerusalem')::date - 1;
  n_del bigint;
begin
  select raw_retention_days into keep from public.analytics_settings where id = 1;
  perform public.analytics_rollup(y);
  delete from public.analytics_events where at < now() - make_interval(days => keep);
  get diagnostics n_del = row_count;
  delete from public.analytics_ingest_net where day < y;
  return jsonb_build_object('rolled_up', y, 'deleted_raw', n_del,
    'events_table', pg_size_pretty(pg_total_relation_size('public.analytics_events')),
    'database', pg_size_pretty(pg_database_size(current_database())));
end $$;
revoke all on function public.analytics_maintenance() from public, anon, authenticated;

-- ── 10. דוחות למנהלים ────────────────────────────────────────────────
-- שיטה: תזרים לפי מועד. רכישות לפי מועד החיוב (paid_at), החזרים לפי מועד
-- הזיכוי. לא "הכנסה מרכישות התקופה אחרי החזרים עליהן".
create or replace function public.analytics_report(p_from date, p_to date, p_env text default 'live', p_grain text default 'day')
 returns jsonb language plpgsql stable security definer set search_path to 'public'
as $$
declare
  t0 timestamptz := p_from::timestamp at time zone 'Asia/Jerusalem';
  t1 timestamptz := (p_to + 1)::timestamp at time zone 'Asia/Jerusalem';
  s  public.analytics_settings;
  raw_from date;
  out jsonb;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  if p_env not in ('test', 'prelaunch', 'live') or p_grain not in ('day', 'week', 'month') or p_to < p_from
     or p_to - p_from > 800 then
    raise exception 'bad_args' using errcode = '22023';
  end if;
  select * into s from public.analytics_settings where id = 1;
  raw_from := (now() at time zone 'Asia/Jerusalem')::date - s.raw_retention_days + 1;

  with ev as (
    select e.* from public.analytics_events e where e.at >= t0 and e.at < t1 and e.env = p_env
  ), sess as (
    select distinct on (session_id) session_id, visitor_id, at,
      public.analytics_source_key(link_id, ref, utm_source, referrer) as source_key, link_id, ref, utm_source
    from ev where type = 'session_start' order by session_id, at
  ), paid_all as (
    -- סביבה: מה שנשמר על הסל. אם השמירה נכשלה (null) והסל נפתח אחרי תחילת המדידה,
    -- הסביבה נגזרת מהמצב שהיה אז. סל מלפני תחילת המדידה הוא "לפני המערכת".
    select cs.id, cs.total_price, cs.paid_at, cs.attribution, cs.order_ids,
      cs.analytics_env is null and cs.created_at >= s.measurement_started_at as write_missing,
      coalesce(cs.analytics_env, case when cs.created_at >= s.measurement_started_at
                                      then public.analytics_env_at(cs.created_at) end) as env_eff
    from public.checkout_sessions cs
    where cs.status = 'paid' and cs.paid_at >= t0 and cs.paid_at < t1
  ), paid as (
    select * from paid_all where env_eff = p_env
  ), converted as (
    select distinct sess.session_id, sess.source_key from sess
    join paid on paid.attribution->>'session_id' = sess.session_id::text
  ), paid_legacy as (
    -- רכישות אמיתיות שנפתחו לפני תחילת המדידה: נספרות בנפרד, לא משויכות ולא מסווגות מחדש
    select count(*) n, coalesce(sum(total_price), 0) total from paid_all where env_eff is null
  ), cancelled as (
    select count(*) n, coalesce(sum(o.total_price), 0) total
    from paid p join public.orders o on o.id = any (p.order_ids) where o.status = 'cancelled'
  ), refunds as (
    select count(*) n, coalesce(sum(amount), 0) total,
      coalesce(sum(amount) filter (where link_status = 'confirmed'), 0) linked,
      coalesce(sum(amount) filter (where link_status <> 'confirmed'), 0) unlinked
    from public.payment_refunds where refunded_at >= t0 and refunded_at < t1
  ), by_source as (
    select coalesce(x.source_key, 'direct') source_key,
      count(*) filter (where x.kind = 's') sessions,
      count(distinct x.visitor_id) filter (where x.kind = 's') visitors,
      count(*) filter (where x.kind = 'pv') product_views,
      count(*) filter (where x.kind = 'atc') add_to_cart,
      count(*) filter (where x.kind = 'bc') begin_checkout,
      count(*) filter (where x.kind = 'cv') converted_sessions
    from (
      select sess.source_key, sess.visitor_id, 's' kind from sess
      union all
      select coalesce(sess.source_key, 'direct'), null, case ev.type when 'product_view' then 'pv' when 'add_to_cart' then 'atc' else 'bc' end
      from ev left join sess using (session_id) where ev.type in ('product_view', 'add_to_cart', 'begin_checkout')
      union all
      select converted.source_key, null, 'cv' from converted
    ) x group by 1
  ), purchases_by_source as (
    select coalesce(attribution->>'source_key', 'unattributed') source_key, count(*) purchases, sum(total_price) revenue
    from paid group by 1
  ), series as (
    select date_trunc(p_grain, (ev.at at time zone 'Asia/Jerusalem'))::date bucket,
      count(*) filter (where type = 'session_start') sessions,
      count(*) filter (where type = 'add_to_cart') add_to_cart,
      count(*) filter (where type = 'begin_checkout') begin_checkout
    from ev group by 1
  ), pseries as (
    select date_trunc(p_grain, (paid_at at time zone 'Asia/Jerusalem'))::date bucket, count(*) purchases, sum(total_price) revenue
    from paid group by 1
  )
  select jsonb_build_object(
    'range', jsonb_build_object('from', p_from, 'to', p_to, 'env', p_env, 'grain', p_grain),
    'raw_complete', p_from >= raw_from,
    'mode', s.mode, 'attribution_days', s.attribution_days,
    'totals', jsonb_build_object(
      'sessions', (select count(*) from sess),
      'tagged_entries', (select count(*) from sess where source_key <> 'direct' and source_key not like 'ref-host:%'),
      'visitors', (select count(distinct visitor_id) from sess),
      'page_views', (select count(*) from ev where type = 'page_view'),
      'product_views', (select count(*) from ev where type = 'product_view'),
      'add_to_cart', (select count(*) from ev where type = 'add_to_cart'),
      'begin_checkout', (select count(*) from ev where type = 'begin_checkout'),
      'purchases', (select count(*) from paid),
      'revenue', (select coalesce(sum(total_price), 0) from paid),
      'purchases_with_session', (select count(*) from paid where attribution ? 'session_id'),
      'converted_sessions', (select count(*) from converted),
      'attribution_write_missing', (select count(*) from paid where write_missing),
      'legacy_purchases', (select to_jsonb(paid_legacy) from paid_legacy),
      'cancelled_orders', (select to_jsonb(cancelled) from cancelled),
      'refunds', case when s.refunds_tracked_from is not null and s.refunds_tracked_from <= p_from
                      then (select to_jsonb(refunds) from refunds) else null end,
      'refunds_status', case when s.refunds_tracked_from is null then 'not_tracked'
                             when s.refunds_tracked_from > p_from then 'partial_range' else 'tracked' end
    ),
    'by_source', coalesce((
      select jsonb_agg(jsonb_build_object(
        'source_key', k.source_key,
        'link', (select jsonb_build_object('code', l.code, 'kind', l.kind, 'source', l.source, 'creator', l.creator, 'label', l.label, 'active', l.active)
                   from public.tracking_links l where k.source_key = 'link:' || l.id),
        'sessions', coalesce(b.sessions, 0), 'visitors', coalesce(b.visitors, 0),
        'product_views', coalesce(b.product_views, 0), 'add_to_cart', coalesce(b.add_to_cart, 0),
        'begin_checkout', coalesce(b.begin_checkout, 0), 'converted_sessions', coalesce(b.converted_sessions, 0),
        'purchases', coalesce(p.purchases, 0), 'revenue', coalesce(p.revenue, 0)) order by coalesce(p.revenue, 0) desc, coalesce(b.sessions, 0) desc)
      from (select source_key from by_source union select source_key from purchases_by_source) k
      left join by_source b using (source_key) left join purchases_by_source p using (source_key)), '[]'),
    'series', coalesce((
      select jsonb_agg(jsonb_build_object('bucket', k.bucket, 'sessions', coalesce(a.sessions, 0),
        'add_to_cart', coalesce(a.add_to_cart, 0), 'begin_checkout', coalesce(a.begin_checkout, 0),
        'purchases', coalesce(b.purchases, 0), 'revenue', coalesce(b.revenue, 0)) order by k.bucket)
      from (select bucket from series union select bucket from pseries) k
      left join series a using (bucket) left join pseries b using (bucket)), '[]')
  ) into out;
  return out;
end $$;
revoke all on function public.analytics_report(date, date, text, text) from public, anon;
grant execute on function public.analytics_report(date, date, text, text) to authenticated;

-- מצב הקליטה וההתראות: מה נמדד בפועל, ומה רק מוערך
create or replace function public.analytics_ingest_status()
 returns jsonb language plpgsql stable security definer set search_path to 'public'
as $$
declare
  s public.analytics_settings;
  today date := (now() at time zone 'Asia/Jerusalem')::date;
  cycle_start date;
  days_in int; days_total int; measured bigint; today_n bigint; median7 numeric;
begin
  if not (public.is_admin() or coalesce(auth.role(), '') = 'service_role') then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  select * into s from public.analytics_settings where id = 1;
  cycle_start := make_date(extract(year from today)::int, extract(month from today)::int, s.billing_cycle_day);
  if cycle_start > today then cycle_start := (cycle_start - interval '1 month')::date; end if;
  days_in := today - cycle_start + 1;
  days_total := ((cycle_start + interval '1 month')::date - cycle_start);
  select coalesce(sum(batches_ok + rejected_off + rejected_day_cap + rejected_net + early_rejected), 0) into measured
    from public.analytics_ingest_daily where day >= cycle_start;
  select coalesce(sum(batches_ok + rejected_off + rejected_day_cap + rejected_net + early_rejected), 0) into today_n
    from public.analytics_ingest_daily where day = today;
  select coalesce(percentile_cont(0.5) within group (order by batches_ok + rejected_off + rejected_day_cap + rejected_net + early_rejected), 0)
    into median7 from public.analytics_ingest_daily where day between today - 7 and today - 1;
  return jsonb_build_object(
    'cycle_start', cycle_start, 'cycle_days', days_total, 'day_in_cycle', days_in,
    'quota', s.invocation_quota,
    'measured_track_requests_cycle', measured,
    'measured_track_requests_today', today_n,
    'projected_track_requests_cycle', round(measured::numeric / greatest(days_in, 1) * days_total),
    'median_prev_7_days', median7,
    'abnormal_rate', today_n >= 1000 and today_n > 5 * greatest(median7, 1),
    'share_of_quota_measured', round(measured::numeric / s.invocation_quota, 4),
    'note', 'נמדד: בקשות track שהגיעו למסד, ודיווח מצטבר של דחיות מוקדמות. לא נמדד: הפעלות של פונקציות אחרות ובקשות שנדחו לפני שהגיעו לקוד. המספר המלא רק במסך Usage של Supabase.',
    'database_bytes', pg_database_size(current_database()),
    'events_bytes', pg_total_relation_size('public.analytics_events'),
    'database_share', round(pg_database_size(current_database())::numeric / (s.db_quota_mb::numeric * 1024 * 1024), 4),
    'ingest_enabled', s.ingest_enabled, 'mode', s.mode
  );
end $$;
revoke all on function public.analytics_ingest_status() from public, anon;
grant execute on function public.analytics_ingest_status() to authenticated, service_role;

create or replace function public.analytics_update_settings(p jsonb)
 returns public.analytics_settings language plpgsql security definer set search_path to 'public'
as $$
declare r public.analytics_settings;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  update public.analytics_settings set
    attribution_days = coalesce((p->>'attribution_days')::int, attribution_days),
    ingest_enabled   = coalesce((p->>'ingest_enabled')::boolean, ingest_enabled),
    launch_at        = case when p ? 'launch_at' then (p->>'launch_at')::timestamptz else launch_at end,
    mode_changed_at  = case when p->>'mode' is not null and p->>'mode' <> mode then now() else mode_changed_at end,
    mode_changed_by  = case when p->>'mode' is not null and p->>'mode' <> mode then auth.uid() else mode_changed_by end,
    mode             = coalesce(p->>'mode', mode),
    updated_at       = now()
  where id = 1 returning * into r;
  if p->>'mode' is not null and (select mode from public.analytics_mode_log order by at desc limit 1) is distinct from r.mode then
    insert into public.analytics_mode_log (mode, by) values (r.mode, auth.uid());
  end if;
  return r;
end $$;
revoke all on function public.analytics_update_settings(jsonb) from public, anon;
grant execute on function public.analytics_update_settings(jsonb) to authenticated;

-- אישור שיוך של החזר לרכישה: רק מנהל, ורק לסל ששולם
create or replace function public.refund_confirm_link(p_refund uuid, p_session uuid)
 returns public.payment_refunds language plpgsql security definer set search_path to 'public'
as $$
declare r public.payment_refunds; total numeric; already numeric;
begin
  if not public.is_admin() then raise exception 'forbidden' using errcode = '42501'; end if;
  select total_price into total from public.checkout_sessions where id = p_session and status = 'paid';
  if total is null then raise exception 'session_not_paid' using errcode = '22023'; end if;
  select coalesce(sum(amount), 0) into already from public.payment_refunds
    where session_id = p_session and link_status = 'confirmed' and id <> p_refund;
  select * into r from public.payment_refunds where id = p_refund for update;
  if r.id is null then raise exception 'not_found' using errcode = '22023'; end if;
  if already + r.amount > total + 0.01 then raise exception 'exceeds_original' using errcode = '22023'; end if;
  update public.payment_refunds set session_id = p_session, link_status = 'confirmed', link_method = 'admin',
    confirmed_by = auth.uid(), confirmed_at = now() where id = p_refund returning * into r;
  return r;
end $$;
revoke all on function public.refund_confirm_link(uuid, uuid) from public, anon;
grant execute on function public.refund_confirm_link(uuid, uuid) to authenticated;

commit;

-- ── אחרי ההרצה: משימות cron (בלוק נפרד, אחרי שה-commit למעלה עבר) ──────
-- ניקוי וסיכום יומי, 02:30 שעון ישראל (00:30 UTC בחורף)
--   select cron.schedule('analytics-maintenance', '30 0 * * *', $c$ select public.analytics_maintenance() $c$);
-- בדיקת חריגה והתראה: ראו MIGRATION-tracking-2-watch.sql (אחרי פריסת analytics-watch)
