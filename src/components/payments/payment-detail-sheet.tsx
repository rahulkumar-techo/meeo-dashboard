/**
 * @file payment-detail-sheet.tsx
 * @description Slide-over drawer inspecting comprehensive payment breakdown, double-entry financial ledger, gateway attempt records, and refund audit history.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  CreditCard,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Layers,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Receipt,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePaymentDetail } from "@/hooks/use-payment-query"
import { PaymentStatusBadge } from "./payment-status-badge"
import { RefundDialog } from "./refund-dialog"
import { ReconcileDialog } from "./reconcile-dialog"
import type { PaymentListItem, PaymentDetail } from "@/types/payment"

interface PaymentDetailSheetProps {
  paymentId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onActionSuccess?: () => void
}

export function PaymentDetailSheet({
  paymentId,
  open,
  onOpenChange,
  onActionSuccess,
}: PaymentDetailSheetProps) {
  const [activeTab, setActiveTab] = React.useState("overview")
  const [refundOpen, setRefundOpen] = React.useState(false)
  const [reconcileOpen, setReconcileOpen] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const { data: paymentDetail, isLoading, refetch } = usePaymentDetail(
    paymentId || "",
    open && Boolean(paymentId)
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!paymentId) return null

  const payment = paymentDetail
  const totalAmount = Number(payment?.amount) || 0
  const refundedAmount = Number(payment?.refundedAmount) || 0
  const netRetained = totalAmount - refundedAmount
  const remainingRefundable = Math.max(0, netRetained)

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-border/70 bg-muted/20">
            <SheetHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    {payment?.provider || "GATEWAY"}
                  </Badge>
                  {payment && <PaymentStatusBadge status={payment.status} />}
                </div>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReconcileOpen(true)}
                    className="h-8 gap-1.5 text-xs font-medium"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Reconcile</span>
                  </Button>
                  {(payment?.status === "SUCCESS" ||
                    payment?.status === "PARTIALLY_REFUNDED") &&
                    remainingRefundable > 0 && (
                      <Button
                        size="sm"
                        onClick={() => setRefundOpen(true)}
                        className="h-8 gap-1.5 text-xs bg-orange-600 hover:bg-orange-700 text-white font-medium"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Issue Refund</span>
                      </Button>
                    )}
                </div>
              </div>

              <div>
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <span>Payment Breakdown</span>
                </SheetTitle>
                <SheetDescription className="text-xs font-mono text-muted-foreground flex items-center gap-2 mt-1">
                  <span>{paymentId}</span>
                  <button
                    onClick={() => copyToClipboard(paymentId)}
                    className="hover:text-foreground inline-flex items-center gap-1 text-muted-foreground"
                    title="Copy Payment ID"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </SheetDescription>
              </div>
            </SheetHeader>
          </div>

          {isLoading || !payment ? (
            <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
              <div className="animate-spin inline-block size-6 border-2 border-current border-t-transparent rounded-full text-indigo-600" />
              <p>Loading payment specifications & ledger records...</p>
            </div>
          ) : (
            <div className="flex-1 p-6 space-y-6">
              {/* Financial Snapshot Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Original Amount
                  </span>
                  <div className="text-base font-bold text-foreground font-mono">
                    ${totalAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {payment.currency}
                  </span>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Refunded
                  </span>
                  <div className="text-base font-bold text-orange-600 dark:text-orange-400 font-mono">
                    ${refundedAmount.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {refundedAmount > 0
                      ? `${((refundedAmount / totalAmount) * 100).toFixed(0)}% refunded`
                      : "No refunds"}
                  </span>
                </div>

                <div className="rounded-lg border border-border/70 bg-card p-3 space-y-1">
                  <span className="text-[11px] font-medium text-muted-foreground">
                    Net Retained
                  </span>
                  <div className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${netRetained.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Settled to merchant
                  </span>
                </div>
              </div>

              {/* Tabs for Overview, Ledger, Attempts, Refunds */}
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full space-y-4"
              >
                <TabsList className="grid w-full grid-cols-4 h-9">
                  <TabsTrigger value="overview" className="text-xs">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="ledger" className="text-xs">
                    Ledger ({payment.transactions?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="attempts" className="text-xs">
                    Attempts ({payment.attempts?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="refunds" className="text-xs">
                    Refunds ({payment.refunds?.length || 0})
                  </TabsTrigger>
                </TabsList>

                {/* 1. Overview Tab */}
                <TabsContent value="overview" className="space-y-4 text-xs">
                  <div className="rounded-lg border border-border/70 bg-card divide-y divide-border/60">
                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Linked Order:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-foreground">
                          {payment.orderId}
                        </span>
                        <Link
                          href="/orders"
                          className="text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Gateway Provider:</span>
                      <Badge variant="secondary" className="font-semibold">
                        {payment.provider}
                      </Badge>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span className="font-medium text-foreground capitalize">
                        {payment.paymentMethod || "card_visa"}
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Attempts Count:</span>
                      <span className="font-mono text-foreground font-semibold">
                        {payment.attemptsCount || payment.attempts?.length || 1}
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Created Timestamp:</span>
                      <span className="text-foreground">
                        {new Date(payment.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 flex justify-between items-center">
                      <span className="text-muted-foreground">Last Updated:</span>
                      <span className="text-foreground">
                        {new Date(payment.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* 2. Double-Entry Financial Ledger */}
                <TabsContent value="ledger" className="space-y-3 text-xs">
                  <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                          <TableHead>ENTRY TYPE</TableHead>
                          <TableHead>AMOUNT</TableHead>
                          <TableHead>GATEWAY TXN ID</TableHead>
                          <TableHead className="text-right">RECORDED AT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.transactions && payment.transactions.length > 0 ? (
                          payment.transactions.map((txn) => (
                            <TableRow key={txn.id}>
                              <TableCell>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                                    txn.type === "CAPTURE"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                      : txn.type === "REFUND"
                                      ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                  }`}
                                >
                                  {txn.type === "CAPTURE" ? (
                                    <ArrowDownRight className="h-3 w-3" />
                                  ) : (
                                    <ArrowUpRight className="h-3 w-3" />
                                  )}
                                  {txn.type}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono font-bold text-foreground">
                                ${Number(txn.amount).toFixed(2)} {txn.currency}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground text-[11px]">
                                {txn.gatewayTransactionId || "N/A"}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-[11px]">
                                {new Date(txn.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                })}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No ledger transactions recorded yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* 3. Gateway Attempts Ledger */}
                <TabsContent value="attempts" className="space-y-3 text-xs">
                  <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                          <TableHead>#</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>GATEWAY TXN REF</TableHead>
                          <TableHead>CODE</TableHead>
                          <TableHead className="text-right">ATTEMPTED AT</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.attempts && payment.attempts.length > 0 ? (
                          payment.attempts.map((att) => (
                            <TableRow key={att.id}>
                              <TableCell className="font-mono font-semibold">
                                #{att.attemptNumber}
                              </TableCell>
                              <TableCell>
                                <PaymentStatusBadge status={att.status} />
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground text-[11px]">
                                {att.gatewayTransactionId || "N/A"}
                              </TableCell>
                              <TableCell className="font-mono text-foreground">
                                {att.gatewayResponseCode || "200"}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-[11px]">
                                {new Date(att.createdAt).toLocaleTimeString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No attempt history found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                {/* 4. Refunds Tab */}
                <TabsContent value="refunds" className="space-y-3 text-xs">
                  <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/30">
                          <TableHead>REFUND ID</TableHead>
                          <TableHead>AMOUNT</TableHead>
                          <TableHead>STATUS</TableHead>
                          <TableHead>REASON / NOTE</TableHead>
                          <TableHead className="text-right">DATE</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.refunds && payment.refunds.length > 0 ? (
                          payment.refunds.map((ref) => (
                            <TableRow key={ref.id}>
                              <TableCell className="font-mono font-medium text-foreground">
                                {ref.id.slice(0, 8)}...
                              </TableCell>
                              <TableCell className="font-mono font-bold text-orange-600 dark:text-orange-400">
                                ${Number(ref.amount).toFixed(2)} {ref.currency}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-[10px]">
                                  {ref.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground max-w-[150px] truncate">
                                {ref.reason || "N/A"}
                              </TableCell>
                              <TableCell className="text-right text-muted-foreground text-[11px]">
                                {new Date(ref.createdAt).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={5}
                              className="text-center py-6 text-muted-foreground"
                            >
                              No refunds issued for this payment.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Sub Modals */}
      {payment && (
        <>
          <RefundDialog
            payment={payment}
            open={refundOpen}
            onOpenChange={setRefundOpen}
            onSuccess={() => {
              refetch()
              onActionSuccess?.()
            }}
          />
          <ReconcileDialog
            payment={payment}
            open={reconcileOpen}
            onOpenChange={setReconcileOpen}
            onSuccess={() => {
              refetch()
              onActionSuccess?.()
            }}
          />
        </>
      )}
    </>
  )
}
