-- Create sponsors table for Ads & Sponsors.
CREATE TABLE IF NOT EXISTS sponsors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE SET NULL,
  company_name text NOT NULL,
  contact_person text NOT NULL,
  email text NOT NULL,
  phone text,
  sponsorship_type text NOT NULL CHECK (sponsorship_type IN ('event', 'society', 'platform')),
  sponsorship_level text NOT NULL CHECK (sponsorship_level IN ('platinum', 'gold', 'silver', 'bronze')),
  amount numeric NOT NULL DEFAULT 0,
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'expired', 'cancelled')),
  benefits jsonb DEFAULT '[]'::jsonb,
  events_sponsored int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sponsors_organization_id ON sponsors(organization_id);
CREATE INDEX IF NOT EXISTS idx_sponsors_status ON sponsors(status);
