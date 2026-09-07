/**
 * @file use-variant-query.ts
 * @description TanStack Query hooks for Product Variants lifecycle, matrix creation, and stock updates.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { variantService } from "@/services/variant.service"
import type {
  ProductVariant,
  VariantQueryParams,
  CreateVariantPayload,
  BatchCreateVariantsPayload,
  UpdateVariantPayload,
  VariantListResponseData,
} from "@/types/variant"

export const VARIANTS_QUERY_KEY = ["variants"]

/**
 * Hook to retrieve paginated list of variants for a specific product.
 */
export function useProductVariantsQuery(productId: string, params?: VariantQueryParams) {
  return useQuery<VariantListResponseData>({
    queryKey: [...VARIANTS_QUERY_KEY, "product", productId, params],
    queryFn: async () => {
      if (!productId) {
        return { items: [], total: 0, page: 1, limit: 20, totalPages: 0 }
      }
      const res = await variantService.getProductVariants(productId, params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        const pag = data.pagination
        return {
          items: data.items,
          total: pag?.total ?? data.total ?? data.items.length,
          page: pag?.page ?? data.page ?? params?.page ?? 1,
          limit: pag?.limit ?? data.limit ?? params?.limit ?? 20,
          totalPages:
            pag?.totalPages ??
            data.totalPages ??
            Math.ceil((pag?.total ?? data.total ?? data.items.length) / (params?.limit ?? 20)),
          pagination: pag,
        }
      }

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
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to retrieve a single variant by UUID.
 */
export function useVariantQuery(id: string) {
  return useQuery<ProductVariant>({
    queryKey: [...VARIANTS_QUERY_KEY, id],
    queryFn: async () => {
      const res = await variantService.getVariantById(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to create a single variant for a product.
 */
export function useCreateVariantMutation(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateVariantPayload) => {
      return await variantService.createVariant(productId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...VARIANTS_QUERY_KEY, "product", productId] })
      queryClient.invalidateQueries({ queryKey: ["products", productId] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

/**
 * Hook to batch create multiple variants in one transaction.
 */
export function useBatchCreateVariantsMutation(productId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: BatchCreateVariantsPayload) => {
      return await variantService.batchCreateVariants(productId, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...VARIANTS_QUERY_KEY, "product", productId] })
      queryClient.invalidateQueries({ queryKey: ["products", productId] })
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

/**
 * Hook to update an existing variant.
 */
export function useUpdateVariantMutation(productId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateVariantPayload }) => {
      return await variantService.updateVariant(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...VARIANTS_QUERY_KEY, variables.id] })
      if (productId) {
        queryClient.invalidateQueries({ queryKey: [...VARIANTS_QUERY_KEY, "product", productId] })
      } else {
        queryClient.invalidateQueries({ queryKey: VARIANTS_QUERY_KEY })
      }
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}

/**
 * Hook to delete a variant.
 */
export function useDeleteVariantMutation(productId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await variantService.deleteVariant(id)
    },
    onSuccess: () => {
      if (productId) {
        queryClient.invalidateQueries({ queryKey: [...VARIANTS_QUERY_KEY, "product", productId] })
      } else {
        queryClient.invalidateQueries({ queryKey: VARIANTS_QUERY_KEY })
      }
      queryClient.invalidateQueries({ queryKey: ["products"] })
    },
  })
}
