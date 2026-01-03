-- Add user_id column to sensor_readings table for data isolation
-- This ensures each user can only see their own sensor readings

ALTER TABLE "sensor_readings" ADD COLUMN "user_id" integer REFERENCES "users"("id");

