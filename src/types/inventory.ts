/**
 * @file inventory.ts
 * @description Centralized TypeScript type definitions for the Inventory Management Module.
 * Covers stock levels, audit transactions, checkout holds/reservations, and QA simulation workflows.
 */

/**
 * Product Variant metadata attached to inventory records
 */
export interface ProductVariantInfo {
  id: string
  sku: string
  barcode?: string | null
  price?: number | string | null
  product?: {
    id: string
    name: string
    slug?: string
  } | null
}

/**
 * Main Inventory Record representing live stock state for a product variant
 */
export interface InventoryRecord {
  id: string
  variantId: string
  availableQuantity: number
  reservedQuantity: number
  reorderLevel: number
  totalStock?: number
  isLowStock?: boolean
  variant?: ProductVariantInfo | null
  createdAt: string
  updatedAt: string
}

/**
 * Low Stock Alert record for urgent replenishment triage
 */
export interface LowStockAlert {
  id: string
  variantId: string
  availableQuantity: number
  reservedQuantity: number
  reorderLevel: number
  shortage: number
  variant?: {
    id?: string
    sku: string
    barcode?: string | null
    price?: number | string | null
    product?: {
      id?: string
      name: string
      slug?: string
    } | null
  } | null
}

/**
 * Supported types for immutable transaction ledger logs
 */
export type InventoryTransactionType =
  | "STOCK_ADDED"
  | "STOCK_REMOVED"
  | "ORDER_RESERVED"
  | "ORDER_CONFIRMED"
  | "ORDER_CANCELLED"
  | "RETURNED"
  | "MANUAL_ADJUSTMENT"

/**
 * Immutable Transaction Ledger Entry
 */
export interface InventoryTransaction {
  id: string
  variantId: string
  type: InventoryTransactionType
  quantity: number
  note?: string | null
  referenceType?: string | null
  referenceId?: string | null
  createdAt: string
  variant?: {
    id?: string
    sku: string
    barcode?: string | null
    product?: {
      id?: string
      name: string
      slug?: string
    } | null
  } | null
}

/**
 * Checkout Reservation Status
 */
export type ReservationStatus = "ACTIVE" | "CONFIRMED" | "RELEASED" | "EXPIRED"

/**
 * Reservation record representing temporary checkout hold
 */
export interface InventoryReservation {
  id: string
  variantId: string
  quantity: number
  status: ReservationStatus
  orderId?: string | null
  expiresAt: string
  createdAt: string
  updatedAt?: string
  variant?: {
    id?: string
    sku: string
    product?: {
      id?: string
      name: string
    } | null
  } | null
}

// ---------------------------------------------------------------------------
// Request Payloads
// ---------------------------------------------------------------------------

/**
 * Payload for adding physical stock units (Restock)
 * Endpoint: POST /api/v1/inventory/add-stock
 */
export interface AddStockPayload {
  variantId: string
  quantity: number
  note?: string
  referenceType?: string
  referenceId?: string
}

/**
 * Payload for removing stock units (Damage/Shrinkage write-off)
 * Endpoint: POST /api/v1/inventory/remove-stock
 */
export interface RemoveStockPayload {
  variantId: string
  quantity: number
  note?: string
  referenceType?: string
  referenceId?: string
}

/**
 * Payload for manual stock count adjustment & reorder threshold setup
 * Endpoint: POST /api/v1/inventory/adjust
 */
export interface AdjustInventoryPayload {
  variantId: string
  availableQuantity: number
  reorderLevel?: number
  note?: string
}

/**
 * Payload for reserving stock during checkout
 * Endpoint: POST /api/v1/inventory/reservations/reserve
 */
export interface ReserveStockPayload {
  variantId: string
  quantity: number
  orderId?: string
  expiresInMinutes?: number
}

/**
 * Payload for confirming reservation on payment completion
 * Endpoint: POST /api/v1/inventory/reservations/:id/confirm
 */
export interface ConfirmReservationPayload {
  orderId?: string
}

/**
 * Payload for releasing stock reservation
 * Endpoint: POST /api/v1/inventory/reservations/:id/release
 */
export interface ReleaseReservationPayload {
  reason?: string
}

/**
 * Payload for end-to-end checkout & payment flow simulation
 * Endpoint: POST /api/v1/inventory/checkout/simulate
 */
export interface CheckoutSimulatePayload {
  variantId: string
  quantity: number
  simulatePaymentSuccess: boolean
  holdMinutes?: number
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

/**
 * Query parameters for listing inventory levels
 * Endpoint: GET /api/v1/inventory
 */
export interface InventoryQueryParams {
  page?: number
  limit?: number
  search?: string
  lowStockOnly?: boolean
}

/**
 * Query parameters for filtering the immutable transaction audit ledger
 * Endpoint: GET /api/v1/inventory/transactions
 */
export interface InventoryTransactionQueryParams {
  variantId?: string
  type?: InventoryTransactionType | string
  referenceType?: string
  referenceId?: string
  page?: number
  limit?: number
  startDate?: string
  endDate?: string
}

// ---------------------------------------------------------------------------
// Response Types
// ---------------------------------------------------------------------------

/**
 * Generic API response wrapper matching backend response shape
 */
export interface InventoryApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}

/**
 * Paginated Inventory List response data
 */
export interface InventoryListResponseData {
  items: InventoryRecord[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Paginated Transaction Audit Ledger response data
 */
export interface InventoryTransactionListResponseData {
  items: InventoryTransaction[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

/**
 * Response shape for add/remove/adjust actions
 */
export interface StockActionResponseData {
  inventory: Partial<InventoryRecord> & {
    id?: string
    variantId?: string
    availableQuantity: number
    reservedQuantity?: number
    reorderLevel?: number
  }
  transaction?: InventoryTransaction
}

/**
 * Response shape for reservation creation
 */
export interface ReserveStockResponseData {
  reservation: InventoryReservation
  inventory: {
    availableQuantity: number
    reservedQuantity: number
  }
  transaction?: {
    type: string
    quantity: number
  }
}

/**
 * Response shape for expired reservations cleanup sweeper
 */
export interface CleanupExpiredResponseData {
  expiredCount: number
  restoredUnits: number
  timestamp: string
}

/**
 * Timeline step in checkout simulation
 */
export interface SimulationTimelineStep {
  step: number
  action: string
  status: "SUCCESS" | "FAILED" | "COMPLETED" | "RESTORED"
  message: string
}

/**
 * Response shape for checkout simulation QA endpoint
 */
export interface CheckoutSimulationResponseData {
  flowStatus: string
  variantId: string
  quantity: number
  timeline: SimulationTimelineStep[]
  finalInventory?: {
    availableQuantity: number
    reservedQuantity: number
  }
}
