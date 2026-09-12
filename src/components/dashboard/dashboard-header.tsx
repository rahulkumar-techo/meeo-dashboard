"use client"

import * as React from "react"
import { Search, Sparkles } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme"
import { HeaderSearchDialog } from "./header-search-dialog"
import { HeaderNotificationsPopover } from "./header-notifications-popover"
import { HeaderQuickCreateMenu } from "./header-quick-create-menu"
import { HeaderProfileMenu } from "./header-profile-menu"

import { useSocket } from "@/context/socket-provider"
import { SocketStatusBadge } from "@/components/common/socket-status-badge"
import { CurrencySelector } from "@/components/common/currency-selector"


/**
 * Main application top navigation header.
 * Fully responsive across mobile, tablet, and desktop viewports with dark mode integration.
 */
export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const { isConnected } = useSocket()

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 w-full shrink-0 items-center justify-between gap-2 border-b border-border/70 bg-background/95 px-2.5 sm:px-4 backdrop-blur-md transition-all">
        {/* Left Section: Sidebar Toggle, Env Badge & Search */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />

          {/* Environment Tag - Full on sm+, compact on mobile */}
          <div className="hidden xs:flex items-center gap-1.5 rounded-md border border-indigo-200/60 bg-indigo-50/70 px-2 py-1 text-[11px] font-mono font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
            <span className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="hidden sm:inline">PROD - US-EAST-1</span>
            <span className="sm:hidden">PROD</span>
          </div>

          {/* Desktop Search Bar with ⌘K */}
          <div
            onClick={() => setSearchOpen(true)}
            className="relative hidden md:flex items-center w-64 lg:w-80 cursor-pointer"
          >
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              readOnly
              placeholder="Search console (⌘K)..."
              className="h-8 w-full rounded-md border border-border/80 bg-muted/40 pl-8 pr-12 text-xs text-foreground placeholder:text-muted-foreground hover:bg-muted/70 cursor-pointer focus:border-indigo-500 focus:outline-hidden"
            />
            <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right Section: Mobile Search, System Uptime, Quick Actions, Theme, Notifications & Profile */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSearchOpen(true)}
            className="md:hidden size-8 text-muted-foreground hover:text-foreground"
            aria-label="Search"
          >
            <Search className="size-4" />
          </Button>

          {/* Real-time WebSocket Stream Blinker */}
          <div className="hidden lg:flex items-center">
            <SocketStatusBadge variant="pill" />
          </div>
          <div className="hidden sm:flex lg:hidden items-center">
            <SocketStatusBadge variant="badge" />
          </div>
          <div className="flex sm:hidden items-center">
            <SocketStatusBadge variant="dot" />
          </div>

          {/* Currency Preference Selector */}
          <CurrencySelector className="h-8" />

          {/* Quick Create Dropdown Menu */}
          <HeaderQuickCreateMenu />

          {/* Theme Mode Toggle (Light / Dark / System) */}
          <ThemeToggle />

          {/* Notifications Dropdown Popover */}
          <HeaderNotificationsPopover />

          {/* Divider */}
          <div className="h-5 w-px bg-border/60 mx-0.5" />

          {/* User Profile Menu */}
          <HeaderProfileMenu />
        </div>
      </header>

      {/* Global Command/Search Dialog */}
      <HeaderSearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
