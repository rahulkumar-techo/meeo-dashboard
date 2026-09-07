/**
 * @file data-table-pagination.tsx
 * @description Standardized data table pagination footer with row counters and page navigation.
 * Follows Single Responsibility Principle (SRP) for table paging logic.
 */

"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataTablePaginationProps {
  /** 1-based or 0-based page index (defaults to 1-based for UI) */
  currentPage: number
  /** Total number of pages */
  totalPages: number
  /** Current rows per page */
  pageSize: number
  /** Total item count across all pages */
  totalItems: number
  /** Selected items count if multi-select enabled */
  selectedCount?: number
  /** Page change callback */
  onPageChange: (page: number) => void
  /** Page size change callback */
  onPageSizeChange?: (pageSize: number) => void
  /** Available page size options */
  pageSizeOptions?: number[]
  /** Custom container class */
  className?: string
}

export function DataTablePagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  selectedCount = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className,
}: DataTablePaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-3 border-t border-border/60 px-2 py-3 text-xs sm:flex-row",
        className
      )}
    >
      {/* Left: Selected count & Row display info */}
      <div className="flex items-center gap-2 text-muted-foreground">
        {selectedCount > 0 ? (
          <span className="font-medium text-foreground">
            {selectedCount} of {totalItems} row(s) selected
          </span>
        ) : (
          <span>
            Showing <strong className="font-semibold text-foreground">{startItem}</strong> to{" "}
            <strong className="font-semibold text-foreground">{endItem}</strong> of{" "}
            <strong className="font-semibold text-foreground">{totalItems}</strong> entries
          </span>
        )}
      </div>

      {/* Right: Page size select & Navigation */}
      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 rounded border border-border bg-background px-1.5 py-0 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1 font-medium text-muted-foreground">
          <span>
            Page {currentPage} of {Math.max(1, totalPages)}
          </span>

          <div className="flex items-center gap-1 ml-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onPageChange(1)}
              disabled={currentPage <= 1}
              title="First Page"
            >
              <ChevronsLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              title="Previous Page"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              title="Next Page"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-7"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage >= totalPages}
              title="Last Page"
            >
              <ChevronsRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
