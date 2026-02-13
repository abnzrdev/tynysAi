import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/csv-parser';
import { batchInsertSensorReadings } from '@/lib/data-access';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('authorization');
    
    // Get the secret from environment variables
    const iotDeviceSecret = process.env.IOT_DEVICE_SECRET;

    // Validate that the secret is configured
    if (!iotDeviceSecret) {
      console.error('IOT_DEVICE_SECRET is not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Check if Authorization header is missing
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized - Missing Authorization header' },
        { status: 401 }
      );
    }

    // Extract the token from "Bearer <token>" format or use as-is
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.substring(7)
      : authHeader;

    // Validate the token against the secret
    if (token !== iotDeviceSecret) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials' },
        { status: 401 }
      );
    }

    // Authorization successful - read CSV body
    const csvBody = await request.text();

    if (!csvBody || csvBody.trim() === '') {
      return NextResponse.json(
        { error: 'Empty request body' },
        { status: 400 }
      );
    }

    // Parse and validate CSV data
    const parseResult = parseCSV(csvBody);

    console.log('CSV parsing results:', {
      validReadings: parseResult.validReadings.length,
      skippedLines: parseResult.skippedLines.length,
      totalLines: parseResult.totalLines,
    });

    // Log skipped lines for debugging
    if (parseResult.skippedLines.length > 0) {
      console.warn('Skipped malformed lines:', parseResult.skippedLines);
    }

    // Batch insert valid readings into database
    let insertedCount = 0;
    if (parseResult.validReadings.length > 0) {
      try {
        insertedCount = await batchInsertSensorReadings(parseResult.validReadings);
        console.log(`Successfully inserted ${insertedCount} sensor readings`);
      } catch (dbError) {
        console.error('Database insertion error:', dbError);
        return NextResponse.json(
          { 
            error: 'Failed to store sensor readings',
            details: 'Database operation failed',
            summary: {
              totalLines: parseResult.totalLines,
              validReadings: parseResult.validReadings.length,
              skippedLines: parseResult.skippedLines.length,
              inserted: 0,
            }
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: true,
        message: 'Data ingested successfully',
        summary: {
          totalLines: parseResult.totalLines,
          validReadings: parseResult.validReadings.length,
          skippedLines: parseResult.skippedLines.length,
          inserted: insertedCount,
          errors: parseResult.skippedLines.length > 0 ? parseResult.skippedLines : undefined,
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error processing ingest request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

