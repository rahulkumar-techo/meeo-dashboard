/**
 * @file use-category-query.ts
 * @description TanStack Query hooks for category data fetching and mutations.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { categoryService } from "@/services/category.service"
import type {
  CategoryQueryParams,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  CategoryListResponseData,
} from "@/types/category"

export const CATEGORIES_QUERY_KEY = ["categories"]

/**
 * Hook to retrieve paginated categories with search and filters.
 */
export function useCategoriesQuery(params?: CategoryQueryParams) {
  return useQuery<CategoryListResponseData>({
    queryKey: [...CATEGORIES_QUERY_KEY, params],
    queryFn: async () => {
      const res = await categoryService.getCategories(params)
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
        totalPages: 1,
      }
    },
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to create a new category with automatic cache refresh.
 */
export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateCategoryPayload) => {
      return await categoryService.createCategory(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

/**
 * Hook to update an existing category.
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) => {
      return await categoryService.updateCategory(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}

/**
 * Hook to delete a category by ID.
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await categoryService.deleteCategory(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
    },
  })
}
