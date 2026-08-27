-- Delivery location capture now distinguishes a landmark from free-text delivery
-- instructions (which continue to use the existing delivery_notes column). Additive
-- and safe against the existing live orders table and data.
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_landmark TEXT;
