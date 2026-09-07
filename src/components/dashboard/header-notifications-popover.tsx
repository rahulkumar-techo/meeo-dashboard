"use client"

import * as React from "react"
import { Bell, CheckCheck, AlertTriangle, ShieldCheck, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

const NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "High settlement volume spike",
    desc: "$142,000 processed in last 60m via Stripe Connect",
    time: "4m ago",
    unread: true,
    type: "info",
  },
  {
    id: "notif-2",
    title: "Dead-letter queue retry alert",
    desc: "3 webhook payloads moved to retry buffer",
    time: "18m ago",
    unread: true,
    type: "warning",
  },
  {
    id: "notif-3",
    title: "RBAC Security Policy Updated",
    desc: "Admin user role permissions modified by security audit",
    time: "1h ago",
    unread: false,
    type: "success",
  },
]

export function HeaderNotificationsPopover() {
  const [unreadCount, setUnreadCount] = React.useState(2)

  const markAllRead = () => {
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-xs">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 sm:w-88 p-0">
        <div className="flex items-center justify-between border-b border-border/80 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <CheckCheck className="size-3" />
              <span>Mark read</span>
            </button>
          )}
        </div>

        <div className="max-h-72 divide-y divide-border/40 overflow-y-auto">
          {NOTIFICATIONS.map((item) => (
            <div
              key={item.id}
              className={`p-3 text-left transition-colors hover:bg-accent/50 ${
                item.unread ? "bg-accent/20" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {item.type === "warning" ? (
                    <AlertTriangle className="size-3.5 shrink-0 text-amber-500" />
                  ) : item.type === "success" ? (
                    <ShieldCheck className="size-3.5 shrink-0 text-emerald-500" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-indigo-500" />
                  )}
                  <span className="text-xs font-medium text-foreground">{item.title}</span>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{item.time}</span>
              </div>
              <p className="mt-1 pl-4 text-[11px] text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-border/60 bg-muted/30 p-2 text-center">
          <Link
            href="/operations/notifications"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>View all notifications</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
