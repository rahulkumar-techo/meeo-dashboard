/**
 * @file audit-log.service.ts
 * @description Admin API communication layer for System Security & Compliance Audit Logs.
 * Connects to immutable audit trails, actor identities, and forensic state diff inspections.
 */

import { apiClient } from "@/config/client"
import type {
  AuditLogApiResponse,
  AuditLogListResponseData,
  AuditLogDetail,
  AuditLogQueryParams,
} from "@/types/audit-log"

export const auditLogService = {
  /**
   * 1. Query System Audit Logs with Filters & Pagination
   * Endpoint: GET /api/v1/admin/audit-logs
   */
  async getAuditLogs(
    params?: AuditLogQueryParams
  ): Promise<AuditLogApiResponse<AuditLogListResponseData>> {
    const response = await apiClient.get<
      AuditLogApiResponse<AuditLogListResponseData>
    >("/admin/audit-logs", {
      params,
    })
    return response.data
  },

  /**
   * 2. Inspect State Diffs & Log Record Details
   * Endpoint: GET /api/v1/admin/audit-logs/:id
   */
  async getAuditLogById(
    id: string
  ): Promise<AuditLogApiResponse<AuditLogDetail>> {
    const response = await apiClient.get<
      AuditLogApiResponse<AuditLogDetail>
    >(`/admin/audit-logs/${id}`)
    return response.data
  },
}
