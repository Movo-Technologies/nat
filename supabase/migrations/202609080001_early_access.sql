create extension if not exists pgcrypto;

create table public.early_access_applications (
  id uuid primary key default gen_random_uuid(),
  name text not null check(char_length(name) between 2 and 100),
  email text not null check(email = lower(trim(email)) and char_length(email) <= 254),
  company_name text, website_url text not null, website_domain text not null,
  role text, industry text, desired_outcomes text[] not null check(cardinality(desired_outcomes) between 1 and 8),
  current_stack text, traffic_band text, live_beta_opt_in boolean not null,
  feedback_opt_in boolean not null default false,
  privacy_acknowledged boolean not null check(privacy_acknowledged = true),
  privacy_version text not null default '2026-09-08-draft',
  notes text check(char_length(notes) <= 1000),
  status text not null default 'submitted' check(status in ('submitted','reviewing','shortlisted','invited','onboarded','declined','deferred')),
  source text not null default 'website', utm jsonb not null default '{}'::jsonb,
  referrer text, landing_path text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(email,website_domain)
);
create index early_access_domain_idx on public.early_access_applications(website_domain);
alter table public.early_access_applications enable row level security;
revoke all on public.early_access_applications from anon, authenticated;

create table public.waitlist_rate_limits (
  key text primary key, window_start timestamptz not null, attempts integer not null
);
alter table public.waitlist_rate_limits enable row level security;
revoke all on public.waitlist_rate_limits from anon, authenticated;

create function public.consume_waitlist_rate_limit(p_key text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare count_now integer;
begin
  if length(p_key) <> 64 then return false; end if;
  -- Atomic fixed window, shared across every worker instance.
  insert into public.waitlist_rate_limits as limits(key,window_start,attempts)
  values(p_key,now(),1)
  on conflict(key) do update set
    attempts=case when limits.window_start < now()-interval '15 minutes' then 1 else limits.attempts+1 end,
    window_start=case when limits.window_start < now()-interval '15 minutes' then now() else limits.window_start end
  returning attempts into count_now;
  delete from public.waitlist_rate_limits where window_start < now()-interval '1 day';
  return count_now <= 5;
end $$;

create function public.submit_early_access(p_application jsonb) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.early_access_applications(name,email,website_url,website_domain,company_name,role,industry,desired_outcomes,current_stack,traffic_band,live_beta_opt_in,feedback_opt_in,privacy_acknowledged,notes,utm,referrer,landing_path)
  values(p_application->>'name',lower(trim(p_application->>'email')),p_application->>'websiteUrl',p_application->>'websiteDomain',nullif(p_application->>'companyName',''),nullif(p_application->>'role',''),nullif(p_application->>'industry',''),array(select jsonb_array_elements_text(p_application->'desiredOutcomes')),nullif(p_application->>'currentStack',''),nullif(p_application->>'trafficBand',''),(p_application->>'liveBetaOptIn')::boolean,coalesce((p_application->>'feedbackOptIn')::boolean,false),(p_application->>'privacyAcknowledged')::boolean,nullif(p_application->>'notes',''),coalesce(p_application->'utm','{}'::jsonb),nullif(p_application->>'referrer',''),nullif(p_application->>'landingPath',''))
  -- Unauthenticated submissions cannot overwrite an existing person's details.
  on conflict(email,website_domain) do nothing;
end $$;
revoke all on function public.consume_waitlist_rate_limit(text) from public, anon, authenticated;
revoke all on function public.submit_early_access(jsonb) from public, anon, authenticated;
grant execute on function public.consume_waitlist_rate_limit(text) to service_role;
grant execute on function public.submit_early_access(jsonb) to service_role;
