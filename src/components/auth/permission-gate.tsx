/**
 * @file permission-gate.tsx
 * @description Declarative component to conditionally render or disable UI elements based on user permissions.
 */

"use client"

import * as React from "react"
import { usePermissions } from "@/hooks/use-permissions"

export interface PermissionGateProps {
  /** Permission(s) required to view or enable the children */
  permission?: string | string[]
  /** If multiple permissions provided, require all or at least one (default: false = any) */
  requireAll?: boolean
  /** Element to render when permission check fails (default: null) */
  fallback?: React.ReactNode
  /** If true, renders children with disabled state instead of hiding */
  disableInsteadOfHide?: boolean
  children: React.ReactNode
}

export function PermissionGate({
  permission,
  requireAll = false,
  fallback = null,
  disableInsteadOfHide = false,
  children,
}: PermissionGateProps) {
  const { hasPermission, isSuperAdmin } = usePermissions()

  const allowed = isSuperAdmin || hasPermission(permission, { requireAll })

  if (allowed) {
    return <>{children}</>
  }

  if (disableInsteadOfHide && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      disabled: true,
      "aria-disabled": true,
      title: "You lack the required permission to perform this action.",
      className: `${(children as any).props?.className || ""} opacity-50 cursor-not-allowed pointer-events-none`,
    })
  }

  return <>{fallback}</>
}
