-- חזרה לאחור ל-MIGRATION-tracking-1.sql. מוחק את כל נתוני המעקב, הקישורים וההחזרים שנקלטו.
-- לא נוגע ברכישות, בהזמנות או בתשלומים. עמודות השיוך בסל נמחקות יחד עם תוכנן.
begin;
do $$
begin
  if to_regclass('cron.job') is not null then
    perform cron.unschedule(jobid) from cron.job where jobname in ('analytics-maintenance', 'analytics-watch');
  end if;
end $$;
drop function if exists public.refund_confirm_link(uuid, uuid);
drop function if exists public.analytics_update_settings(jsonb);
drop function if exists public.analytics_ingest_status();
drop function if exists public.analytics_report(date, date, text, text);
drop function if exists public.analytics_maintenance();
drop function if exists public.analytics_rollup(date);
drop function if exists public.analytics_source_key(uuid, text, text, text);
drop function if exists public.analytics_ingest(text, jsonb, int);
drop function if exists public.analytics_watch_secret_ok(text);
drop function if exists public.analytics_env_at(timestamptz);
drop table if exists public.payment_refunds, public.analytics_ingest_net, public.analytics_ingest_daily,
  public.analytics_daily, public.analytics_events, public.tracking_links, public.analytics_mode_log, public.analytics_settings;
alter table public.checkout_sessions drop column if exists attribution, drop column if exists analytics_env;
-- admins ו-is_admin נשארים בכוונה: ייתכן שישמשו שינויים אחרים. להסרה מלאה:
--   drop function if exists public.is_admin(text[]); drop table if exists public.admins;
commit;
