"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Cell } from "recharts"
import { EndpointRequestMetric } from "@/types/server-metrics"
import { Activity, Network, Layers } from "lucide-react"

interface EndpointTrafficChartProps {
  endpoints: EndpointRequestMetric[]
}

const METHOD_COLORS: Record<string, string> = {
  GET: "#10b981",    // Emerald
  POST: "#3b82f6",   // Blue
  PUT: "#f59e0b",    // Amber
  DELETE: "#ef4444", // Red
  PATCH: "#8b5cf6",  // Violet
}

export function EndpointTrafficChart({ endpoints }: EndpointTrafficChartProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("ALL")

  const methods = ["ALL", ...Array.from(new Set(endpoints.map((e) => e.method)))]

  const filteredData = endpoints
    .filter((e) => selectedMethod === "ALL" || e.method === selectedMethod)
    .sort((a, b) => b.totalRequests - a.totalRequests)
    .map((e) => ({
      route: e.route.replace("/api/v1", ""),
      fullRoute: e.route,
      method: e.method,
      requests: e.totalRequests,
      percentage: e.percentageOfTraffic,
      avgLatency: e.avgLatencyMs,
      errorRate: e.errorRatePercent,
    }))

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Network className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Network Requests by Endpoint</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Total HTTP request volume distribution across Fastify REST routes
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-lg border border-border/50">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMethod(m)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  selectedMethod === m
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis
                type="category"
                dataKey="route"
                tick={{ fontSize: 11, fill: "hsl(var(--foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                width={85}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
                        <div className="flex items-center justify-between border-b border-border pb-1">
                          <span className="font-semibold text-foreground">{data.fullRoute}</span>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono"
                            style={{
                              borderColor: METHOD_COLORS[data.method] || "#3b82f6",
                              color: METHOD_COLORS[data.method] || "#3b82f6",
                            }}
                          >
                            {data.method}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Total Ingress:</span>
                          <span className="font-mono font-medium text-foreground">
                            {data.requests.toLocaleString()} reqs
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Traffic Share:</span>
                          <span className="font-mono font-medium text-emerald-500">
                            {data.percentage}%
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Avg Latency:</span>
                          <span className="font-mono font-medium text-foreground">
                            {data.avgLatency} ms
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Error Rate:</span>
                          <span className={`font-mono font-medium ${data.errorRate > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                            {data.errorRate}%
                          </span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar dataKey="requests" name="Requests" radius={[0, 4, 4, 0]}>
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={METHOD_COLORS[entry.method] || "#10b981"}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Technical Annotation & Calculation */}
        <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
          <Layers className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">What this calculates:</strong> Aggregates HTTP request counters from Fastify router telemetry (<code className="text-[11px] font-mono bg-muted px-1 py-0.5 rounded">http_requests_total</code>). Traffic share is calculated as <span className="font-mono text-primary font-medium">(Route Requests / Total Server Requests) × 100%</span>.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
