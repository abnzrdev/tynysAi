"use client";

import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface SensorReading {
  id: number;
  timestamp: string;
  sensorId: string;
  value: number;
  location: string | null;
  transportType: string | null;
  ingestedAt: Date;
}

interface SensorChartProps {
  data: SensorReading[];
}

export function SensorChart({ data }: SensorChartProps) {
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTransportType, setSelectedTransportType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Get unique sensor IDs
  const uniqueSensors = useMemo(() => {
    const sensors = new Set(data.map((reading) => reading.sensorId));
    return Array.from(sensors).sort();
  }, [data]);

  // Get unique locations
  const uniqueLocations = useMemo(() => {
    const locations = new Set(
      data
        .filter((reading) => reading.location)
        .map((reading) => reading.location as string)
    );
    return Array.from(locations).sort();
  }, [data]);

  // Get unique transport types
  const uniqueTransportTypes = useMemo(() => {
    const types = new Set(
      data
        .filter((reading) => reading.transportType)
        .map((reading) => reading.transportType as string)
    );
    return Array.from(types).sort();
  }, [data]);

  // Get the most recent reading for real-time display
  const latestReading = useMemo(() => {
    if (data.length === 0) return null;
    
    const sortedData = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    return sortedData[0];
  }, [data]);

  // Filter and transform data for the chart
  const chartData = useMemo(() => {
    let filtered = data;

    // Filter by sensor ID
    if (selectedSensor !== "all") {
      filtered = filtered.filter((reading) => reading.sensorId === selectedSensor);
    }

    // Filter by location
    if (selectedLocation !== "all") {
      filtered = filtered.filter((reading) => reading.location === selectedLocation);
    }

    // Filter by transport type
    if (selectedTransportType !== "all") {
      filtered = filtered.filter((reading) => reading.transportType === selectedTransportType);
    }

    // Filter by date range
    if (startDate) {
      const startDateTime = new Date(startDate).getTime();
      filtered = filtered.filter(
        (reading) => new Date(reading.timestamp).getTime() >= startDateTime
      );
    }

    if (endDate) {
      const endDateTime = new Date(endDate).getTime() + 86400000; // Add 24h to include the full day
      filtered = filtered.filter(
        (reading) => new Date(reading.timestamp).getTime() <= endDateTime
      );
    }

    // Sort by timestamp and format for recharts
    return filtered
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((reading) => ({
        timestamp: new Date(reading.timestamp).toLocaleString(),
        value: reading.value,
        sensorId: reading.sensorId,
        location: reading.location,
        transportType: reading.transportType,
        fullTimestamp: reading.timestamp,
      }));
  }, [data, selectedSensor, selectedLocation, selectedTransportType, startDate, endDate]);

  // Calculate statistics for filtered data
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { min: 0, max: 0, avg: 0, count: 0 };
    }

    const values = chartData.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    return {
      min: min.toFixed(2),
      max: max.toFixed(2),
      avg: avg.toFixed(2),
      count: chartData.length,
    };
  }, [chartData]);

  return (
    <div className="space-y-4">
      {/* Real-Time Status Badge */}
      {latestReading && (
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Real-Time
            </Badge>
            <div className="text-sm flex items-center gap-2 flex-wrap">
              <span className="font-semibold">Latest:</span>
              <span className="text-muted-foreground">
                Sensor: {latestReading.sensorId}
              </span>
              {latestReading.location && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Location: {latestReading.location}
                  </span>
                </>
              )}
              {latestReading.transportType && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    Type: {latestReading.transportType}
                  </span>
                </>
              )}
              <span className="text-muted-foreground">•</span>
              <span className="font-mono font-bold text-lg">
                {latestReading.value.toFixed(2)}
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground text-xs">
                {new Date(latestReading.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500/5 to-purple-500/5">
        <CardHeader className="border-b bg-gradient-to-r from-blue-500/5 to-purple-500/5">
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-5 w-5 text-blue-500"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sensor ID Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensor ID</label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sensor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sensors</SelectItem>
                  {uniqueSensors.map((sensor) => (
                    <SelectItem key={sensor} value={sensor}>
                      {sensor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {uniqueLocations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No locations available
                    </SelectItem>
                  ) : (
                    uniqueLocations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Transport Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Transport Type</label>
              <Select value={selectedTransportType} onValueChange={setSelectedTransportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select transport type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueTransportTypes.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No transport types available
                    </SelectItem>
                  ) : (
                    uniqueTransportTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>

            {/* End Date Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Statistics Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <p className="text-xs text-muted-foreground">Data Points</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.count}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.min}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.avg}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{stats.max}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader className="border-b bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
          <CardTitle className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-5 w-5 text-cyan-500"
            >
              <line x1="12" x2="12" y1="20" y2="10" />
              <line x1="18" x2="18" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="16" />
            </svg>
            Sensor Data Visualization
            {selectedSensor !== "all" && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({selectedSensor})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
              <div className="text-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-12 w-12 mx-auto mb-2 opacity-50"
                >
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
                <p>No data available for the selected filters</p>
                <p className="text-sm mt-2">
                  Try adjusting your filter criteria
                </p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="timestamp"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{
                    value: "Sensor Value",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))" },
                  }}
                  tick={{ fill: "hsl(var(--muted-foreground))" }}
                  stroke="hsl(var(--border))"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "rgb(59, 130, 246)", strokeWidth: 2, stroke: "white" }}
                  activeDot={{ r: 6, fill: "rgb(59, 130, 246)" }}
                  name="Sensor Value"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

