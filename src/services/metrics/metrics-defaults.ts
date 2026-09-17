/**
 * @file metrics-defaults.ts
 * @description Zero/Empty baseline structure for Server Telemetry when offline or uninitialized.
 * Zero dummy/mock data: all numbers are 0, arrays are empty [].
 */

import { ServerMetricsData, HttpTrafficSummary, SystemHostInfo } from "@/types/server-metrics"

export const EMPTY_SYSTEM_INFO: SystemHostInfo = {
  hostname: "Node.js Server Host",
  platform: "",
  osRelease: "",
  arch: "",
  cpuModel: "",
  cpuCores: 0,
  cpuSpeedMhz: 0,
  totalRamBytes: 0,
  freeRamBytes: 0,
  usedRamBytes: 0,
  ramUsedPercent: 0,
  nodeVersion: "",
  v8Version: "",
  pid: 0,
}

export const EMPTY_HTTP_TRAFFIC: HttpTrafficSummary = {
  totalRequests: 0,
  totalErrors: 0,
  overallErrorRatePercent: 0,
  avgLatencyMs: 0,
  requestsPerSecond: 0,
  endpoints: [],
}

export const EMPTY_SERVER_METRICS: ServerMetricsData = {
  cpu: {
    userSeconds: 0,
    systemSeconds: 0,
    totalSeconds: 0,
    startTimeSeconds: 0,
    uptimeSeconds: 0,
  },
  memory: {
    residentBytes: 0,
    heapTotalBytes: 0,
    heapUsedBytes: 0,
    heapAvailableBytes: 0,
    externalBytes: 0,
    heapUsedPercent: 0,
    spaces: [],
  },
  eventLoop: {
    lagSeconds: 0,
    lagMinSeconds: 0,
    lagMaxSeconds: 0,
    lagMeanSeconds: 0,
    lagStddevSeconds: 0,
    lagP50Seconds: 0,
    lagP90Seconds: 0,
    lagP99Seconds: 0,
    utilizationQuantiles: [],
    utilizationSum: 0,
    utilizationCount: 0,
  },
  handles: {
    activeResources: [],
    activeResourcesTotal: 0,
    activeHandles: [],
    activeHandlesTotal: 0,
    activeRequests: [],
    activeRequestsTotal: 0,
  },
  gc: {
    kinds: [],
    totalGcCount: 0,
    totalGcTimeSeconds: 0,
  },
  httpTraffic: EMPTY_HTTP_TRAFFIC,
  system: EMPTY_SYSTEM_INFO,
  runtime: {
    version: "",
    major: "",
    minor: "",
    patch: "",
  },
  rawPrometheus: "",
  timestamp: "",
}
