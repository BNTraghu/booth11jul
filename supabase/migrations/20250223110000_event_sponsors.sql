-- Assign sponsors to events with a role (e.g. Title, Co-Sponsor).
CREATE TABLE IF NOT EXISTS event_sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  sponsor_id uuid NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'co_sponsor'
    CHECK (role IN ('title', 'co_sponsor', 'associate', 'supporting', 'in_kind')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, sponsor_id)
);

CREATE INDEX IF NOT EXISTS idx_event_sponsors_event_id ON event_sponsors(event_id);
CREATE INDEX IF NOT EXISTS idx_event_sponsors_sponsor_id ON event_sponsors(sponsor_id);
