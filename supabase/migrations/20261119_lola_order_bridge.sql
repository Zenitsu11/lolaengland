-- LOLA Order Bridge: private warehouse outbox and automatic dispatch queue.
-- COD orders queue immediately; prepaid orders queue only after payment is marked paid.

create table if not exists public.warehouse_dispatches (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  dispatch_status text not null default 'queued'
    check (dispatch_status in ('queued','notified','accepted','packing','packed','shipped','delivered','cancelled','failed')),
  whatsapp_status text not null default 'pending'
    check (whatsapp_status in ('pending','sent','failed','skipped')),
  email_status text not null default 'pending'
    check (email_status in ('pending','sent','failed','skipped')),
  whatsapp_message_id text,
  email_message_id text,
  last_error text,
  attempt_count integer not null default 0,
  queued_at timestamptz not null default now(),
  notified_at timestamptz,
  accepted_at timestamptz,
  packed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  updated_at timestamptz not null default now()
);

create index if not exists warehouse_dispatches_status_queued_idx
  on public.warehouse_dispatches(dispatch_status, queued_at desc);

alter table public.warehouse_dispatches enable row level security;

create or replace function public.queue_warehouse_dispatch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.payment_method = 'cod' and new.status in ('cod_pending','confirmed') then
    insert into public.warehouse_dispatches(order_id)
    values (new.id)
    on conflict (order_id) do nothing;
  elsif new.payment_method <> 'cod' and new.status = 'paid' then
    insert into public.warehouse_dispatches(order_id)
    values (new.id)
    on conflict (order_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists orders_queue_warehouse_dispatch on public.orders;
create trigger orders_queue_warehouse_dispatch
after insert or update of status, payment_method on public.orders
for each row execute function public.queue_warehouse_dispatch();

comment on table public.warehouse_dispatches is
  'Private outbox for automated warehouse fulfilment notifications and status tracking.';
