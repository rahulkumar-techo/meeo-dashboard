/**
 * @file order.ts
 * @description Centralized TypeScript type definitions for the Order Management Admin Module.
 * Covers platform orders, fulfillment state machine, shipping logistics, analytics metrics, and audit records.
 */

/**
 * Valid order status states across the platform lifecycle
 */
export type OrderStatus =
  | "PENDING"
  | "PAYMENT_PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED"

/**
 * Customer profile summary attached to order records
 */
export interface OrderUser {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
  avatar?: string | null
}

/**
 * Shipping & Delivery address snapshot
 */
export interface OrderAddress {
  recipientName: string
  phone?: string | null
  addressLine1: string
  addressLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
}

/**
 * Variant snapshot attached to line items
 */
export interface OrderVariantSnapshot {
  sku?: string
  barcode?: string
  thumbnail?: string | null
  attributes?: Array<{ value: string; attribute: string }>
}

/**
 * Line item snapshot in an order
 */
export interface OrderItem {
  id: string
  productId?: string
  variantId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number | string
  totalPrice?: number | string
  total?: number | string
  discountTotal?: number | string
  taxTotal?: number | string
  image?: string | null
  variantSnapshot?: OrderVariantSnapshot | null
}

/**
 * Status transition history log entry
 */
export interface OrderStatusHistory {
  id?: string
  previousStatus?: OrderStatus | null
  newStatus: OrderStatus
  reason?: string | null
  changedBy?: string | null
  createdAt: string
}

/**
 * Logistics shipment data attached when order is dispatched
 */
export interface OrderShipment {
  carrier: string
  trackingNumber: string
  trackingUrl?: string | null
  estimatedDeliveryAt?: string | null
  shippedAt?: string | null
  receivedBy?: string | null
  deliveryNotes?: string | null
  notes?: string | null
}

/**
 * Main Admin Order structure
 */
export interface AdminOrder {
  id: string
  orderNumber: string
  userId: string
  status: OrderStatus
  currency: string
  subtotal: number | string
  discountTotal: number | string
  shippingTotal: number | string
  taxTotal: number | string
  grandTotal: number | string
  financials?: {
    currency?: string
    subtotal?: number | string
    discountTotal?: number | string
    taxTotal?: number | string
    shippingTotal?: number | string
    grandTotal?: number | string
  } | null
  notes?: string | null
  user?: OrderUser | null
  customer?: OrderUser | null
  address?: OrderAddress | null
  shippingAddress?: OrderAddress | null
  itemCount?: number
  items?: OrderItem[]
  statusHistory?: OrderStatusHistory[]
  shipment?: OrderShipment | null
  coupon?: any
  reservations?: any[]
  createdAt: string
  updatedAt?: string
}

/**
 * Order Financials sub-object from metrics endpoint
 */
export interface AdminOrderFinancials {
  totalRevenue: number
  averageOrderValue: number
  paidOrderCount?: number
}

/**
 * Order Analytics & Operational Metrics
 */
export interface AdminOrderMetrics {
  totalOrders: number
  totalRevenue: number
  averageOrderValue: number
  activeFulfillments: number
  fulfilledOrders?: number
  activeFulfillmentCount?: number
  countsByStatus?: Record<string, number | undefined>
  financials?: AdminOrderFinancials
  currency?: string
  statusCounts: {
    PENDING?: number
    PAYMENT_PENDING?: number
    CONFIRMED?: number
    PROCESSING?: number
    SHIPPED?: number
    DELIVERED?: number
    CANCELLED?: number
    EXPIRED?: number
    REFUNDED?: number
    [key: string]: number | undefined
  }
}

// ---------------------------------------------------------------------------
// Request Payloads
// ---------------------------------------------------------------------------

/**
 * Payload for dispatching an order
 * Endpoint: POST /api/v1/orders/:id/ship
 */
export interface ShipOrderPayload {
  carrier: string
  trackingNumber: string
  trackingUrl?: string
  estimatedDeliveryAt?: string
  notes?: string
}

/**
 * Payload for marking an order as delivered
 * Endpoint: POST /api/v1/orders/:id/deliver
 */
export interface DeliverOrderPayload {
  receivedBy?: string
  deliveryNotes?: string
}

/**
 * Payload for manual status transition
 * Endpoint: PATCH /api/v1/orders/:id/status
 */
export interface UpdateOrderStatusPayload {
  status: OrderStatus
  reason?: string
}

/**
 * Payload for cancelling an order
 * Endpoint: POST /api/v1/orders/:id/cancel
 */
export interface CancelOrderPayload {
  reason?: string
}

/**
 * Payload for running the abandoned checkout sweeper
 * Endpoint: POST /api/v1/orders/expire-stale
 */
export interface ExpireStaleOrdersPayload {
  olderThanMinutes?: number
}

// ---------------------------------------------------------------------------
// Query Parameters
// ---------------------------------------------------------------------------

/**
 * Query parameters for admin orders list
 * Endpoint: GET /api/v1/orders/admin
 */
export interface AdminOrderQueryParams {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus | string
  startDate?: string
  endDate?: string
}

/**
 * Query parameters for metrics aggregation
 * Endpoint: GET /api/v1/orders/admin/metrics
 */
export interface AdminOrderMetricsQueryParams {
  startDate?: string
  endDate?: string
}

// ---------------------------------------------------------------------------
// API Response Types
// ---------------------------------------------------------------------------

export interface OrderApiResponse<T> {
  success: boolean
  message: string
  data: T
  statusCode?: number
}

export interface AdminOrderListResponseData {
  items: AdminOrder[]
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface ExpireStaleOrdersResponseData {
  expiredCount: number
  cutoffTime: string
  expiredOrderIds: string[]
}
