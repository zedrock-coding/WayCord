-- ==============================================================================
-- Waycord Capability-Based Entitlement Architecture Migration
-- ==============================================================================

-- 1. Subscription Tier & Billing Provider Enums
do $$ begin
  if not exists (select 1 from pg_type where typname = 'subscription_tier') then
    create type public.subscription_tier as enum ('free', 'pro', 'team');
  end if;
  if not exists (select 1 from pg_type where typname = 'billing_provider') then
    create type public.billing_provider as enum ('none', 'phonepe', 'patreon', 'institutional_grant', 'dev_override');
  end if;
end $$;

-- 2. User Subscriptions Table
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  tier public.subscription_tier not null default 'free',
  status text not null default 'active' check (status in ('active', 'grace_period', 'past_due', 'canceled')),
  provider public.billing_provider not null default 'none',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  signed_entitlement_jwt text,
  updated_at timestamptz not null default now()
);

alter table public.user_subscriptions enable row level security;

-- Client access: authenticated users can only READ their own subscription.
-- ZERO insert/update/delete policies are granted to authenticated users.
-- Mutations are strictly restricted to service_role (Edge Functions / Webhooks).
drop policy if exists user_subscriptions_update_own on public.user_subscriptions;
drop policy if exists user_subscriptions_select_own on public.user_subscriptions;

create policy user_subscriptions_select_own on public.user_subscriptions
  for select to authenticated
  using (user_id = auth.uid());

-- 3. Usage Quotas Table
create table if not exists public.usage_quotas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cycle_start timestamptz not null default date_trunc('month', now() at time zone 'utc'),
  cycle_end timestamptz not null default (date_trunc('month', now() at time zone 'utc') + interval '1 month'),
  cloud_ai_calls_used integer not null default 0 check (cloud_ai_calls_used >= 0),
  active_device_ids jsonb not null default '[]'::jsonb
);

alter table public.usage_quotas enable row level security;

create policy usage_quotas_select_own on public.usage_quotas
  for select to authenticated
  using (user_id = auth.uid());

-- Helper: Get user's active tier
create or replace function public.get_user_tier(p_user_id uuid)
returns public.subscription_tier
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tier public.subscription_tier;
  v_status text;
  v_period_end timestamptz;
begin
  select tier, status, current_period_end
  into v_tier, v_status, v_period_end
  from public.user_subscriptions
  where user_id = p_user_id;

  if v_tier is null then
    return 'free'::public.subscription_tier;
  end if;

  -- 72-hour grace period if expired
  if v_period_end is not null and v_period_end + interval '72 hours' < now() then
    return 'free'::public.subscription_tier;
  end if;

  if v_status = 'canceled' or v_status = 'past_due' then
    return 'free'::public.subscription_tier;
  end if;

  return v_tier;
end;
$$;

-- 4. Server-Side Enforcement Trigger: maxWorkspaces (2 for Free)
create or replace function public.enforce_workspace_limits()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tier public.subscription_tier;
  v_count integer;
begin
  v_tier := public.get_user_tier(auth.uid());

  if v_tier = 'free' then
    select count(*)
    into v_count
    from public.communities
    where creator_id = auth.uid();

    if v_count >= 2 then
      raise exception 'free_tier_workspace_limit_reached'
        using errcode = '22023',
        message = 'Free tier allows a maximum of 2 shared workspaces. Upgrade to Waycord Pro for unlimited workspaces.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists tr_enforce_workspace_limits on public.communities;
create trigger tr_enforce_workspace_limits
  before insert on public.communities
  for each row
  execute function public.enforce_workspace_limits();

-- 5. Server-Side Enforcement Trigger: maxMembersPerWorkspace (5 for Free, 15 for Pro)
create or replace function public.enforce_member_limits()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_creator_id uuid;
  v_tier public.subscription_tier;
  v_member_count integer;
begin
  select creator_id into v_creator_id
  from public.communities
  where id = new.community_id;

  if v_creator_id is null then
    return new;
  end if;

  v_tier := public.get_user_tier(v_creator_id);

  select count(*)
  into v_member_count
  from public.community_members
  where community_id = new.community_id;

  if v_tier = 'free' and v_member_count >= 5 then
    raise exception 'free_tier_member_limit_reached'
      using errcode = '22023',
      message = 'Free tier allows a maximum of 5 members per workspace. Upgrade workspace creator to Waycord Pro for up to 15 members.';
  elsif v_tier = 'pro' and v_member_count >= 15 then
    raise exception 'pro_tier_member_limit_reached'
      using errcode = '22023',
      message = 'Pro tier allows a maximum of 15 members per workspace. Upgrade to Waycord Team for unlimited members.';
  end if;

  return new;
end;
$$;

drop trigger if exists tr_enforce_member_limits on public.community_members;
create trigger tr_enforce_member_limits
  before insert on public.community_members
  for each row
  execute function public.enforce_member_limits();

-- 6. Needle AI Cloud Usage RPC
create or replace function public.consume_cloud_ai_quota()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_tier public.subscription_tier;
  v_quota public.usage_quotas%rowtype;
  v_now timestamptz := now() at time zone 'utc';
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  v_tier := public.get_user_tier(v_uid);

  -- Upsert usage quota row
  insert into public.usage_quotas (user_id, cycle_start, cycle_end, cloud_ai_calls_used)
  values (v_uid, date_trunc('month', v_now), date_trunc('month', v_now) + interval '1 month', 0)
  on conflict (user_id) do nothing;

  select * into v_quota
  from public.usage_quotas
  where user_id = v_uid;

  -- Reset monthly cycle if needed
  if v_now > v_quota.cycle_end then
    update public.usage_quotas
    set cycle_start = date_trunc('month', v_now),
        cycle_end = date_trunc('month', v_now) + interval '1 month',
        cloud_ai_calls_used = 0
    where user_id = v_uid
    returning * into v_quota;
  end if;

  -- Check limits if Free tier (20 calls / mo)
  if v_tier = 'free' then
    if v_quota.cloud_ai_calls_used >= 20 then
      raise exception 'monthly_ai_limit_exceeded'
        using errcode = '22023',
        message = 'Monthly cloud AI limit reached (20 calls). Local heuristic parser remains unlimited. Upgrade to Waycord Pro for unlimited cloud AI.';
    end if;

    update public.usage_quotas
    set cloud_ai_calls_used = cloud_ai_calls_used + 1
    where user_id = v_uid
    returning * into v_quota;

    return jsonb_build_object(
      'tier', 'free',
      'calls_used', v_quota.cloud_ai_calls_used,
      'calls_limit', 20,
      'calls_remaining', (20 - v_quota.cloud_ai_calls_used)
    );
  else
    -- Pro and Team have unlimited calls
    update public.usage_quotas
    set cloud_ai_calls_used = cloud_ai_calls_used + 1
    where user_id = v_uid
    returning * into v_quota;

    return jsonb_build_object(
      'tier', v_tier::text,
      'calls_used', v_quota.cloud_ai_calls_used,
      'calls_limit', -1,
      'calls_remaining', -1
    );
  end if;
end;
$$;

-- 7. Device Sync Limit RPC
create or replace function public.register_device(p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_tier public.subscription_tier;
  v_devices jsonb;
  v_device_count integer;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  v_tier := public.get_user_tier(v_uid);

  -- Upsert usage quota row
  insert into public.usage_quotas (user_id, active_device_ids)
  values (v_uid, jsonb_build_array(p_device_id))
  on conflict (user_id) do nothing;

  select coalesce(active_device_ids, '[]'::jsonb)
  into v_devices
  from public.usage_quotas
  where user_id = v_uid;

  -- If device already registered, return ok
  if v_devices ? p_device_id then
    return jsonb_build_object(
      'status', 'registered',
      'tier', v_tier::text,
      'device_count', jsonb_array_length(v_devices)
    );
  end if;

  v_device_count := jsonb_array_length(v_devices);

  -- Free tier allows max 2 synced devices
  if v_tier = 'free' and v_device_count >= 2 then
    raise exception 'free_tier_device_limit_reached'
      using errcode = '22023',
      message = 'Free tier allows a maximum of 2 synced devices. Upgrade to Waycord Pro for unlimited devices.';
  end if;

  -- Add device
  update public.usage_quotas
  set active_device_ids = active_device_ids || jsonb_build_array(p_device_id)
  where user_id = v_uid
  returning active_device_ids into v_devices;

  return jsonb_build_object(
    'status', 'added',
    'tier', v_tier::text,
    'device_count', jsonb_array_length(v_devices)
  );
end;
$$;

-- 8. Unlink Device RPC
create or replace function public.unlink_device(p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_devices jsonb;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select coalesce(active_device_ids, '[]'::jsonb)
  into v_devices
  from public.usage_quotas
  where user_id = v_uid;

  v_devices := (
    select coalesce(jsonb_agg(elem), '[]'::jsonb)
    from jsonb_array_elements(v_devices) as elem
    where elem #>> '{}' != p_device_id
  );

  update public.usage_quotas
  set active_device_ids = v_devices
  where user_id = v_uid;

  return jsonb_build_object(
    'status', 'unlinked',
    'active_devices', v_devices,
    'device_count', jsonb_array_length(v_devices)
  );
end;
$$;

-- 9. Enforce Trash Restoration Trigger
create or replace function public.enforce_trash_restore_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_tier public.subscription_tier;
begin
  -- Only trigger when attempting to restore a soft-deleted task
  if OLD.deleted_at is not null and NEW.deleted_at is null then
    if v_uid is not null then
      v_tier := public.get_user_tier(v_uid);
      if v_tier = 'free' then
        raise exception 'free_tier_cannot_restore_trash'
          using errcode = '22023',
          message = '30-day soft-delete trash restoration requires Waycord Pro or Team.';
      end if;
    end if;
  end if;
  return NEW;
end;
$$;

drop trigger if exists enforce_trash_restore_trigger on public.tasks;
create trigger enforce_trash_restore_trigger
  before update on public.tasks
  for each row execute function public.enforce_trash_restore_entitlement();

-- 10. Idempotent Billing Webhook Events Log
create table if not exists public.billing_events_log (
  id uuid primary key default gen_random_uuid(),
  provider public.billing_provider not null,
  event_id text not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz not null default now(),
  constraint uq_billing_event unique (provider, event_id)
);

alter table public.billing_events_log enable row level security;
-- No client access allowed: strictly service_role only
