"use client"

import * as React from "react"
import {
  Search,
  Bell,
  ChevronDown,
  Plus,
} from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CURRENT_ADMIN } from "@/components/app-sidebar/nav-config"

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border/70 bg-background/95 px-4 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="-ml-1" />

        {/* Environment Badge */}
        <div className="flex items-center gap-1.5 rounded-md border border-indigo-200/60 bg-indigo-50/70 px-2 py-1 text-[11px] font-mono font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
          <span className="size-1.5 rounded-full bg-indigo-500" />
          <span>PROD - US-EAST-1</span>
        </div>

        {/* Search Bar with ⌘K */}
        <div className="relative hidden md:block w-72 lg:w-96">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders, inventory, transactions..."
            className="h-8 w-full rounded-md border border-border/80 bg-background pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-muted/80 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* System Health Uptime Pill */}
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-border/60 bg-background px-2.5 py-1 text-xs">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-medium text-foreground">
            All systems operational
          </span>
          <span className="rounded bg-muted px-1.5 py-0.2 font-mono text-[10px] text-muted-foreground">
            99.98%
          </span>
        </div>

        {/* Quick Create Button */}
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-indigo-600 px-3 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700"
        >
          <Plus className="size-3.5" />
          <span>Quick Create</span>
          <ChevronDown className="size-3 opacity-70" />
        </Button>

        {/* Notifications Icon with Badge 4 */}
        <div className="relative">
          <Button variant="ghost" size="icon-sm" className="size-8 text-muted-foreground hover:text-foreground">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
            4
          </span>
        </div>

        {/* Header Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-border/60">
          <Avatar className="size-8 rounded-full border border-border/80">
            <AvatarImage src={CURRENT_ADMIN.avatar} alt={CURRENT_ADMIN.name} />
            <AvatarFallback className="text-xs font-semibold bg-indigo-50 text-indigo-700">
              {CURRENT_ADMIN.initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden lg:grid text-left leading-tight">
            <span className="text-xs font-semibold text-foreground">
              {CURRENT_ADMIN.name}
            </span>
            <span className="text-[10.5px] text-muted-foreground">
              Operations Lead
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
