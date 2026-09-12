/**
 * @file page-permission-badge.tsx
 * @description Contextual badge and tooltip displaying user permissions for the current page/module.
 * Informs users of their exact CRUD capabilities to avoid unauthorized requests.
 */

"use client"

import * as React from "react"
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, Crown, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { usePermissions } from "@/hooks/use-permissions"
import { cn } from "@/lib/utils"

export interface PagePermissionBadgeProps {
  /** Resource module name (e.g. "product", "order", "category", "brand", "inventory", "user", "coupon", "review", "dashboard") */
  module?: string
  /** Explicit permissions list to display */
  permissions?: string[]
  /** Optional custom class name */
  className?: string
  /** Compact style */
  compact?: boolean
}

export function PagePermissionBadge({
  module,
  permissions: explicitPerms,
  className,
  compact = false,
}: PagePermissionBadgeProps) {
  const { isSuperAdmin, getModulePermissions, permissions: userPerms } = usePermissions()

  if (isSuperAdmin) {
    return (
      <TooltipProvider delay={150}>
        <Tooltip>
          <TooltipTrigger className="inline-flex cursor-help focus:outline-none">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-amber-300/80 bg-amber-50/80 px-2 py-1 text-[11px] font-semibold text-amber-900 shadow-2xs dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 transition-all hover:bg-amber-100/80",
                className
              )}
            >
              <Crown className="size-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Full Access (Super Admin)</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" className="max-w-xs text-xs">
            <p className="font-semibold text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-500" /> Super Administrator
            </p>
            <p className="text-muted-foreground mt-1">
              You have unrestricted system privileges and can perform all operations (Read, Create, Update, Delete) across every resource.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // If a module name is provided, resolve module CRUD permissions
  const moduleAccess = module ? getModulePermissions(module) : null
  const activeActions = moduleAccess ? moduleAccess.grantedActions : []

  // Check actions
  const actionsList = [
    { key: "read", label: "Read", granted: moduleAccess?.canRead ?? true },
    { key: "create", label: "Create", granted: moduleAccess?.canCreate ?? false },
    { key: "update", label: "Update", granted: moduleAccess?.canUpdate ?? false },
    { key: "delete", label: "Delete", granted: moduleAccess?.canDelete ?? false },
  ]

  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger className="inline-flex cursor-help focus:outline-none">
          <div
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-indigo-200/80 bg-indigo-50/70 px-2 py-1 text-[11px] font-medium text-indigo-700 shadow-2xs dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 transition-all hover:bg-indigo-100/70",
              className
            )}
          >
            <ShieldCheck className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              Access:{" "}
              <strong className="font-semibold capitalize">
                {activeActions.length > 0 ? activeActions.join(" • ") : "Restricted"}
              </strong>
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="w-64 p-3 text-xs">
          <div className="space-y-2">
            <div className="flex items-center justify-between border-b border-border/60 pb-1.5">
              <span className="font-semibold text-foreground capitalize">
                {module || "Page"} Permissions
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">RBAC</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              {actionsList.map((act) => (
                <div
                  key={act.key}
                  className={cn(
                    "flex items-center gap-1.5 rounded px-1.5 py-1 text-[11px]",
                    act.granted
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 font-medium"
                      : "bg-muted/50 text-muted-foreground/60 line-through"
                  )}
                >
                  {act.granted ? (
                    <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="size-3 text-muted-foreground/60 shrink-0" />
                  )}
                  <span>{act.label}</span>
                </div>
              ))}
            </div>

            <p className="text-[10.5px] text-muted-foreground leading-tight pt-1">
              Disabled operations are locked for your role to prevent unauthorized requests.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
