/**
 * @file customer-table.tsx
 * @description Master data table for customer accounts with Ecommerce Intelligence, VIP loyalty tiers, risk ratings, and quick actions.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  Eye,
  ShieldAlert,
  UserCog,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  MailCheck,
  PhoneCall,
} from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { EmptyState, DataTablePagination, StatusBadge } from "@/components/common"
import { CustomerTierBadge } from "./customer-tier-badge"
import { CustomerRiskBadge } from "./customer-risk-badge"
import type { AdminCustomer } from "@/types/customer"

export interface CustomerTableProps {
  items: AdminCustomer[]
  total: number
  totalPages: number
  page: number
  pageSize: number
  isLoading: boolean
  hasActiveFilters?: boolean
  onInspect360: (customer: AdminCustomer) => void
  onModerateStatus: (customer: AdminCustomer) => void
  onEditProfile: (customer: AdminCustomer) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onResetFilters?: () => void
}

export function CustomerTable({
  items,
  total,
  totalPages,
  page,
  pageSize,
  isLoading,
  hasActiveFilters,
  onInspect360,
  onModerateStatus,
  onEditProfile,
  onPageChange,
  onPageSizeChange,
  onResetFilters,
}: CustomerTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopy = (text: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(text)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatCurrency = (val: number | string) => {
    const num = typeof val === "number" ? val : parseFloat(String(val)) || 0
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num)
  }

  const formatTimestamp = (dateStr?: string | null) => {
    if (!dateStr) return "Never"
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4 font-semibold text-foreground">CUSTOMER</TableHead>
              <TableHead className="font-semibold text-foreground">LOYALTY TIER</TableHead>
              <TableHead className="font-semibold text-foreground">STATUS</TableHead>
              <TableHead className="font-semibold text-center text-foreground">ORDERS</TableHead>
              <TableHead className="font-semibold text-right text-foreground">LIFETIME SPEND</TableHead>
              <TableHead className="font-semibold text-foreground">FRAUD RISK</TableHead>
              <TableHead className="font-semibold text-foreground">LAST ACTIVE</TableHead>
              <TableHead className="text-right pr-4 font-semibold text-foreground">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="text-xs">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={idx} className="animate-pulse">
                  <TableCell className="pl-4 py-3.5"><div className="h-5 w-44 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-20 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-16 bg-muted rounded" /></TableCell>
                  <TableCell className="text-center"><div className="h-5 w-8 mx-auto bg-muted rounded" /></TableCell>
                  <TableCell className="text-right"><div className="h-5 w-16 ml-auto bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-5 w-24 bg-muted rounded" /></TableCell>
                  <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                  <TableCell className="text-right pr-4"><div className="h-7 w-28 ml-auto bg-muted rounded" /></TableCell>
                </TableRow>
              ))
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="p-0">
                  <EmptyState
                    title="No Customers Found"
                    description={
                      hasActiveFilters
                        ? "No customer accounts match your active search or filter criteria."
                        : "No customer accounts have registered on the platform yet."
                    }
                    actionLabel={hasActiveFilters ? "Reset Filters" : undefined}
                    onAction={onResetFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((cust) => {
                const customerName =
                  cust.firstName || cust.lastName
                    ? `${cust.firstName || ""} ${cust.lastName || ""}`.trim()
                    : "Customer Profile"
                const initials = customerName
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .join("")
                  .toUpperCase()
                  .slice(0, 2) || "C"

                return (
                  <TableRow
                    key={cust.id}
                    onClick={() => onInspect360(cust)}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                  >
                    {/* Customer Profile */}
                    <TableCell className="pl-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8 border border-border">
                          {cust.avatarUrl && <AvatarImage src={cust.avatarUrl} alt={customerName} />}
                          <AvatarFallback className="text-[10px] font-bold">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[220px]">
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-foreground truncate">
                              {customerName}
                            </p>
                            {cust.emailVerified && (
                              <span title="Email Verified">
                                <MailCheck className="size-3 text-emerald-600" />
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <span className="truncate">{cust.email}</span>
                            <button
                              type="button"
                              onClick={(e) => handleCopy(cust.email, e)}
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Copy Email"
                            >
                              {copiedId === cust.email ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* VIP Loyalty Tier */}
                    <TableCell>
                      <CustomerTierBadge tier={cust.tier} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={cust.status.toLowerCase()} showDot />
                    </TableCell>

                    {/* Total Orders */}
                    <TableCell className="text-center font-mono font-semibold text-foreground">
                      {cust.totalOrders}
                    </TableCell>

                    {/* Lifetime Spend */}
                    <TableCell className="text-right font-mono font-bold text-foreground">
                      {formatCurrency(cust.totalSpend)}
                    </TableCell>

                    {/* Risk Rating */}
                    <TableCell>
                      <CustomerRiskBadge
                        score={cust.riskScore}
                        level={cust.riskLevel}
                        actionNeeded={cust.actionNeeded}
                      />
                    </TableCell>

                    {/* Last Active Date */}
                    <TableCell className="text-muted-foreground text-[11px] whitespace-nowrap">
                      {formatTimestamp(cust.lastLoginAt || cust.lastOrderDate || cust.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/customers/${cust.id}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-[11px] gap-1 border-border/80"
                            title="Open Full 360° Profile"
                          >
                            <Eye className="size-3" />
                            <span>360°</span>
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onModerateStatus(cust)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Moderate Status (Block / Suspend)"
                        >
                          <ShieldAlert className="size-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => onEditProfile(cust)}
                          className="hover:bg-muted text-muted-foreground hover:text-foreground"
                          title="Edit Profile"
                        >
                          <UserCog className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination
        currentPage={page}
        totalPages={totalPages || 1}
        pageSize={pageSize}
        totalItems={total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  )
}
