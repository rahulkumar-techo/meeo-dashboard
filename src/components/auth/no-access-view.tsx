/**
 * @file no-access-view.tsx
 * @description Full-screen view displayed when an authenticated user has zero permissions assigned.
 */

"use client"

import * as React from "react"
import { ShieldAlert, LogOut, RefreshCw, Mail, UserX, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/store/user.store"
import { useLogoutMutation, useCurrentUserQuery } from "@/hooks/use-auth-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function NoAccessView() {
  const router = useRouter()
  const { user } = useUserStore()
  const logoutMutation = useLogoutMutation()
  const { refetch: refetchUser, isFetching } = useCurrentUserQuery()

  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email
    : "Authenticated User"

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      user.email?.[0]?.toUpperCase() ||
      "U"
    : "U"

  const handleSignOut = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        toast.success("Signed out successfully")
        router.push("/login")
      },
    })
  }

  const handleRefresh = async () => {
    try {
      const res = await refetchUser()
      if (res.data && Array.isArray(res.data.permissions) && res.data.permissions.length > 0) {
        toast.success("Permissions updated successfully!")
      } else {
        toast.info("No permissions assigned to your account yet.")
      }
    } catch {
      toast.error("Failed to refresh user permissions.")
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-radial from-background via-muted/30 to-muted/80 p-4">
      <div className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 shadow-inner ring-8 ring-rose-50/50 dark:ring-rose-950/30">
          <ShieldAlert className="size-8" />
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            You can&apos;t access this Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Your account is authenticated, but you do not currently have any permissions or roles assigned to view or manage this console.
          </p>
        </div>

        {/* User Details Pill Box */}
        <div className="rounded-xl border border-border/60 bg-muted/40 p-3.5 text-left flex items-center gap-3">
          <Avatar className="size-10 shrink-0 rounded-full border border-border">
            <AvatarImage src={user?.avatar || user?.avatarUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-xs text-foreground truncate">{displayName}</p>
              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                No Permissions
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-mono truncate">{user?.email}</p>
          </div>
        </div>

        {/* Information Notice */}
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-200/60 bg-amber-50/70 p-3 text-left dark:border-amber-900/50 dark:bg-amber-950/30">
          <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11.5px] text-amber-900 dark:text-amber-200 leading-tight">
            Please contact your system administrator or organization owner to request access to the relevant modules.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching}
            className="flex-1 h-9 gap-1.5 text-xs font-semibold"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin text-indigo-600" : ""}`} />
            <span>{isFetching ? "Checking..." : "Recheck Permissions"}</span>
          </Button>

          <Button
            variant="destructive"
            onClick={handleSignOut}
            className="flex-1 h-9 gap-1.5 text-xs font-semibold"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
