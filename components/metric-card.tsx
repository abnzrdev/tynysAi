"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Database, Radio, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  iconName: "database" | "radio" | "activity" | "trending-up";
  description?: string;
  trend?: {
    value: number; // Percentage change
    isPositive: boolean;
  };
  sparklineData?: Array<{ value: number }>;
  delay?: number;
}

const iconMap = {
  "database": Database,
  "radio": Radio,
  "activity": Activity,
  "trending-up": TrendingUp,
};

export function MetricCard({
  title,
  value,
  iconName,
  description,
  trend,
  sparklineData,
  delay = 0,
}: MetricCardProps) {
  const Icon = iconMap[iconName];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {title}
          </h3>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Primary Value */}
          <div className="text-3xl font-bold tracking-tight font-mono tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>

          {/* Bottom Row: Badge + Sparkline */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {trend && (
                <Badge
                  variant={trend.isPositive ? "default" : "destructive"}
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    trend.isPositive
                      ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" aria-label="Trending up" />
                  ) : (
                    <TrendingDown className="h-3 w-3" aria-label="Trending down" />
                  )}
                  <span>
                    {trend.isPositive ? "+" : ""}
                    {trend.value.toFixed(1)}%
                  </span>
                </Badge>
              )}
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>

            {/* Mini Sparkline */}
            {sparklineData && sparklineData.length > 0 && (
              <div className="h-10 w-20 flex-shrink-0" aria-label="Trend sparkline">
                {(() => {
                  const filtered = sparklineData.filter((p) => Number.isFinite(p?.value));
                  if (filtered.length === 0) return null;
                  return (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={filtered}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={trend?.isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 84%, 60%)"}
                          strokeWidth={2}
                          dot={false}
                          isAnimationActive={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
