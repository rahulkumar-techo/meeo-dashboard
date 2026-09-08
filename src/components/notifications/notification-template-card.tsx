/**
 * @file notification-template-card.tsx
 * @description Reference guide and template inventory for system notification events and variable placeholders.
 */

"use client"

import * as React from "react"
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  PackageCheck,
  Truck,
  CreditCard,
  AlertTriangle,
  Send,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const TEMPLATE_SPECS = [
  {
    type: "ORDER_CONFIRMED",
    category: "Orders",
    variables: ["customerName", "orderNumber", "currency", "totalAmount"],
    desc: "Dispatched upon payment confirmation and order creation.",
  },
  {
    type: "ORDER_SHIPPED",
    category: "Fulfillment",
    variables: ["customerName", "orderNumber", "carrier", "trackingNumber", "estimatedDelivery"],
    desc: "Dispatched when logistics package is in transit.",
  },
  {
    type: "ORDER_DELIVERED",
    category: "Fulfillment",
    variables: ["customerName", "orderNumber"],
    desc: "Dispatched upon carrier confirmation of delivery.",
  },
  {
    type: "PAYMENT_SUCCESS",
    category: "Finance",
    variables: ["customerName", "orderNumber", "currency", "amount", "provider", "transactionId"],
    desc: "Instant transactional receipt issued upon gateway capture.",
  },
  {
    type: "PAYMENT_FAILED",
    category: "Finance",
    variables: ["customerName", "orderNumber", "reason"],
    desc: "Card decline or gateway failure alert with retry link.",
  },
  {
    type: "LOW_STOCK",
    category: "Inventory",
    variables: ["productName", "sku", "remainingStock", "threshold"],
    desc: "Staff restock warning when variant drops below threshold.",
  },
]

export function NotificationTemplateCard({
  onSelectTemplate,
}: {
  onSelectTemplate?: (type: string) => void
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-background to-indigo-500/5 p-4 shadow-2xs transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Notification Templates & Multi-Channel Variables
            </h3>
            <p className="text-xs text-muted-foreground">
              Pre-rendered HTML/Push templates with dynamic placeholder injection.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <span>{isOpen ? "Hide Templates" : "View Templates"}</span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-3 border-t border-border/60 pt-3 md:grid-cols-2 lg:grid-cols-3 text-xs">
          {TEMPLATE_SPECS.map((tmpl) => (
            <div
              key={tmpl.type}
              className="rounded-lg border border-border/60 bg-card p-3 space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                    {tmpl.type}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {tmpl.category}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-[11px] mt-1 leading-relaxed">
                  {tmpl.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-border/40">
                <div className="text-[10px] text-muted-foreground font-semibold mb-1">
                  Placeholders:
                </div>
                <div className="flex flex-wrap gap-1">
                  {tmpl.variables.map((v) => (
                    <code
                      key={v}
                      className="bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono text-foreground"
                    >
                      {"{{"}
                      {v}
                      {"}}"}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
