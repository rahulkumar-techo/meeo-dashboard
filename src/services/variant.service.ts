/**
 * @file variant.service.ts
 * @description API communication layer for managing product SKU variants, batch matrix creation, and inventory.
 */

import { apiClient } from "@/config/client"
import type {
  ProductVariant,
  VariantQueryParams,
  CreateVariantPayload,
  BatchCreateVariantsPayload,
  UpdateVariantPayload,
  VariantApiResponse,
  VariantListApiResponse,
  BatchVariantResponseData,
} from "@/types/variant"

export const variantService = {
  /**
   * List all variants for a parent product.
   * Endpoint: GET /api/v1/products/:productId/variants
   */
  async getProductVariants(
    productId: string,
    params?: VariantQueryParams
  ): Promise<VariantListApiResponse> {
    const response = await apiClient.get<VariantListApiResponse>(
      `/products/${productId}/variants`,
      { params }
    )
    return response.data
  },

  /**
   * Create a single variant with initial inventory for a parent product.
   * Endpoint: POST /api/v1/products/:productId/variants
   */
  async createVariant(
    productId: string,
    payload: CreateVariantPayload
  ): Promise<VariantApiResponse<ProductVariant>> {
    const response = await apiClient.post<VariantApiResponse<ProductVariant>>(
      `/products/${productId}/variants`,
      payload
    )
    return response.data
  },

  /**
   * Batch create multiple variants (matrix generator) in one single transaction.
   * Endpoint: POST /api/v1/products/:productId/variants/batch
   */
  async batchCreateVariants(
    productId: string,
    payload: BatchCreateVariantsPayload
  ): Promise<VariantApiResponse<BatchVariantResponseData>> {
    const response = await apiClient.post<VariantApiResponse<BatchVariantResponseData>>(
      `/products/${productId}/variants/batch`,
      payload
    )
    return response.data
  },

  /**
   * Get variant details by Variant UUID.
   * Endpoint: GET /api/v1/variants/:id
   */
  async getVariantById(id: string): Promise<VariantApiResponse<ProductVariant>> {
    const response = await apiClient.get<VariantApiResponse<ProductVariant>>(`/variants/${id}`)
    return response.data
  },

  /**
   * Get variant details by SKU code (useful for POS / barcode scanning).
   * Endpoint: GET /api/v1/variants/sku/:sku
   */
  async getVariantBySku(sku: string): Promise<VariantApiResponse<ProductVariant>> {
    const response = await apiClient.get<VariantApiResponse<ProductVariant>>(
      `/variants/sku/${encodeURIComponent(sku)}`
    )
    return response.data
  },

  /**
   * Update variant pricing, barcode, status, or attribute associations.
   * Endpoint: PATCH /api/v1/variants/:id
   */
  async updateVariant(
    id: string,
    payload: UpdateVariantPayload
  ): Promise<VariantApiResponse<ProductVariant>> {
    const response = await apiClient.patch<VariantApiResponse<ProductVariant>>(
      `/variants/${id}`,
      payload
    )
    return response.data
  },

  /**
   * Delete a variant from the catalog.
   * Endpoint: DELETE /api/v1/variants/:id
   */
  async deleteVariant(id: string): Promise<VariantApiResponse<{ id: string }>> {
    const response = await apiClient.delete<VariantApiResponse<{ id: string }>>(
      `/variants/${id}`
    )
    return response.data
  },
}
