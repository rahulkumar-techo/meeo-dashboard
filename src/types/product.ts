/**
 * @file product.ts
 * @description Type definitions for product catalog entities, queries, payloads, and API responses.
 */

import type { Category } from "./category"
import type { Brand } from "./brand"

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type ProductSortBy = "name" | "createdAt" | "updatedAt" | "status"
export type SortOrder = "asc" | "desc"

export interface ProductImage {
  id: string
  url: string
  altText?: string | null
  sortOrder?: number
  fileId?: string | null
}

export interface ProductVariant {
  id: string
  sku: string
  title: string
  price: number
  compareAtPrice?: number | null
  inventoryQuantity?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description?: string | null
  status: ProductStatus | string
  isFeatured: boolean
  categoryId?: string | null
  brandId?: string | null
  category?: Pick<Category, "id" | "name" | "slug"> | null
  brand?: Pick<Brand, "id" | "name" | "slug" | "logoUrl"> | null
  images?: ProductImage[]
  variants?: ProductVariant[]
  variantsCount?: number
  seoTitle?: string | null
  seoDescription?: string | null
  createdById?: string | null
  createdAt: string
  updatedAt: string
}

export interface ProductQueryParams {
  search?: string
  categoryId?: string
  brandId?: string
  status?: ProductStatus
  isFeatured?: boolean
  includeArchived?: boolean
  page?: number
  limit?: number
  cursor?: string
  sortBy?: ProductSortBy
  sortOrder?: SortOrder
}

export interface CreateProductImageInput {
  url: string
  altText?: string
  sortOrder?: number
  fileId?: string
}

export interface UploadProductImagePayload {
  file: string | File
  fileName?: string
  altText?: string | null
  sortOrder?: number
}

export interface AttachProductImagePayload {
  url: string
  fileId?: string | null
  altText?: string | null
  sortOrder?: number
}

export interface CreateProductPayload {
  name: string
  slug?: string
  description?: string | null
  categoryId?: string | null
  brandId?: string | null
  status?: ProductStatus
  isFeatured?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
  images?: CreateProductImageInput[]
}

export interface UpdateProductPayload {
  name?: string
  slug?: string
  description?: string | null
  categoryId?: string | null
  brandId?: string | null
  status?: ProductStatus
  isFeatured?: boolean
  seoTitle?: string | null
  seoDescription?: string | null
}

export interface ProductPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface ProductListResponseData {
  items: Product[]
  pagination?: ProductPagination
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface ProductApiResponse<T = Product> {
  success: boolean
  message?: string
  data: T
}

export interface ProductListApiResponse {
  success: boolean
  message: string
  data: ProductListResponseData
}
