/**
 * @file page.tsx
 * @description Unified Server Status & Observability Command Center.
 * Integrates directly with the dedicated ObservabilitySidebar via useObservabilityContext.
 * Features Prometheus telemetry charts, React Flow architecture topology, Bull Board queue monitoring,
 * OpenTelemetry distributed trace waterfalls, and Loki live log streamer.
 */

"use client"

import * as React from "react"
import {
  ObservabilityHeader,
  MetricsKpiGrid,
  MetricChartCard,
  TopologyFlowGraph,
  BullBoardQueueMonitor,
  OpenTelemetryTraceViewer,
  LiveLogTerminal,
} from "@/components/observability"
import {
  SystemInfoCard,
  V8HeapSpacesChart,
  EventLoopLatencyChart,
  HandlesGcMatrix,
  RawPrometheusViewer,
  EndpointTrafficTable,
} from "@/components/server-metrics"
import { useObservabilityContext } from "@/context/observability-context"

export default function ServerMetricsPage() {
  const {
    activeTab,
    timeRange,
    setTimeRange,
    refreshInterval,
    setRefreshInterval,
    isFetching,
    handleGlobalRefresh,
    correlatedLogQuery,
    handleCorrelateLogs,
    handleViewMetrics,
    httpRateData,
    errorRateData,
    latencyData,
    cpuData,
    memoryData,
    eventLoopData,
    topologyNodes,
    topologyEdges,
    queues,
    recentJobs,
    traces,
    hostMetrics,
    activeNodesCount,
    configs,
  } = useObservabilityContext()

  return (
    <div className="flex-1 space-y-5 p-2 sm:p-4 lg:p-6 max-w-[1600px] mx-auto pb-16">
      {/* 1. Global Header Bar with Live Beacon & Cluster Statistics */}
      <ObservabilityHeader
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        refreshInterval={refreshInterval}
        onRefreshIntervalChange={setRefreshInterval}
        isFetching={isFetching}
        onRefresh={handleGlobalRefresh}
        activeNodesCount={activeNodesCount}
      />

      {/* 2. Top-Level Summary Metric KPI Grid (100% Real Instant & Range Metrics) */}
      <MetricsKpiGrid
        httpRateData={httpRateData}
        errorRateData={errorRateData}
        latencyData={latencyData}
        cpuData={cpuData}
        memoryData={memoryData}
        eventLoopData={eventLoopData}
        hostMetrics={hostMetrics}
        configs={configs}
        isLoading={!httpRateData && isFetching}
      />

      {/* 3. Active Module Display (Controlled by dedicated ObservabilitySidebar) */}
      {/* Section A: Metrics & Time-Series Charts */}
      {activeTab === "overview" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricChartCard
              title="HTTP Request Rate"
              description="Real-time ingress requests per second across all routes"
              unit="req/s"
              color="blue"
              data={httpRateData}
              isLoading={!httpRateData && isFetching}
            />

            <MetricChartCard
              title="5xx Error Percentage"
              description="Failed internal server responses relative to total traffic"
              unit="%"
              color="rose"
              data={errorRateData}
              isLoading={!errorRateData && isFetching}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricChartCard
              title="P95 Request Latency"
              description="95th percentile response duration experienced by clients"
              unit="ms"
              color="indigo"
              data={latencyData}
              isLoading={!latencyData && isFetching}
            />

            <MetricChartCard
              title="Node.js Process CPU Usage"
              description="Kernel and user space processor utilization"
              unit="%"
              color="purple"
              data={cpuData}
              isLoading={!cpuData && isFetching}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MetricChartCard
              title="Resident Memory (RSS)"
              description="Non-swapped physical memory assigned to the Fastify process"
              unit="MB"
              color="emerald"
              data={memoryData}
              isLoading={!memoryData && isFetching}
            />

            <MetricChartCard
              title="Event Loop Lag"
              description="P95 delay in asynchronous queue dispatch and tick execution"
              unit="ms"
              color="amber"
              data={eventLoopData}
              isLoading={!eventLoopData && isFetching}
            />
          </div>

          {/* Network Ingress Endpoints Breakdown */}
          {hostMetrics?.httpTraffic?.endpoints && hostMetrics.httpTraffic.endpoints.length > 0 && (
            <div className="space-y-4 pt-2">
              <EndpointTrafficTable endpoints={hostMetrics.httpTraffic.endpoints} />
            </div>
          )}
        </div>
      )}

      {/* Section B: Service Flow Topology (React Flow Reference) */}
      {activeTab === "topology" && (
        <div className="animate-in fade-in-50 duration-200">
          <TopologyFlowGraph
            nodes={topologyNodes}
            edges={topologyEdges}
            hostMetrics={hostMetrics}
            isLoading={isFetching}
            onCorrelateLogs={handleCorrelateLogs}
            onViewMetrics={handleViewMetrics}
          />
        </div>
      )}

      {/* Section C: Bull Board Queue Engine (Bull Board Reference) */}
      {activeTab === "queues" && (
        <div className="animate-in fade-in-50 duration-200">
          <BullBoardQueueMonitor
            queues={queues}
            recentJobs={recentJobs}
            isLoading={isFetching}
          />
        </div>
      )}

      {/* Section D: OpenTelemetry Traces & Spans (OpenTelemetry Reference) */}
      {activeTab === "traces" && (
        <div className="animate-in fade-in-50 duration-200">
          <OpenTelemetryTraceViewer
            traces={traces}
            isLoading={isFetching}
            onCorrelateLogs={handleCorrelateLogs}
          />
        </div>
      )}

      {/* Section E: Loki Live Logs (Loki Reference) */}
      {activeTab === "logs" && (
        <div className="animate-in fade-in-50 duration-200">
          <LiveLogTerminal initialQuery={correlatedLogQuery} />
        </div>
      )}

      {/* Section F: V8 Heap & Hardware Specifications */}
      {activeTab === "runtime" && (
        <div className="space-y-4 animate-in fade-in-50 duration-200">
          <SystemInfoCard
            system={hostMetrics?.system}
            memory={hostMetrics?.memory}
            cpu={hostMetrics?.cpu}
          />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <V8HeapSpacesChart memory={hostMetrics?.memory} className="lg:col-span-6" />
            <EventLoopLatencyChart eventLoop={hostMetrics?.eventLoop} className="lg:col-span-6" />
          </div>
          <HandlesGcMatrix gc={hostMetrics?.gc} handles={hostMetrics?.handles} />
        </div>
      )}

      {/* Section G: Raw Prometheus Metrics */}
      {activeTab === "raw" && (
        <div className="animate-in fade-in-50 duration-200">
          <RawPrometheusViewer rawText={hostMetrics?.rawPrometheus} />
        </div>
      )}
    </div>
  )
}
