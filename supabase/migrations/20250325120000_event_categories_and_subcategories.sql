-- Exhibition event taxonomy: top categories and subcategories (global reference data).

CREATE TABLE IF NOT EXISTS event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  sort_order int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_subcategories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_category_id uuid NOT NULL REFERENCES event_categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  sort_order int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (event_category_id, name)
);

CREATE INDEX IF NOT EXISTS idx_event_subcategories_category_id ON event_subcategories(event_category_id);

ALTER TABLE event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subcategories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read event_categories" ON event_categories;
CREATE POLICY "Authenticated users can read event_categories"
  ON event_categories FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can read event_subcategories" ON event_subcategories;
CREATE POLICY "Authenticated users can read event_subcategories"
  ON event_subcategories FOR SELECT TO authenticated USING (true);

-- Seed categories (idempotent on slug)
INSERT INTO event_categories (slug, name, sort_order) VALUES
  ('jewellery', 'Jewellery', 1),
  ('apparel-clothing', 'Apparel / Clothing', 2),
  ('dress-material-fabrics', 'Dress Material & Fabrics', 3),
  ('art-craft', 'Art & Craft', 4),
  ('home-decor-furnishing', 'Home Decor & Furnishing', 5),
  ('bags-accessories', 'Bags & Accessories', 6),
  ('food-beverages', 'Food & Beverages', 7),
  ('wellness-lifestyle', 'Wellness & Lifestyle', 8),
  ('kids-toys', 'Kids & Toys', 9),
  ('gifts-stationery', 'Gifts & Stationery', 10),
  ('wedding-bridal', 'Wedding & Bridal', 11),
  ('handmade-sustainable-products', 'Handmade & Sustainable Products', 12),
  ('services', 'Services (Optional but Useful)', 13)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Seed subcategories (idempotent on event_category_id + name)
INSERT INTO event_subcategories (event_category_id, name, sort_order)
SELECT ec.id, v.sub_name, v.sub_order
FROM event_categories ec
JOIN (
  VALUES
    -- Jewellery
    ('jewellery', 'Artificial Jewellery', 1),
    ('jewellery', 'Silver Jewellery', 2),
    ('jewellery', 'Gold & Precious Jewellery', 3),
    ('jewellery', 'Temple Jewellery', 4),
    ('jewellery', 'Kundan & Polki', 5),
    ('jewellery', 'Beaded Jewellery', 6),
    ('jewellery', 'Handmade / Artisan Jewellery', 7),
    ('jewellery', 'Bridal Jewellery', 8),
    ('jewellery', 'Men''s Jewellery', 9),
    ('jewellery', 'Gemstones & Crystals', 10),
    -- Apparel / Clothing
    ('apparel-clothing', 'Women''s Ethnic Wear (Sarees, Kurtis, Lehengas)', 1),
    ('apparel-clothing', 'Western Wear', 2),
    ('apparel-clothing', 'Fusion Wear', 3),
    ('apparel-clothing', 'Men''s Wear (Kurtas, Jackets)', 4),
    ('apparel-clothing', 'Kids Wear', 5),
    ('apparel-clothing', 'Designer Wear', 6),
    ('apparel-clothing', 'Sustainable / Organic Clothing', 7),
    ('apparel-clothing', 'Handloom & Khadi', 8),
    ('apparel-clothing', 'Bridal Wear', 9),
    -- Dress Material & Fabrics
    ('dress-material-fabrics', 'Unstitched Suits', 1),
    ('dress-material-fabrics', 'Cotton Fabrics', 2),
    ('dress-material-fabrics', 'Silk Fabrics', 3),
    ('dress-material-fabrics', 'Linen & Organic Fabrics', 4),
    ('dress-material-fabrics', 'Embroidered Fabrics', 5),
    ('dress-material-fabrics', 'Printed Fabrics (Block Print, Kalamkari)', 6),
    ('dress-material-fabrics', 'Dupattas & Shawls', 7),
    -- Art & Craft
    ('art-craft', 'Handmade Crafts', 1),
    ('art-craft', 'Paintings (Canvas, Madhubani, Warli)', 2),
    ('art-craft', 'Sculptures & Idols', 3),
    ('art-craft', 'DIY Craft Kits', 4),
    ('art-craft', 'Hand-painted Items', 5),
    ('art-craft', 'Pottery & Ceramics', 6),
    ('art-craft', 'Paper Crafts', 7),
    -- Home Decor & Furnishing
    ('home-decor-furnishing', 'Wall Decor', 1),
    ('home-decor-furnishing', 'Lamps & Lighting', 2),
    ('home-decor-furnishing', 'Cushions & Covers', 3),
    ('home-decor-furnishing', 'Carpets & Rugs', 4),
    ('home-decor-furnishing', 'Curtains', 5),
    ('home-decor-furnishing', 'Wooden Decor', 6),
    ('home-decor-furnishing', 'Metal Artifacts', 7),
    ('home-decor-furnishing', 'Indoor Plants & Planters', 8),
    -- Bags & Accessories
    ('bags-accessories', 'Handbags', 1),
    ('bags-accessories', 'Clutches', 2),
    ('bags-accessories', 'Sling Bags', 3),
    ('bags-accessories', 'Backpacks', 4),
    ('bags-accessories', 'Wallets', 5),
    ('bags-accessories', 'Travel Accessories', 6),
    ('bags-accessories', 'Fashion Accessories (Belts, Scarves)', 7),
    -- Food & Beverages
    ('food-beverages', 'Homemade Food Products', 1),
    ('food-beverages', 'Organic Foods', 2),
    ('food-beverages', 'Snacks & Namkeen', 3),
    ('food-beverages', 'Sweets & Desserts', 4),
    ('food-beverages', 'Pickles & Chutneys', 5),
    ('food-beverages', 'Beverages (Juices, Health Drinks)', 6),
    ('food-beverages', 'Vegan & Satvic Products', 7),
    -- Wellness & Lifestyle
    ('wellness-lifestyle', 'Skincare Products (Natural/Organic)', 1),
    ('wellness-lifestyle', 'Haircare Products', 2),
    ('wellness-lifestyle', 'Aromatherapy & Essential Oils', 3),
    ('wellness-lifestyle', 'Herbal Products', 4),
    ('wellness-lifestyle', 'Yoga & Meditation Items', 5),
    ('wellness-lifestyle', 'Incense & Spiritual Products', 6),
    -- Kids & Toys
    ('kids-toys', 'Educational Toys', 1),
    ('kids-toys', 'Handmade Toys', 2),
    ('kids-toys', 'Clothing & Accessories', 3),
    ('kids-toys', 'Books & Learning Kits', 4),
    ('kids-toys', 'Baby Care Products', 5),
    -- Gifts & Stationery
    ('gifts-stationery', 'Customized Gifts', 1),
    ('gifts-stationery', 'Greeting Cards', 2),
    ('gifts-stationery', 'Diaries & Journals', 3),
    ('gifts-stationery', 'Corporate Gifts', 4),
    ('gifts-stationery', 'Festive Hampers', 5),
    ('gifts-stationery', 'Personalized Items', 6),
    -- Wedding & Bridal
    ('wedding-bridal', 'Bridal Accessories', 1),
    ('wedding-bridal', 'Wedding Decor', 2),
    ('wedding-bridal', 'Return Gifts', 3),
    ('wedding-bridal', 'Mehendi Artists', 4),
    ('wedding-bridal', 'Bridal Makeup Services', 5),
    -- Handmade & Sustainable Products
    ('handmade-sustainable-products', 'Eco-friendly Products', 1),
    ('handmade-sustainable-products', 'Recycled Items', 2),
    ('handmade-sustainable-products', 'Bamboo Products', 3),
    ('handmade-sustainable-products', 'Handmade Soaps', 4),
    ('handmade-sustainable-products', 'Zero-waste Lifestyle Items', 5),
    -- Services
    ('services', 'Interior Designers', 1),
    ('services', 'Event Planners', 2),
    ('services', 'Photographers', 3),
    ('services', 'Tailoring & Customization', 4),
    ('services', 'Personal Stylists', 5)
) AS v(cat_slug, sub_name, sub_order) ON ec.slug = v.cat_slug
ON CONFLICT (event_category_id, name) DO UPDATE SET
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
