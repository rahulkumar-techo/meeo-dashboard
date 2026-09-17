"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Network, Clock, AlertTriangle, Hash } from "lucide-react"

export function EndpointMetricsGlossary() {
  const glossaryItems = [
    {
      icon: Network,
      name: "HTTP Request Volume (Count & Rate)",
      code: "http_requests_total{route, method, status}",
      whatItIs: "A cumulative Prometheus counter recording every HTTP request terminated by Fastify router, tagged by method, path template, and status code.",
      howCalculated: "Throughput (QPS) is calculated as Rate = ΔRequests / ΔTime (seconds). Traffic share percentage = (Route Requests / Total Requests) × 100%.",
      threshold: "Tracks hot API paths (e.g. /products or /orders) to prioritize caching or horizontal database scaling.",
    },
    {
      icon: Clock,
      name: "Response Latency & Percentiles (Mean, P90, P99)",
      code: "http_request_duration_seconds{quantile}",
      whatItIs: "High-precision timer capturing total wall-clock duration from initial TCP packet arrival until response stream completion.",
      howCalculated: "Mean = Total Seconds / Total Requests. P90/P99 represent the latency value below which 90% or 99% of all requests completed.",
      threshold: "<50ms is excellent for CRUD. >200ms usually signifies slow database indexes, unindexed queries, or event-loop stalls.",
    },
    {
      icon: AlertTriangle,
      name: "Endpoint Error Rate (%)",
      code: "Error Rate % = ((4xx + 5xx) / Total) × 100",
      whatItIs: "The proportion of client-side validation errors (4xx) and unhandled server runtime exceptions (5xx) per endpoint.",
      howCalculated: "Calculated by filtering status codes ≥ 400 divided by the route's total request volume.",
      threshold: "<1.0% is healthy. >5.0% 4xx suggests bad client payloads or expired auth tokens; any 5xx requires immediate error log audit.",
    },
    {
      icon: Hash,
      name: "HTTP Status Code Partitioning",
      code: "2xx (Success), 3xx (Redirect), 4xx (Client), 5xx (Server)",
      whatItIs: "Categorization of HTTP response codes to verify REST API contract compliance across consumers and vendors.",
      howCalculated: "Grouped by standard IANA HTTP status ranges: 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Internal Error.",
      threshold: "Elevated 401/403 indicate authentication/RBAC permission anomalies; elevated 429 indicates rate-limiting triggers.",
    },
  ]

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">HTTP Network Telemetry Glossary</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Engineering breakdown of what each endpoint metric measures and how calculations are performed
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {glossaryItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="p-3.5 rounded-lg border border-border/50 bg-background/50 hover:bg-muted/30 transition-all space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-muted text-primary">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{item.name}</h4>
                </div>
              </div>

              <div className="text-[11px] font-mono text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-border/40">
                {item.code}
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground font-medium">What it is: </span>
                  <span className="text-foreground/90">{item.whatItIs}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Calculation: </span>
                  <span className="text-primary font-mono text-[11px]">{item.howCalculated}</span>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Diagnostic Target: </span>
                  <span className="text-foreground/80">{item.threshold}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
