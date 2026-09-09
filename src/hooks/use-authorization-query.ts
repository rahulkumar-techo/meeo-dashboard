/**
 * @file use-authorization-query.ts
 * @description TanStack React Query hooks for Role-Based Access Control (RBAC) & Authorization.
 */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { authorizationService } from "@/services/authorization.service"
import type {
  CreateRolePayload,
  UpdateRolePayload,
  ReplaceRolePermissionsPayload,
  AssignUserRolesPayload,
} from "@/types/authorization"

export const AUTHORIZATION_QUERY_KEYS = {
  all: ["authorization"] as const,
  roles: () => [...AUTHORIZATION_QUERY_KEYS.all, "roles"] as const,
  roleDetail: (id: string) =>
    [...AUTHORIZATION_QUERY_KEYS.roles(), "detail", id] as const,
  permissions: () => [...AUTHORIZATION_QUERY_KEYS.all, "permissions"] as const,
  userSessions: (userId: string) =>
    [...AUTHORIZATION_QUERY_KEYS.all, "users", userId, "sessions"] as const,
}

/**
 * Hook to retrieve all system roles
 */
export function useRolesQuery() {
  return useQuery({
    queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
    queryFn: async () => {
      const res = await authorizationService.getRoles()
      return res.data
    },
  })
}

/**
 * Hook to retrieve single role details
 */
export function useRoleDetailQuery(roleId: string, enabled = true) {
  return useQuery({
    queryKey: AUTHORIZATION_QUERY_KEYS.roleDetail(roleId),
    queryFn: async () => {
      const res = await authorizationService.getRoleById(roleId)
      return res.data
    },
    enabled: enabled && Boolean(roleId),
  })
}

/**
 * Hook to retrieve all available system permissions
 */
export function usePermissionsQuery() {
  return useQuery({
    queryKey: AUTHORIZATION_QUERY_KEYS.permissions(),
    queryFn: async () => {
      const res = await authorizationService.getPermissions()
      return res.data
    },
    staleTime: 5 * 60 * 1000, // 5 min cache for permission catalog
  })
}

/**
 * Hook to create a new role
 */
export function useCreateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateRolePayload) =>
      authorizationService.createRole(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
      })
    },
  })
}

/**
 * Hook to update role details
 */
export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string
      payload: UpdateRolePayload
    }) => authorizationService.updateRole(roleId, payload),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
      })
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roleDetail(roleId),
      })
    },
  })
}

/**
 * Hook to delete a custom role
 */
export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (roleId: string) => authorizationService.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
      })
    },
  })
}

/**
 * Hook to atomically replace role permissions
 */
export function useReplaceRolePermissionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: string
      payload: ReplaceRolePermissionsPayload
    }) => authorizationService.replaceRolePermissions(roleId, payload),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
      })
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roleDetail(roleId),
      })
    },
  })
}

/**
 * Hook to assign or replace user roles
 */
export function useAssignUserRolesMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string
      payload: AssignUserRolesPayload
    }) => authorizationService.assignUserRoles(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] })
      queryClient.invalidateQueries({ queryKey: ["user"] })
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.roles(),
      })
    },
  })
}

/**
 * Hook to list active user login sessions
 */
export function useUserSessionsQuery(userId: string, enabled = true) {
  return useQuery({
    queryKey: AUTHORIZATION_QUERY_KEYS.userSessions(userId),
    queryFn: async () => {
      const res = await authorizationService.getUserSessions(userId)
      return res.data
    },
    enabled: enabled && Boolean(userId),
  })
}

/**
 * Hook to revoke user session
 */
export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      userId,
      sessionId,
    }: {
      userId: string
      sessionId: string
    }) => authorizationService.revokeUserSession(userId, sessionId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.userSessions(userId),
      })
    },
  })
}

/**
 * Hook to revoke all user sessions
 */
export function useRevokeAllUserSessionsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => authorizationService.revokeAllUserSessions(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({
        queryKey: AUTHORIZATION_QUERY_KEYS.userSessions(userId),
      })
    },
  })
}

