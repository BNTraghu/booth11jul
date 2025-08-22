-- Add stalls configuration field to events table
-- This migration adds the missing stalls field to store stall configuration as JSONB

-- =====================================================
-- ADD STALLS FIELD TO EVENTS TABLE
-- =====================================================

-- Add stalls field to store array of stall configurations
ALTER TABLE events ADD COLUMN IF NOT EXISTS stalls JSONB DEFAULT '[]'::jsonb;

-- Create an index on the stalls field for better performance
CREATE INDEX IF NOT EXISTS events_stalls_idx ON events USING GIN (stalls);

-- Add a comment to document the stalls field structure
COMMENT ON COLUMN events.stalls IS 'Array of stall configurations with structure: [{"id": "string", "stallNo": "string", "stallSize": "string", "stallCategory": "string", "price": number}]';

-- =====================================================
-- VALIDATE EXISTING EVENTS TABLE STRUCTURE
-- =====================================================

-- Check if all required fields exist
DO $$
DECLARE
    column_exists BOOLEAN;
BEGIN
    -- Check if stalls column was created successfully
    SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'stalls'
        AND table_schema = 'public'
    ) INTO column_exists;
    
    IF column_exists THEN
        RAISE NOTICE 'SUCCESS: stalls column added to events table';
    ELSE
        RAISE EXCEPTION 'FAILED: stalls column was not created';
    END IF;
END
$$;

-- =====================================================
-- SAMPLE DATA STRUCTURE FOR REFERENCE
-- =====================================================

/*
Example stalls data structure:
[
  {
    "id": "1755592792034",
    "stallNo": "A1",
    "stallSize": "Medium (8x8 ft)",
    "stallCategory": "Fashion & Accessories",
    "price": 5000
  },
  {
    "id": "1755592812248", 
    "stallNo": "A2",
    "stallSize": "Extra Large (12x12 ft)",
    "stallCategory": "Fashion & Accessories", 
    "price": 7800
  }
]
*/

-- =====================================================
-- EXAMPLE USAGE QUERIES
-- =====================================================

-- Insert event with stalls data:
/*
INSERT INTO events (title, stalls, status) VALUES (
  'Sample Event',
  '[
    {"id": "1", "stallNo": "A1", "stallSize": "Medium (8x8 ft)", "stallCategory": "Fashion", "price": 5000},
    {"id": "2", "stallNo": "A2", "stallSize": "Large (10x10 ft)", "stallCategory": "Food", "price": 6000}
  ]'::jsonb,
  'draft'
);
*/

-- Query events with stall information:
/*
SELECT 
  id, 
  title, 
  jsonb_array_length(stalls) as total_stalls,
  stalls
FROM events 
WHERE stalls IS NOT NULL 
AND jsonb_array_length(stalls) > 0;
*/

-- Query specific stall information:
/*
SELECT 
  id,
  title,
  stall->>'stallNo' as stall_number,
  stall->>'stallSize' as stall_size,
  stall->>'stallCategory' as category,
  (stall->>'price')::numeric as price
FROM events,
jsonb_array_elements(stalls) as stall
WHERE id = 'your-event-id';
*/
