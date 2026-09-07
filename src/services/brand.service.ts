/**
 * @file brand.service.ts
 * @description Brand API service communicating with /api/v1/brand endpoints.
 */

import { apiClient } from "@/config/client"
import type {
  Brand,
  BrandQueryParams,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandApiResponse,
  BrandListApiResponse,
} from "@/types/brand"

export const brandService = {
  /**
   * Fetch brands with optional pagination, search and filtering.
   * Endpoint: GET /api/v1/brand
   */
  async getBrands(params?: BrandQueryParams): Promise<BrandListApiResponse> {
    const response = await apiClient.get<BrandListApiResponse>("/brands", {
      params,
    })
    return response.data
  },

  /**
   * Create a new brand.
   * Endpoint: POST /api/v1/brand
   */
  async createBrand(payload: CreateBrandPayload): Promise<BrandApiResponse<Brand>> {
    const response = await apiClient.post<BrandApiResponse<Brand>>("/brands", payload)
    return response.data
  },

  /**
   * Update an existing brand by ID.
   * Endpoint: PATCH /api/v1/brand/:id
   */
  async updateBrand(
    id: string,
    payload: UpdateBrandPayload
  ): Promise<BrandApiResponse<Brand>> {
    const response = await apiClient.patch<BrandApiResponse<Brand>>(`/brands/${id}`, payload)
    return response.data
  },

  /**
   * Delete a brand by ID.
   * Endpoint: DELETE /api/v1/brand/:id
   */
  async deleteBrand(id: string): Promise<BrandApiResponse<null>> {
    const response = await apiClient.delete<BrandApiResponse<null>>(`/brands/${id}`)
    return response.data
  },
}
