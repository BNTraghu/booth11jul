-- Customer / marketing testimonials (Super Admin manages via admin portal)

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_title text,
  content text NOT NULL,
  rating integer CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  avatar_url text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON testimonials (sort_order ASC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON testimonials (is_published) WHERE is_published = true;

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "testimonials_select_authenticated" ON testimonials;
CREATE POLICY "testimonials_select_authenticated"
  ON testimonials FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "testimonials_insert_authenticated" ON testimonials;
CREATE POLICY "testimonials_insert_authenticated"
  ON testimonials FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_update_authenticated" ON testimonials;
CREATE POLICY "testimonials_update_authenticated"
  ON testimonials FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "testimonials_delete_authenticated" ON testimonials;
CREATE POLICY "testimonials_delete_authenticated"
  ON testimonials FOR DELETE TO authenticated USING (true);
