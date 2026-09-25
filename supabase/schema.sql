-- LOLA ENGLAND database + storage setup

create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  price integer not null default 0 check (price >= 0),
  mrp integer not null default 0 check (mrp >= price),
  rating numeric(2,1) not null default 0 check (rating >= 0 and rating <= 5),
  reviews integer not null default 0 check (reviews >= 0),
  description text not null default '',
  image_url text not null default '',
  amazon_url text not null default '',
  flipkart_url text not null default '',
  featured boolean not null default true,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.store_settings (
  id boolean primary key default true check (id),
  brand_name text not null default 'LOLA ENGLAND',
  shipping_message text not null default 'FREE SHIPPING ON ORDERS OVER ₹799',
  instagram_url text not null default '',
  whatsapp_url text not null default '',
  contact_email text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.store_settings (id) values (true) on conflict (id) do nothing;

alter table public.products enable row level security;
alter table public.store_settings enable row level security;

drop policy if exists "Public can view active products" on public.products;
create policy "Public can view active products" on public.products for select using (active = true);

drop policy if exists "Public can view store settings" on public.store_settings;
create policy "Public can view store settings" on public.store_settings for select using (true);

create index if not exists products_active_sort_idx on public.products (active, sort_order, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();

drop trigger if exists store_settings_updated_at on public.store_settings;
create trigger store_settings_updated_at before update on public.store_settings for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images" on storage.objects for select using (bucket_id = 'product-images');

-- Payment gateway accounts and customer orders.
create table if not exists public.payment_accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  provider text not null default 'razorpay',
  key_id text not null,
  secret_key_encrypted text not null,
  upi_id text not null default '',
  active boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  razorpay_order_id text unique,
  razorpay_payment_id text,
  razorpay_signature text,
  payment_account_id uuid references public.payment_accounts(id) on delete set null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'INR',
  status text not null default 'created',
  payment_method text not null default 'razorpay',
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null default '',
  shipping_address text not null,
  items jsonb not null default '[]'::jsonb,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.payment_accounts enable row level security;
alter table public.orders enable row level security;
