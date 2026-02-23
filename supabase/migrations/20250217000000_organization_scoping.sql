-- Add organization_id to events, venues, vendors (users already has it).
-- Create "Boothbuzz" org if missing and backfill all existing rows.

-- 1) Add columns (nullable first for backfill)
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- 2) Ensure Boothbuzz organization exists (no unique on slug required)
INSERT INTO organizations (id, name, slug, status, created_at, updated_at)
SELECT gen_random_uuid(), 'Boothbuzz', 'boothbuzz', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Boothbuzz');

-- 3) Backfill: set all existing events, venues, vendors, users to Boothbuzz
DO $$
DECLARE
  boothbuzz_id uuid;
BEGIN
  SELECT id INTO boothbuzz_id FROM organizations WHERE slug = 'boothbuzz' OR name = 'Boothbuzz' LIMIT 1;
  IF boothbuzz_id IS NOT NULL THEN
    UPDATE events   SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE venues   SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE vendors  SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE users    SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
  END IF;
END $$;

-- 4) Optional: add indexes for org filtering
CREATE INDEX IF NOT EXISTS idx_events_organization_id   ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_organization_id   ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_organization_id  ON vendors(organization_id);
