# Sensor Chart Component Usage Guide

## Overview

The `SensorChart` component provides an interactive line chart for visualizing historical sensor data with comprehensive filtering capabilities.

## Features

### 1. Real-Time Badge
- Displays the most recent sensor reading
- Shows animated pulse indicator
- Includes sensor ID, location, transport type, value, and timestamp
- Automatically updates with the latest data

### 2. Filter Controls

#### Sensor ID Filter
Select specific sensors or view all sensors at once.

#### Location Filter
Filter data by physical location where sensors are deployed.
- Only shows locations present in the data
- Disabled if no location data is available

#### Transport Type Filter
Filter by the transport method (e.g., truck, ship, rail, air).
- Only shows transport types present in the data
- Disabled if no transport type data is available

#### Date Range Filters
- **Start Date**: Show data from this date onwards
- **End Date**: Show data up to this date
- Dates are inclusive of the selected day

### 3. Statistics Summary
Real-time statistics for filtered data:
- **Data Points**: Number of readings in the filtered dataset
- **Minimum**: Lowest sensor value
- **Average**: Mean of all values
- **Maximum**: Highest sensor value

### 4. Interactive Chart
- Line chart showing sensor values over time
- Hover tooltips with detailed information
- Responsive design that adapts to screen size
- X-axis shows timestamps with angled labels for readability
- Y-axis shows sensor values with labeled scale

## Component Props

```typescript
interface SensorChartProps {
  data: SensorReading[];
}

interface SensorReading {
  id: number;
  timestamp: string;
  sensorId: string;
  value: number;
  location: string | null;
  transportType: string | null;
  ingestedAt: Date;
}
```

## Usage Example

```tsx
import { SensorChart } from "@/components/sensor-chart";

export default async function DashboardPage() {
  // Fetch sensor readings from your data source
  const sensorReadings = await getRecentSensorReadings(500);

  return (
    <div>
      <SensorChart data={sensorReadings} />
    </div>
  );
}
```

## Data Format Requirements

### Minimum Required Fields
- `id`: Unique identifier
- `timestamp`: ISO 8601 timestamp string
- `sensorId`: Sensor identifier
- `value`: Numeric sensor reading
- `ingestedAt`: Date when data was received

### Optional Fields
- `location`: Physical location of the sensor
- `transportType`: Method of transport (for logistics use cases)

## CSV Data Ingestion

### Basic Format (backward compatible)
```csv
timestamp,sensor_id,value
2025-12-29T10:00:00.000Z,sensor_001,23.5
2025-12-29T10:05:00.000Z,sensor_002,18.7
```

### Extended Format (with location and transport type)
```csv
timestamp,sensor_id,value,location,transport_type
2025-12-29T10:00:00.000Z,sensor_001,23.5,warehouse_a,truck
2025-12-29T10:05:00.000Z,sensor_002,18.7,warehouse_b,ship
```

## Customization

### Styling
The component uses Tailwind CSS and shadcn-ui components. You can customize:
- Colors by modifying the theme in `tailwind.config.ts`
- Card layouts by adjusting the grid classes
- Chart colors by changing the `stroke` prop on the `<Line>` component

### Chart Configuration
Located in `components/sensor-chart.tsx`:
- **Line Type**: Change `type="monotone"` to `type="linear"` or `type="step"`
- **Dot Size**: Adjust `dot={{ r: 3 }}` and `activeDot={{ r: 5 }}`
- **Colors**: Modify `stroke="hsl(var(--primary))"` for different colors
- **Height**: Change `height={400}` in `ResponsiveContainer`

## Filter Behavior

### Multiple Filters
Filters are applied cumulatively:
1. Sensor ID filter is applied first
2. Location filter is then applied to the remaining data
3. Transport type filter is applied next
4. Date range filters are applied last

### Empty State
When no data matches the selected filters, a helpful message is displayed with suggestions to adjust filter criteria.

## Performance Considerations

- Component uses `useMemo` for efficient data filtering and transformation
- Chart renders up to 500 data points efficiently
- For larger datasets, consider implementing pagination or data aggregation
- Real-time updates are handled through server-side data fetching

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Responsive design works on mobile, tablet, and desktop
- Touch-friendly controls for mobile devices

## Troubleshooting

### Chart not displaying
- Verify that the `data` prop contains valid sensor readings
- Check that timestamps are in valid ISO 8601 format
- Ensure numeric values are not null or undefined

### Filters showing "No data available"
- Check that the database contains data matching the filter criteria
- Verify that the date range includes existing data timestamps
- Try clearing all filters and reapplying them one at a time

### Real-time badge not showing
- Ensure at least one sensor reading exists in the data
- Verify that the `timestamp` field is properly formatted
- Check that the data array is not empty

