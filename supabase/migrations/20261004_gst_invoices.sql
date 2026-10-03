-- GST invoice foundation
alter table public.store_settings add column if not exists gstin text not null default '';
alter table public.store_settings add column if not exists legal_name text not null default 'LOLA ENGLAND';
alter table public.store_settings add column if not exists business_address text not null default '';
alter table public.store_settings add column if not exists business_state text not null default 'Rajasthan';
alter table public.store_settings add column if not exists business_state_code text not null default '08';

alter table public.orders add column if not exists invoice_number text unique;
create index if not exists orders_invoice_number_idx on public.orders(invoice_number);
