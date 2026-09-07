/**
 * @file brand.ts
 * @description Type definitions for brand entities, query parameters, payloads, and API responses.
 */

export type BrandStatus = "ACTIVE" | "DRAFT" | "INACTIVE" | "ARCHIVED"

export type BrandSortBy = "name" | "createdAt" | "updatedAt"
export type SortOrder = "asc" | "desc"

export interface BrandQueryParams {
  page?: number
  limit?: number
  sortBy?: BrandSortBy
  sortOrder?: SortOrder
  search?: string
  status?: BrandStatus
}

export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl?: string | null
  logo?: string | null
  description?: string | null
  status: BrandStatus | string
  createdById?: string | null
  createdAt?: string
  updatedAt?: string
  _count?: {
    products?: number
  }
}

/**
 * Payload interface for creating a new brand.
 */
export interface CreateBrandPayload {
  name: string
  slug?: string
  logoUrl?: string | null
  description?: string | null
  status?: BrandStatus | string
}

/**
 * Payload interface for updating an existing brand.
 */
export interface UpdateBrandPayload {
  name?: string
  slug?: string
  logoUrl?: string | null
  description?: string | null
  status?: BrandStatus | string
}

export interface BrandApiResponse<T = Brand> {
  success: boolean
  message?: string
  data: T
}

export interface BrandListResponseData {
  items: Brand[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BrandListApiResponse {
  success: boolean
  message: string
  data: BrandListResponseData
}
