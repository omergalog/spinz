-- ═════════════════════════════════════════════════════════════════════
-- מעקב ושיוך, חלק 2: משימות מתוזמנות. להריץ אחרי MIGRATION-tracking-1.sql,
-- ואחרי פריסת הפונקציה analytics-watch.
-- ═════════════════════════════════════════════════════════════════════
begin;

-- סוד לבדיקת החריגה: נוצר אקראית בתוך המסד ולא מוצג
create or replace function public.analytics_watch_secret_ok(p_given text)
 returns boolean language sql stable security definer set search_path to 'public'
as $$
  select case when s.v is null then null else s.v = coalesce(p_given, '') end
    from (select (select decrypted_secret from vault.decrypted_secrets
                   where name = 'analytics_watch_secret' limit 1) as v) s
$$;
revoke all on function public.analytics_watch_secret_ok(text) from public, anon, authenticated;
grant execute on function public.analytics_watch_secret_ok(text) to service_role;

do $$
declare v_id uuid;
begin
  select id into v_id from vault.secrets where name = 'analytics_watch_secret';
  if v_id is null then
    perform vault.create_secret(encode(extensions.gen_random_bytes(32), 'hex'), 'analytics_watch_secret', 'analytics-watch cron');
  end if;
end $$;

-- סיכום יומי ומחיקת אירועים גולמיים ישנים: 02:30 שעון ישראל (00:30 UTC בחורף)
select cron.schedule('analytics-maintenance', '30 0 * * *', $c$ select public.analytics_maintenance() $c$);

-- בדיקת חריגה והתראה: 07:15 שעון ישראל
select cron.schedule('analytics-watch', '15 5 * * *', $c$
  select net.http_post(
    url := 'https://ayrwfyutpbkepnyjkyop.supabase.co/functions/v1/analytics-watch',
    headers := jsonb_build_object('x-watch-secret',
      (select decrypted_secret from vault.decrypted_secrets where name = 'analytics_watch_secret' limit 1)),
    body := '{}'::jsonb)
$c$);

commit;
