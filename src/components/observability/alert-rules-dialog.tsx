/**
 * @file alert-rules-dialog.tsx
 * @description Dynamic Alert Rules & Thresholds Sheet/Modal.
 * Allows operators to dynamically inspect and update alert thresholds (server_5xx, client_4xx,
 * security_events, business_operations) backed by L1/L2 memory caching and Redis Pub/Sub syncing.
 */

"use client"

import * as React from "react"
import {
  Bell,
  Check,
  RotateCcw,
  Save,
  Server,
  ShieldAlert,
  AlertTriangle,
  CreditCard,
  Sliders,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react"
import { toast } from "sonner"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  useObservabilityConfigs,
  useUpdateObservabilityConfig,
  useResetObservabilityConfigs,
} from "@/hooks/use-observability"
import type { ObservabilityConfigItem } from "@/types/observability"

interface AlertRulesDialogProps {
  trigger?: React.ReactNode
}

export function AlertRulesDialog({ trigger }: AlertRulesDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState("server_5xx")

  const { data: configs, isLoading } = useObservabilityConfigs()
  const updateRule = useUpdateObservabilityConfig()
  const resetDefaults = useResetObservabilityConfigs()

  // Local form state map for editable config values
  const [formState, setFormState] = React.useState<Record<string, ObservabilityConfigItem>>({})

  // Initialize local form state whenever fetched configs change
  React.useEffect(() => {
    if (configs && configs.length > 0) {
      const stateMap: Record<string, ObservabilityConfigItem> = {}
      configs.forEach((cfg) => {
        stateMap[cfg.key] = JSON.parse(JSON.stringify(cfg))
      })
      setFormState(stateMap)
    }
  }, [configs])

  const getConfig = (key: string): ObservabilityConfigItem | undefined => {
    return formState[key] || configs?.find((c) => c.key === key)
  }

  const handleFieldChange = (key: string, field: string, value: unknown) => {
    setFormState((prev) => {
      const current = prev[key] || configs?.find((c) => c.key === key)
      if (!current) return prev

      if (field === "isEnabled") {
        return {
          ...prev,
          [key]: { ...current, isEnabled: Boolean(value) },
        }
      }

      return {
        ...prev,
        [key]: {
          ...current,
          value: {
            ...current.value,
            [field]: value,
          },
        },
      }
    })
  }

  const handleSaveTab = async (key: string) => {
    const item = formState[key]
    if (!item) return

    try {
      await updateRule.mutateAsync({
        key,
        payload: {
          isEnabled: item.isEnabled,
          description: item.description || undefined,
          value: item.value as Record<string, unknown>,
        },
      })
      toast.success(`Alert rule for ${item.category} updated successfully`, {
        description: "Cached across L1 memory and synced via Redis Pub/Sub.",
      })
    } catch {
      toast.error(`Failed to update alert rule for ${key}`)
    }
  }

  const handleResetAll = async () => {
    try {
      await resetDefaults.mutateAsync()
      toast.success("Baseline alert thresholds restored", {
        description: "Default production limits have been re-applied.",
      })
    } catch {
      toast.error("Failed to reset baseline rules")
    }
  }

  const serverConfig = getConfig("thresholds:server_5xx")
  const clientConfig = getConfig("thresholds:client_4xx")
  const securityConfig = getConfig("thresholds:security_events")
  const businessConfig = getConfig("thresholds:business_operations")

  return (
    <>
      {trigger ? (
        React.isValidElement(trigger) ? (
          React.cloneElement(trigger as React.ReactElement<any>, {
            onClick: (e: React.MouseEvent) => {
              ;(trigger as any).props?.onClick?.(e)
              setIsOpen(true)
            },
          })
        ) : (
          <div onClick={() => setIsOpen(true)} className="w-full cursor-pointer">
            {trigger}
          </div>
        )
      ) : (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="gap-2 border-indigo-500/30 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 text-xs font-medium cursor-pointer"
        >
          <Sliders className="size-3.5" />
          <span>Alert Rules & Thresholds</span>
        </Button>
      )}

      <Sheet open={isOpen} onOpenChange={setIsOpen}>

      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl border-l border-border/80 bg-background/95 backdrop-blur-md p-0 flex flex-col h-full shadow-2xl"
      >
        {/* Header */}
        <SheetHeader className="p-5 border-b border-border/70 bg-muted/10 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
                <Bell className="size-5" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-foreground">
                  Alert Rules & Dynamic Thresholds
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground">
                  Real-time telemetry evaluation rules served from L1 Node cache (&lt;1ms).
                </SheetDescription>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetAll}
              disabled={resetDefaults.isPending}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              title="Reset all rules to factory baseline"
            >
              <RotateCcw className={cn("size-3.5", resetDefaults.isPending && "animate-spin")} />
              <span>Reset Defaults</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-3 border-b border-border/50 bg-muted/5">
            <TabsList className="grid grid-cols-4 w-full bg-muted/40 p-1">
              <TabsTrigger
                value="server_5xx"
                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground font-medium"
              >
                <Server className="size-3.5 text-rose-500" />
                <span className="hidden sm:inline">Server 5xx</span>
                <span className="sm:hidden">5xx</span>
              </TabsTrigger>

              <TabsTrigger
                value="client_4xx"
                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground font-medium"
              >
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span className="hidden sm:inline">Client 4xx</span>
                <span className="sm:hidden">4xx</span>
              </TabsTrigger>

              <TabsTrigger
                value="security_events"
                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground font-medium"
              >
                <ShieldAlert className="size-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Sec</span>
              </TabsTrigger>

              <TabsTrigger
                value="business_operations"
                className="gap-1.5 text-xs data-[state=active]:bg-background data-[state=active]:text-foreground font-medium"
              >
                <CreditCard className="size-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Business</span>
                <span className="sm:hidden">Biz</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* TAB 1: Server 5xx Errors */}
            <TabsContent value="server_5xx" className="mt-0 space-y-4">
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                      5xx Server Error Rule
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Primary service-health alert for 500-599 user-impacting server failures.
                    </p>
                  </div>
                  <Switch
                    checked={serverConfig?.isEnabled ?? true}
                    onCheckedChange={(val) =>
                      handleFieldChange("thresholds:server_5xx", "isEnabled", val)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Warning Threshold (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={Number(serverConfig?.value?.warningRatePercent ?? 2.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:server_5xx",
                        "warningRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 2.0% warning rate</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Critical Threshold (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={Number(serverConfig?.value?.criticalRatePercent ?? 5.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:server_5xx",
                        "criticalRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 5.0% outage trigger</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Evaluation Window (Minutes)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={Number(serverConfig?.value?.evaluationWindowMinutes ?? 5)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:server_5xx",
                        "evaluationWindowMinutes",
                        parseInt(e.target.value, 10) || 5
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Time sliding evaluation window</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Min Traffic Guard (Req/min)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={Number(serverConfig?.value?.minimumRequestsPerMinute ?? 10)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:server_5xx",
                        "minimumRequestsPerMinute",
                        parseInt(e.target.value, 10) || 10
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Prevents low-volume false alarms</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSaveTab("thresholds:server_5xx")}
                  disabled={updateRule.isPending}
                  className="w-full sm:w-auto gap-2 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                >
                  <Save className="size-4" />
                  <span>Save Server 5xx Thresholds</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 2: Client 4xx Errors */}
            <TabsContent value="client_4xx" className="mt-0 space-y-4">
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
                      Client Validation & 4xx Errors
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Tracks client input defects (400, 404, 405, 413, 415, 422). 401 is tracked in Security.
                    </p>
                  </div>
                  <Switch
                    checked={clientConfig?.isEnabled ?? true}
                    onCheckedChange={(val) =>
                      handleFieldChange("thresholds:client_4xx", "isEnabled", val)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Warning Threshold (%)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={Number(clientConfig?.value?.warningRatePercent ?? 10.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:client_4xx",
                        "warningRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 10.0%</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Critical Threshold (%)
                  </label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    value={Number(clientConfig?.value?.criticalRatePercent ?? 25.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:client_4xx",
                        "criticalRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 25.0%</p>
                </div>
              </div>

              {/* Status Code Tags */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground block">
                  Monitored Status Codes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[400, 404, 405, 413, 415, 422].map((code) => (
                    <Badge
                      key={code}
                      variant="outline"
                      className="border-amber-500/30 bg-amber-500/10 text-amber-500 font-mono text-xs"
                    >
                      {code}
                    </Badge>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Ignored normal codes: <span className="font-mono text-foreground">409 Conflict, 410 Gone</span>. (401 is handled under Security).
                </p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSaveTab("thresholds:client_4xx")}
                  disabled={updateRule.isPending}
                  className="w-full sm:w-auto gap-2 bg-amber-600 hover:bg-amber-500 text-white cursor-pointer"
                >
                  <Save className="size-4" />
                  <span>Save Client 4xx Thresholds</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 3: Security & Abuse */}
            <TabsContent value="security_events" className="mt-0 space-y-4">
              <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-indigo-500 animate-pulse" />
                      Security & Abuse Monitor
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Monitors 401 Unauthorized bursts, 403 Forbidden permissions, and 429 Rate Limiting hits.
                    </p>
                  </div>
                  <Switch
                    checked={securityConfig?.isEnabled ?? true}
                    onCheckedChange={(val) =>
                      handleFieldChange("thresholds:security_events", "isEnabled", val)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    401 / 403 Spike Limit (Req/min)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={Number(securityConfig?.value?.spikeThresholdRequestsPerMin ?? 30)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:security_events",
                        "spikeThresholdRequestsPerMin",
                        parseInt(e.target.value, 10) || 30
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 30 auth failures/min</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    429 Rate Limit Trigger (Hits/min)
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={Number(securityConfig?.value?.rateLimit429ThresholdPerMin ?? 15)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:security_events",
                        "rateLimit429ThresholdPerMin",
                        parseInt(e.target.value, 10) || 15
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 15 rate-limit triggers/min</p>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-foreground block">
                  Monitored Security Codes
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { code: 401, name: "Unauthorized / Token Expired" },
                    { code: 403, name: "Forbidden / RBAC Violation" },
                    { code: 429, name: "Too Many Requests / DDoS Guard" },
                  ].map((item) => (
                    <Badge
                      key={item.code}
                      variant="outline"
                      className="border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-mono text-xs gap-1"
                    >
                      <span>{item.code}</span>
                      <span className="text-[10px] text-muted-foreground">({item.name})</span>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSaveTab("thresholds:security_events")}
                  disabled={updateRule.isPending}
                  className="w-full sm:w-auto gap-2 bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                >
                  <Save className="size-4" />
                  <span>Save Security Thresholds</span>
                </Button>
              </div>
            </TabsContent>

            {/* TAB 4: Business Operations */}
            <TabsContent value="business_operations" className="mt-0 space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                      Business Operations & Pipeline
                    </span>
                    <p className="text-xs text-muted-foreground">
                      Payment gateway drops, checkout order failures, and BullMQ dead letter queue count.
                    </p>
                  </div>
                  <Switch
                    checked={businessConfig?.isEnabled ?? true}
                    onCheckedChange={(val) =>
                      handleFieldChange("thresholds:business_operations", "isEnabled", val)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Payment Failure Alert (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={Number(businessConfig?.value?.paymentFailureRatePercent ?? 2.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:business_operations",
                        "paymentFailureRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 2.0% gateway failure</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Order Creation Failure Alert (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={Number(businessConfig?.value?.orderFailureRatePercent ?? 1.0)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:business_operations",
                        "orderFailureRatePercent",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 1.0% checkout failure</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Queue DLQ Threshold (Failed Jobs)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={Number(businessConfig?.value?.backgroundJobDlqThreshold ?? 5)}
                    onChange={(e) =>
                      handleFieldChange(
                        "thresholds:business_operations",
                        "backgroundJobDlqThreshold",
                        parseInt(e.target.value, 10) || 5
                      )
                    }
                  />
                  <p className="text-[11px] text-muted-foreground">Default: 5 jobs stalled in DLQ</p>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => handleSaveTab("thresholds:business_operations")}
                  disabled={updateRule.isPending}
                  className="w-full sm:w-auto gap-2 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                >
                  <Save className="size-4" />
                  <span>Save Business Thresholds</span>
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  </>
)
}
