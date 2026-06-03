-- Ensure website_ads supports authenticated CRUD, including DELETE.
-- Without a DELETE policy, client-side delete calls can silently affect 0 rows under RLS.

ALTER TABLE IF EXISTS public.website_ads ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'website_ads'
      AND policyname = 'website_ads_select_authenticated'
  ) THEN
    CREATE POLICY website_ads_select_authenticated
      ON public.website_ads
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'website_ads'
      AND policyname = 'website_ads_insert_authenticated'
  ) THEN
    CREATE POLICY website_ads_insert_authenticated
      ON public.website_ads
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'website_ads'
      AND policyname = 'website_ads_update_authenticated'
  ) THEN
    CREATE POLICY website_ads_update_authenticated
      ON public.website_ads
      FOR UPDATE
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'website_ads'
      AND policyname = 'website_ads_delete_authenticated'
  ) THEN
    CREATE POLICY website_ads_delete_authenticated
      ON public.website_ads
      FOR DELETE
      TO authenticated
      USING (true);
  END IF;
END $$;
