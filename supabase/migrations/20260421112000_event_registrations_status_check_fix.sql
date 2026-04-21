-- Align event_registrations status constraint with actual app flows.
-- App uses: interested -> approved -> rejected (plus legacy pending/confirmed).

ALTER TABLE public.event_registrations
  DROP CONSTRAINT IF EXISTS event_registrations_status_check;

ALTER TABLE public.event_registrations
  ADD CONSTRAINT event_registrations_status_check
  CHECK (
    status IS NULL
    OR status IN ('pending', 'interested', 'approved', 'confirmed', 'rejected')
  );

