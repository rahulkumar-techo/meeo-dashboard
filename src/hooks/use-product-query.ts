/**
 * @file use-product-query.ts
 * @description TanStack Query hooks for product data fetching, mutations, and status transitions.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { productService } from "@/services/product.service"
import type {
  Product,
  ProductQueryParams,
  CreateProductPayload,
  UpdateProductPayload,
  UploadProductImagePayload,
  AttachProductImagePayload,
  ProductListResponseData,
} from "@/types/product"

export const PRODUCTS_QUERY_KEY = ["products"]

/**
 * Hook to retrieve paginated catalog products with search and filtering.
 */
export function useProductsQuery(params?: ProductQueryParams) {
  return useQuery<ProductListResponseData>({
    queryKey: [...PRODUCTS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await productService.getProducts(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        const pag = data.pagination
        return {
          items: data.items,
          total: pag?.total ?? data.total ?? data.items.length,
          page: pag?.page ?? data.page ?? params?.page ?? 1,
          limit: pag?.limit ?? data.limit ?? params?.limit ?? 20,
          totalPages: pag?.totalPages ?? data.totalPages ?? Math.ceil((pag?.total ?? data.total ?? data.items.length) / (params?.limit ?? 20)),
          pagination: pag,
        }
      }

      // Fallback if data is raw array
      if (Array.isArray(data)) {
        return {
          items: data,
          total: data.length,
          page: params?.page ?? 1,
          limit: params?.limit ?? 20,
          totalPages: 1,
        }
      }

      return {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      }
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to retrieve a single product by ID.
 */
export function useProductQuery(id: string) {
  return useQuery<Product>({
    queryKey: [...PRODUCTS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await productService.getProductById(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to create a new product.
 */
export function useCreateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductPayload) => {
      return await productService.createProduct(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to update an existing product.
 */
export function useUpdateProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateProductPayload }) => {
      return await productService.updateProduct(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to publish a product (transition to ACTIVE).
 */
export function usePublishProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await productService.publishProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to move product to DRAFT status.
 */
export function useDraftProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await productService.draftProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to archive a product.
 */
export function useArchiveProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await productService.archiveProduct(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to delete a product.
 */
export function useDeleteProductMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, permanent }: { id: string; permanent?: boolean }) => {
      return await productService.deleteProduct(id, permanent)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to upload an image file (JSON base64 or FormData) to a product.
 */
export function useUploadProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: UploadProductImagePayload | FormData
    }) => {
      return await productService.uploadProductImage(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to attach an existing image URL.
 */
export function useAttachProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload: AttachProductImagePayload
    }) => {
      return await productService.attachProductImage(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}

/**
 * Hook to delete an image from product.
 */
export function useDeleteProductImageMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, imageId }: { id: string; imageId: string }) => {
      return await productService.deleteProductImage(id, imageId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRODUCTS_QUERY_KEY })
    },
  })
}
