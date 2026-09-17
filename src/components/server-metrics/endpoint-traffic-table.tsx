"use client"

import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { EndpointRequestMetric } from "@/types/server-metrics"
import { Search, Filter, ArrowUpDown, Globe, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"

interface EndpointTrafficTableProps {
  endpoints: EndpointRequestMetric[]
}

const METHOD_VARIANTS: Record<string, { bg: string; text: string; border: string }> = {
  GET: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20" },
  POST: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
  PUT: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
  DELETE: { bg: "bg-rose-500/10", text: "text-rose-600 dark:text-rose-400", border: "border-rose-500/20" },
  PATCH: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/20" },
}

export function EndpointTrafficTable({ endpoints }: EndpointTrafficTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("ALL")

  const methods = ["ALL", ...Array.from(new Set(endpoints.map((e) => e.method)))]

  const filteredEndpoints = useMemo(() => {
    return endpoints
      .filter((item) => {
        const matchesSearch = item.route.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesMethod = methodFilter === "ALL" || item.method === methodFilter
        return matchesSearch && matchesMethod
      })
      .sort((a, b) => b.totalRequests - a.totalRequests)
  }, [endpoints, searchTerm, methodFilter])

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                <Globe className="h-4 w-4" />
              </div>
              <CardTitle className="text-base font-semibold">Endpoint Telemetry Matrix</CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live HTTP ingress counts, response latencies, and HTTP status codes per API route
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative w-44 sm:w-56">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-xs pl-8 bg-background/70 border-border/60"
              />
            </div>
            <div className="flex items-center gap-1 bg-muted/40 p-0.5 rounded-md border border-border/50">
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded transition-all ${
                    methodFilter === m
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-[80px] text-xs font-semibold">Method</TableHead>
                <TableHead className="text-xs font-semibold">Endpoint Route</TableHead>
                <TableHead className="text-xs font-semibold text-right">Requests</TableHead>
                <TableHead className="text-xs font-semibold w-[120px]">Traffic Share</TableHead>
                <TableHead className="text-xs font-semibold text-right">Avg Latency</TableHead>
                <TableHead className="text-xs font-semibold text-right">P90 Latency</TableHead>
                <TableHead className="text-xs font-semibold">Status Codes</TableHead>
                <TableHead className="text-xs font-semibold text-right">Error Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEndpoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    No endpoint metrics match your filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEndpoints.map((ep, idx) => {
                  const mStyle = METHOD_VARIANTS[ep.method] || {
                    bg: "bg-muted",
                    text: "text-foreground",
                    border: "border-border",
                  }
                  return (
                    <TableRow key={`${ep.method}-${ep.route}-${idx}`} className="border-border/40 hover:bg-muted/20">
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono font-bold px-1.5 py-0 ${mStyle.bg} ${mStyle.text} ${mStyle.border}`}
                        >
                          {ep.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs font-medium text-foreground">{ep.route}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">
                        {ep.totalRequests.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                            <span>{ep.percentageOfTraffic}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${Math.min(ep.percentageOfTraffic * 2.5, 100)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        <span className={ep.avgLatencyMs > 100 ? "text-amber-500 font-semibold" : ""}>
                          {ep.avgLatencyMs} ms
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {ep.p90LatencyMs} ms
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {ep.statusCodes.map((sc) => (
                            <span
                              key={sc.status}
                              className={`text-[10px] font-mono px-1 py-0.2 rounded border ${
                                sc.type === "2xx"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : sc.type === "4xx"
                                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              }`}
                            >
                              {sc.status} ({sc.count})
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-mono ${
                            ep.errorRatePercent === 0
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : ep.errorRatePercent < 2
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                          }`}
                        >
                          {ep.errorRatePercent}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
