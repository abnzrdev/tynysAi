"use client";

import dynamic from "next/dynamic";
import type { MapReading } from "@/components/air-quality-map";
import {
  LiveFeedOverlay,
  type LiveFeedItem,
} from "@/components/live-feed-overlay";

type AirQualityMapProps = {
  readings: MapReading[];
  emptyStateText: string;
  heightClass?: string;
  className?: string;
};

const AirQualityMap = dynamic<AirQualityMapProps>(
  () => import("@/components/air-quality-map").then((mod) => mod.AirQualityMap),
  { ssr: false }
);

export interface StatLabels {
  totalDataPoints: string;
  activeSensors: string;
  recentReadings: string;
  averageValue: string;
}

export interface StatValues {
  totalDataPoints: number;
  activeSensors: number;
  recentReadings: number;
  avgSensorValue: string;
}

interface DashboardMapPanelProps {
  readings: MapReading[];
  emptyMapText: string;
  recentActivity: LiveFeedItem[];
  feedTitle: string;
  feedEmptyText: string;
}

export function DashboardMapPanel({
  readings,
  emptyMapText,
  recentActivity,
  feedTitle,
  feedEmptyText,
}: DashboardMapPanelProps) {
  return (
    <section className="relative rounded-2xl border bg-muted/10 shadow-sm">
      <div className="space-y-3">
        <div className="flex items-center px-4 pt-3">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Live Air Quality Feed
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-slate-800/70 bg-background">
            <AirQualityMap
              readings={readings}
              emptyStateText={emptyMapText}
              heightClass="h-[90vh]"
              className="rounded-2xl"
            />
          </div>
        </div>
      </div>

      <LiveFeedOverlay title={feedTitle} emptyText={feedEmptyText} items={recentActivity} />
    </section>
  );
}
