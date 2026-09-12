"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { cn } from "cn"
import { usePermissions } from "@/hooks/use-permissions"
import { useOverView } from "@/hooks/dashboard/use-overview.hook"
import { useAdminOrderMetricsQuery } from "@/hooks/use-order-query"
import type { NavGroup } from "./nav-config"

interface NavMainProps {
  groups: NavGroup[]
}

export function NavMain({ groups }: NavMainProps) {
  const pathname = usePathname()
  const { hasPermission, isSuperAdmin } = usePermissions()

  // Fetch live overview and order metrics for real-time sidebar badges
  const { data: overviewData } = useOverView({ period: "30d" })
  const { data: orderMetrics } = useAdminOrderMetricsQuery()

  const overview = overviewData?.data

  const isRouteActive = React.useCallback(
    (url: string) => {
      if (url === "/") {
        return pathname === "/"
      }
      return pathname === url || pathname?.startsWith(`${url}/`)
    },
    [pathname]
  )

  // Compute live badges based on real backend numbers
  const getLiveBadge = React.useCallback(
    (url: string) => {
      switch (url) {
        case "/orders": {
          const pending =
            (orderMetrics?.statusCounts?.PENDING ?? 0) +
            (orderMetrics?.statusCounts?.PAYMENT_PENDING ?? 0) ||
            (overview?.orders?.statusBreakdown?.PENDING ?? 0)
          const active = orderMetrics?.activeFulfillments ?? pending
          if (pending > 0) {
            return { badge: `${pending} new`, badgeVariant: "brand" as const }
          }
          if (active > 0) {
            return { badge: `${active} active`, badgeVariant: "brand" as const }
          }
          return null
        }
        case "/inventory": {
          const outOfStock = overview?.inventory?.outOfStockCount ?? 0
          const lowStock = overview?.inventory?.lowStockCount ?? 0
          if (outOfStock > 0) {
            return { badge: `${outOfStock} out`, badgeVariant: "destructive" as const }
          }
          if (lowStock > 0) {
            return { badge: `${lowStock} low`, badgeVariant: "warning" as const }
          }
          return null
        }
        case "/reviews": {
          const pending = overview?.reviews?.pendingModeration ?? 0
          if (pending > 0) {
            return { badge: `${pending} pending`, badgeVariant: "warning" as const }
          }
          return null
        }
        case "/finance/payments": {
          const failed = overview?.payments?.failedPayments ?? 0
          if (failed > 0) {
            return { badge: `${failed} failed`, badgeVariant: "destructive" as const }
          }
          return null
        }
        case "/marketing/coupons": {
          const activeCoupons = overview?.promotions?.activeCouponsCount ?? 0
          if (activeCoupons > 0) {
            return { badge: `${activeCoupons} active`, badgeVariant: "secondary" as const }
          }
          return null
        }
        default:
          return null
      }
    },
    [overview, orderMetrics]
  )

  // Filter groups and items based on user RBAC permissions and attach live badges
  const visibleGroups = React.useMemo(() => {
    return groups
      .map((group) => {
        const visibleItems = group.items
          .filter((item) => {
            if (isSuperAdmin) return true
            if (!item.permission) return true
            return hasPermission(item.permission)
          })
          .map((item) => {
            const liveBadge = getLiveBadge(item.url)
            return {
              ...item,
              badge: liveBadge ? liveBadge.badge : item.badge,
              badgeVariant: liveBadge ? liveBadge.badgeVariant : item.badgeVariant,
            }
          })

        return {
          ...group,
          items: visibleItems,
        }
      })
      .filter((group) => group.items.length > 0)
  }, [groups, hasPermission, isSuperAdmin, getLiveBadge])

  if (visibleGroups.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-xs text-muted-foreground">
        <p className="font-semibold text-foreground">No accessible modules</p>
        <p className="text-[11px] mt-1 text-muted-foreground/80">
          Your account has no visible sections assigned.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {visibleGroups.map((group) => (
        <SidebarGroup key={group.id} className="py-1">
          <SidebarGroupLabel className="text-[10px] font-bold tracking-wider text-muted-foreground/75 uppercase px-2">
            {group.label}
          </SidebarGroupLabel>
          <SidebarMenu className="gap-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isRouteActive(item.url)

              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={active}
                    tooltip={{
                      children: item.title,
                    }}
                    className={cn(
                      "h-8 text-xs font-normal text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground px-2 rounded-md",
                      active &&
                        "bg-indigo-50/90 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 font-semibold shadow-2xs hover:bg-indigo-50/90"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-4 text-muted-foreground/80",
                        active && "text-indigo-600 dark:text-indigo-400"
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </SidebarMenuButton>

                  {item.badge !== undefined && (
                    <SidebarMenuBadge>
                      <Badge
                        variant={item.badgeVariant ?? "secondary"}
                        className="h-4 px-1.5 text-[9.5px] font-medium"
                      >
                        {item.badge}
                      </Badge>
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </div>
  )
}
