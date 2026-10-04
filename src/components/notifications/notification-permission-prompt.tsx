/**
 * @file notification-permission-prompt.tsx
 * @description Root layout floating permission prompt card requesting user to enable Web Push Notifications.
 * Displays only when push is supported, user is authenticated, and permission is not yet granted/registered.
 */

"use client"

import * as React from "react"
import { BellRing, X, CheckCircle2, Sparkles, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useUserStore } from "@/store/user.store"

const DISMISS_STORAGE_KEY = "meeo_push_prompt_dismissed"

export function NotificationPermissionPrompt() {
  const { isAuthenticated, hasHydrated } = useUserStore()
  const {
    isSupported,
    permission,
    isCurrentDeviceRegistered,
    isProcessing,
    enablePushNotifications,
  } = usePushNotifications()

  const [isDismissed, setIsDismissed] = React.useState(true)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(DISMISS_STORAGE_KEY)
      setIsDismissed(dismissed === "true")
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== "undefined") {
      sessionStorage.setItem(DISMISS_STORAGE_KEY, "true")
    }
  }

  const handleEnable = async () => {
    const success = await enablePushNotifications()
    if (success) {
      setIsDismissed(true)
    }
  }

  // Conditions to hide:
  // 1. Not mounted or store not hydrated
  // 2. User not logged in
  // 3. Browser doesn't support push
  // 4. Already registered on this device
  // 5. User already explicitly blocked permissions in browser
  // 6. User dismissed during this browsing session
  if (
    !mounted ||
    !hasHydrated ||
    !isAuthenticated ||
    !isSupported ||
    isCurrentDeviceRegistered ||
    permission === "denied" ||
    isDismissed
  ) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-xl border border-indigo-500/30 bg-card/95 p-4 shadow-xl backdrop-blur-md dark:bg-card/90">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-indigo-500/15 blur-2xl" />

        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
            <BellRing className="size-5 animate-bounce" />
          </div>

          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <span>Enable Push Notifications</span>
                <Sparkles className="size-3 text-indigo-500" />
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Dismiss"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Receive instant updates for live orders, inventory alerts, and security events directly in your browser.
            </p>

            <div className="pt-2 flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleEnable}
                disabled={isProcessing}
                className="h-7.5 px-3 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin shrink-0" />
                    <span>Enabling...</span>
                  </>
                ) : (
                  <span>Enable Notifications</span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-7.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
