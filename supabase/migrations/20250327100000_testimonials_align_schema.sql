-- Align existing testimonials table with app (CREATE TABLE IF NOT EXISTS skipped if table already existed)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'testimonials'
  ) THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN name TO author_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'author'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN author TO author_name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'role'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'author_title'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN role TO author_title;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'message'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN message TO content;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'body'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN body TO content;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'quote'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.testimonials RENAME COLUMN quote TO content;
  END IF;

  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_name text;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS author_title text;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS content text;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating integer;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS avatar_url text;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS is_published boolean NOT NULL DEFAULT true;
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
  ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

  UPDATE public.testimonials SET author_name = COALESCE(NULLIF(trim(author_name), ''), 'Unknown') WHERE author_name IS NULL;
  UPDATE public.testimonials SET content = COALESCE(NULLIF(trim(content), ''), '') WHERE content IS NULL;

  ALTER TABLE public.testimonials ALTER COLUMN author_name SET NOT NULL;
  ALTER TABLE public.testimonials ALTER COLUMN content SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class r ON r.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = r.relnamespace
    WHERE n.nspname = 'public' AND r.relname = 'testimonials' AND c.conname = 'testimonials_rating_check'
  ) THEN
    ALTER TABLE public.testimonials ADD CONSTRAINT testimonials_rating_check
      CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
  END IF;

  CREATE INDEX IF NOT EXISTS idx_testimonials_sort ON public.testimonials (sort_order ASC, created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials (is_published) WHERE is_published = true;
END $$;
