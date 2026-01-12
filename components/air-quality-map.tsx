"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLngTuple } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import { cn } from "@/lib/utils";

export type MapReading = {
  location?: string | null;
  value: number;
  timestamp: string;
  sensorId: string;
};

const AQI_BREAKPOINTS = [
  { limit: 12, color: "#22c55e", label: "Good", tw: "bg-green-500" },
  { limit: 35.4, color: "#84cc16", label: "Moderate", tw: "bg-lime-500" },
  { limit: 55.4, color: "#eab308", label: "USG", tw: "bg-amber-500" },
  { limit: 150.4, color: "#f97316", label: "Unhealthy", tw: "bg-orange-500" },
  { limit: 250.4, color: "#ef4444", label: "Very Unhealthy", tw: "bg-red-500" },
  { limit: Infinity, color: "#7e22ce", label: "Hazardous", tw: "bg-purple-700" },
];

const DEFAULT_CENTER: LatLngTuple = [37.0902, -95.7129];

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
  sensorIds: string[];
};

type MarkerCluster = {
  getAllChildMarkers: () => L.Marker[];
};

type MarkerClusterGroup = L.LayerGroup & {
  addLayer: (layer: L.Layer) => MarkerClusterGroup;
};

type MarkerClusterGroupFactory = (options?: {
  iconCreateFunction?: (cluster: MarkerCluster) => L.DivIcon;
  chunkedLoading?: boolean;
  showCoverageOnHover?: boolean;
  spiderfyOnMaxZoom?: boolean;
}) => MarkerClusterGroup;

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
        sensorIds: [reading.sensorId],
      });
      return;
    }

    const count = existing.count + 1;
    const avgValue = (existing.avgValue * existing.count + reading.value) / count;
    const isNewer = timestamp > existing.lastTimestamp;

    const sensorIds = existing.sensorIds.includes(reading.sensorId)
      ? existing.sensorIds
      : [...existing.sensorIds, reading.sensorId];

    map.set(key, {
      ...existing,
      count,
      avgValue,
      latestValue: isNewer ? reading.value : existing.latestValue,
      lastTimestamp: isNewer ? timestamp : existing.lastTimestamp,
      sensorIds,
    });
  });

  return Array.from(map.values());
}
function createPointIcon(value: number) {
  const bp = AQI_BREAKPOINTS.find((b) => value <= b.limit) ?? AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];
  const html = `
    <div class="flex items-center justify-center rounded-full text-[10px] font-semibold text-primary-foreground shadow-lg border border-border/70 ${bp.tw}"
         style="width:28px;height:28px;">
      ${Math.round(value)}
    </div>
  `;

  const iconOptions: L.DivIconOptions & { aqiValue: number } = {
    className: "aqi-point-icon",
    html,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
    aqiValue: value,
  };

  return L.divIcon(iconOptions);
}

function createClusterIcon(cluster: MarkerCluster) {
  const childMarkers = cluster.getAllChildMarkers() as L.Marker[];
  const values = childMarkers.map((m) => {
    const opts = (m.options.icon?.options ?? {}) as { aqiValue?: number };
    return opts.aqiValue ?? 0;
  });

  const avg = values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0;
  const bp = AQI_BREAKPOINTS.find((b) => avg <= b.limit) ?? AQI_BREAKPOINTS[AQI_BREAKPOINTS.length - 1];
  const size = Math.min(44 + values.length, 76);

  const html = `
    <div class="flex items-center justify-center rounded-full text-xs font-semibold text-primary-foreground shadow-lg border border-border/70 ${bp.tw}"
         style="width:${size}px;height:${size}px;">
      ${values.length}
    </div>
  `;

  const iconOptions: L.DivIconOptions = {
    className: "aqi-cluster-icon",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  };

  return L.divIcon(iconOptions);
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
  heightClass = "h-[420px]",
  className,
}: {
  readings: MapReading[];
  emptyStateText: string;
  heightClass?: string;
  className?: string;
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
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border border-dashed border-slate-800/60 text-sm text-muted-foreground",
          heightClass,
        )}
      >
        {emptyStateText}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-slate-800/70 bg-background",
        heightClass,
        className
      )}
    >
      <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-xl bg-background/90 px-3 py-2 shadow-lg ring-1 ring-slate-800/60">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {AQI_BREAKPOINTS.map((bp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: bp.color }} />
              <span className="font-medium">{bp.label}</span>
            </div>
          ))}
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={5}
        scrollWheelZoom
        className="h-full w-full bg-background z-0"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitToMarkers points={points} />
        {/* ClusterLayer uses the upstream leaflet.markercluster plugin directly */}
        <ClusterLayer points={points} />
      </MapContainer>
    </div>
  );
}

/**
 * ClusterLayer: Create a markerClusterGroup and add markers for every aggregated point.
 * This uses the global L.markerClusterGroup provided by leaflet.markercluster.
 */
function ClusterLayer({ points }: { points: AggregatedPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const markerClusterGroup = (L as typeof L & { markerClusterGroup?: MarkerClusterGroupFactory }).markerClusterGroup;
    if (!markerClusterGroup) return;

    const clusterGroup = markerClusterGroup({
      iconCreateFunction: (cluster) => createClusterIcon(cluster),
      chunkedLoading: true,
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
    });

    points.forEach((point) => {
      const marker = L.marker(point.coords, { icon: createPointIcon(point.avgValue) });

      const tooltipHtml = `
        <div class="space-y-1 text-xs">
          <div class="font-semibold">${point.key}</div>
          <div>Avg: ${point.avgValue.toFixed(1)}</div>
          <div>Latest: ${point.latestValue.toFixed(1)}</div>
          <div>Samples: ${point.count}</div>
        </div>
      `;
      marker.bindTooltip(tooltipHtml, { direction: "top", offset: [0, -2], permanent: false, sticky: true });

      const sensorsHtml = point.sensorIds.map((id) => `<a href="/sensors/${encodeURIComponent(id)}" target="_blank" class="text-blue-600 underline">${id}</a>`).join("<br/>");
      const popupHtml = `
        <div class="space-y-1 text-sm">
          <div class="font-semibold">${point.key}</div>
          <div>Avg: ${point.avgValue.toFixed(2)}</div>
          <div>Latest: ${point.latestValue.toFixed(2)}</div>
          <div>Samples: ${point.count}</div>
          <div class="text-xs text-muted-foreground">Sensors:<br/>${sensorsHtml}</div>
          <div class="text-[11px] text-muted-foreground">Updated: ${new Date(point.lastTimestamp).toLocaleString()}</div>
        </div>
      `;
      marker.bindPopup(popupHtml);

      clusterGroup.addLayer(marker);
    });

    map.addLayer(clusterGroup);

    return () => {
      map.removeLayer(clusterGroup);
    };
  }, [map, points]);

  return null;
}
