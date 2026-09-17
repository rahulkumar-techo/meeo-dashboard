"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { EndpointRequestMetric } from "@/types/server-metrics"
import { Clock, Zap, AlertCircle } from "lucide-react"

interface EndpointLatencyChartProps {
  endpoints: EndpointRequestMetric[]
}

export function EndpointLatencyChart({ endpoints }: EndpointLatencyChartProps) {
  const chartData = endpoints.map((e) => ({
    route: e.route.replace("/api/v1", ""),
    fullRoute: e.route,
    method: e.method,
    avgLatency: e.avgLatencyMs,
    p90Latency: e.p90LatencyMs,
    p99Latency: e.p99LatencyMs,
  }))

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Clock className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Response Latency by Route (ms)</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Average vs P90 Tail Latency across critical API endpoints
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[11px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-mono">
              &lt;50ms Fast
            </Badge>
            <Badge variant="outline" className="text-[11px] bg-amber-500/10 text-amber-600 border-amber-500/20 font-mono">
              &gt;100ms I/O Bound
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
              <XAxis
                dataKey="route"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                angle={-20}
                textAnchor="end"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                unit=" ms"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-popover/95 backdrop-blur-md border border-border p-3 rounded-lg shadow-xl text-xs space-y-1.5 min-w-[200px]">
                        <div className="font-semibold text-foreground border-b border-border pb-1">
                          {data.method} {data.fullRoute}
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Mean (Avg) Latency:</span>
                          <span className="font-mono font-medium text-blue-500">{data.avgLatency} ms</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>P90 Tail Latency:</span>
                          <span className="font-mono font-medium text-purple-500">{data.p90Latency} ms</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>P99 Worst Case:</span>
                          <span className="font-mono font-medium text-amber-500">{data.p99Latency} ms</span>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                formatter={(value) => <span className="text-foreground">{value}</span>}
              />
              <Bar dataKey="avgLatency" name="Mean Latency (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="p90Latency" name="P90 Latency (ms)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Technical Explanation */}
        <div className="p-2.5 rounded-md bg-muted/30 border border-border/40 text-xs text-muted-foreground flex items-start gap-2">
          <Zap className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">What this measures:</strong> Time in milliseconds from when Fastify accepts the socket payload until the response headers and payload stream have flushed. P90 represents the maximum latency experienced by 90% of all client requests.
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
