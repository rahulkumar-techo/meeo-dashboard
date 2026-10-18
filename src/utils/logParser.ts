/**
 * @file logParser.ts
 * @description Utility to parse, strip ANSI escape codes, and normalize raw Fastify/Pino
 * logs, Loki streams, and SSE events into readable log entries.
 */

import type { LogLevel, NormalizedLogEntry } from "@/types/observability"

// Regex to strip ANSI color and formatting escape sequences
const ANSI_REGEX =
  /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g

export function stripAnsi(str: string): string {
  if (!str || typeof str !== "string") return ""
  return str.replace(ANSI_REGEX, "").trim()
}

// Pino numeric level mapping
const PINO_LEVELS: Record<number, LogLevel> = {
  10: "trace",
  20: "debug",
  30: "info",
  40: "warn",
  50: "error",
  60: "error", // fatal
}

export function normalizeLogLevel(level: unknown): LogLevel {
  if (typeof level === "number" && PINO_LEVELS[level]) {
    return PINO_LEVELS[level]
  }

  if (typeof level === "string") {
    const clean = level.toLowerCase().trim()
    if (clean === "warn" || clean === "warning") return "warn"
    if (clean === "err" || clean === "error" || clean === "fatal") return "error"
    if (clean === "info") return "info"
    if (clean === "debug") return "debug"
    if (clean === "trace") return "trace"
  }

  return "info"
}

export interface ParsedHttpLog {
  method: string
  url: string
  statusCode: number
  duration: string
  reqId?: string
}

const HTTP_ACCESS_REGEX =
  /^(GET|POST|PUT|DELETE|PATCH|OPTIONS|HEAD)\s+(\S+)\s+(\d{3})\s+([0-9.]+\s*m?s)(?:\s+\[([a-zA-Z0-9_-]+)\])?/i

export function parseHttpAccessLog(message: string): ParsedHttpLog | null {
  const cleanMsg = stripAnsi(message).replace(/\s+/g, " ")
  const match = cleanMsg.match(HTTP_ACCESS_REGEX)
  if (!match) return null

  return {
    method: match[1].toUpperCase(),
    url: match[2],
    statusCode: Number(match[3]),
    duration: match[4],
    reqId: match[5],
  }
}

/**
 * Normalizes any log payload (Pino JSON object, JSON string, or Loki line)
 * into a consistent, readable NormalizedLogEntry.
 */
export function normalizeLogEntry(input: unknown): NormalizedLogEntry {
  let item: Record<string, unknown> = {}
  let rawString = ""

  if (typeof input === "string") {
    rawString = input
    const trimmed = input.trim()
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        item = JSON.parse(trimmed) as Record<string, unknown>
      } catch {
        item = { message: trimmed }
      }
    } else {
      item = { message: trimmed }
    }
  } else if (input && typeof input === "object") {
    item = input as Record<string, unknown>
    rawString = JSON.stringify(input)
  }

  // 1. Resolve Timestamp
  let timestampIso = new Date().toISOString()
  let timestampNs = String(Date.now() * 1_000_000)

  if (item.timestamp) {
    timestampIso =
      typeof item.timestamp === "number"
        ? new Date(item.timestamp).toISOString()
        : String(item.timestamp)
  } else if (item.time) {
    timestampIso =
      typeof item.time === "number"
        ? new Date(item.time).toISOString()
        : String(item.time)
  }

  if (item.timestampNs) {
    timestampNs = String(item.timestampNs)
  }

  // 2. Resolve Level
  const level = normalizeLogLevel(item.level ?? item.severity)

  // 3. Resolve Message
  const rawMsg = item.msg ?? item.message ?? (typeof input === "string" ? input : "")
  const cleanMsg = stripAnsi(String(rawMsg))

  const structObj = (item.structured || item.fields) as Record<string, unknown> | undefined

  // 4. Resolve Request ID
  const reqId =
    item.reqId ??
    item.req_id ??
    item.requestId ??
    structObj?.reqId

  // 5. Check if it's an HTTP access log
  const httpInfo = parseHttpAccessLog(cleanMsg)
  const finalReqId = (reqId || httpInfo?.reqId) as string | undefined

  // 6. Build structured metadata
  const structured: Record<string, unknown> = {
    ...(structObj || {}),
  }

  if (item.pid !== undefined) structured.pid = item.pid
  if (finalReqId) structured.reqId = finalReqId
  if (item.hostname) structured.hostname = item.hostname
  if (item.err || item.error) structured.error = item.err || item.error
  if (httpInfo) {
    structured.http = httpInfo
  }

  // 7. Format final human-readable display message
  let displayMessage = cleanMsg
  if (httpInfo) {
    displayMessage = `${httpInfo.method} ${httpInfo.url}  ${httpInfo.statusCode} (${httpInfo.duration})`
  }

  const id =
    item.id ||
    `log-${timestampNs}-${Math.random().toString(36).slice(2, 7)}`

  return {
    id: String(id),
    timestamp: timestampIso,
    timestampNs,
    level,
    message: displayMessage || "[Empty log message]",
    labels: (item.labels as Record<string, string>) || {},
    structured,
    raw: rawString,
  }
}
