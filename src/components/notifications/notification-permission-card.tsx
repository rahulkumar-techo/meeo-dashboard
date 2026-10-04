/**
 * @file notification-permission-card.tsx
 * @description Interactive UI Card for Web Push Notification permissions, device registration,
 * and active FCM device management.
 */

"use client"

import * as React from "react"
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Globe,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useUnregisterDeviceMutation } from "@/hooks/use-notification-query"
import type { RegisteredDeviceItem } from "@/types/notification"

export function NotificationPermissionCard() {
  const {
    isSupported,
    permission,
    cachedToken,
    isCurrentDeviceRegistered,
    isProcessing,
    enablePushNotifications,
    disablePushNotifications,
    registeredDevices,
    isLoadingDevices,
    refetchDevices,
  } = usePushNotifications()

  const unregisterDeviceMutation = useUnregisterDeviceMutation()

  const handleDeviceDelete = async (device: RegisteredDeviceItem) => {
    if (!device.token) return
    await unregisterDeviceMutation.mutateAsync({ token: device.token })
    refetchDevices()
  }

  const getPlatformIcon = (platform: string) => {
    if (platform === "web") return <Laptop className="size-3.5 text-sky-500" />
    return <Smartphone className="size-3.5 text-emerald-500" />
  }

  return (
    <Card className="border-border/70 shadow-2xs bg-card">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <BellRing className="size-4.5" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                <span>Web Push Notification & Device Authorization</span>
                {isProcessing ? (
                  <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-[10px] font-medium gap-1 animate-pulse">
                    <Loader2 className="size-2.5 animate-spin shrink-0" />
                    Configuring Device...
                  </Badge>
                ) : isCurrentDeviceRegistered ? (
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-medium gap-1">
                    <CheckCircle2 className="size-2.5" />
                    Active on this device
                  </Badge>
                ) : permission === "denied" ? (
                  <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/30 text-[10px] font-medium gap-1">
                    <AlertTriangle className="size-2.5" />
                    Permission Blocked
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-[10px] font-medium text-muted-foreground">
                    Inactive
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Authorize this browser for instant Firebase Cloud Messaging (FCM) push alerts.
              </CardDescription>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="flex items-center gap-2">
            {!isSupported ? (
              <Badge variant="destructive" className="text-xs">
                Browser Unsupported
              </Badge>
            ) : isCurrentDeviceRegistered ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => disablePushNotifications()}
                disabled={isProcessing}
                className="h-8 text-xs font-medium text-destructive hover:bg-destructive/10 border-destructive/30 gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin shrink-0" />
                    <span>Disabling...</span>
                  </>
                ) : (
                  <>
                    <BellOff className="size-3.5" />
                    <span>Disable Push</span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => enablePushNotifications()}
                disabled={isProcessing || permission === "denied"}
                className="h-8 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 shadow-xs disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin shrink-0" />
                    <span>Configuring Push...</span>
                  </>
                ) : (
                  <>
                    <Bell className="size-3.5" />
                    <span>Enable Push Notifications</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {permission === "denied" && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Notifications are blocked in your browser settings</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Browsers do not allow web pages to re-open the permission prompt once blocked. To allow notifications, click the <strong>tune/lock icon</strong> on the left side of your browser URL address bar, set <strong>Notifications</strong> to <strong>Allow</strong> (or Reset permission), and reload the page.
              </p>
            </div>
          </div>
        )}

        {/* Permission details & Local token status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Browser Permission Status</span>
            <div className="flex items-center gap-1.5 font-semibold capitalize text-foreground">
              <ShieldCheck className="size-3.5 text-indigo-500" />
              <span>{permission}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Local Device FCM Token</span>
            <div className="font-mono text-[11px] text-foreground truncate" title={cachedToken || "No token cached"}>
              {cachedToken ? `${cachedToken.slice(0, 18)}...${cachedToken.slice(-6)}` : "Not generated / Cached"}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1">
            <span className="text-[11px] text-muted-foreground font-medium">Active Registered Devices</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground">{registeredDevices.length} Devices</span>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => refetchDevices()}
                disabled={isLoadingDevices}
                title="Refresh Devices"
              >
                <RefreshCw className={`size-3 text-muted-foreground ${isLoadingDevices ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Registered Devices List if present */}
        {registeredDevices.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Globe className="size-3.5 text-muted-foreground" />
              <span>Registered FCM Devices ({registeredDevices.length})</span>
            </div>

            <div className="rounded-md border border-border/60 divide-y divide-border/40 overflow-hidden bg-background">
              {registeredDevices.map((dev) => {
                const isThisDevice = Boolean(cachedToken && dev.token === cachedToken)

                return (
                  <div
                    key={dev.id}
                    className="p-2.5 flex items-center justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-md bg-muted shrink-0">
                        {getPlatformIcon(dev.platform)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium uppercase text-[11px]">{dev.platform}</span>
                          {isThisDevice && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 bg-sky-500/10 text-sky-600 border-sky-500/20">
                              Current Device
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[320px]">
                          {dev.userAgent || dev.id}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {dev.lastUsedAt && (
                        <span className="text-[10px] text-muted-foreground hidden sm:inline">
                          Last active: {new Date(dev.lastUsedAt).toLocaleDateString()}
                        </span>
                      )}
                      {dev.token && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDeviceDelete(dev)}
                          disabled={unregisterDeviceMutation.isPending}
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Unregister device"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
