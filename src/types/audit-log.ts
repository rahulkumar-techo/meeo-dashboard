/**
 * @file audit-log.ts
 * @description Centralized TypeScript type definitions for System Security & Compliance Audit Logs.
 * Models immutable forensic records, actor identity, sensitive data masking, state diffs, and compliance verification.
 */

/**
 * Acting Administrator Profile in Audit Records
 */
export interface AuditLogActor {
  id: string
  email: string
  name?: string
}

/**
 * Standard System Audit Log Item
 */
export interface AuditLogItem {
  id: string
  action: string
  entityType: string
  entityId: string
  oldValue?: Record<string, any> | any
  newValue?: Record<string, any> | any
  ipAddress: string
  userAgent: string
  createdAt: string
  actor?: AuditLogActor | null
}

/**
 * Comprehensive Audit Log Detail Record
 */
export type AuditLogDetail = AuditLogItem

/**
 * Pagination metadata
 */
export interface AuditLogPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Paginated Audit Logs Response Data
 */
export interface AuditLogListResponseData {
  items: AuditLogItem[]
  pagination: AuditLogPagination
}

/**
 * Query parameters for searching and filtering audit records
 */
export interface AuditLogQueryParams {
  entityType?: string
  entityId?: string
  actorId?: string
  action?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
  search?: string
}

/**
 * Generic API response envelope
 */
export interface AuditLogApiResponse<T> {
  success: boolean
  status: "success" | "error"
  data: T
  message?: string
  statusCode?: number
}
