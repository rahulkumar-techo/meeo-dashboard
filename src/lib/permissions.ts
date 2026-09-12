/**
 * @file permissions.ts
 * @description Centralized Role-Based Access Control (RBAC) permission helpers, constants, and utilities.
 * Handles Super Admin bypass, granular permission validation, normalized comparisons, and route gating.
 */

import type { AuthUser } from "@/types/auth"

/**
 * Standard System Permission Identifiers
 */
export const SYSTEM_PERMISSIONS = {
  // Products
  PRODUCT_READ: "product:read",
  PRODUCT_CREATE: "product:create",
  PRODUCT_UPDATE: "product:update",
  PRODUCT_DELETE: "product:delete",

  // Orders
  ORDER_READ: "order:read",
  ORDER_UPDATE: "order:update",
  ORDER_CANCEL: "order:cancel",

  // Inventory
  INVENTORY_READ: "inventory:read",
  INVENTORY_UPDATE: "inventory:update",

  // Payments
  PAYMENT_READ: "payment:read",
  PAYMENT_REFUND: "payment:refund",

  // Users & Roles
  USER_READ: "user:read",
  USER_UPDATE: "user:update",
  ROLE_READ: "role:read",
  ROLE_CREATE: "role:create",
  ROLE_UPDATE: "role:update",
  ROLE_DELETE: "role:delete",

  // System & Audit
  AUDIT_READ: "audit:read",
  SYSTEM_MANAGE: "system:manage",

  // Categories
  CATEGORY_READ: "category:read",
  CATEGORY_CREATE: "category:create",
  CATEGORY_UPDATE: "category:update",
  CATEGORY_DELETE: "category:delete",

  // Brands
  BRAND_READ: "brand:read",
  BRAND_CREATE: "brand:create",
  BRAND_UPDATE: "brand:update",
  BRAND_DELETE: "brand:delete",

  // Attributes
  ATTRIBUTE_READ: "attribute:read",
  ATTRIBUTE_CREATE: "attribute:create",
  ATTRIBUTE_UPDATE: "attribute:update",
  ATTRIBUTE_DELETE: "attribute:delete",

  // Coupons
  COUPON_READ: "coupon:read",
  COUPON_CREATE: "coupon:create",
  COUPON_UPDATE: "coupon:update",
  COUPON_DELETE: "coupon:delete",

  // Reviews
  REVIEW_READ: "review:read",
  REVIEW_MODERATE: "review:moderate",
  REVIEW_DELETE: "review:delete",

  // Dashboard
  DASHBOARD_READ: "dashboard:read",
} as const

export type SystemPermission =
  (typeof SYSTEM_PERMISSIONS)[keyof typeof SYSTEM_PERMISSIONS]

/**
 * Normalizes permission strings (handles "product.read", "product:read", "products:read", casing, whitespace).
 */
export function normalizePermission(permission: string): string {
  if (!permission) return ""
  let normalized = permission.trim().toLowerCase().replace(/\./g, ":")

  // Map plural resource to singular if standard (e.g. products:read -> product:read)
  const [resource, action] = normalized.split(":")
  if (resource && action) {
    let singularResource = resource
    if (resource.endsWith("s") && !resource.endsWith("ss") && resource !== "status") {
      singularResource = resource.slice(0, -1)
    }
    normalized = `${singularResource}:${action}`
  }

  return normalized
}

/**
 * Super Admin roles and bypass permissions that grant full access to everything.
 */
const SUPER_ADMIN_ROLES = ["SUPER_ADMIN", "SUPERADMIN", "SUPER ADMIN", "ADMIN"]
const SUPER_ADMIN_PERMISSIONS = ["system:manage", "*", "all", "admin:all"]

/**
 * Checks if a user possesses Super Admin privileges.
 */
export function isSuperAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false

  // 1. Check roles array
  if (Array.isArray(user.roles)) {
    const hasSuperRole = user.roles.some((r) =>
      SUPER_ADMIN_ROLES.includes(r.trim().toUpperCase())
    )
    if (hasSuperRole) return true
  }

  // 2. Check legacy / single role string
  if (user.role) {
    if (SUPER_ADMIN_ROLES.includes(user.role.trim().toUpperCase())) {
      return true
    }
  }

  // 3. Check permissions array for superadmin bypass tokens
  const directPermissions = user.permissions || []
  const hasSuperPerm = directPermissions.some((perm) =>
    SUPER_ADMIN_PERMISSIONS.includes(normalizePermission(perm))
  )
  if (hasSuperPerm) return true

  // 4. Check nested roleDetails permissions
  if (Array.isArray(user.roleDetails)) {
    for (const rd of user.roleDetails) {
      if (SUPER_ADMIN_ROLES.includes(rd.name?.trim().toUpperCase())) {
        return true
      }
      if (Array.isArray(rd.permissions)) {
        for (const p of rd.permissions) {
          if (SUPER_ADMIN_PERMISSIONS.includes(normalizePermission(p.name))) {
            return true
          }
        }
      }
    }
  }

  return false
}

/**
 * Collects all unique permission strings for the user (from direct array and roleDetails).
 */
export function getUserPermissions(user: AuthUser | null | undefined): string[] {
  if (!user) return []

  const permissionsSet = new Set<string>()

  // Direct permissions array
  if (Array.isArray(user.permissions)) {
    user.permissions.forEach((p) => {
      if (typeof p === "string" && p.trim()) {
        permissionsSet.add(p.trim())
      }
    })
  }

  // Permissions from roleDetails
  if (Array.isArray(user.roleDetails)) {
    user.roleDetails.forEach((rd) => {
      if (Array.isArray(rd.permissions)) {
        rd.permissions.forEach((p) => {
          if (p?.name && typeof p.name === "string" && p.name.trim()) {
            permissionsSet.add(p.name.trim())
          }
        })
      }
    })
  }

  return Array.from(permissionsSet)
}

/**
 * Checks if the user has a specific permission (or if user is Super Admin).
 */
export function hasPermission(
  user: AuthUser | null | undefined,
  requiredPermission?: string | string[],
  options: { requireAll?: boolean } = {}
): boolean {
  if (!user) return false

  // Super admin always has access
  if (isSuperAdminUser(user)) {
    return true
  }

  // If no specific permission is required, grant access
  if (!requiredPermission || (Array.isArray(requiredPermission) && requiredPermission.length === 0)) {
    return true
  }

  const userPerms = getUserPermissions(user).map(normalizePermission)

  const checkPerm = (req: string): boolean => {
    const normalizedReq = normalizePermission(req)
    // Check direct normalized match or wildcard match (e.g. product:* matches product:read)
    return userPerms.some((up) => {
      if (up === normalizedReq) return true
      if (up.endsWith(":*")) {
        const prefix = up.replace(":*", "")
        return normalizedReq.startsWith(`${prefix}:`)
      }
      return false
    })
  }

  if (Array.isArray(requiredPermission)) {
    if (options.requireAll) {
      return requiredPermission.every(checkPerm)
    }
    return requiredPermission.some(checkPerm)
  }

  return checkPerm(requiredPermission)
}

/**
 * Checks if the user has any of the given permissions.
 */
export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: string[]
): boolean {
  return hasPermission(user, permissions, { requireAll: false })
}

/**
 * Checks if the user has all of the given permissions.
 */
export function hasAllPermissions(
  user: AuthUser | null | undefined,
  permissions: string[]
): boolean {
  return hasPermission(user, permissions, { requireAll: true })
}

/**
 * Checks if a user has NO permissions at all (and is not super admin).
 */
export function hasNoPermissions(user: AuthUser | null | undefined): boolean {
  if (!user) return true
  if (isSuperAdminUser(user)) return false
  const perms = getUserPermissions(user)
  return perms.length === 0
}

/**
 * Route to required base permission mapping.
 */
export const ROUTE_PERMISSION_MAP: Record<string, string> = {
  "/": SYSTEM_PERMISSIONS.DASHBOARD_READ,
  "/dashboard": SYSTEM_PERMISSIONS.DASHBOARD_READ,
  "/analytics": SYSTEM_PERMISSIONS.DASHBOARD_READ,
  "/analytics/reports": SYSTEM_PERMISSIONS.DASHBOARD_READ,

  "/orders": SYSTEM_PERMISSIONS.ORDER_READ,
  "/products": SYSTEM_PERMISSIONS.PRODUCT_READ,
  "/products/create": SYSTEM_PERMISSIONS.PRODUCT_CREATE,
  "/categories": SYSTEM_PERMISSIONS.CATEGORY_READ,
  "/categories/create": SYSTEM_PERMISSIONS.CATEGORY_CREATE,
  "/brands": SYSTEM_PERMISSIONS.BRAND_READ,
  "/attributes": SYSTEM_PERMISSIONS.ATTRIBUTE_READ,
  "/inventory": SYSTEM_PERMISSIONS.INVENTORY_READ,

  "/customers": SYSTEM_PERMISSIONS.USER_READ,
  "/customers/360": SYSTEM_PERMISSIONS.USER_READ,
  "/reviews": SYSTEM_PERMISSIONS.REVIEW_READ,

  "/finance": SYSTEM_PERMISSIONS.PAYMENT_READ,
  "/finance/payments": SYSTEM_PERMISSIONS.PAYMENT_READ,
  "/finance/refunds": SYSTEM_PERMISSIONS.PAYMENT_REFUND,
  "/finance/transactions": SYSTEM_PERMISSIONS.PAYMENT_READ,

  "/marketing": SYSTEM_PERMISSIONS.COUPON_READ,
  "/marketing/coupons": SYSTEM_PERMISSIONS.COUPON_READ,
  "/marketing/promotions": SYSTEM_PERMISSIONS.COUPON_READ,

  "/operations": SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
  "/operations/notifications": SYSTEM_PERMISSIONS.AUDIT_READ,
  "/operations/background-jobs": SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
  "/operations/outbox-events": SYSTEM_PERMISSIONS.SYSTEM_MANAGE,

  "/admin": SYSTEM_PERMISSIONS.ROLE_READ,
  "/admin/users-roles": SYSTEM_PERMISSIONS.ROLE_READ,
  "/admin/audit-logs": SYSTEM_PERMISSIONS.AUDIT_READ,
  "/admin/settings": SYSTEM_PERMISSIONS.SYSTEM_MANAGE,
}

/**
 * Resolves the required permission for a given pathname.
 */
export function getRouteRequiredPermission(pathname: string): string | null {
  if (!pathname) return null

  // 1. Direct exact match
  if (ROUTE_PERMISSION_MAP[pathname]) {
    return ROUTE_PERMISSION_MAP[pathname]
  }

  // 2. Prefix match (longest match first)
  const sortedRoutes = Object.keys(ROUTE_PERMISSION_MAP).sort(
    (a, b) => b.length - a.length
  )

  for (const route of sortedRoutes) {
    if (route !== "/" && (pathname === route || pathname.startsWith(`${route}/`))) {
      return ROUTE_PERMISSION_MAP[route]
    }
  }

  return null
}

/**
 * Checks if user can access a specific route.
 */
export function canUserAccessRoute(
  user: AuthUser | null | undefined,
  pathname: string
): boolean {
  if (!user) return false
  if (isSuperAdminUser(user)) return true

  const reqPerm = getRouteRequiredPermission(pathname)
  if (!reqPerm) return true

  return hasPermission(user, reqPerm)
}

/**
 * Returns granular CRUD capabilities for a given resource module (e.g. "product", "order", "category").
 */
export function getModulePermissions(
  user: AuthUser | null | undefined,
  moduleName: string
) {
  const isSuper = isSuperAdminUser(user)
  const singular = normalizePermission(`${moduleName}:read`).split(":")[0]

  const canRead = isSuper || hasPermission(user, `${singular}:read`)
  const canCreate = isSuper || hasPermission(user, `${singular}:create`)
  const canUpdate = isSuper || hasPermission(user, `${singular}:update`)
  const canDelete = isSuper || hasPermission(user, `${singular}:delete`)
  const canModerate = isSuper || hasPermission(user, `${singular}:moderate`)
  const canCancel = isSuper || hasPermission(user, `${singular}:cancel`)
  const canRefund = isSuper || hasPermission(user, `${singular}:refund`)

  const grantedActions: string[] = []
  if (canRead) grantedActions.push("read")
  if (canCreate) grantedActions.push("create")
  if (canUpdate) grantedActions.push("update")
  if (canDelete) grantedActions.push("delete")
  if (canModerate) grantedActions.push("moderate")
  if (canCancel) grantedActions.push("cancel")
  if (canRefund) grantedActions.push("refund")

  return {
    module: singular,
    isSuperAdmin: isSuper,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    canModerate,
    canCancel,
    canRefund,
    grantedActions,
  }
}
