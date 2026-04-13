-- Dummy portfolio + 3 gallery URLs for existing exhibitors (Unsplash, suitable for demos).
-- Only fills rows that are missing portfolio, use the app default SVG as portfolio, or have an empty gallery.
-- Does not overwrite non-default portfolio or non-empty image_urls.

WITH ex AS (
  SELECT id, row_number() OVER (ORDER BY id) AS rn
  FROM public.exhibitors
),
pool AS (
  SELECT ARRAY[
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1540575467063-27aef4ef9ea5?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1505373877841-8d25f5644702?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&w=960&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&w=960&q=80'
  ]::text[] AS u
),
picked AS (
  SELECT
    e.id,
    p.u[((e.rn - 1) % 8) + 1] AS portrait,
    jsonb_build_array(
      p.u[((e.rn) % 8) + 1],
      p.u[((e.rn + 1) % 8) + 1],
      p.u[((e.rn + 2) % 8) + 1]
    ) AS slides
  FROM ex e
  CROSS JOIN pool p
)
UPDATE public.exhibitors AS x
SET
  portfolio_image_url = CASE
    WHEN x.portfolio_image_url IS NULL
      OR btrim(x.portfolio_image_url) = ''
      OR x.portfolio_image_url ILIKE '%default-exhibitor-profile%'
    THEN picked.portrait
    ELSE x.portfolio_image_url
  END,
  image_urls = CASE
    WHEN x.image_urls IS NULL
      OR jsonb_typeof(COALESCE(x.image_urls, '[]'::jsonb)) <> 'array'
      OR jsonb_array_length(
        CASE
          WHEN jsonb_typeof(COALESCE(x.image_urls, '[]'::jsonb)) = 'array' THEN x.image_urls
          ELSE '[]'::jsonb
        END
      ) = 0
    THEN picked.slides
    ELSE x.image_urls
  END
FROM picked
WHERE x.id = picked.id
  AND (
    x.portfolio_image_url IS NULL
    OR btrim(x.portfolio_image_url) = ''
    OR x.portfolio_image_url ILIKE '%default-exhibitor-profile%'
    OR x.image_urls IS NULL
    OR jsonb_typeof(COALESCE(x.image_urls, '[]'::jsonb)) <> 'array'
    OR jsonb_array_length(
      CASE
        WHEN jsonb_typeof(COALESCE(x.image_urls, '[]'::jsonb)) = 'array' THEN x.image_urls
        ELSE '[]'::jsonb
      END
    ) = 0
  );
