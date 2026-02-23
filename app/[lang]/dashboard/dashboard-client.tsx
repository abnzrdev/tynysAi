"use client";

import { useMemo, useState } from "react";
import { DashboardMapPanel, type StatValues } from "./map-panel-client";
import { SensorChart } from "@/components/sensor-chart";
import { SensorDistribution, type SensorSlice } from "@/components/sensor-distribution";
import { SensorAnalytics } from "@/components/analytics/SensorAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Activity,
  Database,
  FileText,
  Filter,
  LineChart,
  Map,
  Microscope,
  Radio,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";

export type SensorReading = {
  id: number;
  timestamp: string;
  sensorId: string;
  value: number;
  location: string | null;
  transportType: string | null;
  ingestedAt: Date | string;
};

interface DashboardCopy {
  totalDataPoints: string;
  activeSensors: string;
  recentReadings: string;
  averageValue: string;
  noGeocodedData: string;
  recentIotData: string;
  noRecentActivity: string;
  sensorStatistics: string;
  keyMetrics: string;
  noSensorStats: string;
  sensorDataDistribution: string;
  recentReadingsBySensor: string;
  noSensorData: string;
  minimumValue: string;
  maximumValue: string;
}

interface DashboardClientProps {
  readings: SensorReading[];
  dict: DashboardCopy;
}

type SectionHeaderProps = {
  id?: string;
  icon: LucideIcon;
  title: string;
  className?: string;
};

function SectionHeader({ id, icon: Icon, title, className }: SectionHeaderProps) {
  return (
    <div
      id={id}
      className={cn(
        "text-lg font-mono font-semibold tracking-tight text-foreground flex items-center gap-2 mb-4 mt-8 border-b pb-2",
        "scroll-mt-28",
        className
      )}
    >
      <Icon className="h-5 w-5 text-muted-foreground" />
      <span>{title}</span>
    </div>
  );
}

export function DashboardClient({ readings, dict }: DashboardClientProps) {
  const [selectedSensor, setSelectedSensor] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedTransportType, setSelectedTransportType] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filterOptions = useMemo(() => {
    const sensors = new Set(readings.map((reading) => reading.sensorId));
    const locations = new Set(
      readings
        .filter((reading) => reading.location)
        .map((reading) => reading.location as string)
    );
    const transportTypes = new Set(
      readings
        .filter((reading) => reading.transportType)
        .map((reading) => reading.transportType as string)
    );

    return {
      sensors: Array.from(sensors).sort(),
      locations: Array.from(locations).sort(),
      transportTypes: Array.from(transportTypes).sort(),
    };
  }, [readings]);

  const filteredReadings = useMemo(() => {
    let filtered = [...readings];

    if (selectedSensor !== "all") {
      filtered = filtered.filter((reading) => reading.sensorId === selectedSensor);
    }

    if (selectedLocation !== "all") {
      filtered = filtered.filter((reading) => reading.location === selectedLocation);
    }

    if (selectedTransportType !== "all") {
      filtered = filtered.filter((reading) => reading.transportType === selectedTransportType);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter((reading) => new Date(reading.timestamp).getTime() >= start);
    }

    if (endDate) {
      const end = new Date(endDate).getTime() + 86400000;
      filtered = filtered.filter((reading) => new Date(reading.timestamp).getTime() <= end);
    }

    return filtered.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [readings, selectedSensor, selectedLocation, selectedTransportType, startDate, endDate]);

  const statValues: StatValues = useMemo(() => {
    const uniqueSensors = new Set(filteredReadings.map((r) => r.sensorId));
    const avgSensorValue = filteredReadings.length
      ? (
          filteredReadings.reduce((sum, r) => sum + r.value, 0) /
          filteredReadings.length
        ).toFixed(2)
      : "0.00";

    return {
      totalDataPoints: filteredReadings.length,
      activeSensors: uniqueSensors.size,
      recentReadings: filteredReadings.length,
      avgSensorValue,
    };
  }, [filteredReadings]);

  const statItems = useMemo(
    () => [
      { label: "Total Points", value: statValues.totalDataPoints, icon: Database },
      { label: "Active Sensors", value: statValues.activeSensors, icon: Radio },
      { label: "Recent Readings", value: statValues.recentReadings, icon: Activity },
      { label: "Avg. Value", value: statValues.avgSensorValue, icon: TrendingUp },
    ],
    [statValues]
  );

  const sensorSlices: SensorSlice[] = useMemo(() => {
    const counts = filteredReadings.reduce((acc, reading) => {
      acc[reading.sensorId] = (acc[reading.sensorId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([sensorId, count]) => ({
        sensorId,
        count,
        percentage: Math.round((count / Math.max(filteredReadings.length, 1)) * 100),
      }));
  }, [filteredReadings]);

  const activityFeed = useMemo(() => {
    return filteredReadings.slice(0, 10).map((reading) => ({
      id: reading.id,
      sensorId: reading.sensorId,
      timestamp: reading.ingestedAt ?? reading.timestamp,
    }));
  }, [filteredReadings]);

  const statNumbers = useMemo(() => {
    const values = filteredReadings.map((r) => r.value);
    const minValue = values.length ? Math.min(...values) : 0;
    const maxValue = values.length ? Math.max(...values) : 0;
    const avgValue = values.length
      ? values.reduce((sum, val) => sum + val, 0) / values.length
      : 0;
    const range = Math.max(maxValue - minValue, 1);
    const gaugePercent = Math.min(100, Math.max(0, ((avgValue - minValue) / range) * 100));

    return { minValue, maxValue, avgValue, gaugePercent };
  }, [filteredReadings]);

  const filterPopover = (
    <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
      <PopoverTrigger asChild>
        <Button size="sm" variant="secondary" className="shadow-md">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="z-50 w-80">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Sensor ID</label>
              <Select value={selectedSensor} onValueChange={setSelectedSensor}>
                <SelectTrigger>
                  <SelectValue placeholder="All Sensors" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Sensors</SelectItem>
                  {filterOptions.sensors.map((sensor) => (
                    <SelectItem key={sensor} value={sensor}>
                      {sensor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Locations</SelectItem>
                  {filterOptions.locations.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No locations available
                    </SelectItem>
                  ) : (
                    filterOptions.locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Transport Type</label>
              <Select
                value={selectedTransportType}
                onValueChange={setSelectedTransportType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="z-50">
                  <SelectItem value="all">All Types</SelectItem>
                  {filterOptions.transportTypes.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No transport types available
                    </SelectItem>
                  ) : (
                    filterOptions.transportTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedSensor("all");
                setSelectedLocation("all");
                setSelectedTransportType("all");
                setStartDate("");
                setEndDate("");
              }}
            >
              Reset
            </Button>
            <Badge variant="outline" className="uppercase tracking-wide text-[11px]">
              <span className="font-mono mr-1">{filteredReadings.length}</span> active points
            </Badge>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  return (
    <div className="space-y-8">
      <section id="map-view" aria-labelledby="map-view-heading" className="space-y-6 scroll-mt-28">
        <SectionHeader id="map-view-heading" icon={Map} title="Live Monitoring" />
        <DashboardMapPanel
          readings={filteredReadings}
          emptyMapText={dict.noGeocodedData}
          recentActivity={activityFeed}
          feedTitle={dict.recentIotData}
          feedEmptyText={dict.noRecentActivity}
        />

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statItems.map((stat, index) => (
            <div
              key={index}
              className="flex items-center gap-3 rounded-xl border bg-card/90 px-3 py-3 shadow-sm"
            >
              <stat.icon className="h-4 w-4 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {stat.label}
                </p>
                <p className="font-mono text-xl font-semibold leading-tight sm:text-2xl">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        id="particulate-metrics"
        aria-labelledby="particulate-metrics-heading"
        className="scroll-mt-28"
      >
        <SectionHeader id="particulate-metrics-heading" icon={Microscope} title="Air Composition Analysis" />
        {/* ParticulateMetrics temporarily disabled while debugging TDZ issue */}
        {/* <ParticulateMetrics /> */}
      </section>

      <section
        id="analytics"
        aria-labelledby="analytics-heading"
        className="space-y-8 scroll-mt-28"
      >
        <SectionHeader id="analytics-heading" icon={LineChart} title="Historical Trends" />
        <div className="w-full">
          <SensorChart data={filteredReadings} actionSlot={filterPopover} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{dict.sensorStatistics}</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReadings.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  {dict.noSensorStats}
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
                  <div className="relative h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart
                        cx="50%"
                        cy="50%"
                        innerRadius="70%"
                        outerRadius="100%"
                        barSize={18}
                        data={[{ name: "Average", value: statNumbers.gaugePercent, fill: "hsl(var(--primary))" }]}
                        startAngle={225}
                        endAngle={-45}
                      >
                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                        <RadialBar dataKey="value" cornerRadius={10} background />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {dict.averageValue}
                      </p>
                      <p className="font-mono text-3xl font-semibold">
                        {statNumbers.avgValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                      <span className="text-sm text-muted-foreground">{dict.minimumValue}</span>
                      <span className="font-mono font-semibold">{statNumbers.minValue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                      <span className="text-sm text-muted-foreground">{dict.averageValue}</span>
                      <span className="font-mono font-semibold">{statNumbers.avgValue.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
                      <span className="text-sm text-muted-foreground">{dict.maximumValue}</span>
                      <span className="font-mono font-semibold">{statNumbers.maxValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>{dict.sensorDataDistribution}</CardTitle>
            </CardHeader>
            <CardContent>
              <SensorDistribution
                data={sensorSlices}
                total={filteredReadings.length}
                emptyText={dict.noSensorData}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        id="reports"
        aria-labelledby="reports-heading"
        className="space-y-6 scroll-mt-28"
      >
        <SectionHeader id="reports-heading" icon={FileText} title="Export & Reports" />
        <SensorAnalytics data={filteredReadings} />
      </section>
    </div>
  );
}
