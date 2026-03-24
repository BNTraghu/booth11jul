-- Ensure organization_id exists on sponsors (idempotent for DBs that already have it).
ALTER TABLE sponsors
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_sponsors_organization_id ON sponsors(organization_id);
