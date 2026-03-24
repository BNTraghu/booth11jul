-- Allow authenticated users to insert campaigns, advertisements, and campaign_ads
CREATE POLICY "Allow insert advertisements for authenticated"
  ON advertisements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow insert campaigns for authenticated"
  ON campaigns FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow insert campaign_ads for authenticated"
  ON campaign_ads FOR INSERT TO authenticated WITH CHECK (true);
