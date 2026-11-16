-- Add optional Myntra marketplace destinations without changing existing product or store data.
alter table public.products add column if not exists myntra_url text not null default '';
alter table public.store_settings add column if not exists myntra_seller_url text not null default '';
