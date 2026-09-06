"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldAlert,
  Shield,
  Lock,
  Download,
  Terminal,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Copy,
  ChevronRight,
  Check,
  RotateCcw,
  Sliders,
  Globe,
  Radio,
  FileCheck,
  Eye,
  Key,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "cn"

interface AuditLogEntry {
  id: string
  timestamp: string
  timeAgo: string
  severity: "critical" | "warning" | "info" | "blocked"
  actor: {
    name: string
    role: string
    initials: string
    avatar?: string
    isServiceAccount?: boolean
  }
  actionVerb: string
  targetResource: string
  sourceIp: string
  geo: string
  shaHash: string
  diffBefore?: Record<string, any>
  diffAfter?: Record<string, any>
  metadata: Record<string, any>
}

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "aud_9841029",
    timestamp: "2024-10-31 14:26:04",
    timeAgo: "Just now",
    severity: "critical",
    actor: { name: "Sarah Jenkins", role: "Super Admin", initials: "SJ" },
    actionVerb: "role.permissions.elevate",
    targetResource: "user:alex.m@apexcommerce.io",
    sourceIp: "198.51.100.42",
    geo: "New York, US",
    shaHash: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    diffBefore: { role: "support_tier_2", can_override_refunds: false, max_payout_limit: 500 },
    diffAfter: { role: "finance_lead", can_override_refunds: true, max_payout_limit: 25000 },
    metadata: { ticket_ref: "SEC-INC-9912", approval_manager: "Sarah Jenkins", reason: "Quarterly Treasury Coverage" },
  },
  {
    id: "aud_9841028",
    timestamp: "2024-10-31 14:22:18",
    timeAgo: "4m ago",
    severity: "warning",
    actor: { name: "Marcus Vance", role: "Inventory Controller", initials: "MV" },
    actionVerb: "inventory.stock.manual_adjust",
    targetResource: "sku:APX-MSE-BLK (East Hub)",
    sourceIp: "198.51.100.88",
    geo: "New Jersey, US",
    shaHash: "sha256:a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0",
    diffBefore: { qty_on_hand: 142, warehouse_loc: "wh_east_1" },
    diffAfter: { qty_on_hand: 120, delta: -22, reason: "Physical Stock Cycle Count Audit" },
    metadata: { audit_type: "cycle_count", supervisor_signed: true },
  },
  {
    id: "aud_9841027",
    timestamp: "2024-10-31 14:18:50",
    timeAgo: "8m ago",
    severity: "warning",
    actor: { name: "Elena Rostova", role: "Finance Lead", initials: "ER" },
    actionVerb: "finance.refund.manual_authorize",
    targetResource: "order:ORD-10244 ($189.00)",
    sourceIp: "203.0.113.12",
    geo: "London, UK",
    shaHash: "sha256:f9e8d7c6b5a43210987654321fedcba0987654321fedcba0987654321fedcba0",
    diffBefore: { order_status: "dispute_open", refund_issued: 0 },
    diffAfter: { order_status: "refunded", refund_issued: 189.0, gateway_ref: "re_3M4k9bL291k" },
    metadata: { customer_email: "j.beck@berlin.de", policy_waiver: "Damaged freight consignment" },
  },
  {
    id: "aud_9841026",
    timestamp: "2024-10-31 14:12:05",
    timeAgo: "14m ago",
    severity: "info",
    actor: { name: "svc-checkout-drain", role: "Internal VPC Worker", initials: "SC", isServiceAccount: true },
    actionVerb: "worker.dlq.retry_batch",
    targetResource: "queue:dead-letter-triage",
    sourceIp: "10.0.4.12",
    geo: "Internal VPC (us-east-1)",
    shaHash: "sha256:1234abcde5678f901234567890abcdef1234567890abcdef1234567890abcdef",
    metadata: { batch_size: 14, retried_success: 13, retried_failed: 1 },
  },
  {
    id: "aud_9841025",
    timestamp: "2024-10-31 13:58:40",
    timeAgo: "28m ago",
    severity: "blocked",
    actor: { name: "Unknown Actor", role: "Failed Auth Signature", initials: "UA" },
    actionVerb: "auth.login.invalid_credential",
    targetResource: "operator:root@apexcommerce.io",
    sourceIp: "185.220.101.5",
    geo: "Tor Exit Node, DE",
    shaHash: "sha256:778899aabbccddeeff00112233445566778899aabbccddeeff00112233445566",
    metadata: { blocked_by_waf: true, geo_rule_id: "WAF-RULE-ANOMALOUS-TOR", attempt_count: 5 },
  },
]

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS)
  const [selectedLogId, setSelectedLogId] = React.useState<string>(INITIAL_AUDIT_LOGS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [severityFilter, setSeverityFilter] = React.useState("all")
  const [copiedHash, setCopiedHash] = React.useState(false)

  const selectedLog = React.useMemo(() => {
    return logs.find((l) => l.id === selectedLogId) || logs[0]
  }, [logs, selectedLogId])

  // Filter logs
  const filteredLogs = React.useMemo(() => {
    return logs.filter((l) => {
      if (severityFilter !== "all" && l.severity !== severityFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          l.id.toLowerCase().includes(q) ||
          l.actionVerb.toLowerCase().includes(q) ||
          l.actor.name.toLowerCase().includes(q) ||
          l.targetResource.toLowerCase().includes(q) ||
          l.sourceIp.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [logs, severityFilter, searchQuery])

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header & Merkle Root Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Administration</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Security Audit Ledger</span>
            <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
              WORM-PROTECTED
            </Badge>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ShieldAlert className="size-7 text-indigo-600" />
            Enterprise Audit Trail & Security Ledger
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Cryptographically signed immutable event logs, privileged access tracking, permission changes, and financial overrides backed by hardware KMS ledger.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Verify Merkle Root
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Download className="size-4" />
            Export Ledger
          </Button>
        </div>
      </div>

      {/* Merkle Root Epoch Banner */}
      <div className="p-3 bg-muted/40 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 font-mono">
          <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-bold text-foreground">Merkle Root Epoch #409,219:</span>
          <span className="text-muted-foreground truncate max-w-md">0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069</span>
        </div>
        <span className="font-mono text-muted-foreground text-[11px]">AWS KMS us-east-1 (HSM-FIPS 140-2 Level 3)</span>
      </div>

      {/* 4 Bento Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Security Events (24H)</span>
            <Shield className="size-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">18,490</span>
            <span className="text-xs text-emerald-600 font-semibold font-mono">0 tamper flags</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span>Chain integrity: 100%</span>
            <span className="text-emerald-600 font-bold">VERIFIED</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Privileged Access Ops</span>
            <Key className="size-4 text-purple-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">142</span>
            <span className="text-xs text-muted-foreground font-mono">Elevated</span>
          </div>
          <div className="flex gap-1.5 font-mono text-[10px] text-muted-foreground pt-1">
            <Badge variant="outline" className="text-[9px] px-1 py-0">18 Stock</Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0">8 Refunds</Badge>
            <Badge variant="outline" className="text-[9px] px-1 py-0">4 Elevations</Badge>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Geo Anomalies & Blocks</span>
            <AlertTriangle className="size-4 text-rose-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-rose-600">3</span>
            <Badge className="bg-rose-100 text-rose-800 text-[10px] font-mono">Mitigated</Badge>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span>2 Tor Exit Nodes</span>
            <span>1 CIDR block</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Retention & Archival</span>
            <Lock className="size-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">7 Years</span>
            <span className="text-xs text-indigo-600 font-mono font-semibold">Immutable WORM</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground font-mono pt-1">
            <span>Glacier Vault Lock</span>
            <span className="text-emerald-600 font-bold">Active</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[240px] max-w-md flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search actor email, IP address, resource UUID, action verb..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-card"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
          >
            <option value="all">Severity: All</option>
            <option value="critical">Critical Security Events</option>
            <option value="warning">Warnings</option>
            <option value="info">Informational</option>
            <option value="blocked">Blocked Threats</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500" />
          <span>Streaming logs (3.2 events/sec)</span>
        </div>
      </div>

      {/* Main Split: Table (7 cols) + Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="h-9">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Timestamp</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Severity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Actor</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Action Verb</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Source IP & Geo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs">
                    No security audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const isSelected = selectedLogId === log.id
                  return (
                    <TableRow
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={cn(
                        "h-12 cursor-pointer transition-colors",
                        log.severity === "critical" ? "bg-rose-50/40 hover:bg-rose-50/60" :
                        log.severity === "blocked" ? "bg-amber-50/40 hover:bg-amber-50/60" :
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell className="font-mono text-xs">
                        <span className="font-semibold text-foreground">{log.timestamp.split(" ")[1]}</span>
                        <span className="block text-[10px] text-muted-foreground">{log.timestamp.split(" ")[0]}</span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono font-bold px-1.5 py-0 uppercase",
                            log.severity === "critical" ? "bg-rose-50 text-rose-700 border-rose-200" :
                            log.severity === "blocked" ? "bg-amber-50 text-amber-800 border-amber-200" :
                            log.severity === "warning" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
                            "bg-muted text-muted-foreground"
                          )}
                        >
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs text-foreground">{log.actor.name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{log.actor.role}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-1.5 py-0.5 rounded bg-muted text-indigo-700 font-mono text-[11px] font-semibold">
                          {log.actionVerb}
                        </code>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="text-foreground">{log.sourceIp}</span>
                        <span className="block text-[10px] text-muted-foreground">{log.geo}</span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: Detailed Audit Inspector */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Audit Record Inspector</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedLog.id}</h3>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 font-mono text-[10px] uppercase font-bold">
              KMS Signed
            </Badge>
          </div>

          {/* Actor & Action Details */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Actor Identity</span>
              <div className="font-semibold text-foreground mt-0.5">{selectedLog.actor.name} ({selectedLog.actor.role})</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Action Verb</span>
              <div className="font-mono text-indigo-700 font-semibold mt-0.5">{selectedLog.actionVerb}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Target Resource</span>
              <div className="font-mono text-foreground mt-0.5 truncate">{selectedLog.targetResource}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Source IP & Location</span>
              <div className="font-mono text-foreground mt-0.5">{selectedLog.sourceIp} ({selectedLog.geo})</div>
            </div>
          </div>

          {/* State Transition Diff */}
          {selectedLog.diffBefore && selectedLog.diffAfter && (
            <div className="space-y-2 text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">State Transition Diff (Before → After)</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-200 text-[11px] font-mono">
                  <div className="text-rose-700 font-bold pb-1">- Previous State</div>
                  <pre className="text-rose-900 leading-tight">{JSON.stringify(selectedLog.diffBefore, null, 2)}</pre>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-200 text-[11px] font-mono">
                  <div className="text-emerald-700 font-bold pb-1">+ Elevated State</div>
                  <pre className="text-emerald-900 leading-tight">{JSON.stringify(selectedLog.diffAfter, null, 2)}</pre>
                </div>
              </div>
            </div>
          )}

          {/* Cryptographic Hash Envelope */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Lock className="size-3.5 text-indigo-600" />
                Immutable SHA-256 Digest
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(selectedLog.shaHash)
                  setCopiedHash(true)
                  setTimeout(() => setCopiedHash(false), 2000)
                }}
                className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
              >
                {copiedHash ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copiedHash ? "Copied" : "Copy Hash"}
              </Button>
            </div>
            <pre className="p-2.5 rounded-lg bg-slate-950 text-slate-200 font-mono text-[11px] break-all leading-tight">
              {selectedLog.shaHash}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
