-- Allow authenticated users to update campaigns and advertisements
CREATE POLICY "Allow update campaigns for authenticated"
  ON campaigns FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow update advertisements for authenticated"
  ON advertisements FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
