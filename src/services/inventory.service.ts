/**
 * @file inventory.service.ts
 * @description API communication layer for the Inventory Management module.
 * Provides client methods for stock tracking, adjustments, reservations, audit logs, and checkout QA flow.
 */

import { apiClient } from "@/config/client"
import type {
  InventoryRecord,
  LowStockAlert,
  InventoryTransaction,
  InventoryReservation,
  AddStockPayload,
  RemoveStockPayload,
  AdjustInventoryPayload,
  ReserveStockPayload,
  ConfirmReservationPayload,
  ReleaseReservationPayload,
  CheckoutSimulatePayload,
  InventoryQueryParams,
  InventoryTransactionQueryParams,
  InventoryApiResponse,
  InventoryListResponseData,
  InventoryTransactionListResponseData,
  StockActionResponseData,
  ReserveStockResponseData,
  CleanupExpiredResponseData,
  CheckoutSimulationResponseData,
} from "@/types/inventory"

export const inventoryService = {
  /**
   * 1. Get stock counts for a specific variant.
   * Auto-initializes an inventory record if none exists.
   * Endpoint: GET /api/v1/inventory/variant/:variantId
   */
  async getVariantInventory(
    variantId: string
  ): Promise<InventoryApiResponse<InventoryRecord>> {
    const response = await apiClient.get<InventoryApiResponse<InventoryRecord>>(
      `/inventory/variant/${variantId}`
    )
    return response.data
  },

  /**
   * 2. List all inventory records across catalog with search & filters.
   * Endpoint: GET /api/v1/inventory
   */
  async getInventories(
    params?: InventoryQueryParams
  ): Promise<InventoryApiResponse<InventoryListResponseData>> {
    const response = await apiClient.get<
      InventoryApiResponse<InventoryListResponseData>
    >("/inventory", {
      params,
    })
    return response.data
  },

  /**
   * 3. Get list of variants at or below their reorder threshold.
   * Endpoint: GET /api/v1/inventory/low-stock
   */
  async getLowStockAlerts(): Promise<InventoryApiResponse<LowStockAlert[]>> {
    const response = await apiClient.get<
      InventoryApiResponse<LowStockAlert[]>
    >("/inventory/low-stock")
    return response.data
  },

  /**
   * 4. Add physical stock units (Restock) and log STOCK_ADDED audit record.
   * Endpoint: POST /api/v1/inventory/add-stock
   */
  async addStock(
    payload: AddStockPayload
  ): Promise<InventoryApiResponse<StockActionResponseData>> {
    const response = await apiClient.post<
      InventoryApiResponse<StockActionResponseData>
    >("/inventory/add-stock", payload)
    return response.data
  },

  /**
   * 5. Remove stock units (Damage/Shrinkage write-off) with overselling protection.
   * Endpoint: POST /api/v1/inventory/remove-stock
   */
  async removeStock(
    payload: RemoveStockPayload
  ): Promise<InventoryApiResponse<StockActionResponseData>> {
    const response = await apiClient.post<
      InventoryApiResponse<StockActionResponseData>
    >("/inventory/remove-stock", payload)
    return response.data
  },

  /**
   * 6. Set manual stock count or update reorder alert threshold.
   * Endpoint: POST /api/v1/inventory/adjust
   */
  async adjustInventory(
    payload: AdjustInventoryPayload
  ): Promise<InventoryApiResponse<StockActionResponseData>> {
    const response = await apiClient.post<
      InventoryApiResponse<StockActionResponseData>
    >("/inventory/adjust", payload)
    return response.data
  },

  /**
   * 7. Query immutable transaction audit ledger with filters.
   * Endpoint: GET /api/v1/inventory/transactions
   */
  async getTransactions(
    params?: InventoryTransactionQueryParams
  ): Promise<InventoryApiResponse<InventoryTransactionListResponseData>> {
    const response = await apiClient.get<
      InventoryApiResponse<InventoryTransactionListResponseData>
    >("/inventory/transactions", {
      params,
    })
    return response.data
  },

  /**
   * 8. Reserve stock units for checkout with TTL expiration.
   * Endpoint: POST /api/v1/inventory/reservations/reserve
   */
  async reserveStock(
    payload: ReserveStockPayload
  ): Promise<InventoryApiResponse<ReserveStockResponseData>> {
    const response = await apiClient.post<
      InventoryApiResponse<ReserveStockResponseData>
    >("/inventory/reservations/reserve", payload)
    return response.data
  },

  /**
   * 9. Confirm active reservation upon payment confirmation.
   * Endpoint: POST /api/v1/inventory/reservations/:id/confirm
   */
  async confirmReservation(
    id: string,
    payload?: ConfirmReservationPayload
  ): Promise<InventoryApiResponse<{ reservation: InventoryReservation; inventory: any; transaction: any }>> {
    const response = await apiClient.post<
      InventoryApiResponse<{ reservation: InventoryReservation; inventory: any; transaction: any }>
    >(`/inventory/reservations/${id}/confirm`, payload || {})
    return response.data
  },

  /**
   * 10. Release stock hold back into available pool upon customer cancellation.
   * Endpoint: POST /api/v1/inventory/reservations/:id/release
   */
  async releaseReservation(
    id: string,
    payload?: ReleaseReservationPayload
  ): Promise<InventoryApiResponse<{ reservation: InventoryReservation; inventory: any; transaction: any }>> {
    const response = await apiClient.post<
      InventoryApiResponse<{ reservation: InventoryReservation; inventory: any; transaction: any }>
    >(`/inventory/reservations/${id}/release`, payload || {})
    return response.data
  },

  /**
   * 11. Run background sweeper to identify & auto-release expired stale checkout holds.
   * Endpoint: POST /api/v1/inventory/reservations/cleanup-expired
   */
  async cleanupExpiredReservations(): Promise<
    InventoryApiResponse<CleanupExpiredResponseData>
  > {
    const response = await apiClient.post<
      InventoryApiResponse<CleanupExpiredResponseData>
    >("/inventory/reservations/cleanup-expired")
    return response.data
  },

  /**
   * 12. Simulate full end-to-end checkout & payment flow in a single request.
   * Endpoint: POST /api/v1/inventory/checkout/simulate
   */
  async simulateCheckout(
    payload: CheckoutSimulatePayload
  ): Promise<InventoryApiResponse<CheckoutSimulationResponseData>> {
    const response = await apiClient.post<
      InventoryApiResponse<CheckoutSimulationResponseData>
    >("/inventory/checkout/simulate", payload)
    return response.data
  },
}
