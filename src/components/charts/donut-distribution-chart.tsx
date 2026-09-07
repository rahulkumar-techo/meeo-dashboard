/**
 * @file donut-distribution-chart.tsx
 * @description Standardized Recharts Donut / Pie chart wrapper for breakdown distributions.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DonutDataPoint {
  name: string
  value: number
  color?: string
  [key: string]: any
}

export interface DonutDistributionChartProps {
  /** Card title */
  title?: string
  /** Subtitle description */
  description?: string
  /** Data array */
  data: DonutDataPoint[]
  /** Center text total or label */
  centerLabel?: string
  /** Center text sublabel */
  centerSublabel?: string
  /** Height in pixels (default: 260) */
  height?: number
  /** Color palette */
  colors?: string[]
  /** Custom action slot */
  actions?: React.ReactNode
  /** Value formatter */
  valueFormatter?: (value: number) => string
  /** Custom container class */
  className?: string
}

const DEFAULT_COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#06b6d4", // cyan
  "#8b5cf6", // violet
  "#f43f5e", // rose
]

export function DonutDistributionChart({
  title,
  description,
  data,
  centerLabel,
  centerSublabel,
  height = 260,
  colors = DEFAULT_COLORS,
  actions,
  valueFormatter = (val) => String(val),
  className,
}: DonutDistributionChartProps) {
  const total = React.useMemo(
    () => data.reduce((acc, curr) => acc + curr.value, 0),
    [data]
  )

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            {title && (
              <CardTitle className="text-sm font-semibold tracking-tight text-foreground">
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && <div className="flex items-center gap-1.5">{actions}</div>}
        </CardHeader>
      )}

      <CardContent className="pt-2">
        <div className="relative" style={{ width: "100%", height }}>
          {centerLabel && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-4">
              <span className="text-xl font-bold text-foreground sm:text-2xl">
                {centerLabel}
              </span>
              {centerSublabel && (
                <span className="text-[11px] text-muted-foreground">
                  {centerSublabel}
                </span>
              )}
            </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]
                    const pct = total > 0 ? ((Number(item.value) / total) * 100).toFixed(1) : "0"
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-md backdrop-blur-xs text-xs">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: item.payload.fill || item.color }}
                          />
                          <span className="font-semibold text-foreground">{item.name}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 text-muted-foreground">
                          <span>Value:</span>
                          <span className="font-bold text-foreground">
                            {valueFormatter(Number(item.value))} ({pct}%)
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || colors[index % colors.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>

              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value, entry: any) => {
                  const entryData = data.find((d) => d.name === value)
                  const pct = entryData && total > 0
                    ? ` (${((entryData.value / total) * 100).toFixed(0)}%)`
                    : ""
                  return (
                    <span className="text-xs text-muted-foreground">
                      {value}
                      <span className="text-[10px] text-muted-foreground/80">{pct}</span>
                    </span>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
