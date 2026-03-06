"use client";

import dynamic from "next/dynamic";
import type { MapReading } from "@/components/air-quality-map";
import {
  LiveFeedOverlay,
  type LiveFeedItem,
} from "@/components/live-feed-overlay";
import { cn } from "@/lib/utils";

type AirQualityMapProps = {
  readings: MapReading[];
  emptyStateText: string;
  heightClass?: string;
  className?: string;
  showLegend?: boolean;
  showLanguageToggle?: boolean;
  useUserLocation?: boolean;
  showUserStatus?: boolean;
  showUserStatusAsPopover?: boolean;
};

const AirQualityMap = dynamic<AirQualityMapProps>(
  () => import("@/components/air-quality-map").then((mod) => mod.AirQualityMap),
  {
    ssr: false,
    loading: () => <div className="h-full min-h-[360px] animate-pulse bg-slate-900/70" />,
  }
);

interface DashboardMapPanelProps {
  readings: MapReading[];
  emptyMapText: string;
  recentActivity: LiveFeedItem[];
  feedTitle: string;
  feedEmptyText: string;
  mapHeightClass?: string;
  backgroundMode?: boolean;
  className?: string;
  showFeedOverlay?: boolean;
  mobileMode?: boolean;
  minimalMode?: boolean;
  showLegend?: boolean;
  showLanguageToggle?: boolean;
  useUserLocation?: boolean;
  showUserStatus?: boolean;
  showUserStatusAsPopover?: boolean;
}

export function DashboardMapPanel({
  readings,
  emptyMapText,
  recentActivity,
  feedTitle,
  feedEmptyText,
  mapHeightClass = "h-[72vh] min-h-[520px] md:h-[80vh]",
  backgroundMode = false,
  className,
  showFeedOverlay = true,
  mobileMode = false,
  minimalMode = false,
  showLegend = true,
  showLanguageToggle,
  useUserLocation,
  showUserStatus,
  showUserStatusAsPopover = false,
}: DashboardMapPanelProps) {
  const shouldShowLanguageToggle = showLanguageToggle ?? !mobileMode;
  const shouldUseUserLocation = useUserLocation ?? mobileMode;
  const shouldShowUserStatus = showUserStatus ?? mobileMode;

  if (backgroundMode) {
    return (
      <div className={cn("fixed inset-0 -z-10 overflow-hidden", className)}>
        <AirQualityMap
          readings={readings}
          emptyStateText={emptyMapText}
          heightClass={mapHeightClass}
          className="h-full rounded-none border-0"
          showLegend={showLegend}
          showLanguageToggle={shouldShowLanguageToggle}
          useUserLocation={shouldUseUserLocation}
          showUserStatus={shouldShowUserStatus}
          showUserStatusAsPopover={showUserStatusAsPopover}
        />
        {showFeedOverlay ? (
          <LiveFeedOverlay title={feedTitle} emptyText={feedEmptyText} items={recentActivity} />
        ) : null}
      </div>
    );
  }

  if (minimalMode) {
    return (
      <div className={cn("relative", className)}>
        <AirQualityMap
          readings={readings}
          emptyStateText={emptyMapText}
          heightClass={mapHeightClass}
          className="h-full rounded-none border-0"
          showLegend={showLegend}
          showLanguageToggle={shouldShowLanguageToggle}
          useUserLocation={shouldUseUserLocation}
          showUserStatus={shouldShowUserStatus}
          showUserStatusAsPopover={showUserStatusAsPopover}
        />
      </div>
    );
  }

  return (
    <section className={cn("relative rounded-2xl border bg-muted/10 shadow-sm", className)}>
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
              heightClass={mapHeightClass}
              className="rounded-2xl"
              showLegend={showLegend}
              showLanguageToggle={shouldShowLanguageToggle}
              useUserLocation={shouldUseUserLocation}
              showUserStatus={shouldShowUserStatus}
              showUserStatusAsPopover={showUserStatusAsPopover}
            />
          </div>
        </div>
      </div>

      {showFeedOverlay ? (
        <LiveFeedOverlay title={feedTitle} emptyText={feedEmptyText} items={recentActivity} />
      ) : null}
    </section>
  );
}
