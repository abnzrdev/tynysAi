# Sensor Data API Documentation

## Overview

The TynysAi Sensor Data API provides endpoints for ingesting and querying air quality sensor data from IoT devices. The API supports JSON-based data ingestion with comprehensive validation and duplicate detection.

## Authentication

All API endpoints require authentication using a Bearer token.

**Header Format:**
```
Authorization: Bearer <IOT_DEVICE_SECRET>
```

The `IOT_DEVICE_SECRET` must be configured in your environment variables.

## Endpoints

### POST /api/v1/sensor-data

Ingests sensor reading data from IoT devices.

#### Request

**Headers:**
- `Authorization: Bearer <token>` (required)
- `Content-Type: application/json` (required)

**Body:**
```json
{
  "device_id": "lab01",
  "site": "AGI_Lab",
  "timestamp": "2024-01-15T10:30:00Z",
  "readings": {
    "pm1": 12.3,
    "pm25": 25.7,
    "pm10": 43.1,
    "co2": 412,
    "voc": 0.65,
    "temp": 21.8,
    "hum": 46.2,
    "ch2o": 0.03,
    "co": 0.1,
    "o3": 18.5,
    "no2": 14.2,
    "pressure": 1013.25
  },
  "metadata": {
    "battery": 87,
    "signal": -65,
    "firmware": "2.1.4",
    "error_code": null
  }
}
```

#### Field Descriptions

**Top-level fields:**
- `device_id` (required): Unique device identifier (e.g., "lab01")
- `site` (optional): Site name where sensor is deployed
- `timestamp` (required): ISO-8601 timestamp of data collection

**readings object:**
All fields are optional, but at least one should be provided.

- `pm1`, `pm25`, `pm10`: Particulate matter in μg/m³ (0-1000)
- `co2`: Carbon dioxide in ppm (300-5000)
- `co`: Carbon monoxide in ppm (0-100)
- `o3`: Ozone in ppb (0-500)
- `no2`: Nitrogen dioxide in ppb (0-500)
- `voc`: Volatile organic compounds in ppm (0-100)
- `ch2o`: Formaldehyde in ppm (0-10)
- `temp`: Temperature in Celsius (-40 to 60)
- `hum`: Humidity percentage (0-100)
- `pressure`: Atmospheric pressure in hPa (800-1200)

**metadata object:**
All fields are optional.

- `battery`: Battery level percentage (0-100)
- `signal`: Signal strength in dBm (-120 to 0)
- `firmware`: Firmware version string
- `error_code`: Error code if any issues detected

#### Response

**Success (201 Created):**
```json
{
  "success": true,
  "message": "Sensor data ingested successfully",
  "data": {
    "readingId": 12345,
    "sensorId": 42,
    "deviceId": "lab01",
    "timestamp": "2024-01-15T10:30:00Z"
  },
  "warnings": []
}
```

**Duplicate Detection (200 OK):**
```json
{
  "success": true,
  "message": "Duplicate reading detected and skipped",
  "duplicate": true
}
```

**Validation Error (400 Bad Request):**
```json
{
  "error": "Validation failed",
  "errors": [
    "pm25 (1200) exceeds maximum (1000)",
    "timestamp: Timestamp is in the future"
  ],
  "warnings": [
    "co2 is near maximum range (4500 of 5000)"
  ]
}
```

**Authentication Error (401 Unauthorized):**
```json
{
  "error": "Unauthorized - Invalid credentials"
}
```

#### Validation Rules

1. **Device ID**: Must be non-empty string
2. **Timestamp**: Must be valid ISO-8601 format, within 5 minutes ago to 1 hour in the future
3. **Value Ranges**: All numeric values must be within specified ranges
4. **Duplicate Detection**: Uses hash-based deduplication on device_id, timestamp, and key readings

#### Example cURL Request

```bash
curl -X POST http://localhost:3000/api/v1/sensor-data \
  -H "Authorization: Bearer your-iot-device-secret" \
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

## Data Access Functions

The following functions are available in `lib/sensor-data-access.ts` for querying sensor data:

### Latest Readings
```typescript
getLatestSensorReadings(limit?: number)
```
Returns the latest readings from all active sensors.

### Sensor-Specific Queries
```typescript
getSensorReadingsByDeviceId(deviceId: string, startDate: Date, endDate: Date)
```
Returns readings for a specific sensor within a time range.

### Aggregations
```typescript
getHourlyAggregates(sensorId: number, startDate: Date, endDate: Date)
getDailyAggregates(sensorId: number, startDate: Date, endDate: Date)
```
Returns hourly or daily aggregated statistics.

### Sensor Management
```typescript
getAllActiveSensors()
getSensorsWithLowBattery(threshold?: number)
getSensorsWithinRadius(centerLat: number, centerLon: number, radiusKm: number)
```
Query sensor metadata and status.

### Alert Queries
```typescript
getReadingsExceedingThresholds(params: {
  pm25Threshold?: number;
  pm10Threshold?: number;
  co2Threshold?: number;
  startDate?: Date;
  endDate?: Date;
})
```
Returns readings that exceed configured thresholds.

## Error Handling

### Common Error Codes

- **400 Bad Request**: Invalid request format or validation failure
- **401 Unauthorized**: Missing or invalid authentication token
- **500 Internal Server Error**: Server-side error during processing

### Error Response Format

```json
{
  "error": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"],
  "message": "Additional context"
}
```

## Rate Limiting

Currently, rate limiting is not implemented but should be added for production deployments. Recommended limits:
- 100 requests per minute per device
- 1000 requests per minute per IP address

## Best Practices

1. **Batch Submissions**: For offline devices, batch multiple readings in a single request
2. **Timestamp Accuracy**: Ensure device clocks are synchronized (NTP recommended)
3. **Error Handling**: Implement retry logic with exponential backoff
4. **Data Validation**: Validate data on device before sending to reduce API errors
5. **Monitoring**: Monitor battery levels and signal strength to ensure reliable data transmission
