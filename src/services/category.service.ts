/**
 * @file category.service.ts
 * @description Category API communication layer handling taxonomy creation, queries, updates, and deletion.
 */

import { apiClient } from "@/config/client"
import type {
  Category,
  CategoryQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryApiResponse,
  CategoryListApiResponse,
} from "@/types/category"

export const categoryService = {
  /**
   * Create a new category.
   * Endpoint: POST /api/v1/categories/
   * Requires category:create or product:create permission.
   */
  async createCategory(payload: CreateCategoryPayload): Promise<CategoryApiResponse<Category>> {
    const response = await apiClient.post<CategoryApiResponse<Category>>(
      "/categories/",
      payload
    )
    return response.data
  },

  /**
   * Update an existing category by ID.
   * Endpoint: PATCH /api/v1/categories/:id
   */
  async updateCategory(
    id: string,
    payload: UpdateCategoryPayload
  ): Promise<CategoryApiResponse<Category>> {
    const response = await apiClient.patch<CategoryApiResponse<Category>>(
      `/categories/${id}`,
      payload
    )
    return response.data
  },

  /**
   * Delete a category by ID.
   * Endpoint: DELETE /api/v1/categories/:id
   */
  async deleteCategory(id: string): Promise<CategoryApiResponse<null>> {
    const response = await apiClient.delete<CategoryApiResponse<null>>(`/categories/${id}`)
    return response.data
  },

  /**
   * Fetch categories with optional pagination, sorting, search and filtering.
   * Endpoint: GET /api/v1/categories/
   */
  async getCategories(params?: CategoryQueryParams): Promise<CategoryListApiResponse> {
    const response = await apiClient.get<CategoryListApiResponse>(
      "/categories/",
      { params }
    )
    return response.data
  },
}
