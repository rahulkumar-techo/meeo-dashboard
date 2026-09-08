/**
 * @file header-notifications-popover.tsx
 * @description Header bell popover with unread counter badge, audio chime notifications, and quick dispatcher link.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShieldCheck,
  ArrowUpRight,
  Volume2,
  VolumeX,
  Play,
  Inbox,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationAudio } from "@/lib/notification-sound"

export function HeaderNotificationsPopover() {
  const [notifications, setNotifications] = React.useState<
    {
      id: string
      title: string
      desc: string
      time: string
      unread: boolean
      type: "info" | "warning" | "success"
    }[]
  >([])
  const [isMuted, setIsMuted] = React.useState(false)

  React.useEffect(() => {
    setIsMuted(notificationAudio.getIsMuted())
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
  }

  const toggleSound = () => {
    const next = !isMuted
    setIsMuted(next)
    notificationAudio.setMuted(next)
    if (!next) {
      notificationAudio.playChime()
    }
  }

  const handleTestChime = () => {
    notificationAudio.playChime()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-84 sm:w-92 p-0">
        {/* Popover Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-3.5 py-2.5 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">
              Notifications & Alerts
            </span>
            {unreadCount > 0 && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSound}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title={isMuted ? "Unmute Chime" : "Mute Chime"}
            >
              {isMuted ? (
                <VolumeX className="size-3.5 text-muted-foreground" />
              ) : (
                <Volume2 className="size-3.5 text-indigo-600 dark:text-indigo-400" />
              )}
            </button>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <CheckCheck className="size-3" />
                <span>Mark read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="max-h-72 divide-y divide-border/40 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground space-y-1">
              <Inbox className="size-6 mx-auto text-muted-foreground/60" />
              <div className="text-xs font-medium">No New Notifications</div>
              <div className="text-[10px]">All system and channel feeds are up to date.</div>
            </div>
          ) : (
            notifications.map((item) => (
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
                    <span className="text-xs font-medium text-foreground">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 pl-4 text-[11px] text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/60 bg-muted/30 p-2.5 flex items-center justify-between text-xs">
          <button
            onClick={handleTestChime}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Play className="size-3 text-indigo-500" />
            <span>Test Sound</span>
          </button>

          <Link
            href="/operations/notifications"
            className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <span>Dispatch & Logs Console</span>
            <ArrowUpRight className="size-3" />
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
