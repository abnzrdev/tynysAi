# Data Dictionary

## Sensor Database Fields

### Sites Table

| Field Name | Data Type | Units | Description | Example |
|------------|-----------|-------|-------------|---------|
| `site_id` | SERIAL | - | Unique site identifier | 1 |
| `site_name` | TEXT | - | Name of deployment location | "AGI_Lab" |
| `city` | TEXT | - | City name | "Astana" |
| `country` | TEXT | - | ISO country code | "KZ" |
| `transit_type` | TEXT | - | Type of transit environment | "metro", "bus", "train" |
| `site_description` | TEXT | - | Additional site information | "Main laboratory facility" |
| `contact_person` | TEXT | - | Contact person name | "John Doe" |
| `contact_email` | TEXT | - | Contact email address | "contact@example.com" |
| `created_at` | TIMESTAMP | - | Record creation timestamp | 2024-01-15T10:00:00Z |
| `updated_at` | TIMESTAMP | - | Last update timestamp | 2024-01-15T10:00:00Z |

### Sensors Table

| Field Name | Data Type | Units | Description | Example |
|------------|-----------|-------|-------------|---------|
| `sensor_id` | SERIAL | - | Unique sensor identifier | 42 |
| `device_id` | TEXT | - | Unique device identifier | "lab01" |
| `site_id` | INTEGER | - | Foreign key to sites table | 1 |
| `sensor_type` | TEXT | - | Type of sensor device | "air_quality" |
| `hardware_version` | TEXT | - | Hardware version string | "v2.0" |
| `firmware_version` | TEXT | - | Firmware version string | "2.1.4" |
| `installation_date` | TIMESTAMP | - | Installation timestamp | 2024-01-01T00:00:00Z |
| `last_calibration_date` | TIMESTAMP | - | Last calibration timestamp | 2024-01-01T00:00:00Z |
| `latitude` | DOUBLE PRECISION | degrees | GPS latitude (-90 to 90) | 51.1694 |
| `longitude` | DOUBLE PRECISION | degrees | GPS longitude (-180 to 180) | 71.4491 |
| `altitude` | DOUBLE PRECISION | meters | Altitude above sea level | 347.0 |
| `environment_type` | TEXT | - | Environment classification | "indoor", "outdoor", "transit" |
| `is_active` | BOOLEAN | - | Whether sensor is active | true |
| `metadata_json` | JSONB | - | Additional metadata | `{"notes": "..."}` |
| `created_at` | TIMESTAMP | - | Record creation timestamp | 2024-01-15T10:00:00Z |
| `updated_at` | TIMESTAMP | - | Last update timestamp | 2024-01-15T10:00:00Z |

### Sensor Readings Table

| Field Name | Data Type | Units | Range | Description | Example |
|------------|-----------|-------|-------|-------------|---------|
| `reading_id` | SERIAL | - | - | Unique reading identifier | 12345 |
| `sensor_id` | INTEGER | - | - | Foreign key to sensors table | 42 |
| `timestamp` | TIMESTAMP | - | - | Data collection time | 2024-01-15T10:30:00Z |
| `server_received_at` | TIMESTAMP | - | - | Server receipt time | 2024-01-15T10:30:05Z |
| `pm1` | DOUBLE PRECISION | μg/m³ | 0-1000 | PM1.0 particulate matter | 12.3 |
| `pm25` | DOUBLE PRECISION | μg/m³ | 0-1000 | PM2.5 particulate matter | 25.7 |
| `pm10` | DOUBLE PRECISION | μg/m³ | 0-1000 | PM10 particulate matter | 43.1 |
| `co2` | DOUBLE PRECISION | ppm | 300-5000 | Carbon dioxide | 412 |
| `co` | DOUBLE PRECISION | ppm | 0-100 | Carbon monoxide | 0.1 |
| `o3` | DOUBLE PRECISION | ppb | 0-500 | Ozone | 18.5 |
| `no2` | DOUBLE PRECISION | ppb | 0-500 | Nitrogen dioxide | 14.2 |
| `voc` | DOUBLE PRECISION | ppm | 0-100 | Volatile organic compounds | 0.65 |
| `ch2o` | DOUBLE PRECISION | ppm | 0-10 | Formaldehyde | 0.03 |
| `temperature` | DOUBLE PRECISION | °C | -40 to 60 | Air temperature | 21.8 |
| `humidity` | DOUBLE PRECISION | % | 0-100 | Relative humidity | 46.2 |
| `pressure` | DOUBLE PRECISION | hPa | 800-1200 | Atmospheric pressure | 1013.25 |
| `battery_level` | INTEGER | % | 0-100 | Battery charge level | 87 |
| `signal_strength` | INTEGER | dBm | -120 to 0 | Wireless signal strength | -65 |
| `error_code` | TEXT | - | - | Error code if any | "ERR_001" |
| `data_quality_score` | DOUBLE PRECISION | - | 0-1 | Data quality assessment | 0.95 |
| `data_hash` | TEXT | - | - | Hash for duplicate detection | "abc123..." |
| `location` | TEXT | - | - | Legacy location field | "AGI_Lab" |
| `transport_type` | TEXT | - | - | Legacy transport type | "metro" |
| `user_id` | INTEGER | - | - | Legacy user ownership | 1 |
| `ingested_at` | TIMESTAMP | - | - | Data ingestion timestamp | 2024-01-15T10:30:05Z |

### Sensor Health Table

| Field Name | Data Type | Units | Description | Example |
|------------|-----------|-------|-------------|---------|
| `health_id` | SERIAL | - | Unique health record identifier | 789 |
| `sensor_id` | INTEGER | - | Foreign key to sensors table | 42 |
| `check_timestamp` | TIMESTAMP | - | Health check timestamp | 2024-01-15T10:30:00Z |
| `uptime_seconds` | INTEGER | seconds | Device uptime | 86400 |
| `reading_count_24h` | INTEGER | count | Readings in last 24 hours | 1440 |
| `battery_voltage` | DOUBLE PRECISION | volts | Battery voltage | 3.7 |
| `memory_usage` | INTEGER | % | Memory usage percentage | 45 |
| `last_reboot` | TIMESTAMP | - | Last reboot timestamp | 2024-01-14T00:00:00Z |
| `health_status` | TEXT | - | Status: healthy, warning, critical, offline | "healthy" |
| `metadata_json` | JSONB | - | Additional health metrics | `{"cpu_temp": 45}` |

## Value Ranges and Thresholds

### Air Quality Index (AQI) Reference

| Metric | Good | Moderate | Unhealthy | Very Unhealthy | Hazardous |
|--------|------|----------|-----------|----------------|-----------|
| PM2.5 (μg/m³) | 0-12 | 12-35 | 35-55 | 55-150 | >150 |
| PM10 (μg/m³) | 0-54 | 55-154 | 155-254 | 255-354 | >354 |
| CO₂ (ppm) | <400 | 400-1000 | 1000-2000 | 2000-5000 | >5000 |
| O₃ (ppb) | 0-54 | 55-70 | 71-85 | 86-105 | >105 |
| NO₂ (ppb) | 0-53 | 54-100 | 101-360 | 361-649 | >649 |

### Sensor Status Thresholds

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Battery Level (%) | >50 | 20-50 | <20 |
| Signal Strength (dBm) | >-70 | -70 to -90 | <-90 |
| Data Quality Score | >0.8 | 0.5-0.8 | <0.5 |

## Data Quality Indicators

### Completeness
- Percentage of expected readings received
- Calculated as: `(actual_readings / expected_readings) * 100`

### Accuracy
- Deviation from reference sensors
- Measured as: `|measured_value - reference_value| / reference_value * 100`

### Precision
- Variance between consecutive readings
- Calculated as standard deviation of recent readings

### Timeliness
- Data latency from collection to storage
- Measured as: `server_received_at - timestamp`

## Common Error Codes

| Error Code | Description | Resolution |
|-----------|-------------|------------|
| `ERR_001` | Sensor calibration required | Recalibrate sensor |
| `ERR_002` | Low battery warning | Replace or charge battery |
| `ERR_003` | Communication timeout | Check network connectivity |
| `ERR_004` | Sensor malfunction | Service or replace sensor |
| `ERR_005` | Out of range reading | Verify sensor calibration |

## Geographic Reference

### Default Location: Astana, Kazakhstan
- **Latitude**: 51.1694° N
- **Longitude**: 71.4491° E
- **Altitude**: ~347 meters above sea level
- **Time Zone**: UTC+6 (ALMT)

## Data Retention Policies

| Data Type | Retention Period | Storage Format |
|-----------|------------------|----------------|
| Real-time readings | 30 days | Full resolution (1-minute intervals) |
| Hourly aggregates | 2 years | Aggregated statistics |
| Daily aggregates | 2 years | Daily summaries |
| Sensor metadata | Indefinite | Full records |
| Health records | 1 year | Full records |
