/**
 * @file category.ts
 * @description Type definitions for category entities, query params, and API payloads.
 */

export type CategoryStatus = "ACTIVE" | "DRAFT" | "INACTIVE" | "ARCHIVED"

export type CategorySortBy = "name" | "createdAt" | "updatedAt" | "sortOrder"
export type SortOrder = "asc" | "desc"

export interface CategoryQueryParams {
  page?: number
  limit?: number
  sortBy?: CategorySortBy
  sortOrder?: SortOrder
  search?: string
  parentId?: string
  status?: CategoryStatus
}

export interface Category {
  id: string
  parentId: string | null
  createdById?: string | null
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  status: CategoryStatus | string
  sortOrder: number
  createdAt: string
  updatedAt: string
  parent?: {
    id: string
    name: string
    slug: string
  } | null
  children?: Category[]
  _count?: {
    products?: number
    children?: number
  }
  skusCount?: number
}

export interface CreateCategoryPayload {
  name: string
  slug: string
  parentId: string | null
  description: string | null
  imageUrl: string | null
  status: CategoryStatus | string
  sortOrder: number
}

export interface UpdateCategoryPayload {
  name?: string
  slug?: string
  parentId?: string | null
  description?: string | null
  imageUrl?: string | null
  status?: CategoryStatus | string
  sortOrder?: number
}

export interface CategoryApiResponse<T = Category> {
  success: boolean
  message?: string
  data: T
}

export interface CategoryListResponseData {
  items: Category[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface CategoryListApiResponse {
  success: boolean
  message: string
  data: CategoryListResponseData
}
