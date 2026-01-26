import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, Droplets, Thermometer, Wind } from "lucide-react";

const MOCK_SENSOR_SAMPLE = {
  device_id: "lab01",
  site: "AGI_Lab",
  pm25: 25.7,
  pm10: 43.1,
  co2: 412,
  temp: 21.8,
  hum: 46.2,
} as const;

type PollutionLevel = {
  status: "Low" | "Medium" | "High";
  color: "emerald" | "amber" | "red";
};

export function getPollutionLevel(pm25: number, pm10: number): PollutionLevel {
  if (pm25 > 50 || pm10 > 100) {
    return { status: "High", color: "red" };
  }

  if (pm25 < 25 && pm10 < 50) {
    return { status: "Low", color: "emerald" };
  }

  return { status: "Medium", color: "amber" };
}

const palette = {
  emerald: {
    bg: "bg-emerald-50/80 dark:bg-emerald-950/30",
    border: "border-emerald-100/70 dark:border-emerald-800/70",
    text: "text-emerald-700 dark:text-emerald-100",
    pill: "bg-emerald-600 text-emerald-50 shadow-md shadow-emerald-500/30",
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-50",
    dot: "bg-emerald-500",
    shadow: "shadow-[0_18px_60px_-30px_rgba(16,185,129,0.65)]",
  },
  amber: {
    bg: "bg-amber-50/80 dark:bg-amber-950/30",
    border: "border-amber-100/70 dark:border-amber-800/70",
    text: "text-amber-800 dark:text-amber-100",
    pill: "bg-amber-500 text-amber-50 shadow-md shadow-amber-400/40",
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-50",
    dot: "bg-amber-500",
    shadow: "shadow-[0_18px_60px_-30px_rgba(245,158,11,0.65)]",
  },
  red: {
    bg: "bg-red-50/80 dark:bg-red-950/30",
    border: "border-red-100/70 dark:border-red-800/70",
    text: "text-red-800 dark:text-red-100",
    pill: "bg-red-600 text-red-50 shadow-md shadow-red-500/30",
    badge: "bg-red-100 text-red-800 dark:bg-red-900/70 dark:text-red-50",
    dot: "bg-red-500",
    shadow: "shadow-[0_18px_60px_-30px_rgba(239,68,68,0.65)]",
  },
} as const;

export function ParticulateMetrics() {
  const level = getPollutionLevel(MOCK_SENSOR_SAMPLE.pm25, MOCK_SENSOR_SAMPLE.pm10);
  const tone = palette[level.color];

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle className="text-2xl">Particulate Measuring & Composition</CardTitle>
          <CardDescription>
            Live sample from {MOCK_SENSOR_SAMPLE.site} - Device {MOCK_SENSOR_SAMPLE.device_id}
          </CardDescription>
        </div>
        <Badge className={`self-start px-3 py-1 text-sm font-semibold ${tone.badge}`}>
          {level.status} exposure
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-5">
          <div className={`relative overflow-hidden rounded-2xl border p-5 md:col-span-2 ${tone.bg} ${tone.border} ${tone.shadow}`}>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-foreground/5 dark:from-white/5" />

            <div className="relative flex items-start justify-between">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Traffic Light</p>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${tone.pill}`}>
                    {level.status}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    PM2.5 {MOCK_SENSOR_SAMPLE.pm25.toFixed(1)} / PM10 {MOCK_SENSOR_SAMPLE.pm10.toFixed(1)}
                  </span>
                </div>
                <p className="text-lg font-semibold text-foreground">Overall particulate exposure</p>
                <p className="text-sm text-muted-foreground">
                  Classification derived from raw PM2.5 and PM10 readings in real time.
                </p>
              </div>
              <Wind className={`h-10 w-10 ${tone.text}`} />
            </div>

            <div className="relative mt-6 grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 rounded-xl border bg-background/70 px-3 py-2 shadow-sm">
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                <span className="text-muted-foreground">PM2.5 driver</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border bg-background/70 px-3 py-2 shadow-sm">
                <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
                <span className="text-muted-foreground">PM10 driver</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:col-span-3 sm:grid-cols-2">
            <div className="rounded-2xl border bg-card/80 px-4 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span className="text-sm font-medium">PM2.5</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  ug/m3
                </Badge>
              </div>
              <p className="mt-4 text-4xl font-mono font-semibold text-foreground">
                {MOCK_SENSOR_SAMPLE.pm25.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Fine particles impacting respiratory systems.</p>
            </div>

            <div className="rounded-2xl border bg-card/80 px-4 py-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wind className="h-4 w-4" />
                  <span className="text-sm font-medium">PM10</span>
                </div>
                <Badge variant="outline" className="font-mono text-xs">
                  ug/m3
                </Badge>
              </div>
              <p className="mt-4 text-4xl font-mono font-semibold text-foreground">
                {MOCK_SENSOR_SAMPLE.pm10.toFixed(1)}
              </p>
              <p className="text-sm text-muted-foreground">Coarse particulate loading at the sample site.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-start justify-between rounded-2xl border bg-muted/40 px-4 py-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Cloud className="h-4 w-4" />
                <span className="text-sm font-semibold">CO2</span>
              </div>
              <p className="text-sm text-muted-foreground">Cabin air loading</p>
            </div>
            <span className="font-mono text-lg font-semibold text-foreground">
              {MOCK_SENSOR_SAMPLE.co2.toLocaleString()} ppm
            </span>
          </div>

          <div className="flex items-start justify-between rounded-2xl border bg-muted/40 px-4 py-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span className="text-sm font-semibold">Temperature</span>
              </div>
              <p className="text-sm text-muted-foreground">Ambient thermal state</p>
            </div>
            <span className="font-mono text-lg font-semibold text-foreground">
              {MOCK_SENSOR_SAMPLE.temp.toFixed(1)} C
            </span>
          </div>

          <div className="flex items-start justify-between rounded-2xl border bg-muted/40 px-4 py-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-4 w-4" />
                <span className="text-sm font-semibold">Humidity</span>
              </div>
              <p className="text-sm text-muted-foreground">Relative moisture</p>
            </div>
            <span className="font-mono text-lg font-semibold text-foreground">
              {MOCK_SENSOR_SAMPLE.hum.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
