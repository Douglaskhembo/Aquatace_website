
-- BRANCHES
CREATE TABLE public.branches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  area TEXT,
  address TEXT,
  county TEXT DEFAULT 'Kiambu',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  opening_hours TEXT DEFAULT 'Mon-Sun 7:00 AM - 9:00 PM',
  offer_note TEXT,
  serves_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  products_available TEXT[] DEFAULT ARRAY[]::TEXT[],
  delivery_radius_km NUMERIC,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.branches TO anon;
GRANT SELECT ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active branches are public" ON public.branches
  FOR SELECT USING (active = true);

-- ORDERS
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  delivery_address TEXT NOT NULL,
  delivery_lat DOUBLE PRECISION NOT NULL,
  delivery_lng DOUBLE PRECISION NOT NULL,
  delivery_notes TEXT,
  assigned_branch_id UUID REFERENCES public.branches(id),
  estimated_distance_km NUMERIC,
  estimated_duration_min NUMERIC,
  subtotal_kes NUMERIC NOT NULL DEFAULT 0,
  delivery_fee_kes NUMERIC NOT NULL DEFAULT 0,
  total_kes NUMERIC NOT NULL DEFAULT 0,
  delivery_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.orders TO anon;
GRANT INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can place orders" ON public.orders
  FOR INSERT WITH CHECK (true);
-- No public SELECT: order lookup goes through a server function using order_number as a token.

-- ORDER ITEMS
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  category TEXT,
  unit_price_kes NUMERIC NOT NULL,
  quantity INT NOT NULL,
  subtotal_kes NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.order_items TO anon;
GRANT INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can add order items" ON public.order_items
  FOR INSERT WITH CHECK (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_branches_updated BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_branches_active ON public.branches(active);
CREATE INDEX idx_orders_order_number ON public.orders(order_number);
CREATE INDEX idx_orders_branch ON public.orders(assigned_branch_id);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);

-- Seed branches
INSERT INTO public.branches (name, area, address, county, latitude, longitude, phone, whatsapp, email, offer_note, serves_areas, products_available, sort_order) VALUES
('Marurui Branch', 'Marurui', 'Marurui, Nairobi', 'Nairobi', -1.2280, 36.8536, '+254795199701', '+254795199701', 'marurui@aquatacet.co.ke',
  '10% discount + free delivery', ARRAY['Marurui','Thome','Ridgeways','Kasarani'], ARRAY['Water refills','Bottled water','6kg gas','13kg gas'], 1),
('Kihunguro Branch', 'Kihunguro', 'Kihunguro, Ruiru', 'Kiambu', -1.1530, 36.9700, '+254713727229', '+254713727229', 'kihunguro@aquatacet.co.ke',
  '10% discount + free delivery', ARRAY['Kihunguro','Kamakis','Ruiru','Thika Super Highway'], ARRAY['Water refills','Bottled water','6kg gas','13kg gas'], 2),
('Membley Branch', 'Membley', 'Membley Estate, Ruiru', 'Kiambu', -1.1650, 36.9550, '+254707201072', '+254707201072', 'membley@aquatacet.co.ke',
  '10% discount + free delivery', ARRAY['Membley','Ruiru'], ARRAY['Gas supply','Selected water products'], 3),
('Ting''ang''a Branch', 'Ting''ang''a', 'Ting''ang''a, Kiambu', 'Kiambu', -1.1550, 36.8100, '+254112819068', '+254112819068', 'tingang@aquatacet.co.ke',
  'Shop location', ARRAY['Ting''ang''a','Kiambu','Githunguri'], ARRAY['Water refills','Bottled water','6kg gas','13kg gas'], 4);
