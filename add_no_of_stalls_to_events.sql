-- Add missing no_of_stalls column to events table
-- This column is needed for the Edit Event stalls validation to work properly

-- Check if column exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'events' 
        AND column_name = 'no_of_stalls'
    ) THEN
        -- Add the column
        ALTER TABLE events ADD COLUMN no_of_stalls integer DEFAULT 0;
        
        -- Add comment
        COMMENT ON COLUMN events.no_of_stalls IS 'Number of planned stalls for the event';
        
        -- Add constraint to ensure non-negative values
        ALTER TABLE events ADD CONSTRAINT check_no_of_stalls CHECK (no_of_stalls >= 0);
        
        RAISE NOTICE 'Added no_of_stalls column to events table';
    ELSE
        RAISE NOTICE 'Column no_of_stalls already exists in events table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name = 'no_of_stalls';
