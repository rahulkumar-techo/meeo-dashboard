/**
 * @file attribute.service.ts
 * @description API communication layer for Master Product Attributes.
 */

import { apiClient } from "@/config/client"
import type {
  Attribute,
  AttributeQueryParams,
  CreateAttributePayload,
  UpdateAttributePayload,
  AttributeApiResponse,
  AttributeListApiResponse,
} from "@/types/attribute"

export const attributeService = {
  /**
   * List master attributes with optional search and pagination.
   * Endpoint: GET /api/v1/attributes
   */
  async getAttributes(params?: AttributeQueryParams): Promise<AttributeListApiResponse> {
    const response = await apiClient.get<AttributeListApiResponse>("/attributes", { params })
    return response.data
  },

  /**
   * Get a single master attribute by ID with all its values.
   * Endpoint: GET /api/v1/attributes/:id
   */
  async getAttributeById(id: string): Promise<AttributeApiResponse<Attribute>> {
    const response = await apiClient.get<AttributeApiResponse<Attribute>>(`/attributes/${id}`)
    return response.data
  },

  /**
   * Create a new master attribute with optional initial values.
   * Endpoint: POST /api/v1/attributes
   */
  async createAttribute(payload: CreateAttributePayload): Promise<AttributeApiResponse<Attribute>> {
    const response = await apiClient.post<AttributeApiResponse<Attribute>>("/attributes", payload)
    return response.data
  },

  /**
   * Update master attribute name and/or append new values.
   * Endpoint: PATCH /api/v1/attributes/:id
   */
  async updateAttribute(
    id: string,
    payload: UpdateAttributePayload
  ): Promise<AttributeApiResponse<Attribute>> {
    const response = await apiClient.patch<AttributeApiResponse<Attribute>>(
      `/attributes/${id}`,
      payload
    )
    return response.data
  },

  /**
   * Delete a master attribute (cascades values).
   * Endpoint: DELETE /api/v1/attributes/:id
   */
  async deleteAttribute(id: string): Promise<AttributeApiResponse<{ id: string }>> {
    const response = await apiClient.delete<AttributeApiResponse<{ id: string }>>(
      `/attributes/${id}`
    )
    return response.data
  },
}
