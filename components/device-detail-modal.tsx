"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type DeviceDetailReading = {
  sensorId: string;
  value: number;
  timestamp?: string | null;
  mainReadings?: {
    pm25?: number;
    pm10?: number;
    co2?: number;
    temperatureC?: number;
    humidityPct?: number;
  };
};

export type DeviceDetails = {
  location: string;
  avgValue: number;
  latestValue: number;
  sampleCount: number;
  sensorIds: string[];
  readings: DeviceDetailReading[];
};

type DeviceDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  details: DeviceDetails | null;
};

function formatTimestamp(timestamp?: string | null) {
  if (!timestamp) return "Not available";
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return "Not available";
  return date.toLocaleString();
}

function numberOrDash(value?: number) {
  return typeof value === "number" && Number.isFinite(value) ? value.toFixed(1) : "—";
}

function SensorMatrix({ details }: { details: DeviceDetails }) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-semibold text-zinc-100">All sensor readings</h4>
      <div className="overflow-x-auto rounded-xl border border-slate-700/70 bg-slate-950/40">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] border-b border-slate-700/70 px-3 py-2 text-[10px] uppercase tracking-[0.1em] text-slate-400">
            <p>Device</p>
            <p className="text-right">AQI</p>
            <p className="text-right">PM2.5</p>
            <p className="text-right">PM10</p>
            <p className="text-right">CO₂</p>
            <p className="text-right">Temp °C</p>
            <p className="text-right">Humidity %</p>
          </div>
          <div className="divide-y divide-slate-800/70">
            {details.readings.map((reading, idx) => (
              <div
                key={`matrix-${reading.sensorId}-${reading.timestamp ?? idx}`}
                className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.8fr_0.8fr_0.9fr] px-3 py-2 text-xs text-slate-200"
              >
                <p className="truncate pr-2 font-medium text-zinc-100">{reading.sensorId}</p>
                <p className="text-right font-mono">{reading.value.toFixed(1)}</p>
                <p className="text-right font-mono">{numberOrDash(reading.mainReadings?.pm25)}</p>
                <p className="text-right font-mono">{numberOrDash(reading.mainReadings?.pm10)}</p>
                <p className="text-right font-mono">{numberOrDash(reading.mainReadings?.co2)}</p>
                <p className="text-right font-mono">{numberOrDash(reading.mainReadings?.temperatureC)}</p>
                <p className="text-right font-mono">{numberOrDash(reading.mainReadings?.humidityPct)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DeviceDetailModal({ open, onOpenChange, details }: DeviceDetailModalProps) {
  if (!details) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92svh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Device details</DialogTitle>
          <DialogDescription>
            Full data for the selected device marker, including latest sensor values and timestamps.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 rounded-xl border border-slate-700/70 bg-slate-950/50 p-4 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Location</p>
            <p className="mt-1 text-sm text-zinc-100">{details.location}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Device count</p>
            <p className="mt-1 text-sm text-zinc-100 font-mono">{details.sensorIds.length}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Average AQI</p>
            <p className="mt-1 text-sm text-zinc-100 font-mono">{details.avgValue.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Latest AQI</p>
            <p className="mt-1 text-sm text-zinc-100 font-mono">{details.latestValue.toFixed(1)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">Samples</p>
            <p className="mt-1 text-sm text-zinc-100 font-mono">{details.sampleCount}</p>
          </div>
        </div>

        <SensorMatrix details={details} />

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-zinc-100">Recent readings</h4>
          <div className="space-y-2">
            {details.readings.map((reading, idx) => (
              <article
                key={`${reading.sensorId}-${reading.timestamp ?? idx}`}
                className="rounded-xl border border-slate-700/70 bg-slate-950/40 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-zinc-100">{reading.sensorId}</p>
                  <p className="text-xs text-slate-300">{formatTimestamp(reading.timestamp)}</p>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">AQI</p>
                    <p className="font-mono text-sm text-zinc-100">{reading.value.toFixed(1)}</p>
                  </div>
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">PM2.5</p>
                    <p className="font-mono text-sm text-zinc-100">{numberOrDash(reading.mainReadings?.pm25)}</p>
                  </div>
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">PM10</p>
                    <p className="font-mono text-sm text-zinc-100">{numberOrDash(reading.mainReadings?.pm10)}</p>
                  </div>
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">CO₂</p>
                    <p className="font-mono text-sm text-zinc-100">{numberOrDash(reading.mainReadings?.co2)}</p>
                  </div>
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Temp (°C)</p>
                    <p className="font-mono text-sm text-zinc-100">{numberOrDash(reading.mainReadings?.temperatureC)}</p>
                  </div>
                  <div className="rounded-md border border-slate-700/60 bg-slate-900/60 px-2 py-1.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] text-slate-400">Humidity (%)</p>
                    <p className="font-mono text-sm text-zinc-100">{numberOrDash(reading.mainReadings?.humidityPct)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
