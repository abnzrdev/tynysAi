# Quick Start Guide

## ✅ Implementation Checklist

All tasks have been completed! Here's what was done:

- [x] Installed `recharts` library (v3.6.0)
- [x] Installed shadcn-ui Select component
- [x] Installed shadcn-ui Badge component
- [x] Created SensorChart component with Line Chart
- [x] Added Real-Time badge showing latest sensor value
- [x] Implemented Sensor ID filter (Select dropdown)
- [x] Implemented Location filter (Select dropdown)
- [x] Implemented Transport Type filter (Select dropdown)
- [x] Implemented Date Range filters (Start & End DatePickers)
- [x] Added client-side state controls for instant filtering
- [x] Integrated chart into dashboard
- [x] Updated database schema with new columns
- [x] Applied database migration
- [x] Updated CSV parser for extended format
- [x] Created comprehensive documentation

## 🚀 To See Your New Chart in Action:

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Navigate to Dashboard
Open your browser and go to:
```
http://localhost:3000/dashboard
```

### 3. Upload Sample Data (Optional)
If you need test data, use the provided sample file:

```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_IOT_DEVICE_SECRET" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data-extended.csv
```

Replace `YOUR_IOT_DEVICE_SECRET` with your actual secret from `.env.local`.

### 4. Explore the Features

#### Real-Time Badge
- Located at the top of the Historical Analytics section
- Shows the most recent sensor reading with animated pulse
- Displays sensor ID, location, transport type, value, and timestamp

#### Filter Controls
1. **Sensor ID Dropdown**: Select a specific sensor or "All Sensors"
2. **Location Dropdown**: Filter by physical location
3. **Transport Type Dropdown**: Filter by transport method
4. **Start Date Picker**: Show data from this date onwards
5. **End Date Picker**: Show data up to this date

#### Statistics Panel
- Data Points: Number of readings in filtered view
- Minimum: Lowest sensor value
- Average: Mean of all values
- Maximum: Highest sensor value

#### Interactive Chart
- Hover over data points for detailed tooltips
- X-axis shows timestamps
- Y-axis shows sensor values
- Responsive and mobile-friendly

## 📊 Testing with Sample Data

### Option 1: Use Basic CSV Format (3 columns)
Create a file called `test-data-basic.csv`:
```csv
timestamp,sensor_id,value
2025-12-29T08:00:00.000Z,sensor_001,20.5
2025-12-29T08:15:00.000Z,sensor_001,21.2
2025-12-29T08:30:00.000Z,sensor_002,19.8
2025-12-29T08:45:00.000Z,sensor_002,20.1
2025-12-29T09:00:00.000Z,sensor_003,22.3
```

### Option 2: Use Extended CSV Format (5 columns)
Use the provided `sample-data-extended.csv` which includes location and transport_type.

### Upload the Data
```bash
curl -X POST http://localhost:3000/api/ingest \
  -H "Authorization: Bearer YOUR_IOT_DEVICE_SECRET" \
  -H "Content-Type: text/csv" \
  --data-binary @sample-data-extended.csv
```

## 🔍 Troubleshooting

### Chart Not Showing Data?
1. Make sure you've uploaded sensor data via the API
2. Check that the database migration was applied: `npx drizzle-kit push`
3. Verify your database connection in `.env.local`
4. Try clearing all filters and refresh the page

### Filters Not Working?
1. Make sure there's data matching your filter criteria
2. Try selecting "All" for each filter to see all data
3. Check the date range includes your data timestamps

### Real-Time Badge Not Appearing?
1. Ensure at least one sensor reading exists in the database
2. Verify data was successfully ingested (check API response)
3. Refresh the page to fetch latest data

## 📖 Additional Resources

- **Component Usage**: See `CHART_USAGE.md` for detailed component documentation
- **Implementation Details**: See `IMPLEMENTATION_SUMMARY.md` for technical details
- **Project Overview**: See `README.md` for general project information

## 🎉 You're All Set!

The sensor chart visualization is now fully functional with:
- ✅ Interactive line chart with Recharts
- ✅ Real-time badge showing latest sensor value
- ✅ Multiple filter controls (Sensor ID, Location, Transport Type, Date Range)
- ✅ Live statistics and data visualization
- ✅ Responsive design for all devices

Enjoy exploring your IoT data! 📈

