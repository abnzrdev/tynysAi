import { NextRequest, NextResponse } from 'next/server';
import { 
  validateSensorReading, 
  generateDataHash,
  type SensorReadingPayload 
} from '@/lib/sensor-validation';
import { 
  insertSensorReading,
  findOrCreateSensor,
  findOrCreateSite,
  checkDuplicateReading
} from '@/lib/sensor-data-access';

export const dynamic = 'force-dynamic';

/**
 * POST /api/v1/sensor-data
 * 
 * Accepts JSON sensor data from IoT devices
 * 
 * Authentication: Bearer token (IOT_DEVICE_SECRET)
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "device_id": "lab01",
 *   "site": "AGI_Lab",
 *   "timestamp": "2024-01-15T10:30:00Z",
 *   "readings": {
 *     "pm1": 12.3,
 *     "pm25": 25.7,
 *     "pm10": 43.1,
 *     "co2": 412,
 *     "voc": 0.65,
 *     "temp": 21.8,
 *     "hum": 46.2,
 *     "ch2o": 0.03,
 *     "co": 0.1,
 *     "o3": 18.5,
 *     "no2": 14.2
 *   },
 *   "metadata": {
 *     "battery": 87,
 *     "signal": -65,
 *     "firmware": "2.1.4"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization');
    const iotDeviceSecret = process.env.IOT_DEVICE_SECRET;

    if (!iotDeviceSecret) {
      console.error('IOT_DEVICE_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing Authorization header' },
        { status: 401 }
      );
    }

    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    if (token !== iotDeviceSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials' },
        { status: 401 }
      );
    }

    // Parse JSON body
    let payload: SensorReadingPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate payload
    const validation = validateSensorReading(payload);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
          warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
        },
        { status: 400 }
      );
    }

    // Generate hash for duplicate detection
    const dataHash = generateDataHash(payload);

    // Check for duplicate
    const isDuplicate = await checkDuplicateReading(dataHash);
    if (isDuplicate) {
      return NextResponse.json(
        {
          success: true,
          message: 'Duplicate reading detected and skipped',
          duplicate: true,
        },
        { status: 200 }
      );
    }

    // Find or create site
    let siteId: number | null = null;
    if (payload.site) {
      siteId = await findOrCreateSite(payload.site);
    }

    // Find or create sensor
    const sensor = await findOrCreateSensor({
      deviceId: payload.device_id,
      siteId,
      firmwareVersion: payload.metadata?.firmware,
    });

    // Insert sensor reading
    const readingId = await insertSensorReading({
      sensorId: sensor.id,
      timestamp: payload.timestamp,
      readings: payload.readings,
      metadata: payload.metadata,
      dataHash,
    });

    // Update sensor health if metadata provided
    if (payload.metadata?.battery !== undefined || payload.metadata?.signal !== undefined) {
      // This could be done asynchronously or in a separate endpoint
      // For now, we'll just log it
      console.log('Sensor health data received:', {
        sensorId: sensor.id,
        battery: payload.metadata.battery,
        signal: payload.metadata.signal,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Sensor data ingested successfully',
        data: {
          readingId,
          sensorId: sensor.id,
          deviceId: payload.device_id,
          timestamp: payload.timestamp,
        },
        warnings: validation.warnings.length > 0 ? validation.warnings : undefined,
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing sensor data request:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
