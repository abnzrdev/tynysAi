-- Migration: Make clerkId column optional for NextAuth migration
ALTER TABLE "users" ALTER COLUMN "clerk_id" DROP NOT NULL;

