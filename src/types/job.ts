/**
 * @file job.ts
 * @description Centralized TypeScript type definitions for Background Jobs & Worker Nodes Observability.
 * Models BullMQ Redis queue telemetry, live worker pod CPU/RAM, in-flight jobs, DLQ triggers, and bulk lifecycle actions.
 */

/**
 * Execution state of a background job
 */
export type JobStatus =
  | "ACTIVE"
  | "WAITING"
  | "COMPLETED"
  | "FAILED"
  | "DELAYED"
  | "DEAD_LETTER"
  | "CANCELLED"

/**
 * Functional Queue Categories
 */
export type JobCategory =
  | "ALL"
  | "CRITICAL_CHECKOUTS"
  | "ORDER_FULFILLMENT_SYNC"
  | "MARKETING_EMAIL_BATCH"
  | "DEAD_LETTER_TRIGGER"

/**
 * Permitted interactive action buttons
 */
export type JobAction = "INSPECT" | "RETRY" | "CANCEL"

/**
 * Standard Background Job List Item
 */
export interface JobItem {
  id: string
  jobId: string
  status: JobStatus
  handler: string
  queue: string
  category: JobCategory | string
  worker: string
  runtime: string
  runtimeMs?: number
  attempt: string
  attemptsCount: number
  maxAttempts: number
  payloadSummary?: string
  failedReason?: string | null
  createdAt: string
  processedAt?: string | null
  actions: (JobAction | string)[]
}

/**
 * Execution history log per consumer
 */
export interface JobConsumerLog {
  id: string
  consumerName: string
  status: string
  lastError?: string | null
  processedAt: string
}

/**
 * Deep Inspection of a Job
 */
export interface JobDetail {
  jobId: string
  eventType?: string
  aggregateType?: string
  aggregateId?: string
  status: JobStatus
  payload: Record<string, any> | any
  attempts: number
  maxAttempts: number
  lastError?: string | null
  createdAt: string
  publishedAt?: string | null
  consumerLogs?: JobConsumerLog[]
}

/**
 * Worker Pod Memory Metrics
 */
export interface WorkerMemoryUtilization {
  rssMb: number
  heapUsedMb: number
  heapTotalMb: number
  systemTotalMb: number
  systemFreeMb: number
  percentUsed: number
}

/**
 * Worker Pod Concurrency Metrics
 */
export interface WorkerConcurrency {
  limit: number
  activeWorkers: number
  activeJobs: number
}

/**
 * Worker Node & Pod Telemetry
 */
export interface WorkerNodeTelemetry {
  nodeId: string
  podName: string
  hostname: string
  status: "HEALTHY" | "DEGRADED" | "OFFLINE" | string
  cpuUtilizationPercent: number
  memoryUtilization: WorkerMemoryUtilization
  concurrency: WorkerConcurrency
  uptimeSeconds: number
  uptimeHuman: string
  lastHeartbeat: string
}

/**
 * Background Jobs Overview Summary KPIs
 */
export interface JobOverviewSummary {
  activeJobsInFlight: number
  throttledJobs: number
  jobsProcessedTotal: number
  jobsSucceeded: number
  jobsFailed: number
  successRatePercent: number
  averageExecutionLatencyMs: number
  p95ExecutionLatencyMs: number
  deadLetterQueueDepth: number
  deadLetterTriggered: boolean
}

/**
 * Worker nodes health summary in overview
 */
export interface JobOverviewWorkerNodes {
  totalNodes: number
  healthyNodes: number
  degradedNodes: number
  totalActiveConcurrency: number
}

/**
 * Queue status in overview
 */
export interface JobOverviewQueue {
  name: string
  category: JobCategory | string
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  status: "HEALTHY" | "DEGRADED" | "CRITICAL" | string
}

/**
 * Data response from GET /api/v1/jobs/overview
 */
export interface JobsOverviewData {
  summary: JobOverviewSummary
  workerNodes: JobOverviewWorkerNodes
  queues: JobOverviewQueue[]
  timestamp: string
}

/**
 * Supported Bulk Actions
 */
export type BulkJobActionType =
  | "RETRY_ALL_FAILED"
  | "PURGE_DEAD_LETTER"
  | "PAUSE_QUEUES"
  | "RESUME_QUEUES"

/**
 * Request payload for POST /api/v1/jobs/bulk-action
 */
export interface BulkJobActionPayload {
  action: BulkJobActionType
}

/**
 * Response from POST /api/v1/jobs/bulk-action
 */
export interface BulkJobActionResponseData {
  action: BulkJobActionType
  affectedCount: number
  message: string
}

/**
 * Response from POST /api/v1/jobs/:id/retry
 */
export interface RetryJobResponseData {
  jobId: string
  status: JobStatus | string
  message: string
  retriedAt?: string
}

/**
 * Response from POST /api/v1/jobs/:id/cancel
 */
export interface CancelJobResponseData {
  jobId: string
  status: JobStatus | string
  message: string
}

/**
 * Pagination metadata
 */
export interface JobsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Query parameters for listing background jobs
 */
export interface JobsQueryParams {
  filter?: JobCategory | string
  status?: JobStatus | string
  search?: string
  page?: number
  limit?: number
}

/**
 * Paginated Jobs List Response
 */
export interface JobsListResponseData {
  items: JobItem[]
  pagination: JobsPagination
}

/**
 * Generic Background Jobs API response envelope
 */
export interface JobApiResponse<T> {
  status: "success" | "error"
  message?: string
  data: T
  statusCode?: number
}
