import dotenv from "dotenv";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "../lib/db/schema";

// Load local env first (dev), then default env resolution.
dotenv.config({ path: ".env.local" });
dotenv.config();

const OWNER_EMAIL = "hi@tynys.kz";
const DEFAULT_CITY = "Almaty";
const DEFAULT_COUNTRY = "KZ";
const READINGS_PER_RUN = Number.parseInt(
  process.env.SEED_READINGS_PER_RUN ?? "12",
  10,
);
const READING_INTERVAL_MS = Number.parseInt(
  process.env.SEED_READING_INTERVAL_MS ?? "5000",
  10,
);
const RUN_SALT = `${Date.now()}-${randomBytes(6).toString("hex")}`;

type Db = ReturnType<typeof drizzle<typeof schema>>;

type SeedSite = {
  siteName: string;
  city: string;
  country: string;
  transitType: string | null;
  siteDescription: string;
  contactPerson: string;
  contactEmail: string;
  sensors: Array<{
    deviceId: string;
    sensorType: string;
    hardwareVersion: string;
    firmwareVersion: string;
    latitude: number;
    longitude: number;
    altitude: number;
    environmentType: string;
    metadata: Record<string, unknown>;
  }>;
};

const seedSites: SeedSite[] = [
  {
    siteName: "AGI Lab",
    city: DEFAULT_CITY,
    country: DEFAULT_COUNTRY,
    transitType: null,
    siteDescription: "Indoor research lab near Al-Farabi avenue.",
    contactPerson: "Lab Operations",
    contactEmail: "ops@tynys.ai",
    sensors: [
      {
        deviceId: "lab01",
        sensorType: "multi-gas",
        hardwareVersion: "HX-2",
        firmwareVersion: "2.1.4",
        latitude: 43.2221,
        longitude: 76.8512,
        altitude: 790,
        environmentType: "indoor",
        metadata: { zone: "chemistry-wing", floor: 2 },
      },
      {
        deviceId: "lab02",
        sensorType: "particulate",
        hardwareVersion: "HX-2",
        firmwareVersion: "2.1.4",
        latitude: 43.2224,
        longitude: 76.8515,
        altitude: 792,
        environmentType: "indoor",
        metadata: { zone: "hvac-room", floor: 1 },
      },
    ],
  },
  {
    siteName: "Almaty Metro – Station A",
    city: DEFAULT_CITY,
    country: DEFAULT_COUNTRY,
    transitType: "metro",
    siteDescription: "Platform and concourse monitoring station.",
    contactPerson: "Transit Control",
    contactEmail: "metro@tynys.ai",
    sensors: [
      {
        deviceId: "metro01",
        sensorType: "multi-gas",
        hardwareVersion: "TX-3",
        firmwareVersion: "2.1.4",
        latitude: 43.238,
        longitude: 76.945,
        altitude: 760,
        environmentType: "transit-underground",
        metadata: { zone: "platform-north", line: "A" },
      },
      {
        deviceId: "metro02",
        sensorType: "particulate",
        hardwareVersion: "TX-3",
        firmwareVersion: "2.1.4",
        latitude: 43.2383,
        longitude: 76.9454,
        altitude: 758,
        environmentType: "transit-underground",
        metadata: { zone: "concourse", line: "A" },
      },
      {
        deviceId: "metro03",
        sensorType: "environmental",
        hardwareVersion: "TX-3",
        firmwareVersion: "2.1.4",
        latitude: 43.2381,
        longitude: 76.9448,
        altitude: 759,
        environmentType: "transit-underground",
        metadata: { zone: "exit-gate", line: "A" },
      },
    ],
  },
  {
    siteName: "Bus #12 – Line North",
    city: DEFAULT_CITY,
    country: DEFAULT_COUNTRY,
    transitType: "bus",
    siteDescription: "In-vehicle air quality monitoring for route 12.",
    contactPerson: "Fleet Operations",
    contactEmail: "fleet@tynys.ai",
    sensors: [
      {
        deviceId: "bus12-front",
        sensorType: "multi-gas",
        hardwareVersion: "MX-1",
        firmwareVersion: "2.1.4",
        latitude: 43.2475,
        longitude: 76.9015,
        altitude: 775,
        environmentType: "transit-mobile",
        metadata: { zone: "front-door", route: "12N" },
      },
      {
        deviceId: "bus12-mid",
        sensorType: "particulate",
        hardwareVersion: "MX-1",
        firmwareVersion: "2.1.4",
        latitude: 43.248,
        longitude: 76.9022,
        altitude: 776,
        environmentType: "transit-mobile",
        metadata: { zone: "middle-cabin", route: "12N" },
      },
    ],
  },
];

function section(title: string): void {
  console.log(`\n=== ${title} ===`);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function deterministicUnit(seed: string): number {
  const hash = hashString(seed);
  const x = Math.sin(hash) * 10000;
  return x - Math.floor(x);
}

function valueForSeries(
  sensorKey: string,
  metric: string,
  step: number,
  min: number,
  max: number,
  waveFactor: number,
): number {
  const mid = (min + max) / 2;
  const span = max - min;
  const baseShift =
    (deterministicUnit(`${sensorKey}:${metric}:base`) - 0.5) * span * 0.25;
  const amplitude = span * waveFactor;
  const phase = deterministicUnit(`${sensorKey}:${metric}:phase`) * Math.PI * 2;
  const cycle = Math.sin((step / 20) * Math.PI * 2 + phase) * amplitude;
  const jitter =
    (deterministicUnit(`${sensorKey}:${metric}:${step}`) - 0.5) * span * 0.08;
  return round(clamp(mid + baseShift + cycle + jitter, min, max), 2);
}

function valueForRun(
  sensorKey: string,
  metric: string,
  step: number,
  min: number,
  max: number,
  waveFactor: number,
): number {
  const baseValue = valueForSeries(sensorKey, metric, step, min, max, waveFactor);
  const span = max - min;
  const runShift =
    (deterministicUnit(`${sensorKey}:${metric}:${RUN_SALT}`) - 0.5) * span * 0.14;
  const randomShift = (Math.random() - 0.5) * span * 0.06;
  return round(clamp(baseValue + runShift + randomShift, min, max), 2);
}

async function ensureUser(
  db: Db,
  email: string,
  options?: { name?: string; password?: string; rounds?: number },
) {
  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing.length > 0) {
    console.log(`- found user: ${email} (id=${existing[0].id})`);
    return existing[0];
  }

  const safePassword =
    options?.password ?? randomBytes(24).toString("base64url");
  const rounds = options?.rounds ?? 12;
  const passwordHash = await bcrypt.hash(safePassword, rounds);

  const inserted = await db
    .insert(schema.users)
    .values({
      email,
      name: options?.name ?? "Tynys User",
      password: passwordHash,
      isAdmin: "false",
    })
    .returning();

  console.log(`- created user: ${email} (id=${inserted[0].id})`);
  return inserted[0];
}

async function seedUsers(db: Db) {
  section("Users");

  const owner = await ensureUser(db, OWNER_EMAIL, {
    name: "Tynys Owner",
  });

  const e2eEmail = process.env.E2E_USER_EMAIL?.trim();
  const e2ePassword = process.env.E2E_USER_PASSWORD;

  if (e2eEmail && e2ePassword) {
    const existing = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, e2eEmail))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `- E2E user already exists: ${e2eEmail} (password preserved)`,
      );
    } else {
      const passwordHash = await bcrypt.hash(e2ePassword, 12);
      const inserted = await db
        .insert(schema.users)
        .values({
          email: e2eEmail,
          name: "E2E User",
          password: passwordHash,
          isAdmin: "false",
        })
        .returning();

      console.log(`- created E2E user: ${e2eEmail} (id=${inserted[0].id})`);
    }
  } else {
    console.log("- E2E env vars not fully set; skipping E2E user ensure");
  }

  return owner;
}

async function upsertSite(db: Db, site: SeedSite) {
  const existing = await db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.siteName, site.siteName))
    .limit(1);

  if (existing.length > 0) {
    console.log(`- found site: ${site.siteName} (id=${existing[0].id})`);
    return existing[0];
  }

  const inserted = await db
    .insert(schema.sites)
    .values({
      siteName: site.siteName,
      city: site.city,
      country: site.country,
      transitType: site.transitType,
      siteDescription: site.siteDescription,
      contactPerson: site.contactPerson,
      contactEmail: site.contactEmail,
    })
    .returning();

  console.log(`- created site: ${site.siteName} (id=${inserted[0].id})`);
  return inserted[0];
}

async function upsertSensor(
  db: Db,
  siteId: number,
  siteName: string,
  sensor: SeedSite["sensors"][number],
) {
  const existing = await db
    .select()
    .from(schema.sensors)
    .where(eq(schema.sensors.deviceId, sensor.deviceId))
    .limit(1);

  if (existing.length > 0) {
    console.log(`  - found sensor: ${sensor.deviceId} (id=${existing[0].id})`);
    return existing[0];
  }

  const inserted = await db
    .insert(schema.sensors)
    .values({
      deviceId: sensor.deviceId,
      siteId,
      sensorType: sensor.sensorType,
      hardwareVersion: sensor.hardwareVersion,
      firmwareVersion: sensor.firmwareVersion,
      installationDate: new Date(),
      lastCalibrationDate: new Date(),
      latitude: sensor.latitude,
      longitude: sensor.longitude,
      altitude: sensor.altitude,
      environmentType: sensor.environmentType,
      isActive: true,
      metadataJson: {
        ...sensor.metadata,
        siteName,
      },
    })
    .onConflictDoNothing({ target: schema.sensors.deviceId })
    .returning();

  if (inserted.length > 0) {
    console.log(
      `  - created sensor: ${sensor.deviceId} (id=${inserted[0].id})`,
    );
    return inserted[0];
  }

  const readBack = await db
    .select()
    .from(schema.sensors)
    .where(eq(schema.sensors.deviceId, sensor.deviceId))
    .limit(1);

  return readBack[0];
}

async function seedSitesAndSensors(db: Db) {
  section("Sites & Sensors");

  const seededSensors: Array<{
    id: number;
    deviceId: string;
    siteName: string;
    transitType: string | null;
  }> = [];

  for (const site of seedSites) {
    const siteRow = await upsertSite(db, site);
    console.log(`- processing sensors for ${site.siteName}`);

    for (const sensor of site.sensors) {
      const sensorRow = await upsertSensor(
        db,
        siteRow.id,
        site.siteName,
        sensor,
      );
      seededSensors.push({
        id: sensorRow.id,
        deviceId: sensorRow.deviceId,
        siteName: site.siteName,
        transitType: site.transitType,
      });
    }
  }

  return seededSensors;
}

async function seedReadings(
  db: Db,
  ownerUserId: number,
  sensorsToSeed: Array<{
    id: number;
    deviceId: string;
    siteName: string;
    transitType: string | null;
  }>,
) {
  section("Sensor Readings");

  const now = new Date();

  for (const sensor of sensorsToSeed) {
    const latestReading = await db
      .select({ timestamp: schema.sensorReadings.timestamp })
      .from(schema.sensorReadings)
      .where(eq(schema.sensorReadings.sensorId, sensor.id))
      .orderBy(desc(schema.sensorReadings.timestamp))
      .limit(1);

    const latestTimestampMs = latestReading[0]?.timestamp.getTime() ?? 0;
    const runOffsetMs = Number.parseInt(
      randomBytes(2).toString("hex"),
      16,
    ) % 900;
    const candidateStartMs =
      now.getTime() - (READINGS_PER_RUN - 1) * READING_INTERVAL_MS + runOffsetMs;
    const startMs = Math.max(candidateStartMs, latestTimestampMs + 1);

    const rows: Array<typeof schema.sensorReadings.$inferInsert> = [];

    for (let i = 0; i < READINGS_PER_RUN; i += 1) {
      const timestamp = new Date(startMs + i * READING_INTERVAL_MS);

      rows.push({
        sensorId: sensor.id,
        timestamp,
        serverReceivedAt: new Date(timestamp.getTime() + 1_000),
        pm1: valueForRun(sensor.deviceId, "pm1", i, 0, 50, 0.15),
        pm25: valueForRun(sensor.deviceId, "pm25", i, 0, 75, 0.18),
        pm10: valueForRun(sensor.deviceId, "pm10", i, 0, 120, 0.18),
        co2: valueForRun(sensor.deviceId, "co2", i, 400, 1500, 0.12),
        voc: valueForRun(sensor.deviceId, "voc", i, 0.1, 1.5, 0.18),
        temperature: valueForRun(sensor.deviceId, "temp", i, 18, 28, 0.12),
        humidity: valueForRun(sensor.deviceId, "hum", i, 30, 70, 0.12),
        co: valueForRun(sensor.deviceId, "co", i, 0, 5, 0.14),
        o3: valueForRun(sensor.deviceId, "o3", i, 0, 50, 0.15),
        no2: valueForRun(sensor.deviceId, "no2", i, 0, 40, 0.15),
        ch2o: valueForRun(sensor.deviceId, "ch2o", i, 0.01, 0.12, 0.15),
        pressure: valueForRun(
          sensor.deviceId,
          "pressure",
          i,
          900,
          930,
          0.02,
        ),
        batteryLevel: Math.round(
          valueForRun(sensor.deviceId, "battery", i, 45, 100, 0.03),
        ),
        signalStrength: Math.round(
          valueForRun(sensor.deviceId, "signal", i, -90, -40, 0.05),
        ),
        dataQualityScore: valueForRun(
          sensor.deviceId,
          "quality",
          i,
          0.75,
          1.0,
          0.03,
        ),
        location: sensor.siteName,
        transportType: sensor.transitType ?? undefined,
        userId: ownerUserId,
      });
    }

    await db.insert(schema.sensorReadings).values(rows);
    console.log(
      `- ${sensor.deviceId}: inserted ${rows.length} readings (${READING_INTERVAL_MS}ms interval)`,
    );
  }
}

async function seedHealth(
  db: Db,
  sensorsToSeed: Array<{ id: number; deviceId: string }>,
) {
  section("Sensor Health");

  for (const sensor of sensorsToSeed) {
    const existing = await db
      .select()
      .from(schema.sensorHealth)
      .where(eq(schema.sensorHealth.sensorId, sensor.id))
      .orderBy(desc(schema.sensorHealth.checkTimestamp))
      .limit(1);

    if (existing.length > 0) {
      console.log(
        `- ${sensor.deviceId}: health exists (latest ${existing[0].checkTimestamp.toISOString()})`,
      );
      continue;
    }

    const batteryPct = Math.round(
      valueForSeries(sensor.deviceId, "health-battery", 1, 40, 100, 0.01),
    );
    const signal = Math.round(
      valueForSeries(sensor.deviceId, "health-signal", 1, -90, -40, 0.01),
    );

    await db.insert(schema.sensorHealth).values({
      sensorId: sensor.id,
      checkTimestamp: new Date(),
      uptimeSeconds: Math.round(
        valueForSeries(sensor.deviceId, "uptime", 1, 20_000, 800_000, 0.01),
      ),
      readingCount24h: Math.round(
        valueForSeries(sensor.deviceId, "count24", 1, 40, 96, 0.01),
      ),
      batteryVoltage: round(3.2 + (batteryPct / 100) * 1.0, 2),
      memoryUsage: Math.round(
        valueForSeries(sensor.deviceId, "memory", 1, 20, 80, 0.01),
      ),
      lastReboot: new Date(Date.now() - 6 * 60 * 60 * 1000),
      healthStatus: "healthy",
      metadataJson: {
        battery: batteryPct,
        signal,
        firmware: "2.1.4",
        lastSeen: new Date().toISOString(),
      },
    });

    console.log(`- ${sensor.deviceId}: inserted health snapshot`);
  }
}

async function main() {
  section("Seed Start");

  const connectionString = process.env.DATABASE_URL ?? process.env.DB_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL/DB_URL is not set. Add it to .env.local or environment variables.",
    );
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool, { schema });

  try {
    const owner = await seedUsers(db);
    const seededSensors = await seedSitesAndSensors(db);
    await seedReadings(db, owner.id, seededSensors);
    await seedHealth(db, seededSensors);

    section("Seed Complete");
    console.log(`Owner user id: ${owner.id}`);
    console.log(`Sensors processed: ${seededSensors.length}`);
  } finally {
    await pool.end();
    console.log("\nDatabase pool closed.");
  }
}

void (async () => {
  await main();
})().catch((error) => {
  console.error("\nSeed failed:", error);
  process.exit(1);
});
