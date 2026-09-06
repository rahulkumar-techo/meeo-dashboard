"use client"

import * as React from "react"
import Link from "next/link"
import {
  Settings,
  Globe,
  DollarSign,
  Shield,
  Bell,
  Database,
  Lock,
  Check,
  RotateCcw,
  Sparkles,
  Server,
  Key,
  Layers,
  Save,
  AlertTriangle,
  ChevronRight,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "cn"

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = React.useState("general")
  const [showSecret, setShowSecret] = React.useState(false)
  const [savedSuccess, setSavedSuccess] = React.useState(false)

  // Settings State
  const [settings, setSettings] = React.useState({
    storeName: "ApexCommerce Enterprise",
    storeUrl: "https://apexcommerce.io",
    supportEmail: "ops@apexcommerce.io",
    primaryCurrency: "USD",
    timezone: "UTC",
    maintenanceMode: false,
    autoCapturePayments: true,
    requireMFA: true,
    webhookSecret: "whsec_98f10248abce9902189dccba0918",
    rateLimitPerMin: 4800,
    dlqMaxRetries: 5,
    fraudThresholdScore: 75,
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 2500)
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Administration</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">System Configuration</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Settings className="size-7 text-indigo-600" />
            Global Platform Settings
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Configure system parameters, multi-tenant currencies, API & webhook secrets, security policies, and maintenance modes.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <Badge className="bg-emerald-100 text-emerald-800 border-none font-mono text-xs gap-1.5 py-1">
              <Check className="size-3.5 text-emerald-600" /> Settings Saved
            </Badge>
          )}
          <Button
            onClick={handleSave}
            size="sm"
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Save className="size-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-muted/70 p-1">
            <TabsTrigger value="general" className="text-xs gap-1.5">
              <Globe className="size-3.5" /> General & Storefront
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-xs gap-1.5">
              <DollarSign className="size-3.5" /> Currencies & Payments
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5">
              <Shield className="size-3.5" /> Security & 2FA
            </TabsTrigger>
            <TabsTrigger value="developers" className="text-xs gap-1.5">
              <Key className="size-3.5" /> Webhooks & API Keys
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Tab 1: General */}
        {activeTab === "general" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Storefront Identity</h2>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Platform Brand Name</label>
                  <Input
                    value={settings.storeName}
                    onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Public Domain URL</label>
                  <Input
                    value={settings.storeUrl}
                    onChange={(e) => setSettings({ ...settings, storeUrl: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Support Operations Email</label>
                  <Input
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System State & Maintenance</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Maintenance Mode</span>
                    <p className="text-[11px] text-muted-foreground">Show maintenance splash screen to all non-admin visitors.</p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(v: boolean) => setSettings({ ...settings, maintenanceMode: v })}
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="font-semibold text-foreground">Global Ingestion Rate Limit (req/min)</label>
                  <Input
                    type="number"
                    value={settings.rateLimitPerMin}
                    onChange={(e) => setSettings({ ...settings, rateLimitPerMin: Number(e.target.value) })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Finance */}
        {activeTab === "finance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Settlement & Payout Policy</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Auto-Capture Payments</span>
                    <p className="text-[11px] text-muted-foreground">Automatically capture authorized cards upon successful fraud check.</p>
                  </div>
                  <Switch
                    checked={settings.autoCapturePayments}
                    onCheckedChange={(v: boolean) => setSettings({ ...settings, autoCapturePayments: v })}
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Base Catalog Settlement Currency</label>
                  <select
                    value={settings.primaryCurrency}
                    onChange={(e) => setSettings({ ...settings, primaryCurrency: e.target.value })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background font-mono"
                  >
                    <option value="USD">USD - United States Dollar ($)</option>
                    <option value="EUR">EUR - Euro (€)</option>
                    <option value="GBP">GBP - British Pound (£)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Risk & Fraud Thresholds</h2>
              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">Fraud Radar Score Quarantine Trigger (0-100)</label>
                  <Input
                    type="number"
                    value={settings.fraudThresholdScore}
                    onChange={(e) => setSettings({ ...settings, fraudThresholdScore: Number(e.target.value) })}
                    className="h-8 text-xs font-mono"
                  />
                  <p className="text-[11px] text-muted-foreground">Transactions scoring higher than this will trigger manual human triage.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security */}
        {activeTab === "security" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Authentication Enforcement</h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground">Enforce Strict Hardware MFA (FIDO2)</span>
                    <p className="text-[11px] text-muted-foreground">Require YubiKey or WebAuthn for all Super Admin operators.</p>
                  </div>
                  <Switch
                    checked={settings.requireMFA}
                    onCheckedChange={(v: boolean) => setSettings({ ...settings, requireMFA: v })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Developers */}
        {activeTab === "developers" && (
          <div className="rounded-xl border bg-card p-5 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Webhook Signatures & Secrets</h2>
            <div className="space-y-3 text-xs max-w-xl">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Global HMAC Outbox Webhook Secret</label>
                <div className="flex items-center gap-2">
                  <Input
                    type={showSecret ? "text" : "password"}
                    readOnly
                    value={settings.webhookSecret}
                    className="h-8 text-xs font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                    className="h-8 text-xs"
                  >
                    {showSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
