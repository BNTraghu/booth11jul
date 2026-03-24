-- Add exhibitor_id and status to event_registrations for exhibitor approval flow.
-- Existing rows (name/email/phone only) keep exhibitor_id NULL and get status 'pending' or 'confirmed'.

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS exhibitor_id uuid REFERENCES exhibitors(id) ON DELETE SET NULL;

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Optional: index for listing by event and exhibitor
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_exhibitor
  ON event_registrations(event_id, exhibitor_id)
  WHERE exhibitor_id IS NOT NULL;
