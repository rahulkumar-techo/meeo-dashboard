/**
 * @file tier3-operational-modes-card.tsx
 * @description Form card for Tier 3: Operational Protective Modes, IP Whitelisting, and Data Retention.
 */

"use client"

import * as React from "react"
import {
  ShieldAlert,
  Lock,
  ShoppingCart,
  CreditCard,
  Plus,
  Trash2,
  Database,
  Globe,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { SystemSettings } from "@/types/settings"

export interface Tier3OperationalModesCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
  onOpenKillSwitchModal: () => void
}

export function Tier3OperationalModesCard({
  settings,
  onChange,
  onOpenKillSwitchModal,
}: Tier3OperationalModesCardProps) {
  const [newIpInput, setNewIpInput] = React.useState("")

  const allowedIps = settings.allowedMaintenanceIps || []

  const handleAddIp = () => {
    const trimmed = newIpInput.trim()
    if (!trimmed) return
    if (allowedIps.includes(trimmed)) return

    onChange({
      allowedMaintenanceIps: [...allowedIps, trimmed],
    })
    setNewIpInput("")
  }

  const handleRemoveIp = (ipToRemove: string) => {
    onChange({
      allowedMaintenanceIps: allowedIps.filter((ip) => ip !== ipToRemove),
    })
  }

  return (
    <div className="space-y-5">
      {/* 1. Emergency Kill Switch Notice Banner */}
      <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                Platform Emergency Freeze Controls
              </h3>
              {settings.emergencyControls?.killSwitchActive && (
                <Badge variant="destructive" className="text-[10px] animate-pulse">
                  KILL SWITCH ACTIVE
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instantly lock checkouts, payment processing, and public access cluster-wide during severe outages.
            </p>
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          variant={settings.emergencyControls?.killSwitchActive ? "default" : "destructive"}
          onClick={onOpenKillSwitchModal}
          className="shrink-0 text-xs font-bold gap-1.5"
        >
          <Lock className="size-3.5" />
          {settings.emergencyControls?.killSwitchActive
            ? "Disengage Kill Switch"
            : "Emergency Kill Switch"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 2. Protective Operational Toggles */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Lock className="size-4 text-amber-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Operational Modes & Protective Toggles
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* Maintenance Mode */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>Maintenance Mode</span>
                  {settings.maintenanceMode && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-600 border-amber-500/30">
                      503 Active
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Blocks public storefront traffic with 503 status. Whitelisted IPs bypass.
                </p>
              </div>
              <Switch
                checked={Boolean(settings.maintenanceMode)}
                onCheckedChange={(checked: boolean) =>
                  onChange({ maintenanceMode: checked })
                }
              />
            </div>

            {/* Read-Only Mode */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <span>Read-Only Mode</span>
                  {settings.readOnlyMode && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-600 border-amber-500/30">
                      423 Locked
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Rejects all database mutating requests (POST, PUT, DELETE) during schema migrations.
                </p>
              </div>
              <Switch
                checked={Boolean(settings.readOnlyMode)}
                onCheckedChange={(checked: boolean) =>
                  onChange({ readOnlyMode: checked })
                }
              />
            </div>

            {/* Disable Checkout */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <ShoppingCart className="size-3.5 text-indigo-500" />
                  <span>Disable Checkout</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Pauses cart checkouts (e.g. during physical warehouse stocktaking).
                </p>
              </div>
              <Switch
                checked={Boolean(settings.disableCheckout)}
                onCheckedChange={(checked: boolean) =>
                  onChange({ disableCheckout: checked })
                }
              />
            </div>

            {/* Disable Payments */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30">
              <div className="space-y-0.5 pr-3">
                <div className="flex items-center gap-1.5 font-semibold text-foreground">
                  <CreditCard className="size-3.5 text-cyan-500" />
                  <span>Disable Payments</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Blocks payment intent creation while allowing draft orders or cash on delivery.
                </p>
              </div>
              <Switch
                checked={Boolean(settings.disablePayments)}
                onCheckedChange={(checked: boolean) =>
                  onChange({ disablePayments: checked })
                }
              />
            </div>
          </div>
        </div>

        {/* 3. Maintenance Whitelisted IPs & Retention */}
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3">
            <Globe className="size-4 text-indigo-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Allowed Maintenance IPs & Data Retention
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Whitelisted IP List */}
            <div className="space-y-2">
              <label className="font-semibold text-foreground">
                Allowed Maintenance IPs (Bypass 503)
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={newIpInput}
                  onChange={(e) => setNewIpInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddIp()
                    }
                  }}
                  placeholder="e.g. 192.0.2.1 or 2001:db8::1"
                  className="h-8.5 text-xs font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddIp}
                  className="h-8.5 gap-1 shrink-0 text-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Add IP</span>
                </Button>
              </div>

              {/* IP Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto">
                {allowedIps.length === 0 ? (
                  <p className="text-muted-foreground text-[11px] italic">
                    No whitelisted IPs configured. All non-admin traffic is blocked during maintenance.
                  </p>
                ) : (
                  allowedIps.map((ip) => (
                    <Badge
                      key={ip}
                      variant="secondary"
                      className="gap-1.5 font-mono text-[11px] px-2 py-0.5 bg-muted border border-border/60"
                    >
                      <span>{ip}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveIp(ip)}
                        className="text-muted-foreground hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Data Retention Days */}
            <div className="space-y-1.5 pt-2 border-t border-border/60">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Database className="size-3.5 text-indigo-500" />
                <span>Forensic Data Retention Window (Days)</span>
              </label>
              <Input
                type="number"
                min={30}
                max={3650}
                value={settings.dataRetentionDays ?? 365}
                onChange={(e) =>
                  onChange({
                    dataRetentionDays: parseInt(e.target.value) || 365,
                  })
                }
                className="h-8.5 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Retention duration for audit logs, idempotency keys, and notification outbox records before automated archival.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
