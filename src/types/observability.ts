/**
 * @file observability.ts
 * @description Type definitions for Prometheus metrics, Loki logs, OpenTelemetry traces,
 * BullMQ queues, and Service Flow topology.
 */

export type LogLevel = "error" | "warn" | "info" | "debug" | "trace" | "unknown"

// Normalized single log entry from Loki
export interface NormalizedLogEntry {
  id: string
  timestamp: string // ISO-8601 (e.g. 2026-10-18T01:30:00.000Z)
  timestampNs: string // Nanosecond string from Loki
  level: LogLevel
  message: string
  labels: Record<string, string>
  structured?: Record<string, unknown> // Parsed JSON fields (e.g., reqId, err)
  raw: string
}

// Single time-series metric data point for charts
export interface NormalizedMetricPoint {
  timestamp: number // Epoch milliseconds (for Recharts X-axis)
  timeIso: string // ISO-8601 string
  value: number // Numeric value (e.g. 25.4)
}

// Single time-series line or bar
export interface NormalizedMetricSeries {
  id: string
  name: string // Formatted legend title (e.g. "GET /api/v1/catalog [200]")
  metricName: string // Base Prometheus metric name
  labels: Record<string, string>
  points: NormalizedMetricPoint[]
  summary: {
    min: number
    max: number
    avg: number
    latest: number
    count: number
  }
}

export interface MetricsRangeResponse {
  success: boolean
  query: string
  start: string
  end: string
  step: string
  seriesCount: number
  series: NormalizedMetricSeries[]
}

export interface LogsQueryResponse {
  success: boolean
  query: string
  total: number
  direction: "backward" | "forward"
  logs: NormalizedLogEntry[]
  streamsCount: number
}

export interface MetricPresetDefinition {
  id: string
  title: string
  description: string
  unit: string
  category: "system" | "http" | "database" | "business"
  query: string
  defaultStep: string
}

// Single instant point evaluation from /metrics/query
export interface MetricsInstantResult {
  id: string
  name: string
  metricName: string
  labels: Record<string, string>
  timestamp: number
  timeIso: string
  value: number
}

export interface MetricsInstantQueryResponse {
  success: boolean
  query: string
  time: string
  count: number
  results: MetricsInstantResult[]
}

// ==========================================
// Service Topology & Flow Types (React Flow)
// ==========================================
export type ServiceNodeType = "gateway" | "service" | "database" | "cache" | "monitoring" | "queue" | "telemetry"
export type ServiceNodeStatus = "healthy" | "degraded" | "critical" | "down"

// Custom Node Data payload for React Flow Telemetry Node
export interface TelemetryNodeData {
  label: string
  type: "gateway" | "service" | "database" | "cache" | "monitoring"
  status: "healthy" | "degraded" | "critical"
  metrics: {
    throughputRps?: number
    latencyP95Ms?: number
    errorRatePercent?: number
    memoryMb?: number
    cpuPercent?: number
  }
  activeAlertsCount: number
  host?: string
  description?: string
}

export interface TelemetryFlowNode {
  id: string
  type: "telemetryNode" | string
  position: { x: number; y: number }
  data: TelemetryNodeData
}

export interface TelemetryFlowEdge {
  id: string
  source: string
  target: string
  animated: boolean
  style?: {
    stroke?: string
    strokeWidth?: number
    strokeDasharray?: string
  }
  data?: {
    rps?: number
    protocol?: string
  }
}

export interface ServiceNode {
  id: string
  name: string
  type: ServiceNodeType
  status: ServiceNodeStatus
  host: string
  port?: number
  latencyMs: number
  rps: number
  errorRate: number
  description: string
  x: number
  y: number
}

export interface ServiceEdge {
  id: string
  source: string
  target: string
  protocol: "HTTP" | "Redis" | "Postgres" | "gRPC" | "TCP"
  throughput: string
  status: "normal" | "heavy" | "error"
}

// ==========================================
// Bull Board Queue Types (BullMQ / Redis)
// ==========================================
export type JobState = "active" | "waiting" | "completed" | "failed" | "delayed" | "paused"

export interface QueueJob {
  id: string
  name: string
  queueName: string
  state: JobState
  progress: number
  attemptsMade: number
  timestamp: number
  processedOn?: number
  finishedOn?: number
  failedReason?: string
  data?: Record<string, unknown>
}

export interface QueueSummary {
  name: string
  displayName: string
  isPaused: boolean
  counts: {
    active: number
    waiting: number
    completed: number
    failed: number
    delayed: number
    paused: number
  }
  throughputRps: number
  averageLatencyMs: number
}

// ==========================================
// OpenTelemetry Tracing Types
// ==========================================
export type SpanKind = "SERVER" | "CLIENT" | "INTERNAL" | "PRODUCER" | "CONSUMER"

export interface OtelSpan {
  id: string
  traceId: string
  parentId?: string
  name: string
  kind: SpanKind
  startTimeMs: number
  durationMs: number
  serviceName: string
  statusCode: "OK" | "ERROR" | "UNSET"
  attributes: Record<string, string | number | boolean>
}

export interface OtelTrace {
  id: string
  rootSpanName: string
  httpMethod: string
  httpPath: string
  httpStatus: number
  durationMs: number
  startTime: string
  spansCount: number
  hasError: boolean
  spans: OtelSpan[]
}

// ==========================================
// Dynamic Observability Config & Thresholds
// ==========================================
export type ObservabilityCategory = "server_errors" | "client_errors" | "security" | "business"

export interface ObservabilityThresholdConfig {
  warningRatePercent?: number
  criticalRatePercent?: number
  evaluationWindowMinutes?: number
  minimumRequestsPerMinute?: number
  max5xxVolumePerMinute?: number
  monitoredStatusCodes?: number[]
  excludeStatusCodes?: number[]
  spikeThresholdRequestsPerMin?: number
  rateLimit429ThresholdPerMin?: number
  paymentFailureRatePercent?: number
  orderFailureRatePercent?: number
  backgroundJobDlqThreshold?: number
  [key: string]: unknown
}

export interface ObservabilityConfigItem {
  id: string
  key: string
  category: ObservabilityCategory | string
  value: ObservabilityThresholdConfig
  description: string | null
  isEnabled: boolean
  updatedBy: string | null
  createdAt: string
  updatedAt: string
}
