/**
 * @file tier1-brand-settings-card.tsx
 * @description Form card for Tier 1: Core Platform Brand, Canonical Domain, Emails, 2FA, & Timezone.
 */

"use client"

import * as React from "react"
import { Globe, Mail, Shield, Clock, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import type { SystemSettings } from "@/types/settings"

export interface Tier1BrandSettingsCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
}

export function Tier1BrandSettingsCard({
  settings,
  onChange,
}: Tier1BrandSettingsCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Brand & Domain Identity */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Globe className="size-4 text-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Platform Brand & Canonical Domain
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Platform Brand Name
            </label>
            <Input
              value={settings.platformBrandName || ""}
              onChange={(e) =>
                onChange({ platformBrandName: e.target.value })
              }
              placeholder="e.g. Acme Commerce Platform"
              className="h-8.5 text-xs"
            />
            <p className="text-[11px] text-muted-foreground">
              Public brand name rendered across customer storefront, emails, and invoices.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Public Domain URL
            </label>
            <Input
              value={settings.publicDomainUrl || ""}
              onChange={(e) =>
                onChange({ publicDomainUrl: e.target.value })
              }
              placeholder="https://store.example.com"
              className="h-8.5 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Canonical public URL used for deep links, return URLs, and email CTAs.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <DollarSign className="size-3 text-emerald-500" /> Default Currency
              </label>
              <select
                value={settings.defaultCurrency || "USD"}
                onChange={(e) =>
                  onChange({ defaultCurrency: e.target.value })
                }
                className="w-full h-8.5 px-2.5 rounded-md border border-border bg-background text-xs font-mono text-foreground focus:outline-hidden"
              >
                <option value="USD">USD ($ - United States Dollar)</option>
                <option value="EUR">EUR (€ - Euro)</option>
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="GBP">GBP (£ - British Pound)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3 text-indigo-500" /> System Timezone
              </label>
              <select
                value={settings.timezone || "UTC"}
                onChange={(e) => onChange({ timezone: e.target.value })}
                className="w-full h-8.5 px-2.5 rounded-md border border-border bg-background text-xs font-mono text-foreground focus:outline-hidden"
              >
                <option value="UTC">UTC (Coordinated Universal Time)</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST/PDT)</option>
                <option value="Europe/London">Europe/London (GMT/BST)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Communication & Multi-Factor Security */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Mail className="size-4 text-cyan-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Escalation Routing & Security Governance
          </h2>
        </div>

        <div className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Customer Support Email
            </label>
            <Input
              type="email"
              value={settings.supportEmail || ""}
              onChange={(e) => onChange({ supportEmail: e.target.value })}
              placeholder="support@example.com"
              className="h-8.5 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Rendered in email headers for customer inquiries and tickets.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Operations Alert Email
            </label>
            <Input
              type="email"
              value={settings.operationsEmail || ""}
              onChange={(e) =>
                onChange({ operationsEmail: e.target.value })
              }
              placeholder="ops@example.com"
              className="h-8.5 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Receives low-stock alerts, fulfillment bottlenecks, and outbox DLQ warnings.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Security Escalation Email
            </label>
            <Input
              type="email"
              value={settings.securityEmail || ""}
              onChange={(e) =>
                onChange({ securityEmail: e.target.value })
              }
              placeholder="security@example.com"
              className="h-8.5 text-xs font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Receives critical security alerts, unauthorized access alerts, and kill switch broadcasts.
            </p>
          </div>

          {/* 2FA Enforcement Switch */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border/80 bg-muted/30 pt-2">
            <div className="space-y-0.5 pr-3">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="size-3.5 text-indigo-500" />
                <span>Enforce Mandatory Admin 2FA</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Requires Multi-Factor Authentication (TOTP / Hardware key) for all operator logins.
              </p>
            </div>
            <Switch
              checked={Boolean(settings.requireAdmin2FA)}
              onCheckedChange={(checked: boolean) =>
                onChange({ requireAdmin2FA: checked })
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
