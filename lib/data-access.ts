import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import { iotData, sensorReadings, users } from './db/schema';
import type { SensorReading } from './csv-parser';

/**
 * Creates a new user in the database
 * @param userData - The user data to insert
 * @returns The created user record
 */
export async function createUser(userData: {
  clerkId: string;
  name: string;
  email: string;
}) {
  try {
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}

/**
 * Retrieves a user by their Clerk ID
 * @param clerkId - The Clerk user ID
 * @returns User record or null if not found
 */
export async function getUserByClerkId(clerkId: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkId))
      .limit(1);

    return user || null;
  } catch (error) {
    console.error('Error fetching user by Clerk ID:', error);
    throw new Error('Failed to fetch user');
  }
}

/**
 * Retrieves IoT data filtered by the given userId
 * @param userId - The ID of the user to filter data for
 * @returns Array of IoT data records for the specified user
 */
export async function getUserData(userId: number) {
  try {
    const data = await db
      .select()
      .from(iotData)
      .where(eq(iotData.userId, userId));

    return data;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

/**
 * Retrieves recent sensor readings with optional limit
 * @param limit - Maximum number of readings to retrieve (default: 100)
 * @returns Array of sensor readings
 */
export async function getRecentSensorReadings(limit: number = 100) {
  try {
    const readings = await db
      .select()
      .from(sensorReadings)
      .orderBy(desc(sensorReadings.ingestedAt))
      .limit(limit);

    return readings;
  } catch (error) {
    console.error('Error fetching sensor readings:', error);
    throw new Error('Failed to fetch sensor readings');
  }
}

/**
 * Batch inserts sensor readings into the database
 * Optimized for handling large payloads from offline devices
 * @param readings - Array of sensor readings to insert
 * @returns Number of rows inserted
 */
export async function batchInsertSensorReadings(readings: SensorReading[]) {
  if (readings.length === 0) {
    return 0;
  }

  try {
    // Map CSV data to database schema
    const records = readings.map((reading) => ({
      timestamp: reading.timestamp,
      sensorId: reading.sensor_id,
      value: reading.value,
      location: reading.location || null,
      transportType: reading.transport_type || null,
    }));

    // Perform batch insert - Drizzle handles this efficiently
    const result = await db.insert(sensorReadings).values(records);

    return readings.length;
  } catch (error) {
    console.error('Error batch inserting sensor readings:', error);
    throw new Error('Failed to insert sensor readings');
  }
}

