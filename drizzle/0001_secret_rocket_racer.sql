CREATE TABLE IF NOT EXISTS "sensor_readings" (
	"id" serial PRIMARY KEY NOT NULL,
	"timestamp" timestamp NOT NULL,
	"sensor_id" text NOT NULL,
	"value" double precision NOT NULL,
	"ingested_at" timestamp DEFAULT now() NOT NULL
);
