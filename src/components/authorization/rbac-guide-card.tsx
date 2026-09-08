/**
 * @file rbac-guide-card.tsx
 * @description Operational Guide & Security Architecture Card for RBAC & Authorization.
 * Explains fine-grained permission models, ACID permission swaps, and real-time session invalidation.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  ShieldAlert,
  Key,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function RBACGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-xs transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                RBAC Architecture & Security Invariants Guide
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Least-privilege policy, real-time cache invalidation, and protected system roles.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            {isOpen ? (
              <>
                Hide Runbook <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                View Runbook <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-border/60 text-xs">
            {/* 1. Fine-Grained Permissions */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Key className="size-3.5 text-indigo-500" />
                <span>Granular Permission Model</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Explicit Capabilities:</strong> Permissions are bound to API route guards, not hardcoded role names.
                </p>
                <p>
                  • <strong className="text-foreground">12 Domains:</strong> Covers Products, Orders, Inventory, Payments, Users, Coupons, and System.
                </p>
              </div>
            </div>

            {/* 2. Real-Time Cache Invalidation */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldAlert className="size-3.5 text-emerald-500" />
                <span>Sub-Second Cache Busting</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Atomic Swaps:</strong> Role & permission updates execute inside ACID transactions.
                </p>
                <p>
                  • <strong className="text-foreground">Immediate Effect:</strong> Affected user JWT session caches are flushed instantly across Redis.
                </p>
              </div>
            </div>

            {/* 3. System Invariants & Protection */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Lock className="size-3.5 text-amber-500" />
                <span>System Role Invariants</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">SUPER_ADMIN:</strong> Protected role that cannot be deleted or renamed.
                </p>
                <p>
                  • <strong className="text-foreground">Audit Trail:</strong> Every role mutation writes an immutable record to <code className="font-mono text-[10px]">AuditLog</code>.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
