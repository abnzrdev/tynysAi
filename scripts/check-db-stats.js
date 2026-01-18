#!/usr/bin/env node

const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
const { users, sensorReadings } = require('./lib/db/schema');
const { count, eq } = require('drizzle-orm');

const connectionString = process.env.DB_URL || 'postgresql://admin:password123@localhost:5432/tynysdb';

async function checkDatabaseStats() {
  const client = postgres(connectionString);
  const db = drizzle(client);

  try {
    console.log('\n=== PRODUCTION DATABASE STATISTICS ===\n');
    
    const usersList = await db.select().from(users);
    console.log(`Total Users: ${usersList.length}\n`);
    
    for (const user of usersList) {
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.email}`);
      console.log(`Name: ${user.name}`);
      console.log(`Admin: ${user.isAdmin}`);
      console.log(`Created: ${user.createdAt}`);
      
      const readings = await db.select({ count: count() })
        .from(sensorReadings)
        .where(eq(sensorReadings.userId, user.id));
      
      console.log(`Sensor Readings Ingested: ${readings[0].count}`);
      console.log('-'.repeat(60));
    }
    
    const totalReadings = await db.select({ count: count() }).from(sensorReadings);
    console.log(`\nTOTAL SENSOR READINGS IN DATABASE: ${totalReadings[0].count}\n`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

checkDatabaseStats();
