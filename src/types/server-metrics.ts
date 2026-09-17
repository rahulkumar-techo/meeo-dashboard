/**
 * @file server-metrics.ts
 * @description Strongly-typed schemas for Prometheus telemetry, system health, and HTTP endpoint metrics.
 */

export interface ParsedCpuMetrics {
  userSeconds: number
  systemSeconds: number
  totalSeconds: number
  startTimeSeconds: number
  uptimeSeconds: number
}

export interface HeapSpaceInfo {
  space: string
  totalBytes: number
  usedBytes: number
  availableBytes: number
  usedPercent: number
}

export interface ParsedMemoryMetrics {
  residentBytes: number
  heapTotalBytes: number
  heapUsedBytes: number
  heapAvailableBytes: number
  externalBytes: number
  heapUsedPercent: number
  spaces: HeapSpaceInfo[]
}

export interface ParsedEventLoopMetrics {
  lagSeconds: number
  lagMinSeconds: number
  lagMaxSeconds: number
  lagMeanSeconds: number
  lagStddevSeconds: number
  lagP50Seconds: number
  lagP90Seconds: number
  lagP99Seconds: number
  utilizationQuantiles: { quantile: string; value: number }[]
  utilizationSum: number
  utilizationCount: number
}

export interface ParsedHandleItem {
  type: string
  count: number
}

export interface ParsedHandlesMetrics {
  activeResources: ParsedHandleItem[]
  activeResourcesTotal: number
  activeHandles: ParsedHandleItem[]
  activeHandlesTotal: number
  activeRequests: ParsedHandleItem[]
  activeRequestsTotal: number
}

export interface GcKindInfo {
  kind: string
  sumSeconds: number
  count: number
  avgLatencyMs: number
}

export interface ParsedGcMetrics {
  kinds: GcKindInfo[]
  totalGcCount: number
  totalGcTimeSeconds: number
}

export interface ParsedRuntimeInfo {
  version: string
  major: string
  minor: string
  patch: string
}

/**
 * System hardware & host environment telemetry
 */
export interface SystemHostInfo {
  hostname: string
  platform: string
  osRelease: string
  arch: string
  cpuModel: string
  cpuCores: number
  cpuSpeedMhz: number
  totalRamBytes: number
  freeRamBytes: number
  usedRamBytes: number
  ramUsedPercent: number
  nodeVersion: string
  v8Version: string
  pid: number
}

/**
 * Metric telemetry for a specific HTTP route endpoint
 */
export interface EndpointRequestMetric {
  route: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | string
  totalRequests: number
  percentageOfTraffic: number
  avgLatencyMs: number
  p90LatencyMs: number
  p99LatencyMs: number
  errorCount: number
  errorRatePercent: number
  statusCodes: {
    status: number
    count: number
    type: "2xx" | "3xx" | "4xx" | "5xx"
  }[]
}

/**
 * Aggregate summary of all HTTP network traffic
 */
export interface HttpTrafficSummary {
  totalRequests: number
  totalErrors: number
  overallErrorRatePercent: number
  avgLatencyMs: number
  requestsPerSecond: number
  endpoints: EndpointRequestMetric[]
}

/**
 * Complete Server Status & Telemetry Model
 */
export interface ServerMetricsData {
  cpu: ParsedCpuMetrics
  memory: ParsedMemoryMetrics
  eventLoop: ParsedEventLoopMetrics
  handles: ParsedHandlesMetrics
  gc: ParsedGcMetrics
  httpTraffic: HttpTrafficSummary
  system: SystemHostInfo
  runtime: ParsedRuntimeInfo
  rawPrometheus: string
  timestamp: string
}
