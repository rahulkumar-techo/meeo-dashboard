/**
 * @file authorization.ts
 * @description Centralized TypeScript type definitions for Role-Based Access Control (RBAC) & Authorization.
 * Models granular permissions, system roles, user role assignments, active login sessions, and cache invalidation.
 */

/**
 * Granular Permission Definition
 */
export interface PermissionItem {
  id: string
  name: string
  description?: string
  domain?: string
  createdAt?: string
}

/**
 * M:N Relation wrapper for Role Permissions
 */
export interface RolePermissionItem {
  permission: PermissionItem
}

/**
 * System RBAC Role Definition
 */
export interface RoleItem {
  id: string
  name: string
  description?: string
  isSystem?: boolean
  permissions?: RolePermissionItem[] | PermissionItem[]
  usersCount?: number
  createdAt?: string
  updatedAt?: string
}

/**
 * Request payload for creating a role
 */
export interface CreateRolePayload {
  name: string
  description?: string
}

/**
 * Request payload for updating role details
 */
export interface UpdateRolePayload {
  name?: string
  description?: string
}

/**
 * Request payload for atomically replacing role permissions
 */
export interface ReplaceRolePermissionsPayload {
  permissionIds: string[]
}

/**
 * Request payload for atomically assigning roles to a user
 */
export interface AssignUserRolesPayload {
  roleIds: string[]
}

/**
 * User Login Session Definition
 */
export interface UserSessionItem {
  id: string
  userId: string
  ipAddress: string
  userAgent: string
  expiresAt: string
  createdAt: string
  isCurrent?: boolean
}

/**
 * Response from session revocation
 */
export interface RevokeSessionResponse {
  revoked: boolean
  sessionId: string
  message?: string
}

/**
 * Generic Authorization API response envelope
 */
export interface AuthorizationApiResponse<T> {
  status: "success" | "error"
  success?: boolean
  data: T
  message?: string
  statusCode?: number
}
