/**
 * @file use-attribute-query.ts
 * @description TanStack Query hooks for Master Product Attributes.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { attributeService } from "@/services/attribute.service"
import type {
  Attribute,
  AttributeQueryParams,
  CreateAttributePayload,
  UpdateAttributePayload,
  AttributeListResponseData,
} from "@/types/attribute"

export const ATTRIBUTES_QUERY_KEY = ["attributes"]

/**
 * Hook to fetch paginated master attributes with search.
 */
export function useAttributesQuery(params?: AttributeQueryParams) {
  return useQuery<AttributeListResponseData>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, params],
    queryFn: async () => {
      const res = await attributeService.getAttributes(params)
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
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to fetch a single attribute by ID with all its values.
 */
export function useAttributeQuery(id: string) {
  return useQuery<Attribute>({
    queryKey: [...ATTRIBUTES_QUERY_KEY, id],
    queryFn: async () => {
      const res = await attributeService.getAttributeById(id)
      return res.data
    },
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook to create a new master attribute.
 */
export function useCreateAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateAttributePayload) => {
      return await attributeService.createAttribute(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
    },
  })
}

/**
 * Hook to update an attribute name and/or append new values.
 */
export function useUpdateAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateAttributePayload }) => {
      return await attributeService.updateAttribute(id, payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: [...ATTRIBUTES_QUERY_KEY, variables.id] })
    },
  })
}

/**
 * Hook to delete an attribute.
 */
export function useDeleteAttributeMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      return await attributeService.deleteAttribute(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTRIBUTES_QUERY_KEY })
    },
  })
}
