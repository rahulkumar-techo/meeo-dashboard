/**
 * @file dispatch-notification-dialog.tsx
 * @description Modal dialog for dispatching manual, targeted, or broadcast notifications across Email, Mobile Push, and In-App feeds.
 */

"use client"

import * as React from "react"
import {
  Send,
  Mail,
  Smartphone,
  Bell,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Layers,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSendNotificationMutation } from "@/hooks/use-notification-query"
import type {
  NotificationChannel,
  NotificationEventType,
  NotificationSendPayload,
  NotificationSendResponseData,
} from "@/types/notification"

interface DispatchNotificationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (res: NotificationSendResponseData) => void
}

const PRESET_TEMPLATES: Record<
  string,
  {
    type: NotificationEventType
    label: string
    title: string
    body: string
    suggestedChannels: NotificationChannel[]
  }
> = {
  CUSTOM: {
    type: "CUSTOM",
    label: "Custom Free-form Message",
    title: "",
    body: "",
    suggestedChannels: ["EMAIL", "IN_APP"],
  },
  PROMOTION: {
    type: "PROMOTION",
    label: "Promotional Flash Campaign",
    title: "Weekend Flash Sale - 30% Off Everything!",
    body: "Use coupon code FLASH30 at checkout before Sunday midnight to get 30% off your entire order.",
    suggestedChannels: ["EMAIL", "PUSH", "IN_APP"],
  },
  SECURITY_ALERT: {
    type: "SECURITY_ALERT",
    label: "Security & Login Notice",
    title: "Security Notice: Unusual Account Login Detected",
    body: "We detected an administrative login to your account from a new device or IP address. If this was not you, reset your password immediately.",
    suggestedChannels: ["EMAIL"],
  },
  ORDER_CONFIRMED: {
    type: "ORDER_CONFIRMED",
    label: "Order Confirmation Template",
    title: "Your Order #{{orderNumber}} is Confirmed!",
    body: "Hi {{customerName}}, thank you for your order! We have received your payment of {{currency}} {{totalAmount}} and are preparing your items.",
    suggestedChannels: ["EMAIL", "IN_APP"],
  },
  ORDER_SHIPPED: {
    type: "ORDER_SHIPPED",
    label: "Shipping & Tracking Dispatch",
    title: "Your Order #{{orderNumber}} has Shipped!",
    body: "Great news! Your package is in transit with {{carrier}} (Tracking: {{trackingNumber}}). Estimated delivery: {{estimatedDelivery}}.",
    suggestedChannels: ["EMAIL", "PUSH", "IN_APP"],
  },
  PAYMENT_SUCCESS: {
    type: "PAYMENT_SUCCESS",
    label: "Payment Receipt Confirmation",
    title: "Payment Received for Order #{{orderNumber}}",
    body: "Your payment of {{currency}} {{amount}} was successfully processed via {{provider}} (Transaction ID: {{transactionId}}).",
    suggestedChannels: ["EMAIL", "IN_APP"],
  },
  LOW_STOCK: {
    type: "LOW_STOCK",
    label: "Inventory Restock Alert (Staff)",
    title: "Urgent Stock Alert: {{productName}}",
    body: "Variant SKU {{sku}} has dropped to {{remainingStock}} units, which is below the minimum reorder threshold of {{threshold}} units.",
    suggestedChannels: ["EMAIL", "IN_APP"],
  },
}

export function DispatchNotificationDialog({
  open,
  onOpenChange,
  onSuccess,
}: DispatchNotificationDialogProps) {
  const [recipientMode, setRecipientMode] = React.useState<"user" | "email">("user")
  const [userId, setUserId] = React.useState("")
  const [recipientEmail, setRecipientEmail] = React.useState("")
  const [selectedTemplateKey, setSelectedTemplateKey] = React.useState("PROMOTION")
  const [eventType, setEventType] = React.useState<NotificationEventType>("PROMOTION")
  const [title, setTitle] = React.useState("Weekend Flash Sale - 30% Off Everything!")
  const [body, setBody] = React.useState(
    "Use coupon code FLASH30 at checkout before Sunday midnight to get 30% off your entire order."
  )
  const [channels, setChannels] = React.useState<NotificationChannel[]>([
    "EMAIL",
    "PUSH",
    "IN_APP",
  ])
  const [metadataJson, setMetadataJson] = React.useState<string>("")
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)
  const [result, setResult] = React.useState<NotificationSendResponseData | null>(null)

  const sendMutation = useSendMutation()

  function useSendMutation() {
    return useSendNotificationMutation()
  }

  React.useEffect(() => {
    if (open) {
      setErrorMsg(null)
      setResult(null)
    }
  }, [open])

  const handleTemplateChange = (key: string) => {
    setSelectedTemplateKey(key)
    const t = PRESET_TEMPLATES[key]
    if (t) {
      setEventType(t.type)
      if (t.title) setTitle(t.title)
      if (t.body) setBody(t.body)
      setChannels(t.suggestedChannels)
    }
  }

  const toggleChannel = (ch: NotificationChannel) => {
    setChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    if (channels.length === 0) {
      setErrorMsg("Please select at least one delivery channel (Email, Push, or In-App).")
      return
    }

    if (recipientMode === "user" && (channels.includes("PUSH") || channels.includes("IN_APP")) && !userId.trim()) {
      setErrorMsg("Target User ID (UUID) is required when delivering via Push or In-App feeds.")
      return
    }

    if (recipientMode === "email" && !recipientEmail.trim()) {
      setErrorMsg("Direct recipient email is required.")
      return
    }

    let parsedData: Record<string, any> | undefined = undefined
    if (metadataJson.trim()) {
      try {
        parsedData = JSON.parse(metadataJson)
      } catch {
        setErrorMsg("Invalid JSON metadata format. Please verify syntax.")
        return
      }
    }

    const payload: NotificationSendPayload = {
      userId: recipientMode === "user" && userId.trim() ? userId.trim() : undefined,
      recipientEmail:
        recipientMode === "email" && recipientEmail.trim()
          ? recipientEmail.trim()
          : undefined,
      type: eventType,
      title: title.trim(),
      body: body.trim(),
      channels,
      data: parsedData,
    }

    try {
      const res = await sendMutation.mutateAsync(payload)
      setResult(res.data)
      onSuccess?.(res.data)
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to dispatch notification."
      setErrorMsg(msg)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base">
                  Dispatch Notification Campaign
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Fan out transactional or marketing messages across Email, Mobile Push, and In-App.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {errorMsg && (
            <div className="my-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {result ? (
            <div className="my-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-semibold text-emerald-700 dark:text-emerald-300 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                <span>Notification Dispatched Successfully</span>
              </div>
              <p className="text-muted-foreground">
                Dispatched across {result.channelsDispatched.join(", ")}.
              </p>
              <div className="rounded border border-emerald-500/20 bg-card p-2.5 divide-y divide-border/60">
                {result.results.map((r, i) => (
                  <div key={i} className="py-1.5 flex justify-between items-center text-[11px]">
                    <span className="font-semibold text-foreground">{r.channel}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                      {r.success ? "Delivered" : `Failed: ${r.error}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-3 text-xs">
              {/* 1. Template Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-indigo-500" />
                  <span>Preset Event Template</span>
                </label>
                <select
                  value={selectedTemplateKey}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
                >
                  {Object.entries(PRESET_TEMPLATES).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Channel Multi-Select Pills */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Delivery Channels <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel("EMAIL")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                      channels.includes("EMAIL")
                        ? "border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Mail className="size-3.5" />
                    <span>Email (SMTP)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel("PUSH")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                      channels.includes("PUSH")
                        ? "border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Smartphone className="size-3.5" />
                    <span>Mobile Push</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleChannel("IN_APP")}
                    className={`flex items-center justify-center gap-2 rounded-lg border p-2.5 text-xs font-medium transition-all ${
                      channels.includes("IN_APP")
                        ? "border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Bell className="size-3.5" />
                    <span>In-App Feed</span>
                  </button>
                </div>
              </div>

              {/* 3. Recipient Targeting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold">Target Recipient</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecipientMode("user")}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        recipientMode === "user"
                          ? "bg-indigo-600 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Registered User UUID
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecipientMode("email")}
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        recipientMode === "email"
                          ? "bg-indigo-600 text-white"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Direct Email
                    </button>
                  </div>
                </div>

                {recipientMode === "user" ? (
                  <Input
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="e.g. usr-11111111-2222-3333-4444-555555555555"
                    className="font-mono text-xs"
                    required={channels.includes("PUSH") || channels.includes("IN_APP")}
                  />
                ) : (
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. customer@example.com"
                    className="font-mono text-xs"
                    required
                  />
                )}
              </div>

              {/* 4. Subject / Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Notification Title / Subject <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Flash Sale Announcement"
                  className="text-xs font-medium"
                  required
                />
              </div>

              {/* 5. Message Body */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Message Content / Body <span className="text-rose-500">*</span>
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter the notification message text..."
                  className="text-xs min-h-[85px] leading-relaxed"
                  rows={3}
                  required
                />
              </div>

              {/* 6. Optional Data Metadata */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Deep-Link / Metadata JSON (Optional)
                </label>
                <Input
                  value={metadataJson}
                  onChange={(e) => setMetadataJson(e.target.value)}
                  placeholder='{"couponCode": "FLASH30", "ctaUrl": "/checkout"}'
                  className="font-mono text-xs"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              {result ? "Close" : "Cancel"}
            </Button>
            {!result && (
              <Button
                type="submit"
                size="sm"
                disabled={sendMutation.isPending || !title.trim() || !body.trim()}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {sendMutation.isPending ? (
                  <>Dispatching...</>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Dispatch Multi-Channel
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
