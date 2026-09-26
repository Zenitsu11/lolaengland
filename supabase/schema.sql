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


-- Direct UPI QR payment additions.
alter table public.orders add column if not exists upi_transaction_id text;
create index if not exists orders_upi_transaction_idx on public.orders (upi_transaction_id);

-- Checkout charges are configurable from the private Payments admin tab.
alter table public.store_settings add column if not exists shipping_fee numeric(10,2) not null default 40;
alter table public.store_settings add column if not exists free_shipping_threshold numeric(10,2) not null default 799;
alter table public.store_settings add column if not exists platform_fee numeric(10,2) not null default 10;
alter table public.store_settings add column if not exists gst_rate numeric(5,2) not null default 5;

alter table public.orders add column if not exists subtotal numeric(12,2) not null default 0;
alter table public.orders add column if not exists shipping_fee numeric(12,2) not null default 0;
alter table public.orders add column if not exists platform_fee numeric(12,2) not null default 0;
alter table public.orders add column if not exists gst_rate numeric(5,2) not null default 0;
alter table public.orders add column if not exists gst_amount numeric(12,2) not null default 0;
alter table public.orders add column if not exists total_amount numeric(12,2) not null default 0;

-- Owner admin catalogue, inventory and coupons.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.product_inventory (
  product_id uuid primary key references public.products(id) on delete cascade,
  stock_qty integer not null default 0 check (stock_qty >= 0),
  reserved_qty integer not null default 0 check (reserved_qty >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  track_inventory boolean not null default true,
  updated_at timestamptz not null default now()
);
create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  description text not null default '',
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  discount_value numeric(12,2) not null default 0 check (discount_value >= 0),
  minimum_order_value numeric(12,2) not null default 0 check (minimum_order_value >= 0),
  maximum_discount numeric(12,2),
  usage_limit integer,
  used_count integer not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric(12,2) not null default 0;
alter table public.categories enable row level security;
alter table public.product_inventory enable row level security;
alter table public.coupons enable row level security;
drop policy if exists "Public can view active categories" on public.categories;
create policy "Public can view active categories" on public.categories for select using (active = true);
drop policy if exists "Public can view product inventory" on public.product_inventory;
create policy "Public can view product inventory" on public.product_inventory for select using (true);
drop policy if exists "Public can view active coupons" on public.coupons;
create policy "Public can view active coupons" on public.coupons for select using (active = true);
create index if not exists categories_active_sort_idx on public.categories (active, sort_order, created_at desc);
create index if not exists coupons_active_dates_idx on public.coupons (active, starts_at, expires_at);
create index if not exists orders_coupon_idx on public.orders (coupon_code);
insert into public.categories (name,slug,sort_order) values ('Oversized','oversized',10),('Graphics','graphics',20),('Everyday','everyday',30) on conflict (slug) do nothing;
drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories for each row execute function public.set_updated_at();
drop trigger if exists product_inventory_updated_at on public.product_inventory;
create trigger product_inventory_updated_at before update on public.product_inventory for each row execute function public.set_updated_at();
drop trigger if exists coupons_updated_at on public.coupons;
create trigger coupons_updated_at before update on public.coupons for each row execute function public.set_updated_at();

-- Persistent guest-checkout customer records.
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  shipping_address text not null default '',
  total_orders integer not null default 0,
  total_spent numeric(12,2) not null default 0,
  last_order_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists customers_phone_unique_idx on public.customers(phone) where phone <> '';
create index if not exists customers_email_idx on public.customers(lower(email)) where email <> '';
alter table public.orders add column if not exists customer_id uuid references public.customers(id) on delete set null;
alter table public.customers enable row level security;
drop policy if exists "No public customer access" on public.customers;
create policy "No public customer access" on public.customers for select using (false);
drop trigger if exists customers_updated_at on public.customers;
create trigger customers_updated_at before update on public.customers for each row execute function public.set_updated_at();


-- Newsletter subscribers for the storefront community signup.
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  source text not null default 'website',
  subscribed_at timestamptz not null default now(),
  active boolean not null default true
);
alter table public.newsletter_subscribers enable row level security;
drop policy if exists "Public can subscribe to newsletter" on public.newsletter_subscribers;
create policy "Public can subscribe to newsletter" on public.newsletter_subscribers for insert with check (active = true);
create index if not exists newsletter_subscribers_subscribed_at_idx on public.newsletter_subscribers (subscribed_at desc);
