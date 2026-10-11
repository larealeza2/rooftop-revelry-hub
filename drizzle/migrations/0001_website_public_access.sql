-- Website integration: anonymous visitors may browse the menu, experiences and
-- gallery, and may submit a table request. Nothing else is exposed to them.

GRANT SELECT ON public.menu_items TO anon;
GRANT SELECT ON public.experiences TO anon;
GRANT SELECT ON public.gallery_images TO anon;
GRANT INSERT ON public.reservations TO anon;

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public available menu" ON public.menu_items;
CREATE POLICY "Public available menu" ON public.menu_items
  FOR SELECT TO anon USING (available = true);

DROP POLICY IF EXISTS "Public experiences" ON public.experiences;
CREATE POLICY "Public experiences" ON public.experiences
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Public gallery" ON public.gallery_images;
CREATE POLICY "Public gallery" ON public.gallery_images
  FOR SELECT TO anon USING (true);

-- Insert only: guests can ask for a table, never read, change or remove one.
DROP POLICY IF EXISTS "Guests request a table" ON public.reservations;
CREATE POLICY "Guests request a table" ON public.reservations
  FOR INSERT TO anon
  WITH CHECK (
    status = 'pending'
    AND party_size BETWEEN 1 AND 30
    AND char_length(btrim(guest_name)) BETWEEN 2 AND 80
    AND phone ~ '^\+?[0-9 ()-]{7,24}$'
    AND reservation_date >= CURRENT_DATE
    AND reservation_date <= CURRENT_DATE + 365
    AND char_length(coalesce(occasion, '')) <= 60
    AND char_length(coalesce(notes, '')) <= 500
  );

-- Server-side booking throttle. No policies and no anon grants: only the
-- restaurant's own server code can see it.
CREATE TABLE public.booking_throttle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX booking_throttle_ip_created_idx ON public.booking_throttle (ip, created_at);
GRANT ALL ON public.booking_throttle TO service_role;
ALTER TABLE public.booking_throttle ENABLE ROW LEVEL SECURITY;
