/**
 * @file promotion-rule-card.tsx
 * @description Modular card for visualizing and managing an individual promotional campaign rule.
 * Follows Single Responsibility Principle (SRP).
 */

"use client"

import * as React from "react"
import {
  Tag,
  DollarSign,
  Calendar,
  Layers,
  Sparkles,
  Sliders,
  Store,
  Smartphone,
  Globe,
  MoreVertical,
  Play,
  RotateCcw,
  Copy,
  Trash2,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusBadge } from "@/components/common/status-badge"
import { formatCurrency, formatNumber } from "@/lib/formatters"
import { cn } from "@/lib/utils"

export interface PromotionRuleData {
  id: string
  name: string
  codeRef?: string
  type: string
  typeLabel: string
  priority: number
  status: "active" | "scheduled" | "paused" | "expired" | string
  startDate: string
  endDate: string
  channels: ("web" | "mobile" | "pos" | "b2b")[]
  stacking: "compound" | "exclusive" | "priority_override" | string
  triggerSummary: string
  actionSummary: string
  attributedGmv: number
  redemptions: number
  marginDelta: number
  featured?: boolean
}

export interface PromotionRuleCardProps {
  rule: PromotionRuleData
  onToggleStatus?: (ruleId: string, active: boolean) => void
  onDuplicate?: (rule: PromotionRuleData) => void
  onDelete?: (ruleId: string) => void
  onSimulate?: (rule: PromotionRuleData) => void
  className?: string
}

export function PromotionRuleCard({
  rule,
  onToggleStatus,
  onDuplicate,
  onDelete,
  onSimulate,
  className,
}: PromotionRuleCardProps) {
  const isActive = rule.status === "active"

  return (
    <Card
      className={cn(
        "group relative overflow-hidden border-border/70 bg-card/95 transition-all duration-200 hover:border-indigo-500/40 hover:shadow-md",
        rule.featured && "border-indigo-300/80 dark:border-indigo-800/60 shadow-xs",
        className
      )}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Top bar: Name, priority badge, stacking pill, dropdown */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm sm:text-base">
                {rule.name}
              </span>

              {rule.codeRef && (
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] uppercase border-indigo-200 text-indigo-700 dark:border-indigo-900/50 dark:text-indigo-300 bg-indigo-50/50 dark:bg-indigo-950/30"
                >
                  {rule.codeRef}
                </Badge>
              )}

              <Badge
                variant="outline"
                className="font-mono text-[10px] text-muted-foreground"
              >
                P{rule.priority}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{rule.typeLabel}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Calendar className="size-3" />
                <span>
                  {rule.startDate} – {rule.endDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={rule.status} showDot />

            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex size-8 items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors">
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="text-xs">
                {onSimulate && (
                  <DropdownMenuItem onClick={() => onSimulate(rule)}>
                    <Sliders className="mr-2 size-3.5" />
                    Test in Sandbox
                  </DropdownMenuItem>
                )}
                {onDuplicate && (
                  <DropdownMenuItem onClick={() => onDuplicate(rule)}>
                    <Copy className="mr-2 size-3.5" />
                    Duplicate Rule
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {onDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete(rule.id)}
                    className="text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="mr-2 size-3.5" />
                    Delete Rule
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Triggers & Reward Action Pill */}
        <div className="mt-3.5 grid grid-cols-1 gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 text-xs sm:grid-cols-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Condition / Trigger
            </span>
            <p className="font-medium text-foreground">{rule.triggerSummary}</p>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Reward / Action
            </span>
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">
              {rule.actionSummary}
            </p>
          </div>
        </div>

        {/* Channels, Stacking, and Financial Metrics */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/40 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 text-muted-foreground">
              {rule.channels.includes("web") && (
                <span title="Web">
                  <Globe className="size-3.5 text-foreground/80" />
                </span>
              )}
              {rule.channels.includes("mobile") && (
                <span title="Mobile App">
                  <Smartphone className="size-3.5 text-foreground/80" />
                </span>
              )}
              {rule.channels.includes("pos") && (
                <span title="Point of Sale">
                  <Store className="size-3.5 text-foreground/80" />
                </span>
              )}
            </div>

            <Badge
              variant="secondary"
              className="text-[10px] font-mono px-1.5 py-0 capitalize"
            >
              {rule.stacking.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground">Redemptions: </span>
              <strong className="font-semibold text-foreground">
                {formatNumber(rule.redemptions)}
              </strong>
            </div>

            <div>
              <span className="text-muted-foreground">Attributed GMV: </span>
              <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(rule.attributedGmv, { compact: true })}
              </strong>
            </div>

            {onToggleStatus && (
              <div className="flex items-center gap-1.5 pl-2 border-l border-border/60">
                <Switch
                  checked={isActive}
                  onCheckedChange={(checked) => onToggleStatus(rule.id, checked)}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
