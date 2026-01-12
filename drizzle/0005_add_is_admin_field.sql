-- Add isAdmin field to users table
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_admin'
	) THEN
		ALTER TABLE "users" ADD COLUMN "is_admin" text DEFAULT 'false' NOT NULL;
	END IF;
END $$;

