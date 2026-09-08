/**
 * @file job-guide-card.tsx
 * @description Operational Guide & Runbook card for Background Jobs & Worker Fleet Observability.
 * Explains queue categories, worker resource limits, and dead-letter remediation.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  Server,
  Layers,
  Flame,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function JobGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-xs transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Background Jobs & Cluster Observability Guide
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Architecture, queue priorities, and dead-letter remediation playbooks.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            {isOpen ? (
              <>
                Hide Runbook <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                View Runbook <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-border/60 text-xs">
            {/* 1. Queue Priority Architecture */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Layers className="size-3.5 text-indigo-500" />
                <span>Queue Categories & Routing</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>• <strong className="text-foreground">Critical Checkouts:</strong> High-priority order & payment events (<code className="font-mono text-[10px]">domain-events</code>).</p>
                <p>• <strong className="text-foreground">Fulfillment Sync:</strong> Shipping carrier webhooks & tracking (<code className="font-mono text-[10px]">order-fulfillment-sync</code>).</p>
                <p>• <strong className="text-foreground">Marketing Batch:</strong> Promotional emails & low-stock alerts (<code className="font-mono text-[10px]">marketing-email-batch</code>).</p>
              </div>
            </div>

            {/* 2. Worker Pod Telemetry */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Server className="size-3.5 text-emerald-500" />
                <span>Worker Pod Telemetry</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <div className="flex flex-wrap items-center gap-1">
                  <span>• <strong className="text-foreground">Health Status:</strong> Nodes report</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 text-emerald-600 dark:text-emerald-400">HEALTHY</Badge>
                  <span>or</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-600 dark:text-amber-400">DEGRADED</Badge>
                  <span>(memory &gt; 90%).</span>
                </div>
                <p>• <strong className="text-foreground">Concurrency:</strong> Worker threads scale with pod concurrency limits.</p>
                <p>• <strong className="text-foreground">Heartbeats:</strong> Nodes send heartbeats every 10 seconds.</p>
              </div>
            </div>

            {/* 3. Dead-Letter Queue (DLQ) Remediation */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Flame className="size-3.5 text-rose-500" />
                <span>DLQ Remediation Protocol</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>• Filter by <strong className="text-foreground">Dead Letter Trigger</strong> tab to inspect failed jobs.</p>
                <p>• Check error reason and stack trace in the inspect drawer.</p>
                <p>• Once downstream bug/service is resolved, click <strong className="text-foreground">Retry</strong> or <strong className="text-foreground">Retry All Failed</strong> in bulk actions.</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
