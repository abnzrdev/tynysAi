"use client";

import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps as RechartsTooltipProps,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { exportSensorReportPdf } from "@/lib/utils/export-pdf";
import { Calendar as CalendarIcon, Download, RefreshCcw } from "lucide-react";

export interface SensorAnalyticsPoint {
  id?: number;
  timestamp: string;
  value: number;
  sensorId?: string;
  location?: string | null;
  pm25?: number | null;
  pm10?: number | null;
  aqiCategory?: AqiCategory;
  aqiRule?: string;
}

type AqiCategory = "low" | "medium" | "high" | "unknown";

interface SensorAnalyticsProps {
  data: SensorAnalyticsPoint[];
}

type AqiTooltipPayload = {
  value?: number;
  payload?: SensorAnalyticsPoint & { label: string };
};

type AqiTooltipProps = RechartsTooltipProps<number, string> & {
  payload?: AqiTooltipPayload[];
  label?: string | number;
  active?: boolean;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function formatTimestamp(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : dateFormatter.format(date);
}

function formatDateRange(range?: DateRange) {
  if (!range?.from && !range?.to) return "All time";
  const start = range?.from ? shortDateFormatter.format(range.from) : "Start";
  const end = range?.to ? shortDateFormatter.format(range.to) : "Now";
  return `${start} → ${end}`;
}

function getCategoryMeta(category?: AqiCategory) {
  const normalized = category ?? "unknown";
  const meta: Record<AqiCategory, { label: string; className: string }> = {
    low: {
      label: "Low",
      className:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200",
    },
    medium: {
      label: "Medium",
      className:
        "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200",
    },
    high: {
      label: "High",
      className:
        "bg-red-100 text-red-800 dark:bg-red-500/10 dark:text-red-200",
    },
    unknown: {
      label: "Unknown",
      className: "bg-muted text-muted-foreground",
    },
  };

  return meta[normalized];
}

function AqiTooltip({ active, payload, label }: AqiTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  const point = payload[0];
  const statusMeta = getCategoryMeta(point.payload?.aqiCategory as AqiCategory | undefined);
  return (
    <div className="rounded-lg border bg-background/90 p-3 shadow-sm">
      <div className="text-xs text-muted-foreground">{formatTimestamp(label as string)}</div>
      <div className="text-sm font-semibold">AQI {point.value?.toFixed(2)}</div>
      <div className="mt-1 inline-flex items-center gap-2 rounded-full px-2 py-1 text-xs font-medium"
        style={{ background: "transparent" }}>
        <span className={cn("h-2 w-2 rounded-full", {
          "bg-emerald-500": statusMeta.label === "Low",
          "bg-amber-500": statusMeta.label === "Medium",
          "bg-red-500": statusMeta.label === "High",
          "bg-muted-foreground": statusMeta.label === "Unknown",
        })}
        ></span>
        <span className="text-muted-foreground">{statusMeta.label}</span>
      </div>
      {point.payload?.sensorId && (
        <div className="text-xs text-muted-foreground">Sensor {point.payload.sensorId}</div>
      )}
    </div>
  );
}

export function SensorAnalytics({ data }: SensorAnalyticsProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isExporting, setIsExporting] = useState(false);

  const normalizedData = useMemo(() => {
    return data
      .map((reading) => {
        const timestampObj = new Date(reading.timestamp);
        const timestampMs = timestampObj.getTime();

        return {
          ...reading,
          timestampMs,
          aqiCategory: reading.aqiCategory ?? "unknown",
          label: Number.isNaN(timestampMs)
            ? reading.timestamp
            : timestampObj.toLocaleString(),
        };
      })
      .filter((reading) => Number.isFinite(reading.timestampMs) && Number.isFinite(reading.value))
      .sort((a, b) => a.timestampMs - b.timestampMs);
  }, [data]);

  const filteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) return normalizedData;

    const startDate = dateRange?.from ? new Date(dateRange.from) : undefined;
    const endDate = dateRange?.to ? new Date(dateRange.to) : undefined;

    if (startDate) startDate.setHours(0, 0, 0, 0);
    if (endDate) endDate.setHours(23, 59, 59, 999);

    const start = startDate?.getTime();
    const end = endDate?.getTime();

    return normalizedData.filter((reading) => {
      const afterStart = start ? reading.timestampMs >= start : true;
      const beforeEnd = end ? reading.timestampMs <= end : true;
      return afterStart && beforeEnd;
    });
  }, [normalizedData, dateRange]);

  const categoryCounts = useMemo(() => {
    return filteredData.reduce(
      (acc, reading) => {
        const key = (reading.aqiCategory ?? "unknown") as AqiCategory;
        acc[key] += 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0, unknown: 0 }
    );
  }, [filteredData]);

  const stats = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        min: 0,
        max: 0,
        avg: 0,
        sensors: 0,
      };
    }

    const values = filteredData.map((reading) => reading.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const sensors = new Set(filteredData.map((reading) => reading.sensorId ?? "unknown")).size;

    return {
      min,
      max,
      avg,
      sensors,
    };
  }, [filteredData]);

  const chartData = useMemo(
    () =>
      filteredData.map((reading) => ({
        ...reading,
        label: reading.label,
      })),
    [filteredData]
  );

  const handleResetRange = () => setDateRange(undefined);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportSensorReportPdf(
        filteredData.map((reading) => ({
          timestamp: reading.timestamp,
          value: reading.value,
          sensorId: reading.sensorId,
          location: reading.location,
          aqiCategory: reading.aqiCategory ?? "unknown",
        })),
        {
          projectName: "TynysAi",
          dateRange: {
            start: dateRange?.from ?? null,
            end: dateRange?.to ?? null,
          },
        }
      );
    } catch (error) {
      console.error("Failed to export PDF", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold leading-tight">AQI Analytics</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-mono">
            {filteredData.length} points
          </Badge>
          <Badge variant="secondary">{formatDateRange(dateRange)}</Badge>
          <div className="flex flex-wrap gap-1 text-xs">
            {(["low", "medium", "high"] as AqiCategory[]).map((category) => {
              const meta = getCategoryMeta(category);
              return (
                <span
                  key={category}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-2 py-1 font-medium",
                    meta.className
                  )}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {meta.label} {categoryCounts[category]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">Minimum AQI</CardDescription>
            <CardTitle className="font-mono text-3xl">{stats.min.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">Average AQI</CardDescription>
            <CardTitle className="font-mono text-3xl">{stats.avg.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">Maximum AQI</CardDescription>
            <CardTitle className="font-mono text-3xl">{stats.max.toFixed(2)}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">Active Sensors</CardDescription>
            <CardTitle className="font-mono text-3xl">{stats.sensors}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>AQI Trends</CardTitle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("justify-start gap-2", !dateRange && "text-muted-foreground")}>
                  <CalendarIcon className="h-4 w-4" />
                  <span className="text-sm">{formatDateRange(dateRange)}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
                <div className="flex items-center justify-between border-t p-3">
                  <Button variant="ghost" size="sm" onClick={handleResetRange} className="gap-1">
                    <RefreshCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                  <Badge variant="outline" className="font-mono text-xs">
                    {filteredData.length} points
                  </Badge>
                </div>
              </PopoverContent>
            </Popover>
            <Button onClick={handleExport} disabled={filteredData.length === 0 || isExporting} className="gap-2">
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export Report"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-[360px] w-full">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted">
                <p className="text-sm text-muted-foreground">No data in this range. Expand the window to see trends.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 12, right: 18, left: 4, bottom: 24 }}>
                  <defs>
                    <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.85} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                    stroke="hsl(var(--border))"
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    stroke="hsl(var(--border))"
                    label={{
                      value: "AQI",
                      angle: -90,
                      position: "insideLeft",
                      style: { fill: "hsl(var(--muted-foreground))" },
                    }}
                  />
                  <Tooltip content={<AqiTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="AQI"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#analyticsGradient)"
                    dot={{ r: 3, strokeWidth: 1, stroke: "white" }}
                    activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--chart-1))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="rounded-xl border bg-muted/20 p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[hsl(var(--chart-1))]"></span>
                AQI trend
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold text-foreground">{stats.avg.toFixed(2)}</span>
                mean
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold text-foreground">{stats.min.toFixed(2)}</span>
                min
              </span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold text-foreground">{stats.max.toFixed(2)}</span>
                max
              </span>
              <span className="ml-auto text-xs text-muted-foreground">Range: {formatDateRange(dateRange)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
