-- Stall assignment per exhibitor registration (unique per event when set).
ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS stall_no text;

COMMENT ON COLUMN event_registrations.stall_no IS 'Stall number assigned on approval; must match event stall layout. Unique per event when not null.';

-- One registration per event cannot reuse the same stall number.
CREATE UNIQUE INDEX IF NOT EXISTS event_registrations_event_stall_unique
  ON event_registrations (event_id, stall_no)
  WHERE stall_no IS NOT NULL AND btrim(stall_no) <> '';
