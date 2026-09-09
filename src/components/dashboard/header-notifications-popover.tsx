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
import { useSocket } from "@/context/socket-provider"

export function HeaderNotificationsPopover() {
  const { socket, isConnected } = useSocket()
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

  // Listen to live socket events to enrich notification popover feed
  React.useEffect(() => {
    if (!socket || !isConnected) return

    const formatNow = () => "Just now"

    const onOrderCreated = ({ data }: any) => {
      const id = data?.orderId || data?.orderNumber || Date.now().toString()
      const title = `New Order #${data?.orderNumber ?? data?.orderId ?? "Placed"}`
      const desc = data?.totalAmount ? `Amount: ₹${data.totalAmount}` : "A new order was placed"

      setNotifications((prev) => [
        {
          id: `order-${id}-${Date.now()}`,
          title,
          desc,
          time: formatNow(),
          unread: true,
          type: "success",
        },
        ...prev.slice(0, 19),
      ])
    }

    const onOrderCancelled = ({ data }: any) => {
      setNotifications((prev) => [
        {
          id: `cancel-${data?.orderId}-${Date.now()}`,
          title: `Order Cancelled #${data?.orderNumber ?? data?.orderId ?? ""}`,
          desc: data?.reason ? `Reason: ${data.reason}` : "Order has been cancelled.",
          time: formatNow(),
          unread: true,
          type: "warning",
        },
        ...prev.slice(0, 19),
      ])
    }

    const onInventoryLow = ({ data }: any) => {
      setNotifications((prev) => [
        {
          id: `inv-${data?.productId || data?.sku}-${Date.now()}`,
          title: `Low Stock: ${data?.productName || data?.sku || "Product"}`,
          desc: `Only ${data?.currentStock ?? 0} units remaining in stock.`,
          time: formatNow(),
          unread: true,
          type: "warning",
        },
        ...prev.slice(0, 19),
      ])
    }

    const onPaymentRefunded = ({ data }: any) => {
      setNotifications((prev) => [
        {
          id: `refund-${data?.paymentId || data?.orderId}-${Date.now()}`,
          title: "Payment Refund Processed",
          desc: `Refund completed for order #${data?.orderId ?? data?.paymentId}`,
          time: formatNow(),
          unread: true,
          type: "info",
        },
        ...prev.slice(0, 19),
      ])
    }

    socket.on("order.created", onOrderCreated)
    socket.on("order.cancelled", onOrderCancelled)
    socket.on("inventory.low", onInventoryLow)
    socket.on("payment.refunded", onPaymentRefunded)

    return () => {
      socket.off("order.created", onOrderCreated)
      socket.off("order.cancelled", onOrderCancelled)
      socket.off("inventory.low", onInventoryLow)
      socket.off("payment.refunded", onPaymentRefunded)
    }
  }, [socket, isConnected])

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
        {/* Real-time WebSocket Blinker */}
        {isConnected && (
          <span
            className="absolute bottom-1 right-1 flex size-1.5"
            title="Real-time WebSocket Live"
          >
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500 shadow-xs" />
          </span>
        )}
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
            <span
              className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9.5px] font-medium ${
                isConnected
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}
            >
              <span className="relative flex size-1.5">
                {isConnected ? (
                  <>
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex size-1.5 rounded-full bg-amber-500" />
                )}
              </span>
              <span>{isConnected ? "LIVE FEED" : "STANDBY"}</span>
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
