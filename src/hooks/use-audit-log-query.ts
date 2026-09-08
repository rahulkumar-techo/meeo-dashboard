/**
 * @file use-audit-log-query.ts
 * @description TanStack React Query hooks for System Security & Compliance Audit Logs.
 */

"use client"

import { useQuery } from "@tanstack/react-query"
import { auditLogService } from "@/services/audit-log.service"
import type { AuditLogQueryParams } from "@/types/audit-log"

export const AUDIT_LOG_QUERY_KEYS = {
  all: ["auditLogs"] as const,
  list: (params?: AuditLogQueryParams) =>
    [...AUDIT_LOG_QUERY_KEYS.all, "list", params] as const,
  detail: (id: string) => [...AUDIT_LOG_QUERY_KEYS.all, "detail", id] as const,
}

/**
 * Hook to retrieve paginated audit log entries with filters
 */
export function useAuditLogsQuery(params?: AuditLogQueryParams) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.list(params),
    queryFn: async () => {
      const res = await auditLogService.getAuditLogs(params)
      return res.data
    },
  })
}

/**
 * Hook to inspect detailed state diffs and forensic headers for a single audit log
 */
export function useAuditLogDetailQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: AUDIT_LOG_QUERY_KEYS.detail(id),
    queryFn: async () => {
      const res = await auditLogService.getAuditLogById(id)
      return res.data
    },
    enabled: enabled && Boolean(id),
  })
}
