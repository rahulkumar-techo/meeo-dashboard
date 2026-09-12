"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar/appSidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useUserStore } from "@/store/user.store"
import { useCurrentUserQuery } from "@/hooks/use-auth-query"
import { authService } from "@/services/auth.service"
import { usePermissions } from "@/hooks/use-permissions"
import { NoAccessView } from "@/components/auth/no-access-view"
import { AccessDeniedView } from "@/components/auth/access-denied-view"
import { Loader2 } from "lucide-react"

const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/verify-otp",
  "/forgot-password",
  "/reset-password",
]

interface AppLayoutWrapperProps {
  children: React.ReactNode
}

export function AppLayoutWrapper({ children }: AppLayoutWrapperProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, hasHydrated } = useUserStore()
  const [mountedHydrated, setMountedHydrated] = React.useState(false)

  // Permission & RBAC state
  const {
    isSuperAdmin,
    hasNoPermissions,
    canAccessRoute,
    getRouteRequiredPermission,
  } = usePermissions()

  React.useEffect(() => {
    if (useUserStore.persist.hasHydrated()) {
      setMountedHydrated(true)
    } else {
      const unsub = useUserStore.persist.onFinishHydration(() => {
        setMountedHydrated(true)
      })
      return () => unsub()
    }
  }, [])

  const isHydrated = hasHydrated || mountedHydrated
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname?.startsWith(route))

  // Fetch / update current user profile via TanStack Query when authenticated
  useCurrentUserQuery()

  // Route Protection Guard
  React.useEffect(() => {
    if (!isHydrated) return

    if (isAuthRoute) {
      if (isAuthenticated) {
        router.replace("/")
      }
    } else {
      if (!isAuthenticated) {
        const redirectParam = pathname ? `?redirect=${encodeURIComponent(pathname)}` : ""
        router.replace(`/login${redirectParam}`)
      }
    }
  }, [isHydrated, isAuthRoute, isAuthenticated, pathname, router])

  // While store is rehydrating from localStorage, show a clean splash loader
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Initializing Meeo Console...
          </p>
        </div>
      </div>
    )
  }

  // If on an Auth route (login, signup, etc.), render the auth card directly without sidebar/header
  if (isAuthRoute) {
    return <>{children}</>
  }

  // If on a protected route but not authenticated, render loading while redirect completes
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/30">
            <Loader2 className="size-5 animate-spin" />
          </div>
          <p className="text-xs font-medium text-muted-foreground animate-pulse">
            Redirecting to login...
          </p>
        </div>
      </div>
    )
  }

  // If user is authenticated but possesses ZERO permissions (and is not super admin)
  if (hasNoPermissions) {
    return <NoAccessView />
  }

  // Check if current route is allowed for this user
  const isRouteAllowed = canAccessRoute(pathname || "/")
  const requiredPerm = getRouteRequiredPermission(pathname || "/")

  // Authenticated Dashboard layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/40 dark:bg-background min-h-svh min-w-0 max-w-full relative flex flex-col flex-1">
        <DashboardHeader />
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 min-w-0 max-w-full">
          {isRouteAllowed ? (
            children
          ) : (
            <AccessDeniedView
              requiredPermission={requiredPerm}
              pathname={pathname}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
