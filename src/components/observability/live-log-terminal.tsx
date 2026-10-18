/**
 * @file live-log-terminal.tsx
 * @description Advanced Terminal UI for Loki logs with Live SSE & Socket.IO streaming,
 * Historical LogQL Search, level filtering, correlation search by reqId/traceId,
 * structured JSON inspector, auto-scroll, pause/resume, and export.
 * Zero dummy data.
 */

"use client"

import * as React from "react"
import {
  Search,
  Play,
  Pause,
  Trash2,
  Download,
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  Radio,
  History,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Bug,
  Hash,
} from "lucide-react"
import { useLiveLogsSSE } from "@/hooks/use-live-logs-sse"
import { useHistoricalLogs } from "@/hooks/use-observability"
import { cn } from "@/lib/utils"
import { normalizeLogEntry, type ParsedHttpLog } from "@/utils/logParser"
import type { LogLevel, NormalizedLogEntry } from "@/types/observability"

interface LiveLogTerminalProps {
  initialQuery?: string
  className?: string
  onCorrelateTrace?: (traceId: string) => void
}

type TerminalMode = "live" | "historical"

export function LiveLogTerminal({
  initialQuery = '{job="meeo-api"}',
  className,
}: LiveLogTerminalProps) {
  const [mode, setMode] = React.useState<TerminalMode>("live")
  const [logQuery, setLogQuery] = React.useState<string>(initialQuery)
  const [prevInitialQuery, setPrevInitialQuery] = React.useState<string>(initialQuery)
  const [search, setSearch] = React.useState("")
  const [filterLevel, setFilterLevel] = React.useState<string>("all")
  const [autoScroll, setAutoScroll] = React.useState(true)
  const [expandedId, setExpandedId] = React.useState<string | null>(null)
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  // Sync state when initialQuery changes from parent without cascading effect renders
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery)
    setLogQuery(initialQuery)
  }

  const logContainerRef = React.useRef<HTMLDivElement>(null)

  // 1. Live SSE & Socket.IO Stream Hook
  const {
    logs: liveLogs,
    isConnected,
    isPaused,
    transport,
    setTransport,
    togglePause,
    clearLogs,
    isSocketAvailable,
  } = useLiveLogsSSE({
    query: logQuery,
    maxBuffer: 800,
    autoConnect: mode === "live",
    transport: "socket",
  })

  // 2. Historical LogQL Query Hook
  const {
    data: historicalData,
    isLoading: isHistoricalLoading,
    refetch: refetchHistorical,
  } = useHistoricalLogs({
    query: logQuery,
    limit: 100,
    direction: "backward",
    level: filterLevel !== "all" ? filterLevel : undefined,
  })

  const logsToDisplay: NormalizedLogEntry[] = React.useMemo(() => {
    let list: NormalizedLogEntry[] = []
    if (mode === "historical") {
      list = historicalData?.logs || []
    } else if (liveLogs.length === 0 && historicalData?.logs && historicalData.logs.length > 0) {
      list = historicalData.logs
    } else {
      list = liveLogs
    }
    return list.map(normalizeLogEntry)
  }, [mode, historicalData, liveLogs])

  // Filter logs based on search string and log level
  const filteredLogs = React.useMemo(() => {
    return logsToDisplay.filter((log) => {
      if (filterLevel !== "all" && log.level !== filterLevel) return false
      if (search.trim()) {
        const q = search.toLowerCase()
        const msgMatch = log.message.toLowerCase().includes(q)
        const reqMatch = String(log.structured?.reqId || "").toLowerCase().includes(q)
        const rawMatch = (log.raw || "").toLowerCase().includes(q)
        if (!msgMatch && !reqMatch && !rawMatch) return false
      }
      return true
    })
  }, [logsToDisplay, filterLevel, search])

  // Auto-scroll when new logs arrive in live mode
  React.useEffect(() => {
    if (mode === "live" && autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [filteredLogs, autoScroll, mode])

  const handleCopy = React.useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }, [])

  const handleToggleExpand = React.useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleFilterReqId = React.useCallback((reqId: string) => {
    setLogQuery(`{job="meeo-api"} |= "${reqId}"`)
  }, [])

  const downloadLogs = () => {
    const content = filteredLogs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `loki-logs-${new Date().toISOString()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-xl overflow-hidden font-mono",
        className
      )}
    >
      {/* 1. Top Mode & Transport Selector Header */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 px-4 py-2.5 gap-2 bg-zinc-900/80">
        <div className="flex items-center gap-3">
          {/* Mode Tabs: Live Stream vs Historical Query */}
          <div className="flex items-center rounded-lg border border-zinc-800 bg-zinc-950 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer",
                mode === "live"
                  ? "bg-emerald-500/20 text-emerald-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <Radio className="size-3" />
              <span>Live Stream</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("historical")
                refetchHistorical()
              }}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors cursor-pointer",
                mode === "historical"
                  ? "bg-indigo-500/20 text-indigo-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <History className="size-3" />
              <span>Historical LogQL</span>
            </button>
          </div>

          {/* Live Status Beacon */}
          {mode === "live" ? (
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "size-2 rounded-full",
                  isPaused
                    ? "bg-amber-500"
                    : isConnected
                    ? "bg-emerald-500 animate-pulse"
                    : "bg-rose-500"
                )}
              />
              <span className="text-[11px] font-bold tracking-wider uppercase text-zinc-400">
                {isPaused ? "PAUSED" : isConnected ? "STREAMING" : "CONNECTING..."}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-zinc-400">
              <Activity className="size-3 text-indigo-400" />
              <span>Loki API Query ({filteredLogs.length} entries)</span>
            </div>
          )}
        </div>

        {/* Transport selector for Live Mode */}
        {mode === "live" && (
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500 text-[11px]">Transport:</span>
            <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-950 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setTransport("sse")}
                className={cn(
                  "px-2 py-0.5 rounded cursor-pointer",
                  transport === "sse"
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                SSE
              </button>
              <button
                type="button"
                onClick={() => setTransport("socket")}
                disabled={!isSocketAvailable}
                className={cn(
                  "px-2 py-0.5 rounded cursor-pointer disabled:opacity-40",
                  transport === "socket"
                    ? "bg-zinc-800 text-zinc-100 font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
                title={isSocketAvailable ? "Use Socket.IO channel" : "Socket.IO not connected"}
              >
                Socket.IO
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. Secondary Filter & Search Controls */}
      <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 px-4 py-2.5 gap-2 bg-zinc-900/40">
        {/* Stream Selector Input & Presets */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[260px] max-w-2xl">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-zinc-500 text-[11px] font-mono shrink-0">LogQL:</span>
            <input
              type="text"
              value={logQuery}
              onChange={(e) => setLogQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "historical") {
                  refetchHistorical()
                }
              }}
              placeholder='{job="meeo-api"} or {service="meeo-server"} |= "req-..."'
              className="h-7 flex-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-emerald-400 placeholder-zinc-600 focus:border-indigo-500 focus:outline-hidden font-mono"
            />
            {mode === "historical" && (
              <button
                type="button"
                onClick={() => refetchHistorical()}
                className="h-7 px-2.5 rounded-md border border-indigo-500/40 bg-indigo-500/20 text-indigo-400 text-xs font-medium hover:bg-indigo-500/30 cursor-pointer"
              >
                Run
              </button>
            )}
          </div>
          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400 shrink-0">
            <span className="text-zinc-600">Preset:</span>
            <button
              type="button"
              onClick={() => setLogQuery('{job="meeo-api"}')}
              className={cn(
                "px-1.5 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 cursor-pointer transition-colors",
                logQuery === '{job="meeo-api"}' && "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              )}
            >
              job=meeo-api
            </button>
            <button
              type="button"
              onClick={() => setLogQuery('{service="meeo-server"}')}
              className={cn(
                "px-1.5 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 cursor-pointer transition-colors",
                logQuery === '{service="meeo-server"}' && "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              )}
            >
              service=meeo-server
            </button>
            <button
              type="button"
              onClick={() => setLogQuery('{container="meeo-api"}')}
              className={cn(
                "px-1.5 py-0.5 rounded border border-zinc-800 hover:border-zinc-700 hover:text-zinc-200 cursor-pointer transition-colors",
                logQuery === '{container="meeo-api"}' && "border-indigo-500/50 bg-indigo-500/10 text-indigo-300"
              )}
            >
              fallback
            </button>
          </div>
        </div>

        {/* Search, Level, Auto-scroll & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick text / reqId search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter text / [reqId]..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-7 w-44 rounded-md border border-zinc-800 bg-zinc-900/90 pl-7 pr-2 text-xs text-zinc-200 placeholder-zinc-500 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Level Filter Dropdown */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="h-7 rounded-md border border-zinc-800 bg-zinc-900 px-2 text-xs text-zinc-200 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Levels</option>
            <option value="error">Error Only</option>
            <option value="warn">Warn Only</option>
            <option value="info">Info Only</option>
            <option value="debug">Debug Only</option>
          </select>

          {mode === "live" && (
            <>
              {/* Auto-scroll toggle */}
              <button
                type="button"
                onClick={() => setAutoScroll(!autoScroll)}
                className={cn(
                  "h-7 rounded-md border px-2.5 text-xs font-medium transition-colors cursor-pointer",
                  autoScroll
                    ? "bg-zinc-800 border-zinc-600 text-zinc-200"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                Auto-Scroll
              </button>

              {/* Pause / Resume */}
              <button
                type="button"
                onClick={togglePause}
                className="flex h-7 items-center gap-1 rounded-md border border-zinc-800 bg-zinc-900 px-2.5 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors cursor-pointer"
                title={isPaused ? "Resume log stream" : "Pause log stream"}
              >
                {isPaused ? (
                  <Play className="size-3 text-emerald-400" />
                ) : (
                  <Pause className="size-3 text-amber-400" />
                )}
                <span>{isPaused ? "Resume" : "Pause"}</span>
              </button>

              {/* Clear */}
              <button
                type="button"
                onClick={clearLogs}
                className="flex h-7 items-center gap-1 rounded-md border border-zinc-800 px-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors cursor-pointer"
                title="Clear buffer"
              >
                <Trash2 className="size-3" />
              </button>
            </>
          )}

          {/* Download Logs */}
          <button
            type="button"
            onClick={downloadLogs}
            disabled={filteredLogs.length === 0}
            className="flex h-7 items-center gap-1 rounded-md border border-zinc-800 px-2 text-xs text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors disabled:opacity-40 cursor-pointer"
            title="Export logs to text file"
          >
            <Download className="size-3" />
          </button>
        </div>
      </div>

      {/* Table Column Header for Pixel-Perfect Alignment */}
      <div className="flex items-center gap-2.5 px-3 py-1.5 border-b border-zinc-800 bg-zinc-950/95 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider select-none shrink-0 font-mono">
        <span className="w-[84px] shrink-0">Time</span>
        <span className="w-[68px] shrink-0">Level</span>
        <span className="w-[86px] shrink-0">Req ID</span>
        <span className="w-[54px] shrink-0 text-center">Method</span>
        <span className="flex-1 min-w-0">Endpoint / Message</span>
        <span className="w-[68px] shrink-0 text-right">Status</span>
        <span className="w-[76px] shrink-0 text-right">Latency</span>
        <span className="w-[48px] shrink-0 text-right">Actions</span>
      </div>

      {/* 3. Terminal Viewport */}
      <div
        ref={logContainerRef}
        className="h-[460px] overflow-y-auto font-mono text-xs leading-relaxed divide-y divide-zinc-900/60"
      >
        {isHistoricalLoading ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-500 space-y-2">
            <Radio className="size-6 text-indigo-400 animate-pulse" />
            <span>Querying Grafana Loki historical logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-zinc-600 space-y-2">
            <Radio className="size-6 text-zinc-700 animate-pulse" />
            <span>No log entries match the current query or filter.</span>
            <span className="text-[11px] text-zinc-600">
              Query: {logQuery}
            </span>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <LogItemRow
              key={log.id}
              log={log}
              isExpanded={expandedId === log.id}
              isCopied={copiedId === log.id}
              onToggleExpand={handleToggleExpand}
              onCopy={handleCopy}
              onFilterReqId={handleFilterReqId}
            />
          ))
        )}
      </div>
    </div>
  )
}

/* =========================================================================
 * Helper Functions & Memoized Row Component for High-Performance Rendering
 * ========================================================================= */

const getLevelBadge = (level: LogLevel) => {
  switch (level) {
    case "error":
      return "bg-rose-950/80 text-rose-400 border-rose-800"
    case "warn":
      return "bg-amber-950/80 text-amber-400 border-amber-800"
    case "info":
      return "bg-blue-950/80 text-blue-400 border-blue-800"
    case "debug":
      return "bg-purple-950/80 text-purple-400 border-purple-800"
    case "trace":
      return "bg-teal-950/80 text-teal-400 border-teal-800"
    default:
      return "bg-zinc-800 text-zinc-400 border-zinc-700"
  }
}

const getLevelIcon = (level: LogLevel) => {
  switch (level) {
    case "error":
      return <AlertCircle className="size-2.5 shrink-0" />
    case "warn":
      return <AlertTriangle className="size-2.5 shrink-0" />
    case "info":
      return <Info className="size-2.5 shrink-0" />
    case "debug":
      return <Bug className="size-2.5 shrink-0" />
    case "trace":
      return <Activity className="size-2.5 shrink-0" />
    default:
      return <Info className="size-2.5 shrink-0" />
  }
}

const getMethodBadge = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-sky-400 bg-sky-950/60 border-sky-800/80"
    case "POST":
      return "text-emerald-400 bg-emerald-950/60 border-emerald-800/80"
    case "PUT":
    case "PATCH":
      return "text-amber-400 bg-amber-950/60 border-amber-800/80"
    case "DELETE":
      return "text-rose-400 bg-rose-950/60 border-rose-800/80"
    default:
      return "text-zinc-400 bg-zinc-900 border-zinc-700"
  }
}

const getStatusCodeClass = (status: number) => {
  if (status >= 500) return "text-rose-400 font-semibold"
  if (status >= 400) return "text-amber-400 font-semibold"
  if (status >= 300) return "text-sky-400 font-semibold"
  return "text-emerald-400 font-semibold"
}

const getStatusIcon = (status: number) => {
  if (status >= 500) return <AlertCircle className="size-2.5 shrink-0 text-rose-400" />
  if (status >= 400) return <AlertTriangle className="size-2.5 shrink-0 text-amber-400" />
  return <CheckCircle2 className="size-2.5 shrink-0 text-emerald-400" />
}

interface LogItemRowProps {
  log: NormalizedLogEntry
  isExpanded: boolean
  isCopied: boolean
  onToggleExpand: (id: string) => void
  onCopy: (text: string, id: string) => void
  onFilterReqId: (reqId: string) => void
}

const LogItemRow = React.memo(function LogItemRow({
  log,
  isExpanded,
  isCopied,
  onToggleExpand,
  onCopy,
  onFilterReqId,
}: LogItemRowProps) {
  const http = log.structured?.http as ParsedHttpLog | undefined
  const reqId = log.structured?.reqId ? String(log.structured.reqId) : null

  const formattedTime = React.useMemo(() => {
    try {
      return new Date(log.timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        fractionalSecondDigits: 3,
      })
    } catch {
      return log.timestamp
    }
  }, [log.timestamp])

  return (
    <div className="group transition-colors hover:bg-zinc-900/70 border-b border-zinc-900/50">
      <div className="flex items-center gap-2.5 px-3 py-1.5 text-xs font-mono select-none">
        {/* 1. Timestamp (Fixed 84px) */}
        <span className="w-[84px] shrink-0 text-zinc-500 text-[11px] tabular-nums select-all font-mono">
          {formattedTime}
        </span>

        {/* 2. Level Badge with Icon (Fixed 68px) */}
        <div
          className={cn(
            "flex items-center gap-1 w-[68px] shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
            getLevelBadge(log.level)
          )}
        >
          {getLevelIcon(log.level)}
          <span className="truncate">{log.level}</span>
        </div>

        {/* 3. Request ID (Fixed 86px) */}
        <div className="w-[86px] shrink-0 overflow-hidden">
          {reqId ? (
            <button
              type="button"
              onClick={() => onFilterReqId(reqId)}
              className="flex items-center gap-1 w-full px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 text-[11px] font-mono truncate transition-colors cursor-pointer"
              title={`Filter logs for ${reqId}`}
            >
              <Hash className="size-2.5 shrink-0 opacity-60 text-indigo-400" />
              <span className="truncate">{reqId}</span>
            </button>
          ) : (
            <span className="text-zinc-700 text-[11px] px-1.5">—</span>
          )}
        </div>

        {/* 4. HTTP Method (Fixed 54px) */}
        <div className="w-[54px] shrink-0">
          {http ? (
            <span
              className={cn(
                "block text-center px-1 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider",
                getMethodBadge(http.method)
              )}
            >
              {http.method}
            </span>
          ) : (
            <span className="text-zinc-700 text-[10px] block text-center">—</span>
          )}
        </div>

        {/* 5. Endpoint Path or Message (flex-1 min-w-0 truncate) */}
        <div className="flex-1 min-w-0 flex items-center pr-2">
          {http ? (
            <span
              className="text-zinc-100 font-medium truncate select-all"
              title={http.url}
            >
              {http.url}
            </span>
          ) : (
            <span
              className="text-zinc-300 truncate select-all"
              title={log.message}
            >
              {log.message}
            </span>
          )}
        </div>

        {/* 6. Status Code (Fixed 68px) */}
        <div className="w-[68px] shrink-0 flex items-center justify-end">
          {http ? (
            <div
              className={cn(
                "flex items-center gap-1 px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900 text-[11px] font-mono",
                getStatusCodeClass(http.statusCode)
              )}
            >
              {getStatusIcon(http.statusCode)}
              <span>{http.statusCode}</span>
            </div>
          ) : (
            <span className="text-zinc-700 text-[11px]">—</span>
          )}
        </div>

        {/* 7. Duration / Latency (Fixed 76px) */}
        <div className="w-[76px] shrink-0 flex items-center justify-end gap-1 text-[11px] text-zinc-400 font-mono">
          {http?.duration ? (
            <>
              <Clock className="size-2.5 text-zinc-500 shrink-0" />
              <span>{http.duration}</span>
            </>
          ) : (
            <span className="text-zinc-700">—</span>
          )}
        </div>

        {/* 8. Actions (Fixed 48px) */}
        <div className="w-[48px] shrink-0 flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {Boolean(log.structured && Object.keys(log.structured).length > 0) && (
            <button
              type="button"
              onClick={() => onToggleExpand(log.id)}
              className="rounded p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
              title="View structured metadata"
            >
              {isExpanded ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => onCopy(log.raw || log.message, log.id)}
            className="rounded p-1 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Copy log entry"
          >
            {isCopied ? (
              <Check className="size-3 text-emerald-400" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        </div>
      </div>

      {/* Structured JSON Payload Inspector */}
      {Boolean(isExpanded && log.structured) && (
        <div className="mt-1 mb-2.5 mx-3 rounded-md border border-zinc-800/90 bg-zinc-900/95 p-3 text-[11px] text-zinc-300 overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-800 text-[10px] text-zinc-500 font-sans uppercase tracking-wider">
            <span>Structured Payload Details</span>
            <span className="font-mono text-zinc-400">Stream: {log.labels?.service || log.labels?.job || "meeo-api"}</span>
          </div>
          <pre className="font-mono text-emerald-400 text-xs">
            {JSON.stringify(log.structured, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
})
