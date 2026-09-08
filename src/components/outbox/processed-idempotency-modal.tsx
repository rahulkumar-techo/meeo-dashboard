/**
 * @file processed-idempotency-modal.tsx
 * @description Modal dialog listing the consumer idempotency execution audit log from the ProcessedEvent table.
 */

"use client"

import * as React from "react"
import { ShieldCheck, History, ExternalLink, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/common"
import { useProcessedEventsQuery } from "@/hooks/use-outbox-query"

interface ProcessedIdempotencyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProcessedIdempotencyModal({
  open,
  onOpenChange,
}: ProcessedIdempotencyModalProps) {
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [consumerFilter, setConsumerFilter] = React.useState("all")

  const { data: processedData, isLoading } = useProcessedEventsQuery(
    {
      page,
      limit: pageSize,
      consumerName: consumerFilter !== "all" ? consumerFilter : undefined,
    },
    open
  )

  React.useEffect(() => {
    if (open) setPage(1)
  }, [open])

  const items = processedData?.items ?? []
  const totalPages = processedData?.pagination?.totalPages ?? 1
  const totalItems = processedData?.pagination?.total ?? items.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Consumer Idempotency Audit Ledger
              </DialogTitle>
              <DialogDescription className="text-xs">
                Audit log of all events processed by domain consumers with deduplication locks.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-3 text-xs">
          {/* Consumer Filter */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Filter by Consumer:</span>
            <select
              value={consumerFilter}
              onChange={(e) => {
                setConsumerFilter(e.target.value)
                setPage(1)
              }}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Consumer Handlers</option>
              <option value="notificationConsumer">notificationConsumer</option>
              <option value="orderEventsConsumer">orderEventsConsumer</option>
              <option value="paymentEventsConsumer">paymentEventsConsumer</option>
            </select>
          </div>

          <div className="rounded-lg border border-border/70 bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-muted/20">
                  <TableHead>EVENT ID</TableHead>
                  <TableHead>CONSUMER HANDLER</TableHead>
                  <TableHead>STATUS</TableHead>
                  <TableHead className="text-right">PROCESSED AT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <div className="animate-spin inline-block size-5 border-2 border-current border-t-transparent rounded-full text-indigo-600 mb-2" />
                      <div>Loading idempotency records...</div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No consumer executions recorded yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/40">
                      <TableCell className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                        {item.eventId.length > 16
                          ? `${item.eventId.slice(0, 12)}...`
                          : item.eventId}
                      </TableCell>

                      <TableCell className="font-mono text-foreground font-semibold">
                        {item.consumerName}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                        >
                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right text-muted-foreground text-[11px]">
                        {new Date(item.processedAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <DataTablePagination
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
