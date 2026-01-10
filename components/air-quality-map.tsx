"use client";

import { useEffect, useMemo } from "react";
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapReading = {
  location?: string | null;
  value: number;
  timestamp: string;
  sensorId: string;
};

const AQI_BREAKPOINTS = [
  { limit: 12, color: "#22c55e", label: "Good" },
  { limit: 35.4, color: "#84cc16", label: "Moderate" },
  { limit: 55.4, color: "#eab308", label: "USG" },
  { limit: 150.4, color: "#f97316", label: "Unhealthy" },
  { limit: 250.4, color: "#ef4444", label: "Very Unhealthy" },
  { limit: Infinity, color: "#7e22ce", label: "Hazardous" },
];

const DEFAULT_CENTER: LatLngTuple = [37.0902, -95.7129];

function getColorForValue(value: number): string {
  const match = AQI_BREAKPOINTS.find((bp) => value <= bp.limit);
  return match ? match.color : "#6b7280";
}

function parseLocation(location?: string | null): LatLngTuple | null {
  if (!location) return null;
  const [latStr, lngStr] = location.split(",").map((part) => part.trim());
  const lat = Number(latStr);
  const lng = Number(lngStr);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;

  return [lat, lng];
}

type AggregatedPoint = {
  key: string;
  coords: LatLngTuple;
  count: number;
  avgValue: number;
  latestValue: number;
  lastTimestamp: string;
};

function aggregatePoints(readings: MapReading[]): AggregatedPoint[] {
  const map = new Map<string, AggregatedPoint>();

  readings.forEach((reading) => {
    const coords = parseLocation(reading.location);
    if (!coords) return;

    const key = reading.location!.trim();
    const existing = map.get(key);
    const timestamp = new Date(reading.timestamp).toISOString();

    if (!existing) {
      map.set(key, {
        key,
        coords,
        count: 1,
        avgValue: reading.value,
        latestValue: reading.value,
        lastTimestamp: timestamp,
      });
      return;
    }

    const count = existing.count + 1;
    const avgValue = (existing.avgValue * existing.count + reading.value) / count;
    const isNewer = timestamp > existing.lastTimestamp;

    map.set(key, {
      ...existing,
      count,
      avgValue,
      latestValue: isNewer ? reading.value : existing.latestValue,
      lastTimestamp: isNewer ? timestamp : existing.lastTimestamp,
    });
  });

  return Array.from(map.values());
}

function FitToMarkers({ points }: { points: AggregatedPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => p.coords));
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 13 });
  }, [map, points]);

  return null;
}

export function AirQualityMap({
  readings,
  emptyStateText,
}: {
  readings: MapReading[];
  emptyStateText: string;
}) {
  const points = useMemo(() => aggregatePoints(readings), [readings]);

  const center = useMemo<LatLngTuple>(() => {
    if (points.length === 0) return DEFAULT_CENTER;
    const [latSum, lngSum] = points.reduce(
      (acc, point) => [acc[0] + point.coords[0], acc[1] + point.coords[1]],
      [0, 0]
    );
    return [latSum / points.length, lngSum / points.length];
  }, [points]);

  if (points.length === 0) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        {emptyStateText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {AQI_BREAKPOINTS.map((bp, idx) => (
          <div key={idx} className="flex items-center gap-2 rounded-full border px-3 py-1">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: bp.color }} />
            <span>{bp.label}</span>
          </div>
        ))}
      </div>
      <div className="h-[420px] overflow-hidden rounded-lg border">
        <MapContainer
          center={center}
          zoom={5}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitToMarkers points={points} />
          {points.map((point) => (
            <CircleMarker
              key={point.key}
              center={point.coords}
              radius={12}
              pathOptions={{
                color: getColorForValue(point.avgValue),
                fillColor: getColorForValue(point.avgValue),
                fillOpacity: 0.7,
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -2]} opacity={1} permanent={false} sticky>
                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-foreground">{point.key}</div>
                  <div>Avg: {point.avgValue.toFixed(1)}</div>
                  <div>Latest: {point.latestValue.toFixed(1)}</div>
                  <div>Samples: {point.count}</div>
                  <div className="text-[10px] text-muted-foreground">
                    Updated: {new Date(point.lastTimestamp).toLocaleString()}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
