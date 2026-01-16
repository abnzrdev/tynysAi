import "dotenv/config";
import bcrypt from "bcryptjs";
import { count, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { iotData, sensorReadings, sensors, sites, users } from "../lib/db/schema";

const ALMATY_LAT = 43.238949;
const ALMATY_LNG = 76.889709;
const ALMATY_ALTITUDE = 750;

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number) {
  return Math.floor(randomRange(min, max + 1));
}

function jitter(value: number, span: number) {
  return value + randomRange(-span, span);
}

async function main() {
  const connectionString = process.env.DB_URL;
  if (!connectionString) {
    throw new Error("DB_URL environment variable is not set");
  }

  const seedEmail = process.env.SEED_EMAIL || "admin@example.com";
  const seedPassword = process.env.SEED_PASSWORD || "password123";
  const seedName = process.env.SEED_NAME || "Admin Account";

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client);

  try {
    await client`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'sensor_readings' AND column_name = 'id'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'sensor_readings' AND column_name = 'reading_id'
        ) THEN
          ALTER TABLE sensor_readings RENAME COLUMN id TO reading_id;
        END IF;
      END $$;
    `;

    const passwordHash = await bcrypt.hash(seedPassword, 10);

    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, seedEmail))
      .limit(1);

    const userId = existingUser?.id
      ?? (await db
        .insert(users)
        .values({
          name: seedName,
          email: seedEmail,
          password: passwordHash,
          isAdmin: "true",
        })
        .returning())[0].id;

    if (existingUser) {
      await db
        .update(users)
        .set({ password: passwordHash, name: seedName, isAdmin: "true" })
        .where(eq(users.id, existingUser.id));
    }

    const [existingSite] = await db
      .select()
      .from(sites)
      .where(eq(sites.siteName, "Almaty Central"))
      .limit(1);

    const siteId = existingSite?.id
      ?? (await db
        .insert(sites)
        .values({
          siteName: "Almaty Central",
          city: "Almaty",
          country: "KZ",
          transitType: "mixed",
          siteDescription: "Central Almaty sensor deployment area",
        })
        .returning())[0].id;

    const deviceIds = Array.from({ length: 5 }, (_, i) => `almaty-sensor-${String(i + 1).padStart(3, "0")}`);

    for (const deviceId of deviceIds) {
      const [existingSensor] = await db
        .select()
        .from(sensors)
        .where(eq(sensors.deviceId, deviceId))
        .limit(1);

      if (!existingSensor) {
        await db
          .insert(sensors)
          .values({
            deviceId,
            siteId,
            sensorType: "air_quality",
            latitude: jitter(ALMATY_LAT, 0.02),
            longitude: jitter(ALMATY_LNG, 0.02),
            altitude: ALMATY_ALTITUDE + randomRange(-50, 50),
            environmentType: ["indoor", "outdoor", "transit"][randomInt(0, 2)],
            isActive: true,
            hardwareVersion: "v2.1",
            firmwareVersion: "1.4.2",
            installationDate: new Date(Date.now() - randomInt(30, 180) * 24 * 60 * 60 * 1000),
          });
      }
    }

    const sensorRows = await db
      .select()
      .from(sensors)
      .where(inArray(sensors.deviceId, deviceIds));

    const sensorIds = sensorRows.map((row) => row.id);

    if (sensorIds.length > 0) {
      await db.delete(sensorReadings).where(inArray(sensorReadings.sensorId, sensorIds));
    }

    const sensorCoords = Object.fromEntries(
      sensorRows.map((row) => [row.deviceId, { lat: row.latitude ?? ALMATY_LAT, lng: row.longitude ?? ALMATY_LNG, id: row.id }]),
    );

    const now = Date.now();
    const readings = Array.from({ length: 120 }, (_, idx) => {
      const deviceId = deviceIds[idx % deviceIds.length];
      const sensorInfo = sensorCoords[deviceId];
      const ts = new Date(now - (120 - idx) * 30 * 60 * 1000);

      const pm1 = randomRange(5, 30);
      const pm25 = randomRange(15, 60);
      const pm10 = randomRange(20, 100);
      const co2 = randomRange(400, 850);
      const co = randomRange(0.5, 5);
      const o3 = randomRange(20, 80);
      const no2 = randomRange(10, 50);
      const voc = randomRange(0.1, 2);
      const ch2o = randomRange(0.01, 0.1);
      const temperature = randomRange(15, 30);
      const humidity = randomRange(30, 70);
      const pressure = randomRange(920, 950);
      const batteryLevel = randomInt(60, 100);
      const signalStrength = randomInt(-90, -70);
      const dataQualityScore = randomRange(0.85, 1.0);

      return {
        timestamp: ts,
        sensorId: sensorInfo.id,
        pm1: Math.round(pm1 * 10) / 10,
        pm25: Math.round(pm25 * 10) / 10,
        pm10: Math.round(pm10 * 10) / 10,
        co2: Math.round(co2 * 10) / 10,
        co: Math.round(co * 100) / 100,
        o3: Math.round(o3 * 10) / 10,
        no2: Math.round(no2 * 10) / 10,
        voc: Math.round(voc * 100) / 100,
        ch2o: Math.round(ch2o * 1000) / 1000,
        temperature: Math.round(temperature * 10) / 10,
        humidity: Math.round(humidity * 10) / 10,
        pressure: Math.round(pressure * 10) / 10,
        batteryLevel,
        signalStrength,
        dataQualityScore: Math.round(dataQualityScore * 100) / 100,
        location: `${sensorInfo.lat},${sensorInfo.lng}`,
        transportType: ["bus", "metro", "train", "outdoor"][randomInt(0, 3)],
        userId,
      };
    });

    await db.insert(sensorReadings).values(readings);

    const [{ iotCount }] = await db
      .select({ iotCount: count() })
      .from(iotData)
      .where(eq(iotData.userId, userId));

    if (Number(iotCount) === 0) {
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
    }

    console.log("✅ Seed completed for", seedEmail);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("❌ Seed failed", error);
  process.exit(1);
});
