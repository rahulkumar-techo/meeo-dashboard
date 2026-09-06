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
import type { NavGroup } from "./nav-config"

interface NavMainProps {
  groups: NavGroup[]
}

export function NavMain({ groups }: NavMainProps) {
  const pathname = usePathname()

  const isRouteActive = React.useCallback(
    (url: string) => {
      if (url === "/") {
        return pathname === "/"
      }
      return pathname === url || pathname?.startsWith(`${url}/`)
    },
    [pathname]
  )

  return (
    <div className="space-y-1">
      {groups.map((group) => (
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
