/**
 * @file data-table-toolbar.tsx
 * @description Standardized data table filter and action toolbar.
 * Implements Open/Closed Principle with search, filters, views, and action slots.
 */

"use client"

import * as React from "react"
import { Search, X, SlidersHorizontal, LayoutGrid, List } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface DataTableToolbarProps {
  /** Search query value */
  searchQuery?: string
  /** Search query change handler */
  onSearchChange?: (value: string) => void
  /** Search input placeholder */
  searchPlaceholder?: string
  /** Active view mode (table list or grid) */
  viewMode?: "list" | "grid"
  /** View mode change handler */
  onViewModeChange?: (mode: "list" | "grid") => void
  /** Custom filter controls or dropdowns */
  filters?: React.ReactNode
  /** Action buttons (Export, New, Bulk Actions) */
  actions?: React.ReactNode
  /** Count of active applied filters for the indicator badge */
  activeFiltersCount?: number
  /** Reset all filters handler */
  onResetFilters?: () => void
  /** Container custom class */
  className?: string
}

export function DataTableToolbar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  viewMode,
  onViewModeChange,
  filters,
  actions,
  activeFiltersCount = 0,
  onResetFilters,
  className,
}: DataTableToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Left Area: Search & Filter Popovers */}
      <div className="flex flex-1 flex-wrap items-center gap-2">
        {onSearchChange && (
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-8.5 pl-8 pr-7 text-xs bg-background/80"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        )}

        {filters}

        {activeFiltersCount > 0 && onResetFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8.5 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="mr-1 size-3" />
            Reset ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Right Area: View Toggles & Actions */}
      <div className="flex items-center gap-2 self-end sm:self-auto">
        {viewMode && onViewModeChange && (
          <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => onViewModeChange("list")}
              className={cn(
                "flex size-7 items-center justify-center rounded p-1 transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="List View"
            >
              <List className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              className={cn(
                "flex size-7 items-center justify-center rounded p-1 transition-colors",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Grid View"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        )}

        {actions}
      </div>
    </div>
  )
}
