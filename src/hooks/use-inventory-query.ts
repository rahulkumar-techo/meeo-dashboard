/**
 * @file use-inventory-query.ts
 * @description TanStack React Query hooks for the Inventory Management module.
 * Provides hooks for fetching stock levels, low stock alerts, audit logs, and mutation hooks for stock actions.
 */

"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { inventoryService } from "@/services/inventory.service"
import type {
  InventoryRecord,
  LowStockAlert,
  AddStockPayload,
  RemoveStockPayload,
  AdjustInventoryPayload,
  ReserveStockPayload,
  ConfirmReservationPayload,
  ReleaseReservationPayload,
  CheckoutSimulatePayload,
  InventoryQueryParams,
  InventoryTransactionQueryParams,
  InventoryListResponseData,
  InventoryTransactionListResponseData,
} from "@/types/inventory"

export const INVENTORY_QUERY_KEY = ["inventory"]
export const INVENTORY_LOW_STOCK_KEY = ["inventory", "low-stock"]
export const INVENTORY_TRANSACTIONS_KEY = ["inventory", "transactions"]

/**
 * Hook to retrieve paginated catalog inventory levels with search & filter.
 */
export function useInventoriesQuery(params?: InventoryQueryParams) {
  return useQuery<InventoryListResponseData>({
    queryKey: [...INVENTORY_QUERY_KEY, "list", params],
    queryFn: async () => {
      const res = await inventoryService.getInventories(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Hook to retrieve inventory for a specific product variant.
 */
export function useVariantInventoryQuery(variantId: string) {
  return useQuery<InventoryRecord | null>({
    queryKey: [...INVENTORY_QUERY_KEY, "variant", variantId],
    queryFn: async () => {
      if (!variantId) return null
      const res = await inventoryService.getVariantInventory(variantId)
      return res?.data ?? null
    },
    enabled: Boolean(variantId),
    staleTime: 30 * 1000,
  })
}

/**
 * Hook to retrieve low stock alerts for replenishment triage.
 */
export function useLowStockAlertsQuery() {
  return useQuery<LowStockAlert[]>({
    queryKey: INVENTORY_LOW_STOCK_KEY,
    queryFn: async () => {
      const res = await inventoryService.getLowStockAlerts()
      const data = res?.data ?? (res as any)
      return Array.isArray(data) ? data : []
    },
    staleTime: 20 * 1000,
  })
}

/**
 * Hook to retrieve paginated immutable audit ledger transactions.
 */
export function useInventoryTransactionsQuery(
  params?: InventoryTransactionQueryParams
) {
  return useQuery<InventoryTransactionListResponseData>({
    queryKey: [...INVENTORY_TRANSACTIONS_KEY, params],
    queryFn: async () => {
      const res = await inventoryService.getTransactions(params)
      const data = res?.data ?? (res as any)

      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          pagination: data.pagination ?? {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.items.length,
            totalPages: Math.ceil(data.items.length / (params?.limit ?? 20)),
          },
        }
      }

      if (Array.isArray(data)) {
        return {
          items: data,
          pagination: {
            page: params?.page ?? 1,
            limit: params?.limit ?? 20,
            total: data.length,
            totalPages: 1,
          },
        }
      }

      return {
        items: [],
        pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }
    },
    staleTime: 15 * 1000,
  })
}

/**
 * Mutation hook to add physical stock units.
 */
export function useAddStockMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AddStockPayload) => {
      return await inventoryService.addStock(payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_LOW_STOCK_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVENTORY_QUERY_KEY, "variant", variables.variantId],
      })
    },
  })
}

/**
 * Mutation hook to remove stock units (write-off).
 */
export function useRemoveStockMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: RemoveStockPayload) => {
      return await inventoryService.removeStock(payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_LOW_STOCK_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVENTORY_QUERY_KEY, "variant", variables.variantId],
      })
    },
  })
}

/**
 * Mutation hook for manual stock count adjustments.
 */
export function useAdjustInventoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: AdjustInventoryPayload) => {
      return await inventoryService.adjustInventory(payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_LOW_STOCK_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVENTORY_QUERY_KEY, "variant", variables.variantId],
      })
    },
  })
}

/**
 * Mutation hook to reserve stock for checkout.
 */
export function useReserveStockMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: ReserveStockPayload) => {
      return await inventoryService.reserveStock(payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVENTORY_QUERY_KEY, "variant", variables.variantId],
      })
    },
  })
}

/**
 * Mutation hook to confirm an active reservation on payment completion.
 */
export function useConfirmReservationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload?: ConfirmReservationPayload
    }) => {
      return await inventoryService.confirmReservation(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
    },
  })
}

/**
 * Mutation hook to release a stock reservation.
 */
export function useReleaseReservationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string
      payload?: ReleaseReservationPayload
    }) => {
      return await inventoryService.releaseReservation(id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
    },
  })
}

/**
 * Mutation hook for expired reservation cleanup sweeper.
 */
export function useCleanupExpiredReservationsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      return await inventoryService.cleanupExpiredReservations()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_LOW_STOCK_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
    },
  })
}

/**
 * Mutation hook to execute a simulated checkout QA flow.
 */
export function useSimulateCheckoutMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CheckoutSimulatePayload) => {
      return await inventoryService.simulateCheckout(payload)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: INVENTORY_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: INVENTORY_TRANSACTIONS_KEY })
      queryClient.invalidateQueries({
        queryKey: [...INVENTORY_QUERY_KEY, "variant", variables.variantId],
      })
    },
  })
}
