/**
 * @file variant.ts
 * @description Type definitions for product variants, SKU inventory tracking, attributes, and API contracts.
 */

export type VariantStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED"
export type VariantSortBy = "sku" | "price" | "createdAt" | "updatedAt" | "status"
export type VariantSortOrder = "asc" | "desc"

export interface VariantInventory {
  quantity?: number
  availableQuantity?: number
  reservedQuantity?: number
  reorderLevel?: number | null
}

export interface Attribute {
  id: string
  name: string
}

export interface AttributeValue {
  id: string
  value: string
  attribute?: Attribute | null
}

export interface ProductVariant {
  id: string
  productId: string
  sku: string
  barcode?: string | null
  price: number | string
  compareAtPrice?: number | string | null
  costPrice?: number | string | null
  status: VariantStatus | string
  inventory?: VariantInventory | null
  inventoryQuantity?: number
  attributeValues?: AttributeValue[]
  product?: {
    id: string
    name: string
    slug: string
  } | null
  createdAt: string
  updatedAt: string
}

export interface VariantQueryParams {
  search?: string
  status?: VariantStatus
  page?: number
  limit?: number
  sortBy?: VariantSortBy
  sortOrder?: VariantSortOrder
}

export interface CreateVariantPayload {
  sku: string
  price: number
  status?: VariantStatus
  attributeValueIds?: string[]
  initialStock?: number
  barcode?: string | null
  compareAtPrice?: number | null
  costPrice?: number | null
  reorderLevel?: number | null
}

export interface BatchCreateVariantItem {
  sku: string
  price: number
  status: VariantStatus
  attributeValueIds: string[]
  initialStock: number
  barcode?: string | null
  compareAtPrice?: number | null
  costPrice?: number | null
  reorderLevel?: number | null
}

export interface BatchCreateVariantsPayload {
  variants: BatchCreateVariantItem[]
}

export interface UpdateVariantPayload {
  sku?: string
  price?: number
  compareAtPrice?: number | null
  costPrice?: number | null
  barcode?: string | null
  status?: VariantStatus
  attributeValueIds?: string[]
}

export interface VariantPagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
}

export interface VariantListResponseData {
  items: ProductVariant[]
  pagination?: VariantPagination
  total?: number
  page?: number
  limit?: number
  totalPages?: number
}

export interface VariantApiResponse<T = ProductVariant> {
  success: boolean
  message: string
  data: T
}

export interface VariantListApiResponse {
  success: boolean
  message: string
  data: VariantListResponseData
}

export interface BatchVariantResponseData {
  count: number
  variants: Array<{
    id: string
    sku: string
    price: number
    status: string
  }>
}
