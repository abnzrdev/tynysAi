import { pgTable, serial, text, timestamp, jsonb, integer, doublePrecision } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: text('clerk_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
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

export const sensorReadings = pgTable('sensor_readings', {
  id: serial('id').primaryKey(),
  timestamp: timestamp('timestamp', { mode: 'string' }).notNull(),
  sensorId: text('sensor_id').notNull(),
  value: doublePrecision('value').notNull(),
  location: text('location'),
  transportType: text('transport_type'),
  ingestedAt: timestamp('ingested_at').notNull().defaultNow(),
});

