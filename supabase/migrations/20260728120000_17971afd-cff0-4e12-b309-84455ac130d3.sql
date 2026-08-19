-- The `products` table already exists in this project (seeded with the current catalog) and
-- already has public-read RLS in place. Only add the column the new admin image-upload flow
-- needs for clean deletes — safe/additive against the existing live table and data.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image_path TEXT;

-- GALLERY IMAGES (new table)
CREATE TABLE public.gallery_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_path TEXT,
  alt_text TEXT NOT NULL DEFAULT '',
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon;
GRANT SELECT ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gallery images are public" ON public.gallery_images
  FOR SELECT USING (true);

CREATE TRIGGER trg_gallery_images_updated BEFORE UPDATE ON public.gallery_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_gallery_images_sort ON public.gallery_images(sort_order);

-- STORAGE: public "media" bucket. Reads are public; writes require the existing
-- has_role(auth.uid(), 'admin') check (same admin-role system already used elsewhere
-- in this project), not just "any logged-in user".
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Admins upload media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'media' AND public.has_role(auth.uid(), 'admin'));

-- ADMIN ACCESS: after creating your login in Supabase Dashboard → Authentication → Users,
-- run this separately (replace the email) to grant that account the admin role. Not run
-- automatically here since it depends on an account that doesn't exist yet.
-- insert into public.user_roles (user_id, role)
-- select id, 'admin' from auth.users
-- where email = 'you@example.com'
--   and not exists (
--     select 1 from public.user_roles ur where ur.user_id = auth.users.id and ur.role = 'admin'
--   );
