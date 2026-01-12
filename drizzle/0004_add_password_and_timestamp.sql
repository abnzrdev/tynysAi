-- Migration: Add password and created_at columns for email authentication
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'password'
	) THEN
		ALTER TABLE "users" ADD COLUMN "password" text;
	END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'created_at'
	) THEN
		ALTER TABLE "users" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;
	END IF;
END $$;
