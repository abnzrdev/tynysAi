-- Add isAdmin field to users table
ALTER TABLE "users" ADD COLUMN "is_admin" text DEFAULT 'false' NOT NULL;

