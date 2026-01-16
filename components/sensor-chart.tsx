"use client";

import { useMemo, type ReactNode } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SensorReading {
  id: number;
  timestamp: string;
  sensorId: string;
  value: number;
  location: string | null;
  transportType: string | null;
  ingestedAt: string | Date;
}

interface SensorChartProps {
  data: SensorReading[];
  actionSlot?: ReactNode;
}

export function SensorChart({ data, actionSlot }: SensorChartProps) {
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
    // Sort by timestamp and format for recharts
    return [...data]
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
  }, [data]);

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
    <div className="space-y-4 w-full">
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
              <span className="font-mono font-bold text-3xl leading-none">
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

      {/* Chart */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-500/5 to-blue-500/5">
        <CardHeader className="flex flex-col gap-3 border-b bg-gradient-to-r from-cyan-500/5 to-blue-500/5 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-start justify-between gap-3">
            <div className="space-y-1">
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
                Sensor Data
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Focus on trends; adjust filters directly from the data controls.
              </p>
            </div>
            {actionSlot ? <div className="flex-shrink-0">{actionSlot}</div> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-500/5 p-3">
              <p className="text-xs text-muted-foreground">Data Points</p>
              <p className="font-mono text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.count}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 p-3">
              <p className="text-xs text-muted-foreground">Minimum</p>
              <p className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.min}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-500/5 p-3">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="font-mono text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.avg}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-500/5 p-3">
              <p className="text-xs text-muted-foreground">Maximum</p>
              <p className="font-mono text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.max}</p>
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="flex h-[380px] items-center justify-center rounded-lg border-2 border-dashed border-muted">
              <div className="text-center text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="mx-auto mb-2 h-12 w-12 opacity-50"
                >
                  <line x1="12" x2="12" y1="20" y2="10" />
                  <line x1="18" x2="18" y1="20" y2="4" />
                  <line x1="6" x2="6" y1="20" y2="16" />
                </svg>
                <p>No data available for the selected filters</p>
                <p className="mt-2 text-sm">Try adjusting your filter criteria</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={380}>
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
                  tick={{
                    fontSize: 12,
                    fill: "hsl(var(--muted-foreground))",
                    fontFamily:
                      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{
                    value: "Sensor Value",
                    angle: -90,
                    position: "insideLeft",
                    style: { fill: "hsl(var(--muted-foreground))" },
                  }}
                  tick={{
                    fill: "hsl(var(--muted-foreground))",
                    fontFamily:
                      'JetBrains Mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
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

