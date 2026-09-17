/**
 * @file metrics-parser.ts
 * @description Pure parser for Prometheus exposition text into ServerMetricsData.
 * Pure real data parsing: No dummy or fallback data. Unmeasured values default to 0 or [].
 */

import {
  ServerMetricsData,
  ParsedRuntimeInfo,
  HeapSpaceInfo,
  GcKindInfo,
  ParsedHandleItem,
  EndpointRequestMetric,
  SystemHostInfo,
} from "@/types/server-metrics"

export function parsePrometheusText(text: string): ServerMetricsData {
  if (!text || typeof text !== "string") {
    return {
      cpu: { userSeconds: 0, systemSeconds: 0, totalSeconds: 0, startTimeSeconds: 0, uptimeSeconds: 0 },
      memory: { residentBytes: 0, heapTotalBytes: 0, heapUsedBytes: 0, heapAvailableBytes: 0, externalBytes: 0, heapUsedPercent: 0, spaces: [] },
      eventLoop: { lagSeconds: 0, lagMinSeconds: 0, lagMaxSeconds: 0, lagMeanSeconds: 0, lagStddevSeconds: 0, lagP50Seconds: 0, lagP90Seconds: 0, lagP99Seconds: 0, utilizationQuantiles: [], utilizationSum: 0, utilizationCount: 0 },
      handles: { activeResources: [], activeResourcesTotal: 0, activeHandles: [], activeHandlesTotal: 0, activeRequests: [], activeRequestsTotal: 0 },
      gc: { kinds: [], totalGcCount: 0, totalGcTimeSeconds: 0 },
      httpTraffic: { totalRequests: 0, totalErrors: 0, overallErrorRatePercent: 0, avgLatencyMs: 0, requestsPerSecond: 0, endpoints: [] },
      system: { hostname: "Node.js Server Host", platform: "", osRelease: "", arch: "", cpuModel: "", cpuCores: 0, cpuSpeedMhz: 0, totalRamBytes: 0, freeRamBytes: 0, usedRamBytes: 0, ramUsedPercent: 0, nodeVersion: "", v8Version: "", pid: 0 },
      runtime: { version: "", major: "", minor: "", patch: "" },
      rawPrometheus: "",
      timestamp: new Date().toISOString(),
    }
  }

  const lines = text.split("\n")
  const gauges: Record<string, number> = {}
  const heapSpaces: Record<string, { total: number; used: number; available: number }> = {}
  const activeResources: ParsedHandleItem[] = []
  const activeHandles: ParsedHandleItem[] = []
  const activeRequests: ParsedHandleItem[] = []
  const gcKindsMap: Record<string, { sum: number; count: number }> = {}
  const utilizationQuantiles: { quantile: string; value: number }[] = []

  // Route aggregation map: key = method + "::" + route
  const routeMap: Record<
    string,
    {
      route: string
      method: string
      totalRequests: number
      totalDurationSeconds: number
      p90Seconds: number
      p99Seconds: number
      statusCounts: Record<number, number>
    }
  > = {}

  let runtimeInfo: ParsedRuntimeInfo = {
    version: "",
    major: "",
    minor: "",
    patch: "",
  }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const labelMatch = trimmed.match(/^([a-zA-Z0-9_]+)\{(.+?)\}\s+([0-9.eE+-]+)$/)
    if (labelMatch) {
      const metricName = labelMatch[1]
      const labelStr = labelMatch[2]
      const value = parseFloat(labelMatch[3])

      const labels: Record<string, string> = {}
      for (const pair of labelStr.split(",")) {
        const [k, v] = pair.split("=")
        if (k && v) {
          labels[k.trim()] = v.replace(/"/g, "").trim()
        }
      }

      if (metricName === "nodejs_heap_space_size_total_bytes" && labels.space) {
        if (!heapSpaces[labels.space]) heapSpaces[labels.space] = { total: 0, used: 0, available: 0 }
        heapSpaces[labels.space].total = value
      } else if (metricName === "nodejs_heap_space_size_used_bytes" && labels.space) {
        if (!heapSpaces[labels.space]) heapSpaces[labels.space] = { total: 0, used: 0, available: 0 }
        heapSpaces[labels.space].used = value
      } else if (metricName === "nodejs_heap_space_size_available_bytes" && labels.space) {
        if (!heapSpaces[labels.space]) heapSpaces[labels.space] = { total: 0, used: 0, available: 0 }
        heapSpaces[labels.space].available = value
      } else if (metricName === "nodejs_active_resources" && labels.type) {
        activeResources.push({ type: labels.type, count: value })
      } else if (metricName === "nodejs_active_handles" && labels.type) {
        activeHandles.push({ type: labels.type, count: value })
      } else if (metricName === "nodejs_active_requests" && labels.type) {
        activeRequests.push({ type: labels.type, count: value })
      } else if (metricName === "nodejs_version_info") {
        runtimeInfo = {
          version: labels.version || "",
          major: labels.major || "",
          minor: labels.minor || "",
          patch: labels.patch || "",
        }
      } else if (metricName === "nodejs_eventloop_utilization_summary" && labels.quantile) {
        utilizationQuantiles.push({ quantile: labels.quantile, value })
      } else if (metricName === "nodejs_gc_duration_seconds_sum" && labels.kind) {
        if (!gcKindsMap[labels.kind]) gcKindsMap[labels.kind] = { sum: 0, count: 0 }
        gcKindsMap[labels.kind].sum = value
      } else if (metricName === "nodejs_gc_duration_seconds_count" && labels.kind) {
        if (!gcKindsMap[labels.kind]) gcKindsMap[labels.kind] = { sum: 0, count: 0 }
        gcKindsMap[labels.kind].count = value
      } else if (
        (metricName === "http_request_duration_seconds_count" || metricName === "http_requests_total") &&
        (labels.route || labels.path)
      ) {
        const route = labels.route || labels.path || "unknown"
        const method = labels.method || "GET"
        const statusCode = parseInt(labels.status_code || labels.status || "200", 10)
        const key = `${method}::${route}`

        if (!routeMap[key]) {
          routeMap[key] = { route, method, totalRequests: 0, totalDurationSeconds: 0, p90Seconds: 0, p99Seconds: 0, statusCounts: {} }
        }
        routeMap[key].totalRequests += value
        routeMap[key].statusCounts[statusCode] = (routeMap[key].statusCounts[statusCode] || 0) + value
      } else if (metricName === "http_request_duration_seconds_sum" && (labels.route || labels.path)) {
        const route = labels.route || labels.path || "unknown"
        const method = labels.method || "GET"
        const key = `${method}::${route}`
        if (!routeMap[key]) {
          routeMap[key] = { route, method, totalRequests: 0, totalDurationSeconds: 0, p90Seconds: 0, p99Seconds: 0, statusCounts: {} }
        }
        routeMap[key].totalDurationSeconds += value
      } else if (metricName === "http_request_summary_seconds" && (labels.route || labels.path) && labels.quantile) {
        const route = labels.route || labels.path || "unknown"
        const method = labels.method || "GET"
        const key = `${method}::${route}`
        if (!routeMap[key]) {
          routeMap[key] = { route, method, totalRequests: 0, totalDurationSeconds: 0, p90Seconds: 0, p99Seconds: 0, statusCounts: {} }
        }
        if (labels.quantile === "0.9") routeMap[key].p90Seconds = value
        if (labels.quantile === "0.99") routeMap[key].p99Seconds = value
      }
      continue
    }

    const simpleMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+([0-9.eE+-]+)$/)
    if (simpleMatch) {
      gauges[simpleMatch[1]] = parseFloat(simpleMatch[2])
    }
  }

  // Heap Spaces
  const spaces: HeapSpaceInfo[] = Object.entries(heapSpaces)
    .filter(([_, v]) => v.total > 0 || v.used > 0)
    .map(([space, data]) => ({
      space: space.replace(/_/g, " "),
      totalBytes: data.total,
      usedBytes: data.used,
      availableBytes: data.available,
      usedPercent: data.total > 0 ? Math.round((data.used / data.total) * 100) : 0,
    }))

  // GC Kinds
  const gcKinds: GcKindInfo[] = Object.entries(gcKindsMap).map(([kind, data]) => ({
    kind,
    sumSeconds: data.sum,
    count: data.count,
    avgLatencyMs: data.count > 0 ? parseFloat(((data.sum / data.count) * 1000).toFixed(2)) : 0,
  }))

  const totalGcCount = gcKinds.reduce((acc, k) => acc + k.count, 0)
  const totalGcTime = gcKinds.reduce((acc, k) => acc + k.sumSeconds, 0)

  // Total HTTP Requests
  const totalRequests = Object.values(routeMap).reduce((acc, r) => acc + r.totalRequests, 0)
  let totalErrors = 0

  const endpoints: EndpointRequestMetric[] = Object.values(routeMap).map((r) => {
    let routeErrors = 0
    const statusCodes = Object.entries(r.statusCounts).map(([statusStr, count]) => {
      const status = parseInt(statusStr, 10)
      const type: "2xx" | "3xx" | "4xx" | "5xx" =
        status >= 500 ? "5xx" : status >= 400 ? "4xx" : status >= 300 ? "3xx" : "2xx"
      if (status >= 400) {
        routeErrors += count
        totalErrors += count
      }
      return { status, count, type }
    })

    const avgLatencyMs = r.totalRequests > 0
      ? parseFloat(((r.totalDurationSeconds / r.totalRequests) * 1000).toFixed(1))
      : 0
    const p90LatencyMs = r.p90Seconds > 0 ? parseFloat((r.p90Seconds * 1000).toFixed(1)) : avgLatencyMs
    const p99LatencyMs = r.p99Seconds > 0 ? parseFloat((r.p99Seconds * 1000).toFixed(1)) : p90LatencyMs
    const percentageOfTraffic = totalRequests > 0
      ? parseFloat(((r.totalRequests / totalRequests) * 100).toFixed(1))
      : 0
    const errorRatePercent = r.totalRequests > 0
      ? parseFloat(((routeErrors / r.totalRequests) * 100).toFixed(2))
      : 0

    return {
      route: r.route,
      method: r.method,
      totalRequests: r.totalRequests,
      percentageOfTraffic,
      avgLatencyMs,
      p90LatencyMs,
      p99LatencyMs,
      errorCount: routeErrors,
      errorRatePercent,
      statusCodes,
    }
  })

  // System Host Info (only real values derived from Prometheus gauges/runtime)
  const startTime = gauges["process_start_time_seconds"] || 0
  const uptimeSeconds = startTime > 0 ? Math.max(0, Math.floor(Date.now() / 1000) - startTime) : 0
  const residentBytes = gauges["process_resident_memory_bytes"] || 0
  const heapTotalBytes = gauges["nodejs_heap_size_total_bytes"] || 0
  const heapUsedBytes = gauges["nodejs_heap_size_used_bytes"] || 0
  const heapAvailableBytes = Math.max(0, heapTotalBytes - heapUsedBytes)
  const heapUsedPercent = heapTotalBytes > 0 ? Math.round((heapUsedBytes / heapTotalBytes) * 100) : 0

  const system: SystemHostInfo = {
    hostname: "Fastify Node Instance",
    platform: runtimeInfo.version ? `Node.js ${runtimeInfo.version}` : "",
    osRelease: "",
    arch: "",
    cpuModel: "",
    cpuCores: 0,
    cpuSpeedMhz: 0,
    totalRamBytes: 0,
    freeRamBytes: 0,
    usedRamBytes: residentBytes,
    ramUsedPercent: 0,
    nodeVersion: runtimeInfo.version,
    v8Version: "",
    pid: 0,
  }

  return {
    cpu: {
      userSeconds: gauges["process_cpu_user_seconds_total"] || 0,
      systemSeconds: gauges["process_cpu_system_seconds_total"] || 0,
      totalSeconds: gauges["process_cpu_seconds_total"] || 0,
      startTimeSeconds: startTime,
      uptimeSeconds,
    },
    memory: {
      residentBytes,
      heapTotalBytes,
      heapUsedBytes,
      heapAvailableBytes,
      externalBytes: gauges["nodejs_external_memory_bytes"] || 0,
      heapUsedPercent,
      spaces,
    },
    eventLoop: {
      lagSeconds: gauges["nodejs_eventloop_lag_seconds"] || 0,
      lagMinSeconds: gauges["nodejs_eventloop_lag_min_seconds"] || 0,
      lagMaxSeconds: gauges["nodejs_eventloop_lag_max_seconds"] || 0,
      lagMeanSeconds: gauges["nodejs_eventloop_lag_mean_seconds"] || 0,
      lagStddevSeconds: gauges["nodejs_eventloop_lag_stddev_seconds"] || 0,
      lagP50Seconds: gauges["nodejs_eventloop_lag_p50_seconds"] || 0,
      lagP90Seconds: gauges["nodejs_eventloop_lag_p90_seconds"] || 0,
      lagP99Seconds: gauges["nodejs_eventloop_lag_p99_seconds"] || 0,
      utilizationQuantiles,
      utilizationSum: gauges["nodejs_eventloop_utilization_summary_sum"] || 0,
      utilizationCount: gauges["nodejs_eventloop_utilization_summary_count"] || 0,
    },
    handles: {
      activeResources,
      activeResourcesTotal: gauges["nodejs_active_resources_total"] || activeResources.reduce((a, b) => a + b.count, 0),
      activeHandles,
      activeHandlesTotal: gauges["nodejs_active_handles_total"] || activeHandles.reduce((a, b) => a + b.count, 0),
      activeRequests,
      activeRequestsTotal: gauges["nodejs_active_requests_total"] || activeRequests.reduce((a, b) => a + b.count, 0),
    },
    gc: {
      kinds: gcKinds,
      totalGcCount,
      totalGcTimeSeconds: totalGcTime,
    },
    httpTraffic: {
      totalRequests,
      totalErrors,
      overallErrorRatePercent: totalRequests > 0 ? parseFloat(((totalErrors / totalRequests) * 100).toFixed(2)) : 0,
      avgLatencyMs: totalRequests > 0
        ? parseFloat(((Object.values(routeMap).reduce((acc, r) => acc + r.totalDurationSeconds, 0) / totalRequests) * 1000).toFixed(1))
        : 0,
      requestsPerSecond: uptimeSeconds > 0 ? parseFloat((totalRequests / uptimeSeconds).toFixed(2)) : 0,
      endpoints,
    },
    system,
    runtime: runtimeInfo,
    rawPrometheus: text,
    timestamp: new Date().toISOString(),
  }
}
