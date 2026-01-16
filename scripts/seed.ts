import "dotenv/config";
import bcrypt from "bcryptjs";
import { eq, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { iotData, sensorReadings, users, sensors, sites } from "../lib/db/schema";

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

    // Almaty coordinates (approximate center)
    const ALMATY_CENTER_LAT = 43.2220;
    const ALMATY_CENTER_LNG = 76.8512;
    const ALMATY_ALTITUDE = 750; // meters above sea level
    
    // Helper function to generate random number in range
    const random = (min: number, max: number) => Math.random() * (max - min) + min;
    const randomInt = (min: number, max: number) => Math.floor(random(min, max + 1));
    
    // Helper function to add slight variation to coordinates (within ~10km radius)
    const randomLat = () => ALMATY_CENTER_LAT + random(-0.15, 0.15);
    const randomLng = () => ALMATY_CENTER_LNG + random(-0.15, 0.15);

    if (Number(readingCount) === 0) {
      const now = Date.now();
      
      // Create Almaty site
      const [existingAlmatySite] = await db
        .select()
        .from(sites)
        .where(eq(sites.siteName, "Almaty Central"))
        .limit(1);
      
      let almatySiteId: number;
      if (existingAlmatySite) {
        almatySiteId = existingAlmatySite.id;
      } else {
        const [newSite] = await db
          .insert(sites)
          .values({
            siteName: "Almaty Central",
            city: "Almaty",
            country: "KZ",
            transitType: "mixed",
            siteDescription: "Central Almaty sensor deployment area",
          })
          .returning();
        almatySiteId = newSite.id;
      }
      
      // Create multiple sensors in Almaty with lat/lng
      const sensorDeviceIds = Array.from({ length: 5 }, (_, i) => `almaty-sensor-${String(i + 1).padStart(3, '0')}`);
      const sensorMap = new Map<string, number>();
      
      for (const deviceId of sensorDeviceIds) {
        const [existingSensor] = await db
          .select()
          .from(sensors)
          .where(eq(sensors.deviceId, deviceId))
          .limit(1);
        
        if (existingSensor) {
          sensorMap.set(deviceId, existingSensor.id);
        } else {
          const [newSensor] = await db
            .insert(sensors)
            .values({
              deviceId,
              siteId: almatySiteId,
              sensorType: 'air_quality',
              latitude: randomLat(),
              longitude: randomLng(),
              altitude: ALMATY_ALTITUDE + random(-50, 50),
              environmentType: ['indoor', 'outdoor', 'transit'][randomInt(0, 2)],
              isActive: true,
              hardwareVersion: 'v2.1',
              firmwareVersion: '1.4.2',
              installationDate: new Date(now - randomInt(30, 180) * 24 * 60 * 60 * 1000),
            })
            .returning();
          sensorMap.set(deviceId, newSensor.id);
        }
      }
      
      // Generate 50 realistic sensor readings
      const seedReadings = Array.from({ length: 50 }, (_, idx) => {
        const sensorId = sensorMap.get(sensorDeviceIds[idx % sensorDeviceIds.length])!;
        const ts = new Date(now - (50 - idx) * 60 * 60 * 1000); // Spread over 50 hours
        
        // Generate realistic air quality values for Almaty
        const pm1 = random(5, 30);
        const pm25 = random(15, 60);
        const pm10 = random(20, 100);
        const co2 = random(400, 800);
        const co = random(0.5, 5);
        const o3 = random(20, 80);
        const no2 = random(10, 50);
        const voc = random(0.1, 2);
        const ch2o = random(0.01, 0.1);
        const temperature = random(15, 30); // Almaty climate
        const humidity = random(30, 70);
        const pressure = random(920, 950); // At ~750m altitude
        const batteryLevel = randomInt(60, 100);
        const signalStrength = randomInt(-90, -70);
        const dataQualityScore = random(0.85, 1.0);
        
        return {
          timestamp: ts,
          sensorId,
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
          location: "Almaty",
          transportType: ['bus', 'metro', 'train', 'outdoor'][randomInt(0, 3)],
          userId,
        };
      });

      await db.insert(sensorReadings).values(seedReadings);
      console.log(`✅ Inserted ${seedReadings.length} sensor readings for Almaty`);
      console.log(`✅ Created ${sensorDeviceIds.length} sensors with lat/lng coordinates`);
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
