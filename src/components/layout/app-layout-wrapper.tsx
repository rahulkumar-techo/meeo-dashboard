"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar/appSidebar"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useUserStore } from "@/store/user.store"
import { useCurrentUserQuery } from "@/hooks/use-auth-query"
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
  const { isAuthenticated, accessToken, hasHydrated } = useUserStore()
  const [mountedHydrated, setMountedHydrated] = React.useState(false)

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

    // If user is not authenticated and trying to access a protected page
    if (!isAuthenticated && !isAuthRoute) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname || "/")}`)
    }

    // If user is already authenticated and trying to access login/signup/auth pages
    if (isAuthenticated && isAuthRoute) {
      const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
      const redirect = searchParams.get("redirect") || "/"
      router.replace(redirect)
    }
  }, [isHydrated, isAuthenticated, isAuthRoute, pathname, router])

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


  // If visiting an auth page (Login, Signup, OTP, etc.)
  if (isAuthRoute) {
    return <div className="min-h-screen w-full">{children}</div>
  }

  // If unauthenticated and on a protected page, render nothing while redirecting to /login
  if (!isAuthenticated || !accessToken) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-6 animate-spin text-indigo-600" />
          <p className="text-xs text-muted-foreground">Redirecting to secure login...</p>
        </div>
      </div>
    )
  }

  // Authenticated Dashboard layout
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-slate-50/40 dark:bg-background min-h-svh min-w-0 max-w-full relative flex flex-col flex-1">
        <DashboardHeader />
        <div className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 min-w-0 max-w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
