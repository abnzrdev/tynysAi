# Database Migration Guide

## Overview

This guide explains how to migrate your database to the new comprehensive sensor schema. The migration is designed to be backward-compatible, allowing both old and new data formats to coexist.

## Prerequisites

1. PostgreSQL database (version 12 or higher)
2. Drizzle ORM configured (see `drizzle.config.ts`)
3. Environment variables set (`DB_URL`)

## Migration Steps

### Step 1: Backup Existing Database

Before making any changes, create a backup:

```bash
pg_dump -U postgres -d tynys > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Generate Migration

The schema changes are defined in `lib/db/schema.ts`. Generate the migration:

```bash
npx drizzle-kit generate
```

This will create a new migration file in the `drizzle/` directory.

### Step 3: Review Migration

Review the generated migration file to ensure it matches your expectations:

```bash
cat drizzle/XXXX_*.sql
```

### Step 4: Apply Migration

Apply the migration to your database:

```bash
npx drizzle-kit push
```

Or use the migration script:

```bash
npm run migrate
```

### Step 5: Verify Migration

Verify that all tables and indexes were created:

```sql
-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'sensors', 'sensor_readings', 'sensor_health');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('sites', 'sensors', 'sensor_readings', 'sensor_health');
```

## Data Migration (Optional)

If you have existing sensor data in the legacy format, you may want to migrate it to the new schema.

### Legacy to New Schema Mapping

| Legacy Field | New Field | Notes |
|--------------|-----------|-------|
| `sensor_id` | `device_id` (in sensors table) | Create sensor record first |
| `timestamp` | `timestamp` | Same format |
| `value` | `pm25` (or appropriate metric) | Map based on sensor type |
| `location` | `site_name` (in sites table) | Create site record first |
| `transport_type` | `transport_type` (in sites table) | Map to site |

### Migration Script Example

```typescript
// scripts/migrate-legacy-data.ts
import { db } from '@/lib/db';
import { sensorReadings as legacyReadings, sensors, sites } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function migrateLegacyData() {
  // 1. Extract unique locations and create sites
  const uniqueLocations = await db
    .selectDistinct({ location: legacyReadings.location })
    .from(legacyReadings)
    .where(sql`${legacyReadings.location} IS NOT NULL`);

  const siteMap = new Map<string, number>();
  
  for (const { location } of uniqueLocations) {
    if (location) {
      const [site] = await db
        .insert(sites)
        .values({ siteName: location })
        .onConflictDoNothing()
        .returning();
      
      if (site) {
        siteMap.set(location, site.id);
      }
    }
  }

  // 2. Extract unique sensor IDs and create sensors
  const uniqueSensors = await db
    .selectDistinct({ sensorId: legacyReadings.sensorId })
    .from(legacyReadings);

  const sensorMap = new Map<string, number>();
  
  for (const { sensorId } of uniqueSensors) {
    const [sensor] = await db
      .insert(sensors)
      .values({
        deviceId: sensorId,
        sensorType: 'air_quality',
        isActive: true,
      })
      .onConflictDoNothing()
      .returning();
    
    if (sensor) {
      sensorMap.set(sensorId, sensor.id);
    }
  }

  // 3. Migrate readings (if needed)
  // Note: Legacy readings can remain in the old table
  // New readings will use the new schema
}
```

## Rollback Procedure

If you need to rollback the migration:

### Option 1: Restore from Backup

```bash
psql -U postgres -d tynys < backup_YYYYMMDD_HHMMSS.sql
```

### Option 2: Manual Rollback

Drop the new tables (if no data has been added):

```sql
DROP TABLE IF EXISTS sensor_health CASCADE;
DROP TABLE IF EXISTS sensor_readings CASCADE;
DROP TABLE IF EXISTS sensors CASCADE;
DROP TABLE IF EXISTS sites CASCADE;
```

**Warning**: This will delete all data in these tables. Only use if you have a backup.

## Post-Migration Tasks

### 1. Update Environment Variables

Ensure your `.env.local` has the correct database URL:

```env
DB_URL=postgresql://user:password@localhost:5432/tynys
DATABASE_URL=postgresql://user:password@localhost:5432/tynys
IOT_DEVICE_SECRET=your-secret-token-here
```

### 2. Test API Endpoint

Test the new API endpoint:

```bash
curl -X POST http://localhost:3000/api/v1/sensor-data \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "test01",
    "timestamp": "2024-01-15T10:30:00Z",
    "readings": {
      "pm25": 25.7,
      "co2": 412,
      "temp": 21.8
    }
  }'
```

### 3. Verify Data Access Functions

Test the data access functions:

```typescript
import { getLatestSensorReadings, getAllActiveSensors } from '@/lib/sensor-data-access';

// Test latest readings
const readings = await getLatestSensorReadings(10);
console.log('Latest readings:', readings);

// Test active sensors
const sensors = await getAllActiveSensors();
console.log('Active sensors:', sensors);
```

## Troubleshooting

### Issue: Migration Fails with "relation already exists"

**Solution**: The tables may already exist. Check if they exist and drop them if needed:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('sites', 'sensors', 'sensor_readings', 'sensor_health');
```

### Issue: Foreign Key Constraint Errors

**Solution**: Ensure parent tables (sites, sensors) are created before child tables (sensor_readings, sensor_health).

### Issue: Index Creation Fails

**Solution**: Check if indexes already exist:

```sql
SELECT indexname FROM pg_indexes 
WHERE tablename = 'sensor_readings';
```

Drop existing indexes if they conflict:

```sql
DROP INDEX IF EXISTS sensor_readings_timestamp_idx;
```

### Issue: Performance Degradation

**Solution**: 
1. Verify indexes were created: `\d sensor_readings` in psql
2. Run `ANALYZE` on tables: `ANALYZE sensor_readings;`
3. Check query plans: `EXPLAIN ANALYZE SELECT ...`

## Performance Optimization

After migration, optimize the database:

```sql
-- Analyze tables for query planner
ANALYZE sites;
ANALYZE sensors;
ANALYZE sensor_readings;
ANALYZE sensor_health;

-- Update statistics
VACUUM ANALYZE sensor_readings;
```

## Monitoring

Set up monitoring for:
- Table sizes: `SELECT pg_size_pretty(pg_total_relation_size('sensor_readings'));`
- Index usage: Check `pg_stat_user_indexes`
- Query performance: Enable `log_slow_queries` in PostgreSQL

## Next Steps

1. Update application code to use new data access functions
2. Set up data aggregation jobs for hourly/daily summaries
3. Configure alerting for sensor health issues
4. Implement data retention policies
5. Set up backup and recovery procedures
