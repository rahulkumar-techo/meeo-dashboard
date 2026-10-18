/**
 * @file metrics.service.ts
 * @description Prometheus & Host Telemetry Service for Fastify Observability Command Center.
 * Fetches authenticated real-time data from:
 * 1. /api/v1/observability/metrics/prom
 * 2. /api/v1/observability/systemInfo
 * 3. /api/v1/observability/memory
 * Zero hardcoded mock/dummy fallbacks.
 */

import { apiClient } from "@/config/client"
import { ServerMetricsData, SystemHostInfo } from "@/types/server-metrics"
import { parsePrometheusText } from "./metrics/metrics-parser"
import { EMPTY_SERVER_METRICS } from "./metrics/metrics-defaults"

export * from "@/types/server-metrics"
export { parsePrometheusText } from "./metrics/metrics-parser"
export { EMPTY_SERVER_METRICS } from "./metrics/metrics-defaults"

/**
 * Normalizes memory sizes into raw bytes, handling GB (<1000), MB (<1M), or raw Bytes (>=1M).
 */
function normalizeToBytes(val: unknown): number {
  const n = Number(val || 0)
  if (isNaN(n) || n <= 0) return 0
  if (n < 1000) return Math.round(n * 1024 * 1024 * 1024) // in GB (e.g. 16 -> 16 GB)
  if (n < 1000000) return Math.round(n * 1024 * 1024) // in MB (e.g. 16384 -> 16 GB)
  return Math.round(n) // in Bytes
}

/**
 * Extracts total, free, used host RAM from any potential server payload structure.
 */
function extractHostRam(rawSys: any, rawMem: any): {
  total: number
  free: number
  used: number
  percent: number
} {
  const candidates = [
    rawMem?.system,
    rawMem?.systemRam,
    rawMem?.ram,
    rawMem?.memory,
    rawMem,
    rawSys?.memory?.system,
    rawSys?.memory?.systemRam,
    rawSys?.memory?.host,
    rawSys?.memory?.ram,
    rawSys?.memory?.rssVsSystemRam,
    rawSys?.memory,
    rawSys?.system?.ram,
    rawSys?.system?.memory,
    rawSys?.system,
    rawSys?.hardware?.ram,
    rawSys?.hardware?.memory,
    rawSys?.hardware,
    rawSys?.host?.ram,
    rawSys?.host?.memory,
    rawSys?.host,
    rawSys?.ram,
    rawSys?.systemRam,
    rawSys,
  ]

  let total = 0
  let free = 0
  let used = 0
  let percent = 0

  for (const c of candidates) {
    if (!c || typeof c !== "object") continue

    if (total === 0) {
      total = normalizeToBytes(
        c.systemRamBytes ||
        c.systemRamTotal ||
        c.totalRamBytes ||
        c.totalRam ||
        c.totalBytes ||
        c.totalMem ||
        c.totalMemory ||
        c.systemTotal ||
        c.total ||
        c.capacityBytes ||
        c.capacity ||
        0
      )
    }

    if (free === 0) {
      free = normalizeToBytes(
        c.systemRamFree ||
        c.freeRamBytes ||
        c.freeRam ||
        c.freeBytes ||
        c.freeMem ||
        c.freeMemory ||
        c.systemFree ||
        c.availableBytes ||
        c.available ||
        c.free ||
        0
      )
    }

    if (used === 0) {
      used = normalizeToBytes(
        c.systemRamUsed ||
        c.usedRamBytes ||
        c.usedRam ||
        c.usedBytes ||
        c.usedMem ||
        c.usedMemory ||
        c.systemUsed ||
        c.used ||
        0
      )
    }

    if (percent === 0) {
      const p = Number(
        c.ramUsedPercent ||
        c.usedPercent ||
        c.usedPercentage ||
        c.percent ||
        c.usagePercent ||
        0
      )
      if (p > 0) percent = p
    }
  }

  if (total > 0 && used === 0 && free > 0 && total > free) {
    used = total - free
  }
  if (total > 0 && free === 0 && used > 0 && total > used) {
    free = total - used
  }
  if (total > 0 && percent === 0 && used > 0) {
    percent = Number(((used / total) * 100).toFixed(1))
  }

  return { total, free, used, percent }
}

export const metricsService = {
  /**
   * Fetches real-time server runtime metrics from:
   * 1. GET /api/v1/observability/metrics/prom (Prometheus text stream)
   * 2. GET /api/v1/observability/systemInfo (Host RAM, CPU, OS, Disk, Network)
   * 3. GET /api/v1/observability/memory (Detailed System RAM & Process Memory)
   *
   * Zero dummy data: returns EMPTY_SERVER_METRICS (0s, empty arrays) when offline.
   */
  async getServerMetrics(): Promise<ServerMetricsData> {
    try {
      // Execute requests concurrently with Admin JWT authentication
      const [promResult, systemResult, memoryResult] = await Promise.allSettled([
        apiClient.get<string>("/observability/metrics/prom", {
          responseType: "text",
          timeout: 8000,
          headers: {
            Accept: "text/plain",
          },
        }),
        apiClient.get<any>("/observability/systemInfo", {
          timeout: 8000,
        }),
        apiClient.get<any>("/observability/memory", {
          timeout: 8000,
        }),
      ])

      let parsedMetrics: ServerMetricsData = { ...EMPTY_SERVER_METRICS }

      // 1. Process Prometheus scrape stream
      if (promResult.status === "fulfilled" && typeof promResult.value.data === "string") {
        const text = promResult.value.data
        if (text.includes("process_") || text.includes("nodejs_") || text.includes("http_")) {
          parsedMetrics = parsePrometheusText(text)
        }
      }

      // 2. Process and enrich host telemetry from /observability/systemInfo & /observability/memory
      const rawSys = systemResult.status === "fulfilled"
        ? systemResult.value.data?.data || systemResult.value.data
        : null
      const rawMem = memoryResult.status === "fulfilled"
        ? memoryResult.value.data?.data || memoryResult.value.data
        : null

      if ((rawSys && typeof rawSys === "object") || (rawMem && typeof rawMem === "object")) {
        const hostRam = extractHostRam(rawSys, rawMem)

        const hostInfo: SystemHostInfo = {
          hostname: String(rawSys?.hostname || rawSys?.host?.hostname || parsedMetrics.system.hostname || ""),
          platform: String(rawSys?.platform || rawSys?.host?.platform || parsedMetrics.system.platform || ""),
          osRelease: String(rawSys?.osRelease || rawSys?.release || rawSys?.host?.release || parsedMetrics.system.osRelease || ""),
          arch: String(rawSys?.arch || rawSys?.host?.arch || parsedMetrics.system.arch || ""),
          cpuModel: String(rawSys?.cpuModel || rawSys?.cpu?.model || rawSys?.hardware?.cpu?.model || parsedMetrics.system.cpuModel || ""),
          cpuCores: Number(rawSys?.cpuCores || rawSys?.cpu?.cores || rawSys?.cpus?.length || rawSys?.hardware?.cpu?.cores || parsedMetrics.system.cpuCores || 0),
          cpuSpeedMhz: Number(rawSys?.cpuSpeedMhz || rawSys?.cpu?.speed || rawSys?.hardware?.cpu?.speed || parsedMetrics.system.cpuSpeedMhz || 0),
          totalRamBytes: hostRam.total || parsedMetrics.system.totalRamBytes || 0,
          freeRamBytes: hostRam.free || parsedMetrics.system.freeRamBytes || 0,
          usedRamBytes: hostRam.used || parsedMetrics.system.usedRamBytes || 0,
          ramUsedPercent: hostRam.percent || parsedMetrics.system.ramUsedPercent || 0,
          nodeVersion: String(rawSys?.nodeVersion || rawSys?.runtime?.node || rawMem?.runtime?.node || parsedMetrics.system.nodeVersion || ""),
          v8Version: String(rawSys?.v8Version || rawSys?.runtime?.v8 || rawMem?.runtime?.v8 || parsedMetrics.system.v8Version || ""),
          pid: Number(rawSys?.pid || rawSys?.process?.pid || rawMem?.pid || rawMem?.process?.pid || parsedMetrics.system.pid || 0),
          loadAverages: Array.isArray(rawSys?.loadAverages)
            ? rawSys.loadAverages
            : Array.isArray(rawSys?.cpu?.loadAvg)
            ? rawSys.cpu.loadAvg
            : Array.isArray(rawSys?.cpu?.loadAverages)
            ? rawSys.cpu.loadAverages
            : undefined,
          heapLimitBytes: normalizeToBytes(
            rawSys?.memory?.heapLimitBytes ||
            rawSys?.v8?.heapSizeLimit ||
            rawMem?.heapLimitBytes ||
            rawMem?.process?.heapLimit ||
            rawMem?.heapLimit ||
            0
          ),
        }

        // Process disk storage volume
        const diskSource = rawSys?.disk || rawSys?.storage || rawSys?.filesystem
        if (diskSource && typeof diskSource === "object") {
          const totalBytes = normalizeToBytes(diskSource.totalBytes || diskSource.total || diskSource.capacity)
          const usedBytes = normalizeToBytes(diskSource.usedBytes || diskSource.used)
          const freeBytes = normalizeToBytes(
            diskSource.freeBytes || diskSource.free || (totalBytes > usedBytes ? totalBytes - usedBytes : 0)
          )
          const calculatedPercent = totalBytes > 0 ? Number(((usedBytes / totalBytes) * 100).toFixed(1)) : 0
          const rawPercent = Number(
            diskSource.usedPercent ?? diskSource.usedPercentage ?? diskSource.percent ?? 0
          )
          const usedPercent = rawPercent > 0 ? rawPercent : calculatedPercent

          hostInfo.disk = {
            totalBytes,
            usedBytes,
            freeBytes,
            usedPercent,
            status: String(
              diskSource.status || (usedPercent > 90 ? "Critical" : usedPercent > 75 ? "Warning" : "Healthy")
            ),
            mount: String(diskSource.mount || diskSource.fs || "/"),
          }
        }

        // Process network interfaces & sockets
        const netSource = rawSys?.network || rawSys?.net
        if (netSource && typeof netSource === "object") {
          hostInfo.network = {
            interfacesCount: Array.isArray(netSource.interfaces)
              ? netSource.interfaces.length
              : Number(netSource.interfacesCount || netSource.count || 0),
            activeSockets: Number(
              netSource.activeSockets || netSource.sockets || netSource.connections || 0
            ),
            primaryIp: String(netSource.primaryIp || netSource.ip || ""),
          }
        }

        // Process hardware thread capacity & Libuv threadpool
        const threadsSource = rawSys?.threads || rawSys?.threadInfo || rawSys?.process?.threads
        hostInfo.threads = {
          count: Number(
            threadsSource?.count ||
            threadsSource?.total ||
            rawSys?.threadsCount ||
            rawSys?.threadCount ||
            hostInfo.cpuCores ||
            0
          ),
          active: Number(
            threadsSource?.active ||
            threadsSource?.busy ||
            rawSys?.activeThreads ||
            0
          ),
        }

        // Process Libuv handles and active asynchronous requests
        hostInfo.processHandles = {
          activeHandles: Number(
            rawSys?.handles?.activeHandles ||
            rawSys?.process?.activeHandles ||
            rawSys?.activeHandles ||
            parsedMetrics.handles?.activeHandlesTotal ||
            0
          ),
          activeRequests: Number(
            rawSys?.handles?.activeRequests ||
            rawSys?.process?.activeRequests ||
            rawSys?.activeRequests ||
            parsedMetrics.handles?.activeRequestsTotal ||
            0
          ),
        }

        parsedMetrics.system = hostInfo

        // Fallback memory enrichment if prom-client text parsing was empty
        const memSource = rawMem?.process || rawMem || rawSys?.process?.memoryUsage || rawSys?.memory
        if (memSource && typeof memSource === "object") {
          const rss = normalizeToBytes(memSource.residentBytes || memSource.rss || memSource.rssBytes)
          const heapUsed = normalizeToBytes(memSource.heapUsedBytes || memSource.heapUsed || memSource.usedHeap)
          const heapTotal = normalizeToBytes(memSource.heapTotalBytes || memSource.heapTotal || memSource.totalHeap)
          const ext = normalizeToBytes(memSource.externalBytes || memSource.external)

          if (rss > 0 && parsedMetrics.memory.residentBytes === 0) parsedMetrics.memory.residentBytes = rss
          if (heapUsed > 0 && parsedMetrics.memory.heapUsedBytes === 0) parsedMetrics.memory.heapUsedBytes = heapUsed
          if (heapTotal > 0 && parsedMetrics.memory.heapTotalBytes === 0) parsedMetrics.memory.heapTotalBytes = heapTotal
          if (ext > 0 && parsedMetrics.memory.externalBytes === 0) parsedMetrics.memory.externalBytes = ext
          if (heapTotal > 0 && heapUsed > 0 && parsedMetrics.memory.heapUsedPercent === 0) {
            parsedMetrics.memory.heapUsedPercent = Number(((heapUsed / heapTotal) * 100).toFixed(1))
          }
        }
      }

      return parsedMetrics
    } catch {
      return EMPTY_SERVER_METRICS
    }
  },
}
