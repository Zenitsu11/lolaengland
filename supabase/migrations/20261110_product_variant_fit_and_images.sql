ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS fit_type text NOT NULL DEFAULT 'Regular' CHECK (fit_type IN ('Regular','Oversized'));
ALTER TABLE public.product_variants ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.product_variants DROP CONSTRAINT IF EXISTS product_variants_product_id_size_color_key;
CREATE UNIQUE INDEX IF NOT EXISTS product_variants_product_size_color_fit_key ON public.product_variants (product_id, size, color, fit_type);
CREATE INDEX IF NOT EXISTS product_variants_product_color_fit_idx ON public.product_variants (product_id, color, fit_type) WHERE active = true;
