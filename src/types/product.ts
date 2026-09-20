/**
 * @file product.ts
 * @description Unified Type definitions for product catalog entities, ImageKit media, queries, and API responses.
 */

import type { Category } from "./category"
import type { Brand } from "./brand"

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED"
export type ProductSortBy = "name" | "createdAt" | "updatedAt" | "status"
export type SortOrder = "asc" | "desc"

/**
 * ImageKit Product Banner JSON asset structure
 */
export interface ProductBannerImage {
  fileId?: string | null
  url: string
  thumbnailUrl?: string | null
  altText?: string | null
}

/**
 * Unified Image model matching backend Prisma Image entity
 */
export interface ProductImage {
  id: string
  fileId?: string | null
  url: string
  thumbnailUrl?: string | null
  altText?: string | null
  sortOrder?: number
  width?: number | null
  height?: number | null
  size?: number | null
  productId?: string | null
  productVariantId?: string | null
  reviewId?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface ProductVariant {
  id: string
  productId?: string
  sku: string
  title?: string
  price: number | string
  compareAtPrice?: number | string | null
  costPrice?: number | string | null
  inventoryQuantity?: number
  images?: ProductImage[]
}

export type ProductSpecifications = Record<string, Record<string, string>>

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
  bannerImage?: ProductBannerImage | null
  images?: ProductImage[]
  specifications?: ProductSpecifications | null
  variants?: ProductVariant[]
  variantsCount?: number
  _count?: {
    variants?: number
    images?: number
    [key: string]: number | undefined
  }
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
  fileId?: string | null
  thumbnailUrl?: string | null
  altText?: string | null
  sortOrder?: number
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
  thumbnailUrl?: string | null
  altText?: string | null
  sortOrder?: number
}

export interface ImageKitAuthCredentials {
  token: string
  expire: number
  signature: string
  publicKey?: string
  urlEndpoint?: string
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
  bannerImage?: ProductBannerImage | null
  images?: CreateProductImageInput[]
  specifications?: ProductSpecifications | null
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
  bannerImage?: ProductBannerImage | null
  specifications?: ProductSpecifications | null
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
