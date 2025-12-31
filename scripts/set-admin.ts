import { db } from "../lib/db";
import { users } from "../lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Script to set a user as admin
 * Usage: npm run set:admin <email>
 */
async function setAdminByEmail(email: string) {
  try {
    console.log(`Setting admin role for user: ${email}`);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    // Update user to admin
    await db
      .update(users)
      .set({ isAdmin: 'true' })
      .where(eq(users.email, email));

    console.log(`✅ Successfully set ${user.name} (${email}) as admin`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting admin:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address");
  console.log("Usage: npm run set:admin <email>");
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error("❌ Invalid email format");
  process.exit(1);
}

setAdminByEmail(email);

