-- Run this entire script in Supabase Dashboard → SQL Editor → New query.
-- It adds organization_id to events, venues, vendors and backfills with Boothbuzz.

-- 1) Add organization_id column to events, venues, vendors
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

-- 2) Ensure Boothbuzz organization exists
-- Use the INSERT that matches your organizations table columns:
-- If you have (id, name, slug, status, created_at, updated_at):
INSERT INTO organizations (id, name, slug, status, created_at, updated_at)
SELECT gen_random_uuid(), 'Boothbuzz', 'boothbuzz', 'active', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Boothbuzz');

-- If the above fails (e.g. no slug/updated_at), try this instead and comment out the one above:
-- INSERT INTO organizations (id, name, created_at)
-- SELECT gen_random_uuid(), 'Boothbuzz', now()
-- WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Boothbuzz');

-- 3) Backfill: set all existing rows to Boothbuzz
DO $$
DECLARE
  boothbuzz_id uuid;
BEGIN
  SELECT id INTO boothbuzz_id FROM organizations WHERE name = 'Boothbuzz' LIMIT 1;
  IF boothbuzz_id IS NOT NULL THEN
    UPDATE events   SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE venues   SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE vendors  SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
    UPDATE users    SET organization_id = boothbuzz_id WHERE organization_id IS NULL;
  END IF;
END $$;

-- 4) Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_events_organization_id   ON events(organization_id);
CREATE INDEX IF NOT EXISTS idx_venues_organization_id   ON venues(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_organization_id  ON vendors(organization_id);
