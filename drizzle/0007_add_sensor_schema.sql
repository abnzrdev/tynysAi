-- Create sites table
CREATE TABLE IF NOT EXISTS "sites" (
	"site_id" serial PRIMARY KEY NOT NULL,
	"site_name" text NOT NULL,
	"city" text,
	"country" text DEFAULT 'KZ',
	"transit_type" text,
	"site_description" text,
	"contact_person" text,
	"contact_email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sites_site_name_idx" ON "sites"("site_name");
--> statement-breakpoint
-- Create sensors table
CREATE TABLE IF NOT EXISTS "sensors" (
	"sensor_id" serial PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"site_id" integer,
	"sensor_type" text NOT NULL,
	"hardware_version" text,
	"firmware_version" text,
	"installation_date" timestamp,
	"last_calibration_date" timestamp,
	"latitude" double precision,
	"longitude" double precision,
	"altitude" double precision,
	"environment_type" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "sensors_device_id_idx" ON "sensors"("device_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensors_site_id_idx" ON "sensors"("site_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensors_is_active_idx" ON "sensors"("is_active");
--> statement-breakpoint
-- Add foreign key constraint for sensors.site_id
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.table_constraints
		WHERE table_schema = 'public'
			AND table_name = 'sensors'
			AND constraint_name = 'sensors_site_id_sites_site_id_fk'
	) THEN
		ALTER TABLE "sensors" ADD CONSTRAINT "sensors_site_id_sites_site_id_fk" FOREIGN KEY ("site_id") REFERENCES "sites"("site_id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
-- Rename sensor_readings.id to reading_id if it exists as id
DO $$
BEGIN
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'id'
	) AND NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'reading_id'
	) THEN
		ALTER TABLE "sensor_readings" RENAME COLUMN "id" TO "reading_id";
	END IF;
END $$;
--> statement-breakpoint
-- Add new columns to sensor_readings table
DO $$
BEGIN
	-- Handle sensor_id column migration (text -> integer)
	IF EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'sensor_id'
			AND data_type = 'text'
	) THEN
		-- Drop the old text column
		ALTER TABLE "sensor_readings" DROP COLUMN "sensor_id";
	END IF;
	
	-- Add sensor_id column (integer, references sensors)
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'sensor_id'
			AND data_type = 'integer'
	) THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "sensor_id" integer;
	END IF;
	
	-- Add server_received_at column
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.columns
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND column_name = 'server_received_at'
	) THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "server_received_at" timestamp DEFAULT now() NOT NULL;
	END IF;
	
	-- Add PM columns
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'pm1') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "pm1" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'pm25') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "pm25" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'pm10') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "pm10" double precision;
	END IF;
	
	-- Add gas columns
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'co2') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "co2" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'co') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "co" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'o3') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "o3" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'no2') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "no2" double precision;
	END IF;
	
	-- Add VOC columns
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'voc') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "voc" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'ch2o') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "ch2o" double precision;
	END IF;
	
	-- Add environmental columns
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'temperature') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "temperature" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'humidity') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "humidity" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'pressure') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "pressure" double precision;
	END IF;
	
	-- Add sensor status columns
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'battery_level') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "battery_level" integer;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'signal_strength') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "signal_strength" integer;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'error_code') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "error_code" text;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'data_quality_score') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "data_quality_score" double precision;
	END IF;
	IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'data_hash') THEN
		ALTER TABLE "sensor_readings" ADD COLUMN "data_hash" text;
	END IF;
END $$;
--> statement-breakpoint
-- Make sensor_id NOT NULL if it doesn't have data, or add constraint
DO $$
BEGIN
	-- First, check if we can make it NOT NULL (only if table is empty or all rows have sensor_id)
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.table_constraints
		WHERE table_schema = 'public'
			AND table_name = 'sensor_readings'
			AND constraint_name = 'sensor_readings_sensor_id_sensors_sensor_id_fk'
	) THEN
		-- Add foreign key constraint
		ALTER TABLE "sensor_readings" ADD CONSTRAINT "sensor_readings_sensor_id_sensors_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("sensor_id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
--> statement-breakpoint
-- Create indexes for sensor_readings (only after columns are added)
DO $$
BEGIN
	-- Create timestamp index
	IF NOT EXISTS (
		SELECT 1 FROM pg_indexes WHERE indexname = 'sensor_readings_timestamp_idx'
	) THEN
		CREATE INDEX "sensor_readings_timestamp_idx" ON "sensor_readings"("timestamp" DESC);
	END IF;
	
	-- Create sensor_id index (only if column exists)
	IF EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'sensor_id'
	) THEN
		IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sensor_readings_sensor_timestamp_idx') THEN
			CREATE INDEX "sensor_readings_sensor_timestamp_idx" ON "sensor_readings"("sensor_id", "timestamp");
		END IF;
		IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sensor_readings_sensor_id_idx') THEN
			CREATE INDEX "sensor_readings_sensor_id_idx" ON "sensor_readings"("sensor_id");
		END IF;
	END IF;
	
	-- Create data_hash index (only if column exists)
	IF EXISTS (
		SELECT 1 FROM information_schema.columns 
		WHERE table_schema = 'public' AND table_name = 'sensor_readings' AND column_name = 'data_hash'
	) THEN
		IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'sensor_readings_data_hash_idx') THEN
			CREATE INDEX "sensor_readings_data_hash_idx" ON "sensor_readings"("data_hash");
		END IF;
	END IF;
END $$;
--> statement-breakpoint
-- Create sensor_health table
CREATE TABLE IF NOT EXISTS "sensor_health" (
	"health_id" serial PRIMARY KEY NOT NULL,
	"sensor_id" integer NOT NULL,
	"check_timestamp" timestamp DEFAULT now() NOT NULL,
	"uptime_seconds" integer,
	"reading_count_24h" integer,
	"battery_voltage" double precision,
	"memory_usage" integer,
	"last_reboot" timestamp,
	"health_status" text DEFAULT 'unknown' NOT NULL,
	"metadata_json" jsonb
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_health_sensor_id_idx" ON "sensor_health"("sensor_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_health_check_timestamp_idx" ON "sensor_health"("check_timestamp");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sensor_health_health_status_idx" ON "sensor_health"("health_status");
--> statement-breakpoint
-- Add foreign key for sensor_health
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1
		FROM information_schema.table_constraints
		WHERE table_schema = 'public'
			AND table_name = 'sensor_health'
			AND constraint_name = 'sensor_health_sensor_id_sensors_sensor_id_fk'
	) THEN
		ALTER TABLE "sensor_health" ADD CONSTRAINT "sensor_health_sensor_id_sensors_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("sensor_id") ON DELETE no action ON UPDATE no action;
	END IF;
END $$;
