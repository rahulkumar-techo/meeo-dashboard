/**
 * @file use-permissions.ts
 * @description Custom React hook providing reactive Role-Based Access Control (RBAC) permission helpers.
 */

"use client"

import * as React from "react"
import { useUserStore } from "@/store/user.store"
import {
  getUserPermissions,
  isSuperAdminUser,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasNoPermissions,
  canUserAccessRoute,
  getRouteRequiredPermission,
  getModulePermissions,
  SYSTEM_PERMISSIONS,
} from "@/lib/permissions"

export function usePermissions() {
  const { user, isAuthenticated } = useUserStore()

  const permissions = React.useMemo(() => getUserPermissions(user), [user])
  const isSuperAdmin = React.useMemo(() => isSuperAdminUser(user), [user])
  const userHasNoPermissions = React.useMemo(() => hasNoPermissions(user), [user])

  const checkPermission = React.useCallback(
    (permission?: string | string[], options?: { requireAll?: boolean }) => {
      return hasPermission(user, permission, options)
    },
    [user]
  )

  const checkAnyPermission = React.useCallback(
    (perms: string[]) => {
      return hasAnyPermission(user, perms)
    },
    [user]
  )

  const checkAllPermissions = React.useCallback(
    (perms: string[]) => {
      return hasAllPermissions(user, perms)
    },
    [user]
  )

  const canAccessRoute = React.useCallback(
    (pathname: string) => {
      return canUserAccessRoute(user, pathname)
    },
    [user]
  )

  const getModuleAccess = React.useCallback(
    (moduleName: string) => {
      return getModulePermissions(user, moduleName)
    },
    [user]
  )

  return {
    user,
    isAuthenticated,
    permissions,
    isSuperAdmin,
    hasNoPermissions: userHasNoPermissions,
    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    canAccessRoute,
    getRouteRequiredPermission,
    getModulePermissions: getModuleAccess,
    SYSTEM_PERMISSIONS,
  }
}
