# Sensor Database Schema Implementation

## Overview

This document provides a comprehensive overview of the sensor database schema implementation for TynysAi. The schema is designed to handle high-volume, real-time air quality data from multiple sensor devices with support for comprehensive environmental metrics, sensor health monitoring, and efficient querying.

## Quick Start

### 1. Database Setup

Ensure PostgreSQL is running and create the database:

```bash
createdb tynys
```

### 2. Environment Configuration

Set up your `.env.local` file:

```env
DB_URL=postgresql://user:password@localhost:5432/tynys
DATABASE_URL=postgresql://user:password@localhost:5432/tynys
IOT_DEVICE_SECRET=your-secret-token-here
```

### 3. Run Migrations

```bash
npx drizzle-kit push
```

Or use the migration script:

```bash
npm run migrate
```

### 4. Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/v1/sensor-data \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "lab01",
    "site": "AGI_Lab",
    "timestamp": "2024-01-15T10:30:00Z",
    "readings": {
      "pm25": 25.7,
      "co2": 412,
      "temp": 21.8,
      "hum": 46.2
    },
    "metadata": {
      "battery": 87,
      "signal": -65,
      "firmware": "2.1.4"
    }
  }'
```

## Architecture

### Database Schema

The schema consists of four main tables:

1. **`sites`** - Deployment locations for sensors
2. **`sensors`** - Master sensor registry with metadata
3. **`sensor_readings`** - Time-series sensor measurements (main data table)
4. **`sensor_health`** - Sensor status monitoring and diagnostics

### Key Features

- **Comprehensive Metrics**: Supports PM1, PM2.5, PM10, CO₂, CO, O₃, NO₂, VOC, CH₂O
- **Environmental Data**: Temperature, humidity, pressure
- **Sensor Status**: Battery level, signal strength, error codes
- **Duplicate Detection**: Hash-based deduplication
- **Geographic Support**: GPS coordinates for sensors
- **Health Monitoring**: Sensor diagnostics and status tracking
- **Performance Optimized**: Indexes for time-series queries

## File Structure

```
lib/
├── db/
│   ├── index.ts              # Database connection
│   └── schema.ts             # Database schema definitions
├── sensor-validation.ts      # Data validation utilities
└── sensor-data-access.ts     # Data access functions

app/api/v1/
└── sensor-data/
    └── route.ts              # JSON ingestion API endpoint

docs/
├── database-schema.md        # Detailed schema documentation
├── api-documentation.md      # API endpoint documentation
├── data-dictionary.md        # Field descriptions and units
└── migration-guide.md        # Migration instructions
```

## API Endpoints

### POST /api/v1/sensor-data

Ingests sensor reading data from IoT devices.

**Authentication**: Bearer token (IOT_DEVICE_SECRET)

**Request Format**: JSON with device_id, timestamp, readings, and metadata

**Response**: Success confirmation with reading ID

See [API Documentation](./api-documentation.md) for details.

## Data Access Functions

All data access functions are in `lib/sensor-data-access.ts`:

- `getLatestSensorReadings()` - Latest readings from all sensors
- `getSensorReadingsByDeviceId()` - Readings for specific sensor
- `getHourlyAggregates()` - Hourly aggregated statistics
- `getDailyAggregates()` - Daily aggregated statistics
- `getAllActiveSensors()` - List all active sensors
- `getSensorsWithLowBattery()` - Sensors needing attention
- `getSensorsWithinRadius()` - Geospatial queries
- `getReadingsExceedingThresholds()` - Alert generation

## Validation

Data validation is performed using `lib/sensor-validation.ts`:

- **Value Ranges**: All metrics validated against expected ranges
- **Timestamp Validation**: Ensures timestamps are current
- **Duplicate Detection**: Hash-based deduplication
- **Type Checking**: Validates data types and formats

## Performance Considerations

### Indexes

The schema includes optimized indexes for:
- Time-series queries: `(sensor_id, timestamp)`
- Duplicate detection: `data_hash`
- Active sensor queries: `is_active`
- Geographic queries: `latitude, longitude`

### Scaling Strategy

For high-volume deployments:
1. **Time-based Partitioning**: Partition `sensor_readings` by month/year
2. **Read Replicas**: Separate read traffic from writes
3. **Caching**: Redis/Memcached for frequently accessed data
4. **Aggregation**: Pre-compute hourly/daily summaries

## Data Retention

- **Real-time Data**: 30 days at full resolution
- **Aggregated Data**: 2 years at hourly/daily averages
- **Archival**: Compressed storage for compliance

## Monitoring & Alerts

### Sensor Health Monitoring

- Battery level tracking
- Signal strength monitoring
- Uptime tracking
- Reading count per 24 hours

### Alert Conditions

- Battery below 20%
- Signal strength below -90 dBm
- Readings exceeding thresholds
- Sensor offline detection

## Documentation

- **[Database Schema](./database-schema.md)** - Detailed table structures
- **[API Documentation](./api-documentation.md)** - Endpoint specifications
- **[Data Dictionary](./data-dictionary.md)** - Field descriptions and units
- **[Migration Guide](./migration-guide.md)** - Migration procedures

## Testing

### Unit Tests

Test validation and data access functions:

```bash
npm test
```

### Integration Tests

Test API endpoint:

```bash
# Start dev server
npm run dev

# In another terminal
curl -X POST http://localhost:3000/api/v1/sensor-data \
  -H "Authorization: Bearer $IOT_DEVICE_SECRET" \
  -H "Content-Type: application/json" \
  -d @test-data.json
```

## Troubleshooting

### Common Issues

1. **Migration fails**: Check PostgreSQL version (12+) and connection
2. **API returns 401**: Verify IOT_DEVICE_SECRET is set correctly
3. **Validation errors**: Check value ranges in data dictionary
4. **Performance issues**: Verify indexes are created and analyze tables

See [Migration Guide](./migration-guide.md) for detailed troubleshooting.

## Next Steps

1. ✅ Database schema implemented
2. ✅ API endpoint created
3. ✅ Validation and deduplication
4. ✅ Data access functions
5. ⏳ Set up aggregation jobs
6. ⏳ Configure alerting
7. ⏳ Implement data retention policies
8. ⏳ Set up monitoring dashboards

## Support

For issues or questions:
- Check documentation in `docs/` directory
- Review migration guide for setup issues
- Check API documentation for endpoint usage

## License

MIT - See LICENSE file
