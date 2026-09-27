/**
 * @file header-notifications-popover.tsx
 * @description Admin Notification Bell Popover with live multi-channel subscription,
 * real-time socket & FCM push sync, deep-linking redirections, and audio chime alerts.
 */

"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  CreditCard,
  Package,
  ArrowUpRight,

  Volume2,
  VolumeX,
  Play,
  Inbox,
  Sparkles,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { notificationAudio } from "@/lib/notification-sound"
import { useSocket } from "@/context/socket-provider"
import {
  useAdminNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "@/hooks/use-notification-query"
import { onForegroundPushMessage } from "@/lib/push-notifications"
import type { AdminNotificationItem } from "@/types/notification"


interface NotificationItemUI {
  id: string
  title: string
  desc: string
  time: string
  unread: boolean
  category: "order" | "inventory" | "payment" | "system" | "warning"
  href: string
}

function resolveNotificationRoute(type: string, data?: any): { href: string; category: NotificationItemUI["category"] } {
  const t = (type || "").toUpperCase()

  if (t.includes("ORDER") || t.includes("PURCHASE")) {
    const orderIdentifier = data?.orderNumber || data?.orderId || data?.id
    return {
      href: orderIdentifier ? `/orders?search=${encodeURIComponent(orderIdentifier)}` : "/orders",
      category: "order",
    }
  }

  if (t.includes("STOCK") || t.includes("INVENTORY")) {
    return {
      href: "/inventory",
      category: "inventory",
    }
  }

  if (t.includes("PAYMENT") || t.includes("REFUND") || t.includes("TRANSACTION")) {
    return {
      href: "/finance",
      category: "payment",
    }
  }

  return {
    href: "/operations/notifications",
    category: "system",
  }
}

function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "Just now"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Just now"

  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSec < 45) return "Just now"
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

export function HeaderNotificationsPopover() {
  const router = useRouter()
  const { socket, isConnected } = useSocket()
  const [isOpen, setIsOpen] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(false)
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set())
  const [realtimeFeed, setRealtimeFeed] = React.useState<NotificationItemUI[]>([])

  // 1. Initial data from backend admin notification API
  const { data: serverListData } = useAdminNotificationsQuery({ limit: 15 })

  React.useEffect(() => {
    setIsMuted(notificationAudio.getIsMuted())
  }, [])

  // Map server items into UI notifications
  const initialServerNotifications = React.useMemo<NotificationItemUI[]>(() => {
    if (!serverListData?.items) return []
    return serverListData.items.map((item: AdminNotificationItem) => {
      const { href, category } = resolveNotificationRoute(item.type, {
        orderId: (item as any).orderId,
        orderNumber: (item as any).orderNumber,
      })

      return {
        id: item.id,
        title: item.title,
        desc: item.body,
        time: formatRelativeTime(item.sentAt || item.createdAt),
        unread: item.status !== "READ",
        category,
        href,
      }
    })
  }, [serverListData])

  // Combine live real-time notifications with server items (deduplicating by ID)
  const allNotifications = React.useMemo(() => {
    const combined = [...realtimeFeed]
    const seenIds = new Set(realtimeFeed.map((n) => n.id))

    for (const s of initialServerNotifications) {
      if (!seenIds.has(s.id)) {
        combined.push(s)
        seenIds.add(s.id)
      }
    }

    return combined.map((n) => ({
      ...n,
      unread: readIds.has(n.id) ? false : n.unread,
    }))
  }, [realtimeFeed, initialServerNotifications, readIds])

  // 2. Real-time Admin Socket Event Channels
  React.useEffect(() => {
    if (!socket || !isConnected) return

    const pushFeedItem = (
      title: string,
      desc: string,
      category: NotificationItemUI["category"],
      href: string,
      idPrefix = "event"
    ) => {
      const newItem: NotificationItemUI = {
        id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        desc,
        time: "Just now",
        unread: true,
        category,
        href,
      }

      setRealtimeFeed((prev) => [newItem, ...prev.slice(0, 24)])
    }

    // A. Order Events (Created, Confirmed, Shipped, Delivered, Cancelled)
    const onOrderCreated = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? "New"
      const desc = data?.totalAmount ? `Amount: ₹${data.totalAmount}` : "New customer order received"
      pushFeedItem(`Order #${id} Placed`, desc, "order", `/orders?search=${encodeURIComponent(id)}`, "ord-new")
    }

    const onOrderConfirmed = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? ""
      pushFeedItem(`Order #${id} Confirmed`, "Order payment & inventory confirmed", "order", `/orders?search=${encodeURIComponent(id)}`, "ord-conf")
    }

    const onOrderShipped = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? ""
      pushFeedItem(`Order #${id} Dispatched`, "Package dispatched with courier", "order", `/orders?search=${encodeURIComponent(id)}`, "ord-ship")
    }

    const onOrderDelivered = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? ""
      pushFeedItem(`Order #${id} Delivered`, "Successfully delivered to recipient", "order", `/orders?search=${encodeURIComponent(id)}`, "ord-deliv")
    }

    const onOrderCancelled = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? ""
      const reason = data?.reason ? `Reason: ${data.reason}` : "Order was cancelled"
      pushFeedItem(`Order #${id} Cancelled`, reason, "warning", `/orders?search=${encodeURIComponent(id)}`, "ord-canc")
    }

    // B. Inventory Events
    const onInventoryLow = ({ data }: any) => {
      const name = data?.productName || data?.sku || "Product SKU"
      const stock = data?.currentStock ?? 0
      pushFeedItem(`Low Stock Alert: ${name}`, `Only ${stock} units remaining in stock.`, "inventory", "/inventory", "inv-low")
    }

    // C. Payment Events
    const onPaymentSuccess = ({ data }: any) => {
      const id = data?.orderNumber ?? data?.orderId ?? data?.paymentId ?? ""
      const amount = data?.amount ? ` ₹${data.amount}` : ""
      pushFeedItem(`Payment Captured${amount}`, `Payment completed for order #${id}`, "payment", "/finance", "pay-succ")
    }

    const onPaymentRefunded = ({ data }: any) => {
      const id = data?.orderId ?? data?.paymentId ?? ""
      pushFeedItem("Refund Processed", `Payment refund issued for order #${id}`, "payment", "/finance", "pay-ref")
    }

    // D. General In-App / Platform Broadcast Notifications
    const onNotificationCreated = (payload: any) => {
      const data = payload?.data || payload
      if (!data) return
      const { href, category } = resolveNotificationRoute(data.type, data.data)
      pushFeedItem(data.title || "Platform Alert", data.body || "New system notification", category, href, "notif-inapp")
    }

    socket.on("order.created", onOrderCreated)
    socket.on("order.confirmed", onOrderConfirmed)
    socket.on("order.shipped", onOrderShipped)
    socket.on("order.delivered", onOrderDelivered)
    socket.on("order.cancelled", onOrderCancelled)
    socket.on("inventory.low", onInventoryLow)
    socket.on("payment.success", onPaymentSuccess)
    socket.on("payment.refunded", onPaymentRefunded)
    socket.on("notification.created", onNotificationCreated)
    socket.on("notification:new", onNotificationCreated)

    return () => {
      socket.off("order.created", onOrderCreated)
      socket.off("order.confirmed", onOrderConfirmed)
      socket.off("order.shipped", onOrderShipped)
      socket.off("order.delivered", onOrderDelivered)
      socket.off("order.cancelled", onOrderCancelled)
      socket.off("inventory.low", onInventoryLow)
      socket.off("payment.success", onPaymentSuccess)
      socket.off("payment.refunded", onPaymentRefunded)
      socket.off("notification.created", onNotificationCreated)
      socket.off("notification:new", onNotificationCreated)
    }
  }, [socket, isConnected])


  // 3. Foreground FCM Push Notification Listener
  React.useEffect(() => {
    const unsubscribe = onForegroundPushMessage((payload) => {
      const title = payload?.notification?.title || payload?.data?.title || "New Push Alert"
      const desc = payload?.notification?.body || payload?.data?.body || "New message received"
      const type = payload?.data?.type || ""
      const { href, category } = resolveNotificationRoute(type, payload?.data)

      const newItem: NotificationItemUI = {
        id: `fcm-${Date.now()}`,
        title,
        desc,
        time: "Just now",
        unread: true,
        category,
        href,
      }

      setRealtimeFeed((prev) => [newItem, ...prev.slice(0, 24)])
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const markAsReadMutation = useMarkAsReadMutation()
  const markAllAsReadMutation = useMarkAllAsReadMutation()
  const { data: unreadCountFromServer } = useUnreadCountQuery()

  const unreadCount =
    typeof unreadCountFromServer === "number" && unreadCountFromServer > 0
      ? unreadCountFromServer
      : allNotifications.filter((n) => n.unread).length

  const markAllRead = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
      e.preventDefault()
    }
    const allIds = new Set(allNotifications.map((n) => n.id))
    setReadIds(allIds)
    markAllAsReadMutation.mutate()
  }

  const handleNotificationClick = (item: NotificationItemUI) => {
    // Mark this item as read locally and on server
    setReadIds((prev) => new Set([...prev, item.id]))
    markAsReadMutation.mutate(item.id)
    setIsOpen(false)
    router.push(item.href)
  }


  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const next = !isMuted
    setIsMuted(next)
    notificationAudio.setMuted(next)
    if (!next) {
      notificationAudio.playChime()
    }
  }

  const handleTestChime = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    notificationAudio.playChime()
  }

  const renderCategoryIcon = (category: NotificationItemUI["category"]) => {
    switch (category) {
      case "order":
        return <ShoppingBag className="size-3.5 shrink-0 text-indigo-500" />
      case "inventory":
        return <Package className="size-3.5 shrink-0 text-amber-500" />

      case "payment":
        return <CreditCard className="size-3.5 shrink-0 text-emerald-500" />
      case "warning":
        return <AlertTriangle className="size-3.5 shrink-0 text-rose-500" />
      default:
        return <Sparkles className="size-3.5 shrink-0 text-sky-500" />
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
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
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-84 sm:w-96 p-0 shadow-xl">
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
              <span>{isConnected ? "LIVE" : "STANDBY"}</span>
            </span>
            {unreadCount > 0 && (
              <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-400">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
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
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors ml-1"
              >
                <CheckCheck className="size-3" />
                <span>Mark all read</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feed */}
        <div className="max-h-80 divide-y divide-border/40 overflow-y-auto">
          {allNotifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground space-y-1">
              <Inbox className="size-6 mx-auto text-muted-foreground/60" />
              <div className="text-xs font-medium">No Notifications Yet</div>
              <div className="text-[10px]">All system and channel feeds are up to date.</div>
            </div>
          ) : (
            allNotifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleNotificationClick(item)}
                className={`p-3 text-left transition-colors hover:bg-accent/60 cursor-pointer group ${
                  item.unread ? "bg-indigo-500/5 dark:bg-indigo-500/10" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {renderCategoryIcon(item.category)}
                    <span className={`text-xs truncate ${item.unread ? "font-semibold text-foreground" : "font-medium text-foreground/90"}`}>
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {item.time}
                    </span>
                    {item.unread && (
                      <span className="size-1.5 rounded-full bg-indigo-600" />
                    )}
                  </div>
                </div>
                <p className="mt-1 pl-5 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                  {item.desc}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border/60 bg-muted/30 p-2.5 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleTestChime}
            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Play className="size-3 text-indigo-500" />
            <span>Test Sound</span>
          </button>

          <Link
            href="/operations/notifications"
            onClick={() => setIsOpen(false)}
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
