import { 
  pgTable, 
  serial, 
  text, 
  timestamp, 
  jsonb, 
  integer, 
  doublePrecision,
  boolean,
  index,
  uniqueIndex
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============================================
// EXISTING TABLES (User Management)
// ============================================

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').unique(), // Made optional for NextAuth migration
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'), // Password hash for email authentication
  isAdmin: text('is_admin').default('false').notNull(), // Admin role flag
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const devices = pgTable('devices', {
  id: serial('id').primaryKey(),
  serial: text('serial').notNull().unique(),
  type: text('type').notNull(),
});

export const iotData = pgTable('iot_data', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  dataPayload: jsonb('data_payload').notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
});

// ============================================
// NEW SENSOR DATABASE SCHEMA
// ============================================

/**
 * Sites - Deployment locations for sensors
 */
export const sites = pgTable('sites', {
  id: serial('site_id').primaryKey(),
  siteName: text('site_name').notNull(),
  city: text('city'),
  country: text('country').default('KZ'),
  transitType: text('transit_type'), // metro, bus, train, etc.
  siteDescription: text('site_description'),
  contactPerson: text('contact_person'),
  contactEmail: text('contact_email'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  siteNameIdx: index('sites_site_name_idx').on(table.siteName),
}));

/**
 * Sensors - Master sensor registry with metadata
 */
export const sensors = pgTable('sensors', {
  id: serial('sensor_id').primaryKey(),
  deviceId: text('device_id').notNull().unique(), // Unique device identifier (e.g., "lab01")
  siteId: integer('site_id').references(() => sites.id),
  sensorType: text('sensor_type').notNull(), // Type of sensor device
  hardwareVersion: text('hardware_version'),
  firmwareVersion: text('firmware_version'),
  installationDate: timestamp('installation_date'),
  lastCalibrationDate: timestamp('last_calibration_date'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  altitude: doublePrecision('altitude'), // meters above sea level
  environmentType: text('environment_type'), // indoor, outdoor, transit, etc.
  isActive: boolean('is_active').default(true).notNull(),
  metadataJson: jsonb('metadata_json'), // Additional flexible metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  deviceIdIdx: uniqueIndex('sensors_device_id_idx').on(table.deviceId),
  siteIdIdx: index('sensors_site_id_idx').on(table.siteId),
  isActiveIdx: index('sensors_is_active_idx').on(table.isActive),
}));

/**
 * Sensor Readings - Time-series sensor measurements
 * This is the main table for storing air quality data
 */
export const sensorReadings = pgTable('sensor_readings', {
  id: serial('reading_id').primaryKey(),
  sensorId: integer('sensor_id').notNull().references(() => sensors.id),
  timestamp: timestamp('timestamp', { mode: 'date' }).notNull(), // Data collection time
  serverReceivedAt: timestamp('server_received_at').notNull().defaultNow(), // Server receipt time
  
  // Particulate Matter (μg/m³)
  pm1: doublePrecision('pm1'),
  pm25: doublePrecision('pm25'),
  pm10: doublePrecision('pm10'),
  
  // Gases
  co2: doublePrecision('co2'), // CO₂ in ppm
  co: doublePrecision('co'), // CO in ppm
  o3: doublePrecision('o3'), // O₃ in ppb
  no2: doublePrecision('no2'), // NO₂ in ppb
  
  // Volatile Organic Compounds
  voc: doublePrecision('voc'), // VOC in ppm
  ch2o: doublePrecision('ch2o'), // Formaldehyde in ppm
  
  // Environmental Conditions
  temperature: doublePrecision('temperature'), // Celsius
  humidity: doublePrecision('humidity'), // Percentage (0-100)
  pressure: doublePrecision('pressure'), // hPa
  
  // Sensor Status
  batteryLevel: integer('battery_level'), // Percentage (0-100)
  signalStrength: integer('signal_strength'), // dBm (typically -120 to 0)
  errorCode: text('error_code'), // Error code if any
  dataQualityScore: doublePrecision('data_quality_score'), // 0-1 quality score
  
  // Legacy fields for backward compatibility
  value: doublePrecision('value'), // Legacy generic value field (from CSV ingestion)
  location: text('location'),
  transportType: text('transport_type'),
  userId: integer('user_id').references(() => users.id), // User ownership for data isolation
  ingestedAt: timestamp('ingested_at').notNull().defaultNow(),
  
  // Deduplication hash
  dataHash: text('data_hash'), // Hash for duplicate detection
}, (table) => ({
  timestampIdx: index('sensor_readings_timestamp_idx').on(table.timestamp),
  sensorTimestampIdx: index('sensor_readings_sensor_timestamp_idx').on(table.sensorId, table.timestamp),
  sensorIdIdx: index('sensor_readings_sensor_id_idx').on(table.sensorId),
  dataHashIdx: index('sensor_readings_data_hash_idx').on(table.dataHash),
}));

/**
 * Sensor Health - Sensor status monitoring and diagnostics
 */
export const sensorHealth = pgTable('sensor_health', {
  id: serial('health_id').primaryKey(),
  sensorId: integer('sensor_id').notNull().references(() => sensors.id),
  checkTimestamp: timestamp('check_timestamp').notNull().defaultNow(),
  uptimeSeconds: integer('uptime_seconds'), // Device uptime in seconds
  readingCount24h: integer('reading_count_24h'), // Number of readings in last 24 hours
  batteryVoltage: doublePrecision('battery_voltage'), // Battery voltage in volts
  memoryUsage: integer('memory_usage'), // Memory usage percentage
  lastReboot: timestamp('last_reboot'), // Last reboot timestamp
  healthStatus: text('health_status').notNull().default('unknown'), // healthy, warning, critical, offline
  metadataJson: jsonb('metadata_json'), // Additional health metrics
}, (table) => ({
  sensorIdIdx: index('sensor_health_sensor_id_idx').on(table.sensorId),
  checkTimestampIdx: index('sensor_health_check_timestamp_idx').on(table.checkTimestamp),
  healthStatusIdx: index('sensor_health_health_status_idx').on(table.healthStatus),
}));

// ============================================
// RELATIONS (Drizzle ORM)
// ============================================

export const sitesRelations = relations(sites, ({ many }) => ({
  sensors: many(sensors),
}));

export const sensorsRelations = relations(sensors, ({ one, many }) => ({
  site: one(sites, {
    fields: [sensors.siteId],
    references: [sites.id],
  }),
  readings: many(sensorReadings),
  healthRecords: many(sensorHealth),
}));

export const sensorReadingsRelations = relations(sensorReadings, ({ one }) => ({
  sensor: one(sensors, {
    fields: [sensorReadings.sensorId],
    references: [sensors.id],
  }),
}));

export const sensorHealthRelations = relations(sensorHealth, ({ one }) => ({
  sensor: one(sensors, {
    fields: [sensorHealth.sensorId],
    references: [sensors.id],
  }),
}));

