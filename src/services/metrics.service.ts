/**
 * @file metrics.service.ts
 * @description Prometheus Metrics Service for Fastify Server Status & Telemetry.
 * Parses pure real-time data from Fastify GET /metrics with zero mock/dummy fallback data.
 */

import axios from "axios"
import { API_BASE_URL } from "@/config/client"
import { ServerMetricsData } from "@/types/server-metrics"
import { parsePrometheusText } from "./metrics/metrics-parser"
import { EMPTY_SERVER_METRICS } from "./metrics/metrics-defaults"

export * from "@/types/server-metrics"
export { parsePrometheusText } from "./metrics/metrics-parser"
export { EMPTY_SERVER_METRICS } from "./metrics/metrics-defaults"

export const metricsService = {
  /**
   * Fetches raw Prometheus text from /metrics and parses into structured data.
   * Returns EMPTY_SERVER_METRICS (all 0s, empty arrays) if endpoint is unreachable.
   */
  async getServerMetrics(): Promise<ServerMetricsData> {
    const urlsToTry: string[] = []

    // 1. First try relative / derived from API_BASE_URL
    const configuredBase = API_BASE_URL.replace(/\/api\/v1\/?$/, "")
    if (configuredBase) {
      urlsToTry.push(`${configuredBase}/metrics`)
    }

    // 2. In browser local development, try local port 5000 if not already in URL list
    if (typeof window !== "undefined") {
      const localhostUrl = `http://localhost:5000/metrics`
      if (!urlsToTry.includes(localhostUrl)) {
        urlsToTry.push(localhostUrl)
      }
    }

    for (const url of urlsToTry) {
      try {
        const response = await axios.get<string>(url, {
          responseType: "text",
          timeout: 6000,
          headers: {
            Accept: "text/plain",
          },
        })

        if (typeof response.data === "string" && response.data.includes("process_")) {
          return parsePrometheusText(response.data)
        }
      } catch {
        // Try next candidate endpoint URL
      }
    }

    // If unreachable, return empty baseline (0 for numbers, empty arrays, zero dummy data)
    return EMPTY_SERVER_METRICS
  },
}
