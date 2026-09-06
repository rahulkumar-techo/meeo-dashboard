"use client"

import * as React from "react"
import Link from "next/link"
import { Activity, ArrowUpRight } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "cn"
import { CURRENT_SYSTEM_STATUS, type SystemStatus } from "./nav-config"

interface NavSystemStatusProps {
  status?: SystemStatus
}

export function NavSystemStatus({
  status = CURRENT_SYSTEM_STATUS,
}: NavSystemStatusProps) {
  const getStatusColor = () => {
    switch (status.status) {
      case "operational":
        return "bg-emerald-500 shadow-emerald-500/50"
      case "degraded":
        return "bg-amber-500 shadow-amber-500/50"
      case "outage":
        return "bg-rose-500 shadow-rose-500/50"
      default:
        return "bg-emerald-500"
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          render={<Link href={status.href} />}
          tooltip={{
            children: `${status.label} (${status.metrics ?? "Health"})`,
          }}
          className="h-8 rounded-lg border border-border/40 bg-muted/40 px-2.5 text-xs text-muted-foreground transition-all hover:border-border hover:bg-muted hover:text-foreground"
        >
          <div className="relative flex size-2 items-center justify-center">
            <span
              className={cn(
                "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                getStatusColor()
              )}
            />
            <span
              className={cn(
                "relative inline-flex size-1.5 rounded-full",
                getStatusColor()
              )}
            />
          </div>
          <span className="truncate font-medium">{status.label}</span>
          <ArrowUpRight className="ml-auto size-3 opacity-60 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
