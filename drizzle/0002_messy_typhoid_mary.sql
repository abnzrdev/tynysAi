DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'location'
	) THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "location" text;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'transport_type'
	) THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "transport_type" text;
	END IF;
END $$;