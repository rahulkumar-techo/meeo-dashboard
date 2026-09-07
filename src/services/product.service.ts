/**
 * @file product.service.ts
 * @description Product API communication layer handling catalog CRUD, publishing lifecycle, and image management.
 */

import { apiClient } from "@/config/client"
import type {
  Product,
  ProductQueryParams,
  CreateProductPayload,
  UpdateProductPayload,
  ProductApiResponse,
  ProductListApiResponse,
  ProductImage,
  UploadProductImagePayload,
  AttachProductImagePayload,
} from "@/types/product"
import type { Attribute } from "@/types/attribute"

export const productService = {
  /**
   * Fetch paginated list of catalog products.
   * Endpoint: GET /api/v1/products
   */
  async getProducts(params?: ProductQueryParams): Promise<ProductListApiResponse> {
    const response = await apiClient.get<ProductListApiResponse>("/products", {
      params,
    })
    return response.data
  },

  /**
   * Fetch a single product by ID.
   * Endpoint: GET /api/v1/products/:id
   */
  async getProductById(id: string): Promise<ProductApiResponse<Product>> {
    const response = await apiClient.get<ProductApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  /**
   * Get grouped active attributes for a specific product.
   * Endpoint: GET /api/v1/products/:id/attributes
   */
  async getProductAttributes(id: string): Promise<ProductApiResponse<Attribute[]>> {
    const response = await apiClient.get<ProductApiResponse<Attribute[]>>(`/products/${id}/attributes`)
    return response.data
  },

  /**
   * Fetch a single product by unique URL slug.
   * Endpoint: GET /api/v1/products/slug/:slug
   */
  async getProductBySlug(slug: string): Promise<ProductApiResponse<Product>> {
    const response = await apiClient.get<ProductApiResponse<Product>>(`/products/slug/${slug}`)
    return response.data
  },

  /**
   * Create a new product.
   * Endpoint: POST /api/v1/products
   */
  async createProduct(payload: CreateProductPayload): Promise<ProductApiResponse<Product>> {
    const response = await apiClient.post<ProductApiResponse<Product>>("/products", payload)
    return response.data
  },

  /**
   * Update general product details.
   * Endpoint: PATCH /api/v1/products/:id
   */
  async updateProduct(
    id: string,
    payload: UpdateProductPayload
  ): Promise<ProductApiResponse<Product>> {
    const response = await apiClient.patch<ProductApiResponse<Product>>(`/products/${id}`, payload)
    return response.data
  },

  /**
   * Publish product to ACTIVE status.
   * Endpoint: POST /api/v1/products/:id/publish
   */
  async publishProduct(id: string): Promise<ProductApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.post<ProductApiResponse<{ id: string; status: string }>>(
      `/products/${id}/publish`
    )
    return response.data
  },

  /**
   * Revert product status to DRAFT.
   * Endpoint: POST /api/v1/products/:id/draft
   */
  async draftProduct(id: string): Promise<ProductApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.post<ProductApiResponse<{ id: string; status: string }>>(
      `/products/${id}/draft`
    )
    return response.data
  },

  /**
   * Archive a product.
   * Endpoint: POST /api/v1/products/:id/archive
   */
  async archiveProduct(id: string): Promise<ProductApiResponse<{ id: string; status: string }>> {
    const response = await apiClient.post<ProductApiResponse<{ id: string; status: string }>>(
      `/products/${id}/archive`
    )
    return response.data
  },

  /**
   * Delete a product (soft delete default, permanent=true for hard delete).
   * Endpoint: DELETE /api/v1/products/:id
   */
  async deleteProduct(id: string, permanent: boolean = false): Promise<ProductApiResponse<{ id: string; permanent?: boolean }>> {
    const response = await apiClient.delete<ProductApiResponse<{ id: string; permanent?: boolean }>>(
      `/products/${id}`,
      {
        params: permanent ? { permanent: true } : undefined,
      }
    )
    return response.data
  },

  /**
   * Get ImageKit client auth credentials.
   * Endpoint: GET /api/v1/products/images/auth
   */
  async getImageKitAuth(): Promise<ProductApiResponse<{ token: string; expire: number; signature: string }>> {
    const response = await apiClient.get<ProductApiResponse<{ token: string; expire: number; signature: string }>>(
      "/products/images/auth"
    )
    return response.data
  },

  /**
   * Upload an image file for a product (JSON base64 payload or FormData).
   * Endpoint: POST /api/v1/products/:id/images/upload
   */
  async uploadProductImage(
    id: string,
    payload: UploadProductImagePayload | FormData
  ): Promise<ProductApiResponse<ProductImage>> {
    const isFormData = typeof FormData !== "undefined" && payload instanceof FormData
    const response = await apiClient.post<ProductApiResponse<ProductImage>>(
      `/products/${id}/images/upload`,
      payload,
      isFormData
        ? {
            headers: {
              "Content-Type": undefined,
            },
          }
        : undefined
    )
    return response.data
  },

  /**
   * Attach an existing image URL to product.
   * Endpoint: POST /api/v1/products/:id/images
   */
  async attachProductImage(
    id: string,
    payload: AttachProductImagePayload
  ): Promise<ProductApiResponse<ProductImage>> {
    const response = await apiClient.post<ProductApiResponse<ProductImage>>(
      `/products/${id}/images`,
      payload
    )
    return response.data
  },

  /**
   * Delete a product gallery image.
   * Endpoint: DELETE /api/v1/products/:id/images/:imageId
   */
  async deleteProductImage(
    id: string,
    imageId: string
  ): Promise<ProductApiResponse<{ deletedImageId: string }>> {
    const response = await apiClient.delete<ProductApiResponse<{ deletedImageId: string }>>(
      `/products/${id}/images/${imageId}`
    )
    return response.data
  },

  /**
   * Reorder gallery images.
   * Endpoint: PUT /api/v1/products/:id/images/reorder
   */
  async reorderProductImages(
    id: string,
    images: Array<{ id: string; sortOrder: number }>
  ): Promise<ProductApiResponse<ProductImage[]>> {
    const response = await apiClient.put<ProductApiResponse<ProductImage[]>>(
      `/products/${id}/images/reorder`,
      { images }
    )
    return response.data
  },
}
