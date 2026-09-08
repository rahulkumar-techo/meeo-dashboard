/**
 * @file settings-guide-card.tsx
 * @description Architecture and operational runbook for System Settings, Governance, and Emergency Protocols.
 */

"use client"

import * as React from "react"
import { ShieldCheck, Server, AlertTriangle, Zap, Sliders, Lock, Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function SettingsGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="border-border/80 bg-gradient-to-r from-card via-card to-muted/20 shadow-2xs">
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
              <Layers className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Platform System Governance & Operational Invariants
                </h3>
                <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0 border-indigo-500/30 text-indigo-600">
                  Tier 1-3 In-Memory Cache
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Sub-millisecond configuration hot-reloading with atomic schema validation and automatic forensic audit log emission.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs font-semibold text-primary hover:underline shrink-0 self-start sm:self-center"
          >
            {isOpen ? "Hide Architecture Runbook" : "View Operational Runbook"}
          </button>
        </div>

        {isOpen && (
          <div className="pt-3 border-t border-border/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Column 1: Tier Breakdown */}
            <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Server className="size-3.5 text-indigo-500" />
                <span>3-Tier Configuration Matrix</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong className="text-foreground">Tier 1:</strong> Brand identity, domains, emails, 2FA, & timezone.<br />
                <strong className="text-foreground">Tier 2:</strong> Payout frequency, reserves, & refund approval threshold.<br />
                <strong className="text-foreground">Tier 3:</strong> Operational modes, IP bypass whitelists, & data retention.
              </p>
            </div>

            {/* Column 2: Protective Toggles */}
            <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Operational Protective Modes</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                <strong className="text-foreground">Maintenance:</strong> 503 storefront block (whitelisted IPs bypass).<br />
                <strong className="text-foreground">Read-Only:</strong> 423 Locked for mutating calls during DB migrations.<br />
                <strong className="text-foreground">Disable Checkout / Payments:</strong> Granular inventory pause.
              </p>
            </div>

            {/* Column 3: Emergency Kill Switch */}
            <div className="p-3 rounded-lg border border-border/60 bg-background/50 space-y-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-3.5 text-rose-500" />
                <span>Emergency Kill Switch Protocols</span>
              </div>
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                Instantly freezes all checkout & payment intents across all nodes in the cluster during severe payment outages or security incidents.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
