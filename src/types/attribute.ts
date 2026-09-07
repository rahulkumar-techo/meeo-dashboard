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

export interface Attribute {
  id: string
  name: string
  values?: AttributeValue[]
  _count?: { values: number }
  createdAt?: string
  updatedAt?: string
}

export interface AttributeQueryParams {
  search?: string
  page?: number
  limit?: number
  sortBy?: "name" | "createdAt" | "updatedAt"
  sortOrder?: "asc" | "desc"
}

export interface CreateAttributePayload {
  name: string
  values?: string[]
}

export interface UpdateAttributePayload {
  name?: string
  values?: string[]
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
