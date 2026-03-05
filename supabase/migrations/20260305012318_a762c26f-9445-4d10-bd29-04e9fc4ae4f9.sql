
-- Add stock_quantity to products
ALTER TABLE public.products ADD COLUMN stock_quantity INTEGER DEFAULT NULL;

-- Create product_categories table
CREATE TABLE public.product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  icon TEXT DEFAULT 'Package',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert current categories
INSERT INTO public.product_categories (value, label, icon, sort_order) VALUES
  ('ceramica', 'Cerámica', 'Palette', 0),
  ('merch', 'Merch', 'Shirt', 1),
  ('cafe', 'Café', 'Coffee', 2),
  ('otro', 'Otro', 'Package', 3);

-- RLS for product_categories
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories"
  ON public.product_categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.product_categories
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
      AND role IN ('admin', 'admin_events')
    )
  );

-- Remove CHECK constraint on category column to allow dynamic categories
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_check;
