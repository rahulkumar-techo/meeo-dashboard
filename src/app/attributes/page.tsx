/**
 * @file page.tsx
 * @description Master Product Attributes management page.
 */

"use client"

import * as React from "react"
import { Tag, Plus, RefreshCw, Search, Layers, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/common"
import { useAttributesQuery } from "@/hooks/use-attribute-query"
import { AttributeTable } from "@/components/attributes/attribute-table"
import { CreateAttributeDialog } from "@/components/attributes/create-attribute-dialog"
import { EditAttributeDialog } from "@/components/attributes/edit-attribute-dialog"
import { DeleteAttributeDialog } from "@/components/attributes/delete-attribute-dialog"
import type { Attribute } from "@/types/attribute"

export default function AttributesPage() {
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(20)

  // Dialog state
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  const [editAttribute, setEditAttribute] = React.useState<Attribute | null>(null)
  const [deleteAttribute, setDeleteAttribute] = React.useState<Attribute | null>(null)

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const { data, isLoading, isFetching, refetch } = useAttributesQuery({
    page,
    limit: pageSize,
    search: debouncedSearch || undefined,
  })

  const attributes = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  // Compute summary metrics
  const totalValuesCount = attributes.reduce((acc, curr) => {
    return acc + (curr.values?.length ?? curr._count?.values ?? 0)
  }, 0)
  const avgValues = attributes.length > 0 ? (totalValuesCount / attributes.length).toFixed(1) : "0"

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <PageHeader
        title="Master Attributes"
        description="Manage product options (e.g., Color, Size, Storage) to build variant matrices."
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs h-8.5 gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs font-semibold"
          >
            <Plus className="size-3.5" />
            <span>Create Attribute</span>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Master Attributes</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Tag className="size-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{total}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Defined product variation types</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Configured Values</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Layers className="size-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{totalValuesCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Across loaded attributes</p>
        </div>

        <div className="rounded-xl border border-border/70 bg-card p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Avg Values / Attribute</span>
            <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <SlidersHorizontal className="size-3.5" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold tracking-tight text-foreground font-mono">{avgValues}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Options density</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search attributes by name..."
            className="pl-9 h-8.5 text-xs bg-card"
          />
        </div>
        {search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearch("")}
            className="h-8 text-xs text-muted-foreground"
          >
            Clear filter
          </Button>
        )}
      </div>

      {/* Attributes Table */}
      <AttributeTable
        items={attributes}
        total={total}
        totalPages={totalPages}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        hasActiveFilters={Boolean(debouncedSearch)}
        onCreateClick={() => setIsCreateOpen(true)}
        onEditAttribute={(attr) => setEditAttribute(attr)}
        onDeleteAttribute={(attr) => setDeleteAttribute(attr)}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize)
          setPage(1)
        }}
      />

      {/* Modals */}
      <CreateAttributeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={() => refetch()}
      />

      <EditAttributeDialog
        attribute={editAttribute}
        open={Boolean(editAttribute)}
        onOpenChange={(open) => !open && setEditAttribute(null)}
        onSuccess={() => refetch()}
      />

      <DeleteAttributeDialog
        attribute={deleteAttribute}
        open={Boolean(deleteAttribute)}
        onOpenChange={(open) => !open && setDeleteAttribute(null)}
        onSuccess={() => refetch()}
      />
    </div>
  )
}
