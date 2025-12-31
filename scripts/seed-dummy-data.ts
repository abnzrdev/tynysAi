// Environment variables are loaded by dotenv-cli before this script runs
import { db } from '../lib/db';
import { users, sensorReadings, iotData } from '../lib/db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

/**
 * Seed script to populate the database with dummy data for testing
 * Creates a test user and generates realistic IoT sensor data
 */

async function seedDummyData() {
  console.log('🌱 Starting to seed dummy data...\n');

  // Test user credentials
  const testEmail = 'test@example.com';
  const testPassword = 'password123';
  const testName = 'Test User';

  try {
    // Step 1: Create or find test user
    console.log('📝 Checking for test user...');
    let testUser = await db
      .select()
      .from(users)
      .where(eq(users.email, testEmail))
      .limit(1)
      .then(rows => rows[0]);

    if (!testUser) {
      console.log('👤 Creating test user...');
      const hashedPassword = await bcrypt.hash(testPassword, 10);
      
      [testUser] = await db
        .insert(users)
        .values({
          name: testName,
          email: testEmail,
          password: hashedPassword,
        })
        .returning();
      
      console.log(`✅ Test user created with email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log(`✅ Test user already exists: ${testEmail}`);
    }

    console.log(`   User ID: ${testUser.id}\n`);

    // Step 2: Generate sensor readings
    console.log('📊 Generating sensor readings...');
    
    const sensorIds = [
      'TEMP-001',
      'TEMP-002',
      'HUMIDITY-001',
      'PRESSURE-001',
      'AIR-QUALITY-001',
    ];

    const locations = [
      'Office Building A',
      'Warehouse B',
      'Factory Floor C',
      'Research Lab D',
      'Storage Room E',
    ];

    const transportTypes = ['WiFi', 'LoRa', 'Cellular', 'Bluetooth', 'Ethernet'];

    const sensorReadingsData = [];
    const now = new Date();

    // Generate readings for the last 7 days
    const daysToGenerate = 7;
    const readingsPerDay = 50; // Total readings per day across all sensors

    for (let day = 0; day < daysToGenerate; day++) {
      for (let i = 0; i < readingsPerDay; i++) {
        const timestamp = new Date(now);
        timestamp.setDate(timestamp.getDate() - day);
        timestamp.setHours(Math.floor(Math.random() * 24));
        timestamp.setMinutes(Math.floor(Math.random() * 60));
        timestamp.setSeconds(Math.floor(Math.random() * 60));

        const sensorId = sensorIds[Math.floor(Math.random() * sensorIds.length)];
        
        // Generate realistic values based on sensor type
        let value: number;
        if (sensorId.startsWith('TEMP')) {
          value = 18 + Math.random() * 10; // 18-28°C
        } else if (sensorId.startsWith('HUMIDITY')) {
          value = 30 + Math.random() * 40; // 30-70%
        } else if (sensorId.startsWith('PRESSURE')) {
          value = 980 + Math.random() * 40; // 980-1020 hPa
        } else if (sensorId.startsWith('AIR-QUALITY')) {
          value = 50 + Math.random() * 200; // 50-250 AQI
        } else {
          value = Math.random() * 100;
        }

        sensorReadingsData.push({
          timestamp: timestamp.toISOString(),
          sensorId,
          value: Math.round(value * 100) / 100, // Round to 2 decimal places
          location: locations[Math.floor(Math.random() * locations.length)],
          transportType: transportTypes[Math.floor(Math.random() * transportTypes.length)],
        });
      }
    }

    // Sort by timestamp (oldest first)
    sensorReadingsData.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Batch insert sensor readings
    const batchSize = 100;
    let insertedCount = 0;

    for (let i = 0; i < sensorReadingsData.length; i += batchSize) {
      const batch = sensorReadingsData.slice(i, i + batchSize);
      await db.insert(sensorReadings).values(batch);
      insertedCount += batch.length;
      process.stdout.write(`\r   Inserted ${insertedCount}/${sensorReadingsData.length} sensor readings...`);
    }
    
    console.log(`\n✅ Inserted ${insertedCount} sensor readings\n`);

    // Step 3: Generate IoT data records
    console.log('🔌 Generating IoT data records...');
    
    const iotDataRecords = [];
    const iotRecordsCount = 25; // Generate 25 IoT data records

    for (let i = 0; i < iotRecordsCount; i++) {
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - Math.floor(Math.random() * daysToGenerate));
      timestamp.setHours(Math.floor(Math.random() * 24));
      timestamp.setMinutes(Math.floor(Math.random() * 60));

      // Create a realistic IoT data payload
      const payload = {
        deviceId: `DEVICE-${Math.floor(Math.random() * 10) + 1}`,
        type: 'environmental_sensor',
        metrics: {
          temperature: Math.round((18 + Math.random() * 10) * 100) / 100,
          humidity: Math.round((30 + Math.random() * 40) * 100) / 100,
          pressure: Math.round((980 + Math.random() * 40) * 100) / 100,
        },
        status: Math.random() > 0.1 ? 'online' : 'offline',
        batteryLevel: Math.round(Math.random() * 100),
        signalStrength: Math.round(-50 - Math.random() * 50), // -50 to -100 dBm
      };

      iotDataRecords.push({
        timestamp,
        dataPayload: payload,
        userId: testUser.id,
      });
    }

    // Sort IoT records by timestamp
    iotDataRecords.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    // Insert IoT data records
    await db.insert(iotData).values(iotDataRecords);
    console.log(`✅ Inserted ${iotRecordsCount} IoT data records\n`);

    // Summary
    console.log('🎉 Dummy data seeding completed successfully!\n');
    console.log('📋 Summary:');
    console.log(`   • Test User: ${testEmail}`);
    console.log(`   • Password: ${testPassword}`);
    console.log(`   • Sensor Readings: ${insertedCount}`);
    console.log(`   • IoT Data Records: ${iotRecordsCount}`);
    console.log(`   • Active Sensors: ${sensorIds.length}`);
    console.log(`   • Date Range: Last ${daysToGenerate} days`);
    console.log('\n💡 You can now sign in with the test account and view the dashboard!');

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  }
}

// Run the seed function
seedDummyData()
  .then(() => {
    console.log('\n✨ Process completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Process failed:', error);
    process.exit(1);
  });

