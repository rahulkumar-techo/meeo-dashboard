/**
 * @file attribute.ts
 * @description Type definitions for Master Attributes and API payload contracts.
 */

export interface AttributeValue {
  id: string
  attributeId?: string
  value: string
  createdAt?: string
  updatedAt?: string
}

export type AttributeStatus = "APPROVED" | "PENDING_APPROVAL" | "REJECTED" | "DRAFT"

export interface Attribute {
  id: string
  name: string
  values?: AttributeValue[]
  _count?: { values: number }
  isGlobal?: boolean
  status?: AttributeStatus | string
  vendorId?: string | null
  proposedBy?:
    | string
    | {
        id?: string
        name?: string
        email?: string
      }
    | null
  rejectionReason?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface AttributeQueryParams {
  search?: string
  status?: AttributeStatus | string
  isGlobal?: boolean
  vendorId?: string
  page?: number
  limit?: number
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

export interface CreateAttributePayload {
  name: string
  values?: string[]
  isGlobal?: boolean
  status?: AttributeStatus | string
  vendorId?: string
}

export interface UpdateAttributePayload {
  name?: string
  values?: string[]
  isGlobal?: boolean
  status?: AttributeStatus | string
  rejectionReason?: string | null
}

export interface AttributePagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface AttributeListResponseData {
  items: Attribute[]
  pagination?: AttributePagination
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface AttributeApiResponse<T = Attribute> {
  success: boolean
  message: string
  data: T
}

export interface AttributeListApiResponse {
  success: boolean
  message: string
  data: AttributeListResponseData
}
