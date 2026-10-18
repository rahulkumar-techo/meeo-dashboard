/**
 * @file tax-classifications-view.tsx
 * @description HSN / SAC Statutory Tax Classification Master Catalog.
 * Allows searching official 4/6/8-digit codes, managing categories,
 * and performing legal verification status updates to resolve unverified catalog alerts.
 */

"use client"

import * as React from "react"
import {
  Tag,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Filter,
  Check,
  X,
  Loader2,
} from "lucide-react"
import {
  useTaxClassificationsQuery,
  useCreateTaxClassificationMutation,
  useUpdateClassificationStatusMutation,
} from "@/hooks/use-tax-query"
import { useTaxContext } from "@/context/tax-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import type {
  TaxClassification,
  ClassificationStatus,
  CreateTaxClassificationPayload,
} from "@/types/tax"

export function TaxClassificationsView() {
  const {
    isCreateClassificationModalOpen,
    setIsCreateClassificationModalOpen,
  } = useTaxContext()

  const [selectedStatus, setSelectedStatus] = React.useState<
    ClassificationStatus | "ALL"
  >("ALL")
  const [searchQuery, setSearchQuery] = React.useState("")

  const { data, isLoading } = useTaxClassificationsQuery({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    search: searchQuery || undefined,
  })

  const classifications = data?.classifications ?? []

  // Filter in memory for snappy typing
  const filteredList = React.useMemo(() => {
    return classifications.filter((item) => {
      const matchesStatus =
        selectedStatus === "ALL" || item.verificationStatus === selectedStatus
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.hsnCode.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
      return matchesStatus && matchesSearch
    })
  }, [classifications, selectedStatus, searchQuery])

  const counts = React.useMemo(() => {
    let verified = 0
    let unverified = 0
    classifications.forEach((c) => {
      if (c.verificationStatus === "VERIFIED") verified++
      else unverified++
    })
    return { ALL: classifications.length, VERIFIED: verified, UNVERIFIED: unverified }
  }, [classifications])

  const updateStatusMutation = useUpdateClassificationStatusMutation()

  const handleToggleStatus = async (
    item: TaxClassification,
    nextStatus: ClassificationStatus
  ) => {
    await updateStatusMutation.mutateAsync({
      id: item.id,
      payload: { status: nextStatus },
    })
  }

  return (
    <div className="space-y-4">
      {/* 1. Unverified Warning Banner if any unverified codes exist */}
      {counts.UNVERIFIED > 0 && (
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300 flex items-start gap-3 shadow-2xs">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold">
              {counts.UNVERIFIED} Tax Classifications Require Legal Verification
            </h4>
            <p className="text-[11px] leading-relaxed opacity-90">
              Orders checking out with unverified HSN codes trigger fallback tax rates and incident warnings in application logs. A Tax Approver must verify their official gazette schedule.
            </p>
            <div className="pt-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedStatus("UNVERIFIED")}
                className="h-6.5 text-[11px] border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
              >
                Filter Unverified HSNs ({counts.UNVERIFIED})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        <div className="flex items-center gap-1.5">
          {(["ALL", "VERIFIED", "UNVERIFIED"] as const).map((status) => {
            const isActive = selectedStatus === status
            return (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span>
                  {status === "ALL"
                    ? "All HSNs"
                    : status === "VERIFIED"
                    ? "Verified"
                    : "Unverified"}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-background text-muted-foreground border border-border/60"
                  }`}
                >
                  {counts[status]}
                </span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 4/6/8-digit code or category..."
              className="pl-8 h-8.5 text-xs bg-background"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateClassificationModalOpen(true)}
            className="h-8.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Add Classification</span>
          </Button>
        </div>
      </div>

      {/* 3. Classifications Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="size-6 animate-spin text-indigo-600" />
            <p className="text-xs text-muted-foreground">
              Loading HSN/SAC master catalog...
            </p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Tag className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No classifications found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Register statutory HSN codes to assign them to products and map GST slabs.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreateClassificationModalOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="size-3.5" />
              Add Classification
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">HSN / SAC Code</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Verified By</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredList.map((item) => {
                  const isVerified = item.verificationStatus === "VERIFIED"

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-foreground text-xs">
                          {item.hsnCode}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-sm">
                        <span className="text-foreground leading-snug">
                          {item.description}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-normal"
                        >
                          {item.category || "General"}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-center">
                        {isVerified ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px] gap-1"
                          >
                            <CheckCircle className="size-3" />
                            VERIFIED
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] gap-1"
                          >
                            <Clock className="size-3" />
                            UNVERIFIED
                          </Badge>
                        )}
                      </td>

                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {item.verifiedBy || "—"}
                      </td>

                      <td className="py-3 px-4 text-right">
                        {!isVerified ? (
                          <Button
                            size="sm"
                            onClick={() => handleToggleStatus(item, "VERIFIED")}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 text-[11px] px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs"
                          >
                            <ShieldCheck className="size-3" />
                            Verify Code
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleStatus(item, "UNVERIFIED")}
                            disabled={updateStatusMutation.isPending}
                            className="h-7 text-[11px] px-2 text-muted-foreground hover:text-amber-600"
                            title="Flag as unverified"
                          >
                            Unverify
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Classification Dialog */}
      <CreateClassificationDialog
        open={isCreateClassificationModalOpen}
        onOpenChange={setIsCreateClassificationModalOpen}
      />
    </div>
  )
}

function CreateClassificationDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [hsnCode, setHsnCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState("")

  const createMutation = useCreateTaxClassificationMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hsnCode.trim() || !description.trim()) return

    const payload: CreateTaxClassificationPayload = {
      hsnCode: hsnCode.trim(),
      description: description.trim(),
      category: category.trim() || undefined,
      verificationStatus: "UNVERIFIED",
    }

    await createMutation.mutateAsync(payload)
    onOpenChange(false)
    setHsnCode("")
    setDescription("")
    setCategory("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Register HSN / SAC Classification
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Add a new statutory tariff code for catalog mapping. New classifications start as UNVERIFIED pending legal review.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              HSN / SAC Code *
            </label>
            <Input
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
              placeholder="e.g. 84713010 or 6203"
              required
              className="font-mono text-xs h-8.5"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Laptops and portable digital processing machines"
              required
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Category</label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Electronics, Apparel, Footwear..."
              className="text-xs h-8.5"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending}
              className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {createMutation.isPending ? "Registering..." : "Register HSN"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
