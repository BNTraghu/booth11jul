-- Primary portfolio / cover image for exhibitors (stable public URL recommended)
ALTER TABLE public.exhibitors
  ADD COLUMN IF NOT EXISTS portfolio_image_url text;

-- Backfill from first gallery image when portfolio is empty (only if image_urls is json/jsonb)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'exhibitors'
      AND column_name = 'image_urls'
      AND udt_name IN ('jsonb', 'json')
  ) THEN
    UPDATE public.exhibitors e
    SET portfolio_image_url = (
      SELECT elem
      FROM jsonb_array_elements_text(
        CASE
          WHEN jsonb_typeof(e.image_urls::jsonb) = 'array' THEN e.image_urls::jsonb
          ELSE '[]'::jsonb
        END
      ) AS t(elem)
      LIMIT 1
    )
    WHERE (e.portfolio_image_url IS NULL OR trim(e.portfolio_image_url) = '')
      AND e.image_urls IS NOT NULL
      AND jsonb_typeof(e.image_urls::jsonb) = 'array'
      AND jsonb_array_length(e.image_urls::jsonb) > 0;
  END IF;
END $$;
