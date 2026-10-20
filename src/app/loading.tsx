import * as React from "react"

export default function AppLoading() {
  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6 max-w-[1600px] mx-auto animate-pulse">
      {/* 1. Page Header Skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-6 w-48 rounded-md bg-muted/80" />
            <div className="h-4 w-16 rounded-full bg-muted/60" />
          </div>
          <div className="h-3.5 w-80 max-w-full rounded bg-muted/50" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8.5 w-24 rounded-lg bg-muted/70" />
          <div className="h-8.5 w-28 rounded-lg bg-muted/70" />
        </div>
      </div>

      {/* 2. Metric Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 rounded bg-muted/70" />
              <div className="size-8 rounded-lg bg-muted/60" />
            </div>
            <div className="space-y-1.5">
              <div className="h-7 w-20 rounded bg-muted/80" />
              <div className="h-3 w-32 rounded bg-muted/40" />
            </div>
          </div>
        ))}
      </div>

      {/* 3. Filter Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="h-9 w-72 max-w-full rounded-lg bg-muted/60" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-28 rounded-lg bg-muted/50" />
          <div className="h-9 w-24 rounded-lg bg-muted/50" />
        </div>
      </div>

      {/* 4. Table / Content Shell Skeleton */}
      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
        <div className="h-10 w-full rounded-lg bg-muted/40" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
          >
            <div className="h-4 w-36 rounded bg-muted/60" />
            <div className="h-4 w-24 rounded bg-muted/50" />
            <div className="h-4 w-20 rounded bg-muted/50" />
            <div className="h-6 w-16 rounded-full bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  )
}
