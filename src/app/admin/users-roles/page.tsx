"use client"

import * as React from "react"
import Link from "next/link"
import {
  UserCheck,
  Shield,
  ShieldAlert,
  Key,
  Lock,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Download,
  Users,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MoreVertical,
  Check,
  ChevronRight,
  Sparkles,
  Smartphone,
  Eye,
  Sliders,
  RotateCcw,
  Building2,
  Fingerprint,
  Mail,
  Zap,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { cn } from "cn"

interface Operator {
  id: string
  name: string
  email: string
  initials: string
  avatar?: string
  role: "super_admin" | "ops_director" | "finance_lead" | "support_lead" | "catalog_manager"
  roleLabel: string
  department: string
  mfaType: "FIDO2 YubiKey 5C" | "TOTP Authenticator" | "Hardware Token"
  status: "active" | "pending" | "suspended"
  lastSession: string
  ingressIp: string
  location: string
  permissions: {
    commerce: boolean
    finance: boolean
    operations: boolean
    security: boolean
  }
}

const INITIAL_OPERATORS: Operator[] = [
  {
    id: "usr_adm_01",
    name: "Sarah Jenkins",
    email: "sarah.j@apexcommerce.io",
    initials: "SJ",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    role: "super_admin",
    roleLabel: "Super Admin",
    department: "Operations & Security Engineering",
    mfaType: "FIDO2 YubiKey 5C",
    status: "active",
    lastSession: "Active Now",
    ingressIp: "198.51.100.42",
    location: "New York, US",
    permissions: { commerce: true, finance: true, operations: true, security: true },
  },
  {
    id: "usr_adm_02",
    name: "Marcus Vance",
    email: "marcus.v@apexcommerce.io",
    initials: "MV",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    role: "ops_director",
    roleLabel: "Logistics & Inventory Manager",
    department: "Global Warehousing",
    mfaType: "TOTP Authenticator",
    status: "active",
    lastSession: "18m ago",
    ingressIp: "198.51.100.88",
    location: "New Jersey Hub, US",
    permissions: { commerce: true, finance: false, operations: true, security: false },
  },
  {
    id: "usr_adm_03",
    name: "Elena Rostova",
    email: "elena.r@apexcommerce.io",
    initials: "ER",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    role: "finance_lead",
    roleLabel: "Finance & Audit Lead",
    department: "Treasury & Reconciliation",
    mfaType: "FIDO2 YubiKey 5C",
    status: "active",
    lastSession: "1h ago",
    ingressIp: "203.0.113.12",
    location: "London, UK",
    permissions: { commerce: false, finance: true, operations: false, security: false },
  },
  {
    id: "usr_adm_04",
    name: "David Miller",
    email: "david.m@apexcommerce.io",
    initials: "DM",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    role: "support_lead",
    roleLabel: "Customer Support Lead",
    department: "Tier 2 Escalations",
    mfaType: "TOTP Authenticator",
    status: "active",
    lastSession: "Today, 09:14 AM",
    ingressIp: "198.51.100.91",
    location: "Chicago, US",
    permissions: { commerce: true, finance: false, operations: false, security: false },
  },
  {
    id: "usr_adm_05",
    name: "Alex Chen",
    email: "alex.c@apexcommerce.io",
    initials: "AC",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
    role: "catalog_manager",
    roleLabel: "Catalog & Merchandising Manager",
    department: "Product Merchandising",
    mfaType: "TOTP Authenticator",
    status: "active",
    lastSession: "Yesterday",
    ingressIp: "198.51.100.104",
    location: "San Francisco, US",
    permissions: { commerce: true, finance: false, operations: false, security: false },
  },
]

export default function UsersRolesPage() {
  const [operators, setOperators] = React.useState<Operator[]>(INITIAL_OPERATORS)
  const [selectedOperatorId, setSelectedOperatorId] = React.useState<string>(INITIAL_OPERATORS[0].id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [statusTab, setStatusTab] = React.useState("all")
  const [isInviteModalOpen, setIsInviteModalOpen] = React.useState(false)

  // Invite Form
  const [inviteForm, setInviteForm] = React.useState({
    name: "",
    email: "",
    role: "support_lead" as Operator["role"],
    department: "Operations",
  })

  const selectedOperator = React.useMemo(() => {
    return operators.find((o) => o.id === selectedOperatorId) || operators[0]
  }, [operators, selectedOperatorId])

  // Filter operators
  const filteredOperators = React.useMemo(() => {
    return operators.filter((o) => {
      if (roleFilter !== "all" && o.role !== roleFilter) return false
      if (statusTab === "active" && o.status !== "active") return false
      if (statusTab === "pending" && o.status !== "pending") return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          o.name.toLowerCase().includes(q) ||
          o.email.toLowerCase().includes(q) ||
          o.ingressIp.toLowerCase().includes(q) ||
          o.roleLabel.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [operators, roleFilter, statusTab, searchQuery])

  // Toggle permission
  const handleTogglePermission = (scope: keyof Operator["permissions"]) => {
    setOperators((prev) =>
      prev.map((o) => {
        if (o.id === selectedOperator.id) {
          return {
            ...o,
            permissions: {
              ...o.permissions,
              [scope]: !o.permissions[scope],
            },
          }
        }
        return o
      })
    )
  }

  // Handle invite submit
  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteForm.name || !inviteForm.email) return

    const newOp: Operator = {
      id: `usr_adm_${Math.floor(10 + Math.random() * 90)}`,
      name: inviteForm.name,
      email: inviteForm.email,
      initials: inviteForm.name.split(" ").map(n => n[0]).join("").toUpperCase() || "OP",
      role: inviteForm.role,
      roleLabel: inviteForm.role.replace("_", " ").toUpperCase(),
      department: inviteForm.department,
      mfaType: "TOTP Authenticator",
      status: "active",
      lastSession: "Invite Sent",
      ingressIp: "—",
      location: "Pending Auth",
      permissions: { commerce: true, finance: false, operations: false, security: false },
    }

    setOperators((prev) => [newOp, ...prev])
    setSelectedOperatorId(newOp.id)
    setIsInviteModalOpen(false)
    setInviteForm({ name: "", email: "", role: "support_lead", department: "Operations" })
  }

  return (
    <div className="flex-1 space-y-6 p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* SSO / SCIM Status Banner */}
      <div className="w-full bg-indigo-50/70 border border-indigo-100 px-4 py-2 rounded-lg flex items-center justify-between text-xs text-foreground">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-emerald-500" />
          </span>
          <span className="font-mono text-indigo-700 font-bold uppercase tracking-wider">SCIM ENGINE ACTIVE:</span>
          <span className="text-muted-foreground">Okta directory push synced 4m ago (<code className="font-mono text-foreground font-semibold">okta-prod-tenant-01.apexcommerce.io</code>). 0 collisions detected.</span>
        </div>
        <span className="font-mono text-muted-foreground hidden sm:inline">Auth Protocol: <b>SAML 2.0 / SCIM 2.1</b></span>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase">
            <span>Administration</span>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="text-foreground font-semibold">Users & Permissions</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <UserCheck className="size-7 text-indigo-600" />
            Team Directory & RBAC Security Matrix
          </h1>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Manage administrative operators, multi-tenant role inheritance, granular resource scopes, and continuous single sign-on (SSO) reconciliation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <RefreshCw className="size-4 text-indigo-600" />
            Okta Sync
          </Button>
          <Button
            size="sm"
            onClick={() => setIsInviteModalOpen(true)}
            className="h-9 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
          >
            <Plus className="size-4" />
            Invite Team Member
          </Button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Total Active Operators</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">48</span>
            <span className="text-xs font-mono text-indigo-600 font-semibold">Active Operators</span>
          </div>
          <div className="bg-muted/40 p-1.5 rounded font-mono text-[11px] text-muted-foreground flex justify-between">
            <span><b className="text-foreground">32</b> active today</span>
            <span>•</span>
            <span><b className="text-foreground">4</b> pending</span>
            <span>•</span>
            <span className="text-rose-600">2 suspended</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Configured Roles</span>
            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
              <Shield className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">6</span>
            <span className="text-xs font-mono text-muted-foreground">Role Tiers</span>
          </div>
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full rounded-full bg-muted flex overflow-hidden">
              <div className="bg-indigo-600 w-[6%]" title="Super Admin: 3" />
              <div className="bg-purple-500 w-[10%]" title="Ops Director: 5" />
              <div className="bg-blue-500 w-[38%]" title="Support: 18" />
              <div className="bg-emerald-500 w-[25%]" title="Catalog: 12" />
              <div className="bg-amber-500 w-[13%]" title="Finance: 6" />
              <div className="bg-slate-400 w-[8%]" title="API: 4" />
            </div>
            <div className="flex justify-between font-mono text-[9px] text-muted-foreground">
              <span>Admin 3</span>
              <span>Ops 5</span>
              <span>Supp 18</span>
              <span>Cat 12</span>
              <span>Fin 6</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">2FA & Hardware Enforce</span>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono font-bold">STRICT</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-foreground">100%</span>
            <Fingerprint className="size-5 text-indigo-600" />
          </div>
          <div className="bg-muted/40 p-1.5 rounded font-mono text-[11px] text-muted-foreground flex justify-between">
            <span className="text-indigo-600 font-semibold">24 FIDO2 YubiKey</span>
            <span>•</span>
            <span>24 App TOTP</span>
            <span>•</span>
            <span className="text-rose-600">0 SMS</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="rounded-xl border bg-card p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Directory Sync Status</span>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-mono">HEALTHY</Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold text-foreground">Okta Enterprise</span>
            <CheckCircle2 className="size-5 text-emerald-600" />
          </div>
          <div className="bg-muted/40 p-1.5 rounded font-mono text-[11px] text-muted-foreground flex justify-between">
            <span>Auto Provisioning</span>
            <span>•</span>
            <span>Real-time Revoke</span>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-2">
          <Tabs value={statusTab} onValueChange={setStatusTab} className="w-full sm:w-auto">
            <TabsList className="bg-muted/70 p-1">
              <TabsTrigger value="all" className="text-xs gap-1.5">
                Team Members & Operators <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{operators.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="active" className="text-xs gap-1.5">
                Active
              </TabsTrigger>
              <TabsTrigger value="roles" className="text-xs gap-1.5">
                Role Definitions (6)
              </TabsTrigger>
              <TabsTrigger value="service_accounts" className="text-xs gap-1.5">
                Service Accounts (14)
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <Download className="size-3.5" /> Export Audit CSV
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] max-w-md flex-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, IP, role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-card"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-8 px-2.5 rounded-md border text-xs bg-card text-foreground cursor-pointer focus:outline-none"
            >
              <option value="all">Role: All Roles (6)</option>
              <option value="super_admin">Super Admin</option>
              <option value="ops_director">Logistics & Inventory</option>
              <option value="finance_lead">Finance & Audit</option>
              <option value="support_lead">Customer Support</option>
              <option value="catalog_manager">Catalog Manager</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Split: Operator Table (7 cols) + RBAC Permissions Inspector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Operators Table */}
        <div className="lg:col-span-7 rounded-xl border bg-card shadow-2xs overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="h-9">
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Operator Identity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Assigned Role</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">MFA Protocol</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider">Last Session</TableHead>
                <TableHead className="w-12 text-center text-[10px] font-bold uppercase tracking-wider">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOperators.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground text-xs">
                    No operators match query.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOperators.map((op) => {
                  const isSelected = selectedOperatorId === op.id
                  return (
                    <TableRow
                      key={op.id}
                      onClick={() => setSelectedOperatorId(op.id)}
                      className={cn(
                        "h-12 cursor-pointer transition-colors",
                        isSelected ? "bg-indigo-50/70 hover:bg-indigo-50/90" : "hover:bg-muted/40"
                      )}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          {op.avatar ? (
                            <img src={op.avatar} alt={op.name} className="size-8 rounded-full object-cover shrink-0" />
                          ) : (
                            <div className="size-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {op.initials}
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0">
                            <div className="font-semibold text-xs text-foreground truncate flex items-center gap-1">
                              {op.name}
                              {op.id === "usr_adm_01" && (
                                <Badge variant="outline" className="text-[8px] bg-indigo-50 text-indigo-700 font-bold px-1 py-0">YOU</Badge>
                              )}
                            </div>
                            <div className="font-mono text-[10px] text-muted-foreground truncate">{op.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium text-xs text-foreground">{op.roleLabel}</div>
                          <div className="text-[10px] text-muted-foreground">{op.department}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <Fingerprint className="size-3.5 text-indigo-600 shrink-0" />
                          <span className="font-mono text-[11px] text-muted-foreground truncate">{op.mfaType}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-0.5 font-mono text-[11px]">
                          <span className={cn(op.lastSession.includes("Now") ? "text-emerald-600 font-bold" : "text-foreground")}>
                            {op.lastSession}
                          </span>
                          <span className="block text-[10px] text-muted-foreground truncate">{op.ingressIp} • {op.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-mono font-bold px-1.5 py-0",
                            op.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            "bg-amber-50 text-amber-800 border-amber-200"
                          )}
                        >
                          {op.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Right: RBAC Scope Inspector */}
        <div className="lg:col-span-5 rounded-xl border bg-card shadow-2xs p-5 space-y-5 sticky top-20">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Permission Matrix Inspector</span>
              <h3 className="text-sm font-semibold font-mono text-foreground">{selectedOperator.name}</h3>
            </div>
            <Badge className="bg-indigo-100 text-indigo-800 font-mono text-[10px] uppercase font-bold">
              {selectedOperator.roleLabel}
            </Badge>
          </div>

          {/* User Details Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-muted/30 p-3 rounded-lg border">
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Operator Email</span>
              <div className="font-mono text-foreground font-semibold mt-0.5 truncate">{selectedOperator.email}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Security Token</span>
              <div className="font-mono text-foreground mt-0.5">{selectedOperator.mfaType}</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Ingress IP & Geo</span>
              <div className="font-mono text-foreground mt-0.5">{selectedOperator.ingressIp} ({selectedOperator.location})</div>
            </div>
            <div>
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Directory Source</span>
              <div className="font-mono text-emerald-600 font-semibold mt-0.5">Okta SAML 2.0 (Synced)</div>
            </div>
          </div>

          {/* Granular Permission Toggles */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">Active Module Permissions</span>

            <div className="space-y-2">
              {/* Scope 1: Commerce */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                <div>
                  <div className="font-semibold text-foreground">Commerce & Catalog Access</div>
                  <div className="text-[11px] text-muted-foreground">Orders, Products, Categories, Brands, Inventory</div>
                </div>
                <Switch
                  checked={selectedOperator.permissions.commerce}
                  onCheckedChange={() => handleTogglePermission("commerce")}
                />
              </div>

              {/* Scope 2: Finance */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                <div>
                  <div className="font-semibold text-foreground">Finance & Payout Ledger</div>
                  <div className="text-[11px] text-muted-foreground">Payments, Dispute Triage, Gateway Settlements</div>
                </div>
                <Switch
                  checked={selectedOperator.permissions.finance}
                  onCheckedChange={() => handleTogglePermission("finance")}
                />
              </div>

              {/* Scope 3: Operations */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                <div>
                  <div className="font-semibold text-foreground">Operations & Background Jobs</div>
                  <div className="text-[11px] text-muted-foreground">Worker Queue Pools, Outbox Dispatch, System Health</div>
                </div>
                <Switch
                  checked={selectedOperator.permissions.operations}
                  onCheckedChange={() => handleTogglePermission("operations")}
                />
              </div>

              {/* Scope 4: Security */}
              <div className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs">
                <div>
                  <div className="font-semibold text-foreground">Security & Audit Logs</div>
                  <div className="text-[11px] text-muted-foreground">Audit Trail, Role Creation, SCIM Admin Config</div>
                </div>
                <Switch
                  checked={selectedOperator.permissions.security}
                  onCheckedChange={() => handleTogglePermission("security")}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button size="sm" className="flex-1 text-xs h-8 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white">
              <Lock className="size-3.5" /> Save Permission Scopes
            </Button>
            <Button size="sm" variant="outline" className="flex-1 text-xs h-8 gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50">
              <ShieldAlert className="size-3.5" /> Revoke All Sessions
            </Button>
          </div>
        </div>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleInviteSubmit}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Plus className="size-4 text-indigo-600" /> Invite Operator to Admin Console
              </DialogTitle>
              <DialogDescription className="text-xs">
                Send an invitation link with enforced hardware MFA onboarding requirements.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Full Name *</label>
                <Input
                  required
                  placeholder="e.g. Jordan Lee"
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Company Email Address *</label>
                <Input
                  required
                  type="email"
                  placeholder="jordan.l@apexcommerce.io"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">RBAC Role Tier</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value as any })}
                    className="w-full h-8 px-2.5 rounded-md border text-xs bg-background"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="ops_director">Logistics & Inventory Manager</option>
                    <option value="finance_lead">Finance & Audit Lead</option>
                    <option value="support_lead">Customer Support Lead</option>
                    <option value="catalog_manager">Catalog Manager</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Department</label>
                  <Input
                    value={inviteForm.department}
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
