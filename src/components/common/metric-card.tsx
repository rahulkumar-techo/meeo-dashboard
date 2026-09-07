/**
 * @file metric-card.tsx
 * @description Highly aesthetic, modular KPI stat card with trend indicator, icons, sparklines, and theming.
 * Follows Single Responsibility Principle (SRP) for KPI presentation.
 */

"use client"

import * as React from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MetricCardData } from "@/types/common"

export interface MetricCardProps extends MetricCardData {
  className?: string
}

const COLOR_MAP = {
  indigo: {
    bg: "hover:border-indigo-500/40",
    iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    glow: "hover:shadow-indigo-500/5",
  },
  emerald: {
    bg: "hover:border-emerald-500/40",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    glow: "hover:shadow-emerald-500/5",
  },
  amber: {
    bg: "hover:border-amber-500/40",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    glow: "hover:shadow-amber-500/5",
  },
  rose: {
    bg: "hover:border-rose-500/40",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    glow: "hover:shadow-rose-500/5",
  },
  cyan: {
    bg: "hover:border-cyan-500/40",
    iconBg: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
    glow: "hover:shadow-cyan-500/5",
  },
  violet: {
    bg: "hover:border-violet-500/40",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    glow: "hover:shadow-violet-500/5",
  },
  slate: {
    bg: "hover:border-slate-500/40",
    iconBg: "bg-muted text-muted-foreground",
    glow: "hover:shadow-slate-500/5",
  },
}

export function MetricCard({
  title,
  value,
  subValue,
  trend,
  icon: Icon,
  badge,
  sparklineData,
  colorTheme = "indigo",
  footnote,
  onClick,
  className,
}: MetricCardProps) {
  const theme = COLOR_MAP[colorTheme] || COLOR_MAP.indigo

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden border-border/70 bg-card/95 transition-all duration-200 hover:shadow-md",
        theme.bg,
        theme.glow,
        onClick && "cursor-pointer active:scale-[0.99]",
        className
      )}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 h-20 w-20 rounded-full bg-gradient-to-br from-primary/5 to-transparent blur-xl pointer-events-none" />

      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </p>
          <div className="flex items-center gap-1.5">
            {badge && (
              <Badge
                variant={badge.variant === "success" || badge.variant === "brand" ? "outline" : (badge.variant || "outline")}
                className={cn(
                  "px-1.5 py-0 text-[10px] font-medium uppercase",
                  badge.variant === "success" && "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-300",
                  badge.variant === "brand" && "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300"
                )}
              >
                {badge.text}
              </Badge>
            )}
            {Icon && (
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
                  theme.iconBg
                )}
              >
                <Icon className="size-4" />
              </div>
            )}
          </div>
        </div>

        <div className="mt-2 flex items-baseline justify-between gap-2">
          <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {value}
          </div>

          {subValue && (
            <span className="text-xs text-muted-foreground">{subValue}</span>
          )}
        </div>

        {/* Trend & Comparison */}
        {(trend || footnote || sparklineData) && (
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5 text-xs">
            {trend && (
              <div
                className={cn(
                  "flex items-center gap-1 font-medium",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="size-3.5" />
                ) : trend.value === 0 ? (
                  <Minus className="size-3.5" />
                ) : (
                  <TrendingDown className="size-3.5" />
                )}
                <span>{trend.value}</span>
                {trend.comparisonPeriod && (
                  <span className="text-muted-foreground font-normal ml-0.5">
                    vs {trend.comparisonPeriod}
                  </span>
                )}
              </div>
            )}

            {footnote && (
              <span className="text-[11px] text-muted-foreground truncate">
                {footnote}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
