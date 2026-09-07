/**
 * @file use-brand-query.ts
 * @description TanStack Query hooks for brand data fetching and mutations.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { brandService } from "@/services/brand.service"
import type {
  BrandQueryParams,
  CreateBrandPayload,
  UpdateBrandPayload,
  BrandListResponseData,
} from "@/types/brand"

export const BRANDS_QUERY_KEY = ["brands"]

/**
 * Hook to retrieve paginated brands with search and filters.
 */
export function useBrandsQuery(params?: BrandQueryParams) {
  return useQuery<BrandListResponseData>({
    queryKey: [...BRANDS_QUERY_KEY, params],
    queryFn: async () => {
      const res = await brandService.getBrands(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          total: data.total ?? data.items.length,
          page: data.page ?? params?.page ?? 1,
          limit: data.limit ?? params?.limit ?? 20,
          totalPages: data.totalPages ?? Math.ceil((data.total ?? data.items.length) / (params?.limit ?? 20)),
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
 * Hook to create a new brand.
 */
export function useCreateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateBrandPayload) => {
      return await brandService.createBrand(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY })
    },
  })
}

/**
 * Hook to update an existing brand.
 */
export function useUpdateBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateBrandPayload }) => {
      return await brandService.updateBrand(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY })
    },
  })
}

/**
 * Hook to delete a brand.
 */
export function useDeleteBrandMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await brandService.deleteBrand(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BRANDS_QUERY_KEY })
    },
  })
}
