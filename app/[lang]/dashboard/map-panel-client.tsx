"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import type { MapReading } from "@/components/air-quality-map";
import {
  LiveFeedOverlay,
  type LiveFeedItem,
} from "@/components/live-feed-overlay";
import { Activity, Database, Radio, TrendingUp } from "lucide-react";

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
  statLabels: StatLabels;
  statValues: StatValues;
  recentActivity: LiveFeedItem[];
  feedTitle: string;
  feedEmptyText: string;
}

export function DashboardMapPanel({
  readings,
  emptyMapText,
  statLabels,
  statValues,
  recentActivity,
  feedTitle,
  feedEmptyText,
}: DashboardMapPanelProps) {
  const statItems = useMemo(
    () => [
      { label: statLabels.totalDataPoints, value: statValues.totalDataPoints, icon: Database },
      { label: statLabels.activeSensors, value: statValues.activeSensors, icon: Radio },
      { label: statLabels.recentReadings, value: statValues.recentReadings, icon: Activity },
      { label: statLabels.averageValue, value: statValues.avgSensorValue, icon: TrendingUp },
    ],
    [statLabels, statValues]
  );

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

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center">
            <div className="pointer-events-auto w-full px-3 sm:px-6">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {statItems.map((stat, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-xl bg-background/90 px-3 py-2 shadow-md ring-1 ring-border backdrop-blur"
                  >
                    <stat.icon className="h-4 w-4 text-primary" />
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="font-mono text-lg font-semibold leading-tight">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LiveFeedOverlay title={feedTitle} emptyText={feedEmptyText} items={recentActivity} />
    </section>
  );
}
