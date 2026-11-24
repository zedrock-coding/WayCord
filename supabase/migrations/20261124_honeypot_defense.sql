-- 20261124_honeypot_defense.sql
-- Honeypot security tripwires and incident audit logging

create table if not exists public.security_tripwires (
    id uuid primary key default gen_random_uuid(),
    tripwire_type text not null, -- 'canary_endpoint', 'canary_token', 'decoy_credential'
    endpoint text,
    token_signature text,
    ip_address text,
    user_agent text,
    headers jsonb default '{}'::jsonb,
    payload jsonb default '{}'::jsonb,
    threat_level text default 'UNKNOWN', -- 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    ai_analysis text,
    is_quarantined boolean default false,
    created_at timestamptz default now()
);

-- Enable RLS
alter table public.security_tripwires enable row level security;

-- Only authenticated admins or service role can select/update
create policy "Admins can view tripwire incidents"
    on public.security_tripwires
    for select
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and (profiles.role in ('admin', 'owner') or profiles.is_admin = true)
        )
    );

create policy "Admins can update tripwire incidents"
    on public.security_tripwires
    for update
    to authenticated
    using (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and (profiles.role in ('admin', 'owner') or profiles.is_admin = true)
        )
    )
    with check (
        exists (
            select 1 from public.profiles
            where profiles.id = auth.uid()
            and (profiles.role in ('admin', 'owner') or profiles.is_admin = true)
        )
    );

-- Allow service role or anonymous tripwire reporting through secure RPC
create or replace function public.log_security_tripwire(
    p_tripwire_type text,
    p_endpoint text,
    p_token_signature text default null,
    p_ip_address text default null,
    p_user_agent text default null,
    p_headers jsonb default '{}'::jsonb,
    p_payload jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
    v_incident_id uuid;
begin
    insert into public.security_tripwires (
        tripwire_type,
        endpoint,
        token_signature,
        ip_address,
        user_agent,
        headers,
        payload
    ) values (
        p_tripwire_type,
        p_endpoint,
        p_token_signature,
        p_ip_address,
        p_user_agent,
        p_headers,
        p_payload
    )
    returning id into v_incident_id;

    return v_incident_id;
end;
$$;

-- Allow public execution of reporting RPC so canaries trigger without credentials
grant execute on function public.log_security_tripwire to anon, authenticated, service_role;
