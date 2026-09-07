/**
 * @file bar-metric-chart.tsx
 * @description Standardized Recharts Bar Chart wrapper for discrete time intervals and channel volume comparisons.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface BarDataPoint {
  label: string
  value: number
  secondaryValue?: number
  [key: string]: any
}

export interface BarMetricChartProps {
  /** Card title */
  title?: string
  /** Subtitle description */
  description?: string
  /** Primary data key */
  dataKey?: string
  /** Secondary data key */
  secondaryDataKey?: string
  /** Primary series label */
  seriesLabel?: string
  /** Secondary series label */
  secondarySeriesLabel?: string
  /** Chart dataset */
  data: BarDataPoint[]
  /** Color theme */
  color?: string
  /** Secondary bar color */
  secondaryColor?: string
  /** Height in pixels (default: 260) */
  height?: number
  /** Formatter for numbers */
  valueFormatter?: (value: number) => string
  /** Header action controls */
  actions?: React.ReactNode
  /** Custom container class */
  className?: string
}

export function BarMetricChart({
  title,
  description,
  dataKey = "value",
  secondaryDataKey,
  seriesLabel = "Value",
  secondarySeriesLabel = "Secondary",
  data,
  color = "#6366f1",
  secondaryColor = "#94a3b8",
  height = 260,
  valueFormatter = (val) => String(val),
  actions,
  className,
}: BarMetricChartProps) {
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
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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

                          {secondaryDataKey && payload[1] && (
                            <div className="flex items-center gap-2">
                              <span
                                className="size-2 rounded-full"
                                style={{ backgroundColor: secondaryColor }}
                              />
                              <span className="text-muted-foreground">
                                {secondarySeriesLabel}:
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

              <Bar
                dataKey={dataKey}
                fill={color}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />

              {secondaryDataKey && (
                <Bar
                  dataKey={secondaryDataKey}
                  fill={secondaryColor}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
