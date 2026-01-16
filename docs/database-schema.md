# Sensor Database Schema Documentation

## Overview

The TynysAi sensor database schema is designed to handle high-volume, real-time air quality data from multiple sensor devices deployed across transit environments. The schema supports comprehensive environmental metrics, sensor health monitoring, and efficient querying for dashboards and analytics.

## Database Tables

### 1. `sites` - Deployment Locations

Stores information about sensor deployment locations.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `site_id` | SERIAL | Primary key | PRIMARY KEY |
| `site_name` | TEXT | Name of the deployment site | NOT NULL |
| `city` | TEXT | City where site is located | |
| `country` | TEXT | Country code (default: 'KZ') | DEFAULT 'KZ' |
| `transit_type` | TEXT | Type of transit (metro, bus, train, etc.) | |
| `site_description` | TEXT | Additional description | |
| `contact_person` | TEXT | Contact person name | |
| `contact_email` | TEXT | Contact email address | |
| `created_at` | TIMESTAMP | Record creation time | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update time | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `sites_site_name_idx` on `site_name`

### 2. `sensors` - Master Sensor Registry

Master table for all sensor devices with metadata and configuration.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `sensor_id` | SERIAL | Primary key | PRIMARY KEY |
| `device_id` | TEXT | Unique device identifier (e.g., "lab01") | NOT NULL, UNIQUE |
| `site_id` | INTEGER | Foreign key to sites | REFERENCES sites(site_id) |
| `sensor_type` | TEXT | Type of sensor device | NOT NULL |
| `hardware_version` | TEXT | Hardware version string | |
| `firmware_version` | TEXT | Firmware version string | |
| `installation_date` | TIMESTAMP | When sensor was installed | |
| `last_calibration_date` | TIMESTAMP | Last calibration timestamp | |
| `latitude` | DOUBLE PRECISION | GPS latitude | |
| `longitude` | DOUBLE PRECISION | GPS longitude | |
| `altitude` | DOUBLE PRECISION | Altitude in meters | |
| `environment_type` | TEXT | Environment (indoor, outdoor, transit) | |
| `is_active` | BOOLEAN | Whether sensor is active | NOT NULL, DEFAULT true |
| `metadata_json` | JSONB | Additional flexible metadata | |
| `created_at` | TIMESTAMP | Record creation time | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | Last update time | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `sensors_device_id_idx` (UNIQUE) on `device_id`
- `sensors_site_id_idx` on `site_id`
- `sensors_is_active_idx` on `is_active`

### 3. `sensor_readings` - Time-Series Sensor Measurements

Main table for storing air quality sensor readings. This is the primary data table.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `reading_id` | SERIAL | Primary key | PRIMARY KEY |
| `sensor_id` | INTEGER | Foreign key to sensors | NOT NULL, REFERENCES sensors(sensor_id) |
| `timestamp` | TIMESTAMP | Data collection time | NOT NULL |
| `server_received_at` | TIMESTAMP | Server receipt time | NOT NULL, DEFAULT NOW() |
| `pm1` | DOUBLE PRECISION | PM1.0 in μg/m³ | |
| `pm25` | DOUBLE PRECISION | PM2.5 in μg/m³ | |
| `pm10` | DOUBLE PRECISION | PM10 in μg/m³ | |
| `co2` | DOUBLE PRECISION | CO₂ in ppm | |
| `co` | DOUBLE PRECISION | CO in ppm | |
| `o3` | DOUBLE PRECISION | O₃ in ppb | |
| `no2` | DOUBLE PRECISION | NO₂ in ppb | |
| `voc` | DOUBLE PRECISION | VOC in ppm | |
| `ch2o` | DOUBLE PRECISION | Formaldehyde in ppm | |
| `temperature` | DOUBLE PRECISION | Temperature in Celsius | |
| `humidity` | DOUBLE PRECISION | Humidity percentage (0-100) | |
| `pressure` | DOUBLE PRECISION | Atmospheric pressure in hPa | |
| `battery_level` | INTEGER | Battery percentage (0-100) | |
| `signal_strength` | INTEGER | Signal strength in dBm (-120 to 0) | |
| `error_code` | TEXT | Error code if any | |
| `data_quality_score` | DOUBLE PRECISION | Data quality score (0-1) | |
| `data_hash` | TEXT | Hash for duplicate detection | |
| `location` | TEXT | Legacy location field | |
| `transport_type` | TEXT | Legacy transport type field | |
| `user_id` | INTEGER | Legacy user ownership | REFERENCES users(id) |
| `ingested_at` | TIMESTAMP | Data ingestion timestamp | NOT NULL, DEFAULT NOW() |

**Indexes:**
- `sensor_readings_timestamp_idx` on `timestamp` (DESC)
- `sensor_readings_sensor_timestamp_idx` on `sensor_id, timestamp`
- `sensor_readings_sensor_id_idx` on `sensor_id`
- `sensor_readings_data_hash_idx` on `data_hash`

### 4. `sensor_health` - Sensor Status Monitoring

Tracks sensor health, diagnostics, and status information.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `health_id` | SERIAL | Primary key | PRIMARY KEY |
| `sensor_id` | INTEGER | Foreign key to sensors | NOT NULL, REFERENCES sensors(sensor_id) |
| `check_timestamp` | TIMESTAMP | Health check time | NOT NULL, DEFAULT NOW() |
| `uptime_seconds` | INTEGER | Device uptime in seconds | |
| `reading_count_24h` | INTEGER | Readings in last 24 hours | |
| `battery_voltage` | DOUBLE PRECISION | Battery voltage in volts | |
| `memory_usage` | INTEGER | Memory usage percentage | |
| `last_reboot` | TIMESTAMP | Last reboot timestamp | |
| `health_status` | TEXT | Status: healthy, warning, critical, offline | NOT NULL, DEFAULT 'unknown' |
| `metadata_json` | JSONB | Additional health metrics | |

**Indexes:**
- `sensor_health_sensor_id_idx` on `sensor_id`
- `sensor_health_check_timestamp_idx` on `check_timestamp`
- `sensor_health_health_status_idx` on `health_status`

## Relationships

```
sites (1) ──< (many) sensors
sensors (1) ──< (many) sensor_readings
sensors (1) ──< (many) sensor_health
```

## Data Types and Units

### Air Quality Metrics
- **PM1, PM2.5, PM10**: Particulate matter in micrograms per cubic meter (μg/m³)
- **CO₂**: Carbon dioxide in parts per million (ppm)
- **CO**: Carbon monoxide in parts per million (ppm)
- **O₃**: Ozone in parts per billion (ppb)
- **NO₂**: Nitrogen dioxide in parts per billion (ppb)
- **VOC**: Volatile organic compounds in parts per million (ppm)
- **CH₂O**: Formaldehyde in parts per million (ppm)

### Environmental Conditions
- **Temperature**: Celsius (°C)
- **Humidity**: Percentage (0-100%)
- **Pressure**: Hectopascals (hPa)

### Sensor Status
- **Battery Level**: Percentage (0-100%)
- **Signal Strength**: Decibels relative to milliwatt (dBm), typically -120 to 0

## Performance Considerations

### Indexing Strategy
- Time-series queries are optimized with composite indexes on `(sensor_id, timestamp)`
- Duplicate detection uses hash-based indexing
- Active sensor queries use boolean index on `is_active`

### Partitioning Recommendations
For high-volume deployments (>10,000 sensors), consider:
- **Time-based partitioning**: Partition `sensor_readings` by month/year
- **Geographic partitioning**: Shard by region or site
- **Read replicas**: Separate read traffic from write operations

### Data Retention
- **Real-time data**: 30 days at full resolution
- **Aggregated data**: 2 years at hourly/daily averages
- **Archival**: Compressed storage for compliance

## Migration Notes

When migrating from the legacy schema:
1. Existing `sensor_readings` table is preserved with legacy fields
2. New comprehensive fields are added alongside legacy fields
3. Data migration script should map legacy data to new schema
4. Gradual migration path: both schemas can coexist during transition
