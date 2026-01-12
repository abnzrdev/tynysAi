-- Add user_id column to sensor_readings table for data isolation
-- This ensures each user can only see their own sensor readings

DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'user_id'
	) THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "user_id" integer REFERENCES "users"("id");
	END IF;
END $$;

