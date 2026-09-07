/**
 * @file operations.ts
 * @description Mock data and constants for Outbox Events, Background Jobs, and Notification Pipelines.
 */

import { OutboxEventRecord } from "@/components/modules/operations/outbox-payload-drawer"
import { WorkerNodeData } from "@/components/modules/operations/worker-health-card"

export interface OutboxEventData extends OutboxEventRecord {
  aggregateType: string
  eventName: string
  attempts: string
  payloadPreview: string
  nextRetryOrLatency: string
  timestamp: string
  idempotencyKey: string
  partition?: string | number
  failureReason?: string
  stackTrace?: string
}

export const OPERATIONS_OUTBOX_EVENTS: OutboxEventData[] = [
  {
    id: "evt_01HV99281A",
    aggregateType: "Order",
    aggregateId: "ord_10248",
    eventName: "order.inventory_reserved",
    eventType: "order.inventory_reserved",
    payload: {
      event_id: "evt_01HV99281A",
      event_name: "order.inventory_reserved",
      aggregate_type: "Order",
      aggregate_id: "ord_10248",
      order_id: "ord_10248",
      warehouse_id: "wh_east_1",
      skus: [{ sku: "APX-MSE-BLK", qty: 1, allocation_strategy: "strict_fifo" }],
      trace_id: "trc_90128a-4410",
      created_at: "2024-10-28T14:24:08.120Z",
    },
    status: "failed",
    attempts: "3 / 3 (Max)",
    payloadPreview: '{"order_id":"ord_10248","warehouse_id":"wh_east_1"...}',
    nextRetryOrLatency: "EXHAUSTED",
    createdAt: "14:24:12 EST",
    timestamp: "14:24:12",
    retries: 3,
    idempotencyKey: "idemp_ord_10248_resv_99a",
    partition: 4,
    topic: "orders.cdc.v1",
    traceId: "trc_90128a-4410",
    errorMessage: "WarehouseLockTimeoutException: Lock acquisition failed for SKU APX-MSE-BLK at wh_east_1",
    failureReason: "WarehouseLockTimeoutException: Lock acquisition failed for SKU APX-MSE-BLK at wh_east_1",
  },
  {
    id: "evt_01HV99279B",
    aggregateType: "Payment",
    aggregateId: "pay_99214",
    eventName: "payment.webhook_dispatched",
    eventType: "payment.webhook_dispatched",
    payload: {
      event_id: "evt_01HV99279B",
      event_name: "payment.webhook_dispatched",
      payment_id: "pay_99214",
      amount: 450.0,
      currency: "USD",
      gateway: "stripe",
      endpoint: "https://partner-erp.acme.com/webhooks",
    },
    status: "retrying",
    attempts: "2 / 5",
    payloadPreview: '{"payment_id":"pay_99214","provider":"stripe"...}',
    nextRetryOrLatency: "in 42s",
    createdAt: "14:23:55 EST",
    timestamp: "14:23:55",
    retries: 2,
    idempotencyKey: "idemp_pay_99214_wh_01",
    partition: 1,
    topic: "payments.webhook.v1",
    errorMessage: "HTTP 503 Service Unavailable from external merchant webhook endpoint",
    failureReason: "HTTP 503 Service Unavailable from external merchant webhook endpoint",
  },
  {
    id: "evt_01HV99278C",
    aggregateType: "Customer",
    aggregateId: "usr_88190",
    eventName: "customer.welcome_email_queued",
    eventType: "customer.welcome_email_queued",
    payload: {
      event_id: "evt_01HV99278C",
      user_id: "usr_88190",
      email: "david.m@example.com",
      tier: "VIP Gold",
    },
    status: "processing",
    attempts: "1 / 3",
    payloadPreview: '{"user_id":"usr_88190","email":"david.m@example...}',
    nextRetryOrLatency: "In-flight (#04)",
    createdAt: "14:23:50 EST",
    timestamp: "14:23:50",
    retries: 0,
    idempotencyKey: "idemp_usr_88190_welc",
    partition: 2,
    topic: "notifications.email.v1",
  },
  {
    id: "evt_01HV99275D",
    aggregateType: "Order",
    aggregateId: "ord_10247",
    eventName: "order.payment_authorized",
    eventType: "order.payment_authorized",
    payload: {
      event_id: "evt_01HV99275D",
      order_id: "ord_10247",
      amount: 1199.0,
      captured: true,
      auth_code: "AUTH_891240",
    },
    status: "published",
    attempts: "1 / 3",
    payloadPreview: '{"order_id":"ord_10247","amount":1199.00...}',
    nextRetryOrLatency: "18ms",
    createdAt: "14:05:02 EST",
    timestamp: "14:05:02",
    retries: 0,
    idempotencyKey: "idemp_ord_10247_auth",
    partition: 4,
    topic: "orders.events.v1",
  },
  {
    id: "evt_01HV99271E",
    aggregateType: "Inventory",
    aggregateId: "inv_38192",
    eventName: "inventory.stock_decremented",
    eventType: "inventory.stock_decremented",
    payload: {
      sku: "APX-DSK-PRO",
      delta: -1,
      remaining: 14,
      warehouse: "wh_us_central",
    },
    status: "published",
    attempts: "1 / 3",
    payloadPreview: '{"sku":"APX-DSK-PRO","delta":-1,"remaining":14}',
    nextRetryOrLatency: "24ms",
    createdAt: "14:05:01 EST",
    timestamp: "14:05:01",
    retries: 0,
    idempotencyKey: "idemp_inv_38192_decr",
    partition: 3,
    topic: "inventory.stream.v1",
  },
]

export const OPERATIONS_WORKERS: WorkerNodeData[] = [
  {
    id: "pod-01a",
    name: "Worker Pod 01a",
    region: "us-east-1a",
    cpuUsage: 42,
    memUsage: 68,
    activeJobs: 4,
    concurrencyLimit: 8,
    status: "healthy",
  },
  {
    id: "pod-02c",
    name: "Worker Pod 02c",
    region: "us-east-1b",
    cpuUsage: 89,
    memUsage: 94,
    activeJobs: 8,
    concurrencyLimit: 8,
    status: "degraded",
  },
  {
    id: "pod-04b",
    name: "Worker Pod 04b",
    region: "us-east-1c",
    cpuUsage: 28,
    memUsage: 45,
    activeJobs: 2,
    concurrencyLimit: 8,
    status: "healthy",
  },
]

export interface BackgroundJobData {
  id: string
  handler: string
  queue: string
  priority: string
  workerNode: string
  pid: number
  status: "running" | "completed" | "failed" | "retrying" | "queued" | string
  runtime: string
  memory: string
  startedAgo: string
  attempts: string
  args: Record<string, any>
  stackTrace?: string
  errorReason?: string
}

export const OPERATIONS_JOBS: BackgroundJobData[] = [
  {
    id: "job_4481b092",
    handler: "SyncFedExTrackingUpdatesJob",
    queue: "dead-letter-triage",
    priority: "P10 (Sync)",
    workerNode: "pod-02c.us-east-1",
    pid: 24108,
    status: "failed",
    runtime: "8.4s (Timeout)",
    memory: "84 MB",
    startedAgo: "4m ago",
    attempts: "3/3 EXHAUSTED",
    args: { order_id: "ORD-10244", carrier: "FEDEX", tracking_id: "748928192019" },
    errorReason: "HTTP 504 Gateway Timeout from FedEx API v3",
    stackTrace: `CarrierTimeoutError: Endpoint api.fedex.com/track/v3 failed after 8000ms\n  at FedExGateway.fetchStatus (/app/services/carriers/fedex.ts:142)\n  at SyncFedExTrackingUpdatesJob.perform (/app/jobs/sync_fedex.ts:38)\n  at Worker.execute (/app/node_modules/bullmq/dist/classes/worker.js:180)`,
  },
  {
    id: "job_8f29c41d",
    handler: "ProcessStripeWebhookJob",
    queue: "critical-checkout",
    priority: "P0 (Realtime)",
    workerNode: "pod-01a.us-east-1",
    pid: 9281,
    status: "running",
    runtime: "124ms",
    memory: "42 MB",
    startedAgo: "Just now",
    attempts: "1/1",
    args: { evt_id: "evt_3M4k9bL291k", amt: 29900, currency: "usd" },
  },
  {
    id: "job_1192d04a",
    handler: "GenerateQuarterlyTaxReportJob",
    queue: "order-fulfillment-sync",
    priority: "P10 (Normal)",
    workerNode: "pod-04b.us-east-1",
    pid: 18492,
    status: "running",
    runtime: "4.2s",
    memory: "188 MB",
    startedAgo: "12s ago",
    attempts: "1/1",
    args: { quarter: "Q3-2024", entity_id: "ENT_US_MAIN" },
  },
  {
    id: "job_7731a89c",
    handler: "BroadcastPushNotificationBatchJob",
    queue: "marketing-email-batch",
    priority: "P20 (Bulk)",
    workerNode: "pod-01a.us-east-1",
    pid: 9284,
    status: "completed",
    runtime: "1.8s",
    memory: "96 MB",
    startedAgo: "1m ago",
    attempts: "1/1",
    args: { campaign_id: "cmp_labor_day_2024", audience_size: 4500 },
  },
  {
    id: "job_991823ab",
    handler: "IngestSupplierCatalogFeedJob",
    queue: "order-fulfillment-sync",
    priority: "P10 (Normal)",
    workerNode: "pod-04b.us-east-1",
    pid: 18498,
    status: "retrying",
    runtime: "3.1s",
    memory: "112 MB",
    startedAgo: "2m ago",
    attempts: "2/3",
    args: { vendor: "Apex Logistics Hub", skus_count: 820 },
  },
]
