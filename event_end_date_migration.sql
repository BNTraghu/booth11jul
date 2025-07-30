-- Event End Date/Time Migration Script
-- Add end date and end time fields to events table

-- =====================================================
-- EVENTS TABLE MIGRATION
-- =====================================================

-- Add end date and end time fields to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_date date;
ALTER TABLE events ADD COLUMN IF NOT EXISTS event_end_time time;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify events table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name IN ('event_date', 'event_end_date', 'event_time', 'event_end_time')
ORDER BY ordinal_position;

-- =====================================================
-- MIGRATION COMPLETION MESSAGE
-- =====================================================

SELECT 'Event end date/time migration completed successfully!' as status; 