/**
 * @file page.tsx
 * @description Admin Operators, IAM RBAC Roles & MFA Authentication Console (< 220 lines).
 */

"use client"

import * as React from "react"
import { Download, Plus, Shield, UserCheck, Key } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PageHeader,
  MetricGrid,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { ADMIN_OPERATORS, OperatorUser } from "@/data/admin"

export default function UsersRolesPage() {
  const [operators, setOperators] = React.useState<OperatorUser[]>(ADMIN_OPERATORS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("all")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  const filteredOperators = React.useMemo(() => {
    return operators.filter((op) => {
      if (roleFilter !== "all" && op.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          op.name.toLowerCase().includes(q) ||
          op.email.toLowerCase().includes(q) ||
          op.department.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [operators, roleFilter, searchQuery])

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Admin Users & Role-Based Access Control"
        badge="Zero Trust RBAC"
        badgeVariant="brand"
        description="Manage administrative operators, granular permission policies, hardware token MFA enforcement, and ingress security auditing."
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs font-medium border-border/80">
          <Download className="size-3.5 text-muted-foreground" />
          <span>Export Access Roster</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Invite Operator</span>
        </Button>
      </PageHeader>

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Active Staff Accounts", value: "3 Operators", colorTheme: "indigo", footnote: "100% MFA enforced" },
          { title: "Security Posture", value: "Zero Trust (100%)", colorTheme: "emerald", badge: { text: "FIDO2 Active", variant: "success" }, footnote: "Hardware key verified" },
          { title: "Granular RBAC Roles", value: "5 Defined Roles", colorTheme: "cyan", footnote: "Least privilege model" },
          { title: "Failed Logins (24h)", value: "0 Attempts", colorTheme: "emerald", badge: { text: "Optimal", variant: "success" }, footnote: "Ingress firewall clean" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search operator name, email, department..."
        filters={
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="finance_lead">Finance Lead</option>
            <option value="ops_director">Operations Director</option>
          </select>
        }
        activeFiltersCount={roleFilter !== "all" ? 1 : 0}
        onResetFilters={() => { setRoleFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Table */}
      <div className="rounded-lg border border-border/70 bg-card overflow-hidden shadow-2xs">
        {filteredOperators.length === 0 ? (
          <EmptyState
            title="No Operators Found"
            description="No operator accounts matched your filters."
            actionLabel="Reset Filters"
            onAction={() => { setRoleFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">OPERATOR</TableHead>
                  <TableHead className="font-bold">ROLE</TableHead>
                  <TableHead className="font-bold">DEPARTMENT</TableHead>
                  <TableHead className="font-bold">MFA AUTH</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">LAST INGRESS</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {filteredOperators.map((op) => (
                  <TableRow key={op.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-7 border border-border">
                          <AvatarImage src={op.avatar} />
                          <AvatarFallback>{op.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{op.name}</p>
                          <p className="text-[10.5px] text-muted-foreground">{op.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px] font-medium">{op.roleLabel}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{op.department}</TableCell>
                    <TableCell className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{op.mfaType}</TableCell>
                    <TableCell><StatusBadge status={op.status} showDot /></TableCell>
                    <TableCell className="text-right">
                      <p className="font-medium text-foreground">{op.lastSession}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{op.ingressIp} ({op.location})</p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DataTablePagination
          currentPage={page}
          totalPages={1}
          pageSize={pageSize}
          totalItems={filteredOperators.length}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      </div>
    </div>
  )
}
