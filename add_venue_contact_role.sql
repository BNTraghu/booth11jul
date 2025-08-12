-- Add missing contact_role column to venues table
-- This fixes the "Could not find the 'contact_role' column of 'venues' in the schema cache" error

-- Check if the column exists first
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'venues' AND column_name = 'contact_role'
    ) THEN
        -- Add the contact_role column
        ALTER TABLE venues ADD COLUMN contact_role text;
        
        -- Add a comment to describe the column
        COMMENT ON COLUMN venues.contact_role IS 'Role/designation of the contact person';
        
        RAISE NOTICE 'Added contact_role column to venues table';
    ELSE
        RAISE NOTICE 'contact_role column already exists in venues table';
    END IF;
END $$;

-- Verify the column was added
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'venues' AND column_name = 'contact_role'; 