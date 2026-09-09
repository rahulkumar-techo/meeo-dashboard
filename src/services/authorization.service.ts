/**
 * @file authorization.service.ts
 * @description Admin API communication layer for Role-Based Access Control (RBAC) & Authorization.
 * Connects to role lifecycle management, granular permission matrices, user assignments, and session revocation.
 */

import { apiClient } from "@/config/client"
import type {
  AuthorizationApiResponse,
  RoleItem,
  PermissionItem,
  CreateRolePayload,
  UpdateRolePayload,
  ReplaceRolePermissionsPayload,
  AssignUserRolesPayload,
  UserSessionItem,
  RevokeSessionResponse,
} from "@/types/authorization"

export const authorizationService = {
  /**
   * 1. List All System Roles
   * Endpoint: GET /api/v1/admin/roles
   */
  async getRoles(): Promise<AuthorizationApiResponse<RoleItem[]>> {
    const response = await apiClient.get<AuthorizationApiResponse<RoleItem[]>>(
      "/admin/roles"
    )
    return response.data
  },

  /**
   * 2. Get Role Details & Assigned Permissions
   * Endpoint: GET /api/v1/admin/roles/:roleId
   */
  async getRoleById(
    roleId: string
  ): Promise<AuthorizationApiResponse<RoleItem>> {
    const response = await apiClient.get<AuthorizationApiResponse<RoleItem>>(
      `/admin/roles/${roleId}`
    )
    return response.data
  },

  /**
   * 3. Create a New System Role
   * Endpoint: POST /api/v1/admin/roles
   */
  async createRole(
    payload: CreateRolePayload
  ): Promise<AuthorizationApiResponse<RoleItem>> {
    const response = await apiClient.post<AuthorizationApiResponse<RoleItem>>(
      "/admin/roles",
      payload
    )
    return response.data
  },

  /**
   * 4. Update Role Name & Description
   * Endpoint: PATCH /api/v1/admin/roles/:roleId
   */
  async updateRole(
    roleId: string,
    payload: UpdateRolePayload
  ): Promise<AuthorizationApiResponse<RoleItem>> {
    const response = await apiClient.patch<AuthorizationApiResponse<RoleItem>>(
      `/admin/roles/${roleId}`,
      payload
    )
    return response.data
  },

  /**
   * 5. Delete Custom Role (SUPER_ADMIN is protected)
   * Endpoint: DELETE /api/v1/admin/roles/:roleId
   */
  async deleteRole(
    roleId: string
  ): Promise<AuthorizationApiResponse<{ deleted: boolean }>> {
    const response = await apiClient.delete<
      AuthorizationApiResponse<{ deleted: boolean }>
    >(`/admin/roles/${roleId}`)
    return response.data
  },

  /**
   * 6. List All Available System Permissions
   * Endpoint: GET /api/v1/admin/permissions
   */
  async getPermissions(): Promise<AuthorizationApiResponse<PermissionItem[]>> {
    const response = await apiClient.get<
      AuthorizationApiResponse<PermissionItem[]>
    >("/admin/permissions")
    return response.data
  },

  /**
   * 7. Atomically Replace Role Permissions & Invalidate Caches
   * Endpoint: PUT /api/v1/admin/roles/:roleId/permissions
   */
  async replaceRolePermissions(
    roleId: string,
    payload: ReplaceRolePermissionsPayload
  ): Promise<AuthorizationApiResponse<RoleItem>> {
    const response = await apiClient.put<AuthorizationApiResponse<RoleItem>>(
      `/admin/roles/${roleId}/permissions`,
      payload
    )
    return response.data
  },

  /**
   * 8. Atomically Assign Roles to User & Invalidate JWT Context
   * Endpoint: PUT /api/v1/admin/users/:userId/roles
   */
  async assignUserRoles(
    userId: string,
    payload: AssignUserRolesPayload
  ): Promise<AuthorizationApiResponse<any>> {
    const response = await apiClient.put<AuthorizationApiResponse<any>>(
      `/admin/users/${userId}/roles`,
      payload
    )
    return response.data
  },

  /**
   * 9. List Active User Login Sessions
   * Endpoint: GET /api/v1/admin/users/:userId/sessions
   */
  async getUserSessions(
    userId: string
  ): Promise<AuthorizationApiResponse<UserSessionItem[]>> {
    const response = await apiClient.get<
      AuthorizationApiResponse<UserSessionItem[]>
    >(`/admin/users/${userId}/sessions`)
    return response.data
  },

  /**
   * 10. Forcibly Revoke Active User Login Session
   * Endpoint: DELETE /api/v1/admin/users/:userId/sessions/:sessionId
   */
  async revokeUserSession(
    userId: string,
    sessionId: string
  ): Promise<AuthorizationApiResponse<RevokeSessionResponse>> {
    const response = await apiClient.delete<
      AuthorizationApiResponse<RevokeSessionResponse>
    >(`/admin/users/${userId}/sessions/${sessionId}`)
    return response.data
  },

  /**
   * 11. Forcibly Revoke All Active User Login Sessions
   * Endpoint: DELETE /api/v1/admin/users/:userId/sessions
   */
  async revokeAllUserSessions(
    userId: string
  ): Promise<AuthorizationApiResponse<{ revokedCount: number }>> {
    const response = await apiClient.delete<
      AuthorizationApiResponse<{ revokedCount: number }>
    >(`/admin/users/${userId}/sessions`)
    return response.data
  },
}

