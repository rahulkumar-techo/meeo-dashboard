/**
 * @file area-trend-chart.tsx
 * @description Standardized Recharts Area Chart wrapper with gradient fills, responsive container, and custom tooltips.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DataPoint {
  label: string
  value: number
  previousValue?: number
  [key: string]: any
}

export interface AreaTrendChartProps {
  /** Chart card title */
  title?: string
  /** Subtitle description */
  description?: string
  /** Primary series key name */
  dataKey?: string
  /** Previous/comparison series key name */
  previousDataKey?: string
  /** Primary series label for tooltip */
  seriesLabel?: string
  /** Previous series label for tooltip */
  previousSeriesLabel?: string
  /** Chart dataset */
  data: DataPoint[]
  /** Color theme */
  color?: string
  /** Chart height in pixels (default: 260) */
  height?: number
  /** Value formatting function (e.g. formatCurrency) */
  valueFormatter?: (value: number) => string
  /** Custom action slot (e.g. Timeframe button selector) */
  actions?: React.ReactNode
  /** Container custom classes */
  className?: string
}

export function AreaTrendChart({
  title,
  description,
  dataKey = "value",
  previousDataKey,
  seriesLabel = "Current Period",
  previousSeriesLabel = "Previous Period",
  data,
  color = "#6366f1",
  height = 260,
  valueFormatter = (val) => String(val),
  actions,
  className,
}: AreaTrendChartProps) {
  const gradientId = React.useId().replace(/:/g, "_")

  return (
    <Card className={cn("border-border/70 bg-card/95 shadow-2xs", className)}>
      {(title || description || actions) && (
        <CardHeader className="flex flex-row items-center justify-between pb-3">
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
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id={`fill_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0.0} />
                </linearGradient>
                {previousDataKey && (
                  <linearGradient id={`fill_prev_${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                )}
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-border/40"
              />

              <XAxis
                dataKey="label"
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="currentColor"
                className="text-[11px] text-muted-foreground"
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) =>
                  val >= 1000 ? `${(val / 1000).toFixed(0)}k` : String(val)
                }
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-border/80 bg-background/95 p-2.5 shadow-md backdrop-blur-xs text-xs">
                        <p className="font-semibold text-foreground mb-1.5">{label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-2 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            <span className="text-muted-foreground">{seriesLabel}:</span>
                            <span className="font-bold text-foreground">
                              {valueFormatter(Number(payload[0].value))}
                            </span>
                          </div>

                          {previousDataKey && payload[1] && (
                            <div className="flex items-center gap-2">
                              <span className="size-2 rounded-full bg-slate-400" />
                              <span className="text-muted-foreground">
                                {previousSeriesLabel}:
                              </span>
                              <span className="font-medium text-foreground">
                                {valueFormatter(Number(payload[1].value))}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />

              {previousDataKey && (
                <Area
                  type="monotone"
                  dataKey={previousDataKey}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill={`url(#fill_prev_${gradientId})`}
                />
              )}

              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#fill_${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
