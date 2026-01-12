import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { iotData, sensorReadings, users } from "../lib/db/schema";

async function main() {
  const connectionString = process.env.DB_URL;
  if (!connectionString) {
    throw new Error("DB_URL environment variable is not set");
  }

  const seedEmail = process.env.SEED_EMAIL || "test@example.com";
  const seedPassword = process.env.SEED_PASSWORD || "password123";
  const seedName = process.env.SEED_NAME || "Test Account";

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    const passwordHash = await bcrypt.hash(seedPassword, 10);

    const [user] = await db
      .insert(users)
      .values({
        name: seedName,
        email: seedEmail,
        password: passwordHash,
        isAdmin: "true",
      })
      .onConflictDoUpdate({
        target: users.email,
        set: { name: seedName, password: passwordHash, isAdmin: "true" },
      })
      .returning();

    const userId = user.id;
    console.log(`✅ Seed user ready (${seedEmail}) with id ${userId}`);

    const [{ readingCount }] = await db
      .select({ readingCount: count() })
      .from(sensorReadings)
      .where(eq(sensorReadings.userId, userId));

    if (Number(readingCount) === 0) {
      const now = Date.now();
      const seedReadings = Array.from({ length: 48 }, (_, idx) => {
        const ts = new Date(now - (48 - idx) * 60 * 60 * 1000);
        const locations = [
          { sensorId: "bus-001", location: "Almaty Bus Depot", transportType: "bus" },
          { sensorId: "metro-014", location: "Metro North", transportType: "metro" },
        ];
        const meta = locations[idx % locations.length];
        const value = 25 + (idx % 12) * 1.5;
        return {
          timestamp: ts.toISOString(),
          sensorId: meta.sensorId,
          value,
          location: meta.location,
          transportType: meta.transportType,
          userId,
        };
      });

      await db.insert(sensorReadings).values(seedReadings);
      console.log(`✅ Inserted ${seedReadings.length} sensor readings`);
    } else {
      console.log(`ℹ️ Sensor readings already present for ${seedEmail} (count=${readingCount})`);
    }

    const [{ iotCount }] = await db
      .select({ iotCount: count() })
      .from(iotData)
      .where(eq(iotData.userId, userId));

    if (Number(iotCount) === 0) {
      const now = Date.now();
      const seedIoT = Array.from({ length: 6 }, (_, idx) => ({
        timestamp: new Date(now - idx * 24 * 60 * 60 * 1000),
        dataPayload: {
          pm25: 30 + idx * 2,
          co2: 400 + idx * 25,
          humidity: 45 + idx,
          temperature: 22 + idx * 0.5,
        },
        userId,
      }));

      await db.insert(iotData).values(seedIoT);
      console.log(`✅ Inserted ${seedIoT.length} IoT summary rows`);
    } else {
      console.log(`ℹ️ IoT data already present for ${seedEmail} (count=${iotCount})`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("❌ Seed failed", error);
  process.exit(1);
});
