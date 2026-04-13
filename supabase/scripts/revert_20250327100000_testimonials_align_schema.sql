-- Revert structural changes from 20250327100000_testimonials_align_schema.sql
-- Run manually in Supabase SQL Editor (do not rely on this for fresh DBs).
--
-- Renames: the align migration renamed at most one source into author_name / author_title / content.
-- After the block below, uncomment EXACTLY the matching RENAME section for your old column names
-- (see bottom). If you skip renames, PostgREST/app will still expect author_name unless you change the app.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'testimonials'
  ) THEN
    RETURN;
  END IF;

  DROP INDEX IF EXISTS public.idx_testimonials_sort;
  DROP INDEX IF EXISTS public.idx_testimonials_published;

  ALTER TABLE public.testimonials DROP CONSTRAINT IF EXISTS testimonials_rating_check;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'author_name'
  ) THEN
    ALTER TABLE public.testimonials ALTER COLUMN author_name DROP NOT NULL;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'content'
  ) THEN
    ALTER TABLE public.testimonials ALTER COLUMN content DROP NOT NULL;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- Renames (undo). Uncomment only the lines that match your schema BEFORE the align migration.
-- Before running a RENAME, ensure the target name does not already exist.
-- ---------------------------------------------------------------------------

-- If author_name came from column `name`:
-- ALTER TABLE public.testimonials RENAME COLUMN author_name TO name;

-- If author_name came from column `author`:
-- ALTER TABLE public.testimonials RENAME COLUMN author_name TO author;

-- If author_title came from column `role`:
-- ALTER TABLE public.testimonials RENAME COLUMN author_title TO role;

-- If content came from `message` / `body` / `quote` (pick one):
-- ALTER TABLE public.testimonials RENAME COLUMN content TO message;
-- ALTER TABLE public.testimonials RENAME COLUMN content TO body;
-- ALTER TABLE public.testimonials RENAME COLUMN content TO quote;

-- ---------------------------------------------------------------------------
-- Optional: drop columns that align ADDED (empty/new) and you do not want.
-- Do NOT use if that column was produced by a RENAME above (use RENAME back instead).
-- Dropping loses data in that column.
-- ---------------------------------------------------------------------------

-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS author_title;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS rating;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS avatar_url;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS sort_order;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS is_published;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS created_at;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS updated_at;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS author_name;
-- ALTER TABLE public.testimonials DROP COLUMN IF EXISTS content;
