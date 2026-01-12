import { cn } from "@/lib/utils";

type ActivityItem = {
  id: string | number;
  sensorId: string;
  timestamp: string | Date;
};

type CompactActivityFeedProps = {
  items: ActivityItem[];
  title?: string;
  emptyText?: string;
  className?: string;
};

const formatRelativeTime = (timestamp: string | Date) => {
  const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
  const now = Date.now();
  const diffInSeconds = Math.max(0, Math.floor((now - date.getTime()) / 1000));

  if (Number.isNaN(diffInSeconds)) return "just now";
  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
};

export function CompactActivityFeed({
  items,
  title,
  emptyText = "No activity yet.",
  className,
}: CompactActivityFeedProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/70 shadow-sm backdrop-blur-sm",
        "max-h-72 overflow-hidden",
        className
      )}
    >
      {title ? (
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-semibold text-foreground">{title}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            Live
          </span>
        </div>
      ) : null}

      <div className="max-h-60 overflow-y-auto px-2 py-2">
        {items.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            {emptyText}
          </p>
        ) : (
          <div className="space-y-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 items-center justify-center">
                    <span
                      className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60"
                      aria-hidden
                    />
                    <span
                      className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    <span className="sr-only">Success</span>
                  </span>
                  <span className="truncate text-sm font-medium text-foreground">
                    {item.sensorId}
                  </span>
                </div>
                <span className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatRelativeTime(item.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
