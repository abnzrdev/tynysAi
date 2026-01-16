"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export type SensorSlice = {
  sensorId: string;
  count: number;
  percentage: number;
};

interface SensorDistributionProps {
  data: SensorSlice[];
  total: number;
  emptyText: string;
}

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a855f7",
  "#f472b6",
  "#f97316",
  "#2dd4bf",
];

export function SensorDistribution({ data, total, emptyText }: SensorDistributionProps) {
  if (!data.length) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid items-center gap-6 md:grid-cols-[1.1fr_1fr]">
      <div className="relative h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              dataKey="count"
              data={data}
              innerRadius={70}
              outerRadius={100}
              paddingAngle={4}
              cornerRadius={12}
            >
              {data.map((entry, index) => (
                <Cell key={entry.sensorId} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
          <p className="font-mono text-3xl font-semibold">{total}</p>
        </div>
      </div>

      <div className="space-y-3">
        {data.map((slice, index) => (
          <div
            key={slice.sensorId}
            className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-mono font-semibold truncate">{slice.sensorId}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-mono text-base text-foreground">{slice.count}</span>
              <span className="font-mono text-base text-foreground">{slice.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
