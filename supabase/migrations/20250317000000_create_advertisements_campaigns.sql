-- Advertisements and Campaigns tables + campaign_ads junction + seed + RLS

-- advertisements
CREATE TABLE IF NOT EXISTS advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  title text NOT NULL,
  advertiser text NOT NULL,
  type text NOT NULL CHECK (type IN ('banner', 'video', 'sponsored_post', 'popup')),
  placement text NOT NULL CHECK (placement IN ('header', 'sidebar', 'footer', 'event_page', 'mobile_app')),
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  impressions numeric NOT NULL DEFAULT 0,
  clicks numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'completed', 'draft')),
  ctr numeric NOT NULL DEFAULT 0,
  cpm numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_advertisements_organization_id ON advertisements(organization_id);
CREATE INDEX IF NOT EXISTS idx_advertisements_status ON advertisements(status);

-- campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  target_audience text NOT NULL DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  budget numeric NOT NULL DEFAULT 0,
  spent numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'paused', 'completed', 'draft')),
  performance jsonb NOT NULL DEFAULT '{"impressions":0,"clicks":0,"conversions":0,"ctr":0,"cpc":0}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_organization_id ON campaigns(organization_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);

-- campaign_ads junction
CREATE TABLE IF NOT EXISTS campaign_ads (
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  advertisement_id uuid NOT NULL REFERENCES advertisements(id) ON DELETE CASCADE,
  PRIMARY KEY (campaign_id, advertisement_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_ads_campaign_id ON campaign_ads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_ads_advertisement_id ON campaign_ads(advertisement_id);

-- Seed data: use fixed UUIDs so campaign_ads can reference them
DO $$
DECLARE
  org_id uuid;
  ad1_id uuid := 'a1000001-0000-4000-8000-000000000001';
  ad2_id uuid := 'a1000001-0000-4000-8000-000000000002';
  ad3_id uuid := 'a1000001-0000-4000-8000-000000000003';
  camp1_id uuid := 'c2000001-0000-4000-8000-000000000001';
  camp2_id uuid := 'c2000001-0000-4000-8000-000000000002';
BEGIN
  SELECT id INTO org_id FROM organizations WHERE slug = 'boothbuzz' OR name = 'Boothbuzz' LIMIT 1;

  INSERT INTO advertisements (id, organization_id, title, advertiser, type, placement, start_date, end_date, budget, spent, impressions, clicks, status, ctr, cpm)
  VALUES
    (ad1_id, org_id, 'Premium Event Management Software', 'EventTech Solutions', 'banner', 'header', '2024-01-01', '2024-03-31', 50000, 32000, 125000, 2500, 'active', 2.0, 256),
    (ad2_id, org_id, 'Luxury Catering Services', 'Royal Feast Catering', 'sponsored_post', 'event_page', '2024-01-15', '2024-02-15', 25000, 25000, 85000, 1700, 'completed', 2.0, 294),
    (ad3_id, org_id, 'Sound & Lighting Equipment', 'ProAudio Systems', 'video', 'sidebar', '2024-02-01', '2024-04-30', 75000, 18000, 45000, 900, 'active', 2.0, 400)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO campaigns (id, organization_id, name, description, target_audience, start_date, end_date, budget, spent, status, performance)
  VALUES
    (camp1_id, org_id, 'Q1 Event Promotion Campaign', 'Promoting upcoming events for Q1 2024', 'Society members aged 25-45', '2024-01-01', '2024-03-31', 150000, 95000, 'active', '{"impressions":210000,"clicks":4200,"conversions":420,"ctr":2.0,"cpc":22.6}'::jsonb),
    (camp2_id, org_id, 'Summer Festival Marketing', 'Marketing campaign for summer cultural festivals', 'Families and young adults', '2024-04-01', '2024-06-30', 200000, 45000, 'active', '{"impressions":85000,"clicks":1700,"conversions":170,"ctr":2.0,"cpc":26.5}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO campaign_ads (campaign_id, advertisement_id)
  VALUES
    (camp1_id, ad1_id),
    (camp1_id, ad2_id),
    (camp2_id, ad3_id)
  ON CONFLICT (campaign_id, advertisement_id) DO NOTHING;
END $$;

-- RLS: allow SELECT for authenticated users
ALTER TABLE advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read advertisements for authenticated"
  ON advertisements FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read campaigns for authenticated"
  ON campaigns FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow read campaign_ads for authenticated"
  ON campaign_ads FOR SELECT TO authenticated USING (true);
