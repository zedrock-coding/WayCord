-- ==============================================================================
-- Waycord Payment Transactions & Refund Ledger Migration
-- ==============================================================================

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_transaction_id text not null unique,
  provider public.billing_provider not null default 'phonepe',
  provider_payment_id text,
  plan text not null check (plan in ('pro', 'team')),
  amount integer not null check (amount > 0),
  currency text not null default 'INR',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refund_requested', 'refunded')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.payment_transactions enable row level security;

-- Client access: authenticated users can only READ their own transactions
drop policy if exists payment_transactions_select_own on public.payment_transactions;
create policy payment_transactions_select_own on public.payment_transactions
  for select to authenticated
  using (user_id = auth.uid());

-- Index for fast user query
create index if not exists idx_payment_transactions_user_id on public.payment_transactions(user_id);
create index if not exists idx_payment_transactions_merchant_id on public.payment_transactions(merchant_transaction_id);
