export interface SensorReading {
  timestamp: string;
  sensor_id: string;
  value: number;
  location?: string;
  transport_type?: string;
}

export interface ParseResult {
  validReadings: SensorReading[];
  skippedLines: {
    lineNumber: number;
    line: string;
    reason: string;
  }[];
  totalLines: number;
}

/**
 * Validates if a string is a valid ISO-8601 timestamp
 */
function isValidISO8601(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    // Check if the date is valid and matches the original string format
    return !isNaN(date.getTime()) && date.toISOString() === timestamp;
  } catch {
    return false;
  }
}

/**
 * Validates if a string can be parsed as a number
 */
function isValidNumber(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === null) return false;
  const num = Number(trimmed);
  return !isNaN(num) && isFinite(num);
}

/**
 * Parses CSV string with headers: timestamp, sensor_id, value
 * Validates each line and gracefully skips malformed entries
 */
export function parseCSV(csvString: string): ParseResult {
  const lines = csvString.split('\n').map(line => line.trim());
  const validReadings: SensorReading[] = [];
  const skippedLines: ParseResult['skippedLines'] = [];
  
  let headerProcessed = false;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;
    
    // Skip empty lines
    if (line === '') {
      continue;
    }

    // Process header line
    if (!headerProcessed) {
      const expectedHeader3 = 'timestamp,sensor_id,value';
      const expectedHeader5 = 'timestamp,sensor_id,value,location,transport_type';
      const normalizedLine = line.toLowerCase().replace(/\s+/g, '');
      const normalizedExpected3 = expectedHeader3.replace(/\s+/g, '');
      const normalizedExpected5 = expectedHeader5.replace(/\s+/g, '');
      
      if (normalizedLine !== normalizedExpected3 && normalizedLine !== normalizedExpected5) {
        skippedLines.push({
          lineNumber,
          line,
          reason: `Invalid header. Expected: ${expectedHeader3} or ${expectedHeader5}`,
        });
      }
      
      headerProcessed = true;
      continue;
    }

    // Parse data lines
    const parts = line.split(',').map(part => part.trim());
    
    if (parts.length !== 3 && parts.length !== 5) {
      skippedLines.push({
        lineNumber,
        line,
        reason: `Invalid number of fields. Expected 3 or 5, got ${parts.length}`,
      });
      continue;
    }

    const [timestamp, sensor_id, valueStr, location, transport_type] = parts;

    // Validate timestamp (ISO-8601)
    if (!isValidISO8601(timestamp)) {
      skippedLines.push({
        lineNumber,
        line,
        reason: `Invalid ISO-8601 timestamp: "${timestamp}"`,
      });
      continue;
    }

    // Validate sensor_id (must not be empty)
    if (!sensor_id || sensor_id === '') {
      skippedLines.push({
        lineNumber,
        line,
        reason: 'Empty sensor_id',
      });
      continue;
    }

    // Validate value (must be numeric)
    if (!isValidNumber(valueStr)) {
      skippedLines.push({
        lineNumber,
        line,
        reason: `Invalid numeric value: "${valueStr}"`,
      });
      continue;
    }

    // All validations passed - add to valid readings
    const reading: SensorReading = {
      timestamp,
      sensor_id,
      value: Number(valueStr),
    };

    // Add optional fields if present
    if (location && location.trim() !== '') {
      reading.location = location;
    }
    if (transport_type && transport_type.trim() !== '') {
      reading.transport_type = transport_type;
    }

    validReadings.push(reading);
  }

  return {
    validReadings,
    skippedLines,
    totalLines: lineNumber,
  };
}

