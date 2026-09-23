CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Rooftop Admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  phone text NOT NULL,
  reservation_date date NOT NULL,
  reservation_time time NOT NULL,
  party_size integer NOT NULL CHECK (party_size > 0),
  occasion text,
  notes text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated admins manage reservations" ON public.reservations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX reservations_date_idx ON public.reservations (reservation_date, reservation_time);

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(12,2) NOT NULL CHECK (price >= 0),
  category text NOT NULL CHECK (category IN ('Indian','Continental','East African','Asian','Fast Food','Desserts')),
  image_url text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated admins manage menu" ON public.menu_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE INDEX menu_items_category_idx ON public.menu_items (category);

CREATE TABLE public.experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  image_url text,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.experiences TO authenticated;
GRANT ALL ON public.experiences TO service_role;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated admins manage experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  alt_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated admins manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated admins view media" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'restaurant-media');
CREATE POLICY "Authenticated admins upload media" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'restaurant-media');
CREATE POLICY "Authenticated admins update media" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'restaurant-media') WITH CHECK (bucket_id = 'restaurant-media');
CREATE POLICY "Authenticated admins delete media" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'restaurant-media');