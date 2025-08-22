-- Add country and bank details columns to venues table if missing
DO $$
BEGIN
	-- country
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'country'
	) THEN
		ALTER TABLE public.venues ADD COLUMN country text;
	END IF;

	-- bank details
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'bank_name'
	) THEN
		ALTER TABLE public.venues ADD COLUMN bank_name text;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'bank_account_number'
	) THEN
		ALTER TABLE public.venues ADD COLUMN bank_account_number text;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'bank_holder_name'
	) THEN
		ALTER TABLE public.venues ADD COLUMN bank_holder_name text;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'bank_ifsc'
	) THEN
		ALTER TABLE public.venues ADD COLUMN bank_ifsc text;
	END IF;

	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'venues' AND column_name = 'bank_micr'
	) THEN
		ALTER TABLE public.venues ADD COLUMN bank_micr text;
	END IF;
END $$; 