/**
 * @file tax-rules-view.tsx
 * @description Statutory GST Rule Catalog view with full lifecycle operations.
 * Implements DRAFT -> APPROVED -> ACTIVE / SCHEDULED -> RETIRED state transitions,
 * dual-authorization approval dialogs, publication safe-binding, and audit history inspection.
 */

"use client"

import * as React from "react"
import {
  Scale,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  Archive,
  History,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react"
import {
  useTaxRulesQuery,
  useCreateTaxRuleMutation,
  useApproveTaxRuleMutation,
  usePublishTaxRuleMutation,
  useRetireTaxRuleMutation,
  useTaxRuleAuditsQuery,
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
  TaxRule,
  TaxRuleStatus,
  TaxTreatment,
  CreateTaxRulePayload,
} from "@/types/tax"

export function TaxRulesView() {
  const {
    isCreateRuleModalOpen,
    setIsCreateRuleModalOpen,
    approvingRule,
    setApprovingRule,
    publishingRule,
    setPublishingRule,
    retiringRule,
    setRetiringRule,
    inspectAuditRule,
    setInspectAuditRule,
  } = useTaxContext()

  // State
  const [selectedStatus, setSelectedStatus] = React.useState<TaxRuleStatus | "ALL">("ALL")
  const [searchQuery, setSearchQuery] = React.useState("")

  // Fetch Rules
  const { data, isLoading, refetch } = useTaxRulesQuery({
    status: selectedStatus === "ALL" ? undefined : selectedStatus,
    search: searchQuery || undefined,
  })

  const rules = data?.rules ?? []

  // Filtered in memory for snappy responsiveness
  const filteredRules = React.useMemo(() => {
    return rules.filter((rule) => {
      const matchesStatus =
        selectedStatus === "ALL" || rule.status === selectedStatus
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        rule.hsnCode.toLowerCase().includes(q) ||
        (rule.description && rule.description.toLowerCase().includes(q)) ||
        (rule.notificationRef && rule.notificationRef.toLowerCase().includes(q))
      return matchesStatus && matchesSearch
    })
  }, [rules, selectedStatus, searchQuery])

  // Count by status
  const counts = React.useMemo(() => {
    const map: Record<string, number> = {
      ALL: rules.length,
      DRAFT: 0,
      APPROVED: 0,
      SCHEDULED: 0,
      ACTIVE: 0,
      RETIRED: 0,
    }
    rules.forEach((r) => {
      if (map[r.status] !== undefined) {
        map[r.status]++
      }
    })
    return map
  }, [rules])

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1.5">
          {(["ALL", "ACTIVE", "DRAFT", "APPROVED", "SCHEDULED", "RETIRED"] as const).map(
            (status) => {
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
                  <span>{status === "ALL" ? "All Rules" : status}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-background text-muted-foreground border border-border/60"
                    }`}
                  >
                    {counts[status] ?? 0}
                  </span>
                </button>
              )
            }
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search HSN or Gazette ref..."
              className="pl-8 h-8.5 text-xs bg-background"
            />
          </div>

          <Button
            size="sm"
            onClick={() => setIsCreateRuleModalOpen(true)}
            className="h-8.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs gap-1.5 shrink-0"
          >
            <Plus className="size-3.5" />
            <span>Create Draft Rule</span>
          </Button>
        </div>
      </div>

      {/* 2. Rules Table */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="size-6 animate-spin text-indigo-600" />
            <p className="text-xs text-muted-foreground">
              Loading statutory tax catalog...
            </p>
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <div className="size-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
              <Scale className="size-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                No statutory tax rules found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {searchQuery || selectedStatus !== "ALL"
                  ? "Try adjusting your filters or search terms."
                  : "Seed standard CBIC rules or create your first draft rule to start calculating GST."}
              </p>
            </div>
            {!searchQuery && selectedStatus === "ALL" && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsCreateRuleModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Plus className="size-3.5" />
                Draft Rule
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/50 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3 px-4">HSN / SAC Code</th>
                  <th className="py-3 px-4">Tax Treatment</th>
                  <th className="py-3 px-4 text-center">CGST</th>
                  <th className="py-3 px-4 text-center">SGST</th>
                  <th className="py-3 px-4 text-center">IGST</th>
                  <th className="py-3 px-4">Effective From</th>
                  <th className="py-3 px-4">Gazette Reference</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredRules.map((rule) => {
                  return (
                    <tr
                      key={rule.id}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      {/* HSN Code & Version */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground">
                            {rule.hsnCode}
                          </span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                            v{rule.version ?? 1}
                          </span>
                        </div>
                        {rule.description && (
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs mt-0.5">
                            {rule.description}
                          </p>
                        )}
                      </td>

                      {/* Tax Treatment */}
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">
                          {rule.taxTreatment}
                        </span>
                      </td>

                      {/* CGST */}
                      <td className="py-3 px-4 text-center font-mono">
                        {rule.cgstRate}%
                      </td>

                      {/* SGST */}
                      <td className="py-3 px-4 text-center font-mono">
                        {rule.sgstRate}%
                      </td>

                      {/* IGST */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {rule.igstRate}%
                      </td>

                      {/* Effective Date */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="size-3 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(rule.effectiveFrom).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Gazette Reference */}
                      <td className="py-3 px-4 max-w-xs">
                        <span
                          className="text-[11px] font-mono text-muted-foreground truncate block"
                          title={rule.notificationRef || "None provided"}
                        >
                          {rule.notificationRef || "—"}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={rule.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {rule.status === "DRAFT" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setApprovingRule(rule)}
                              className="h-7 text-[11px] px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 gap-1"
                            >
                              <FileCheck2 className="size-3" />
                              Approve
                            </Button>
                          )}

                          {rule.status === "APPROVED" && (
                            <Button
                              size="sm"
                              onClick={() => setPublishingRule(rule)}
                              className="h-7 text-[11px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                            >
                              <Send className="size-3" />
                              Publish
                            </Button>
                          )}

                          {(rule.status === "ACTIVE" ||
                            rule.status === "SCHEDULED" ||
                            rule.status === "DRAFT") && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setRetiringRule(rule)}
                              className="h-7 text-[11px] px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              <Archive className="size-3" />
                              Retire
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setInspectAuditRule(rule)}
                            className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                            title="Inspect Immutable Audit Log"
                          >
                            <History className="size-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Dialogs */}
      <CreateRuleDialog
        open={isCreateRuleModalOpen}
        onOpenChange={setIsCreateRuleModalOpen}
      />

      {approvingRule && (
        <ApproveRuleDialog
          rule={approvingRule}
          onClose={() => setApprovingRule(null)}
        />
      )}

      {publishingRule && (
        <PublishRuleDialog
          rule={publishingRule}
          onClose={() => setPublishingRule(null)}
        />
      )}

      {retiringRule && (
        <RetireRuleDialog
          rule={retiringRule}
          onClose={() => setRetiringRule(null)}
        />
      )}

      {inspectAuditRule && (
        <RuleAuditsModal
          rule={inspectAuditRule}
          onClose={() => setInspectAuditRule(null)}
        />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: TaxRuleStatus }) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]"
        >
          ACTIVE
        </Badge>
      )
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]"
        >
          DRAFT
        </Badge>
      )
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 text-[10px]"
        >
          APPROVED
        </Badge>
      )
    case "SCHEDULED":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 text-[10px]"
        >
          SCHEDULED
        </Badge>
      )
    case "RETIRED":
      return (
        <Badge
          variant="outline"
          className="bg-muted text-muted-foreground border-border text-[10px]"
        >
          RETIRED
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

/**
 * Create Draft Rule Dialog
 */
function CreateRuleDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [hsnCode, setHsnCode] = React.useState("")
  const [taxTreatment, setTaxTreatment] = React.useState<TaxTreatment>("TAXABLE")
  const [cgstRate, setCgstRate] = React.useState<number>(9)
  const [sgstRate, setSgstRate] = React.useState<number>(9)
  const [igstRate, setIgstRate] = React.useState<number>(18)
  const [cessRate, setCessRate] = React.useState<number>(0)
  const [effectiveFrom, setEffectiveFrom] = React.useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [notificationRef, setNotificationRef] = React.useState("")
  const [description, setDescription] = React.useState("")

  const createMutation = useCreateTaxRuleMutation()

  // Auto-sync rates
  const handleIgstChange = (val: number) => {
    setIgstRate(val)
    setCgstRate(val / 2)
    setSgstRate(val / 2)
  }

  const handleCgstChange = (val: number) => {
    setCgstRate(val)
    setSgstRate(val)
    setIgstRate(val * 2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hsnCode.trim()) return

    const payload: CreateTaxRulePayload = {
      hsnCode: hsnCode.trim(),
      taxTreatment,
      cgstRate: Number(cgstRate),
      sgstRate: Number(sgstRate),
      igstRate: Number(igstRate),
      cessRate: Number(cessRate),
      effectiveFrom: new Date(effectiveFrom).toISOString(),
      notificationRef: notificationRef.trim(),
      description: description.trim() || undefined,
    }

    await createMutation.mutateAsync(payload)
    onOpenChange(false)
    // reset form
    setHsnCode("")
    setNotificationRef("")
    setDescription("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Create Draft Statutory GST Rule
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Draft a new statutory GST rule. Requires independent verification and dual approval before publication.
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
              placeholder="e.g. 84713010 or 8471"
              required
              className="font-mono text-xs h-8.5"
            />
            <p className="text-[10px] text-muted-foreground">
              Enter 4, 6, or 8 digit statutory HSN/SAC code.
            </p>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Tax Treatment
            </label>
            <select
              value={taxTreatment}
              onChange={(e) => setTaxTreatment(e.target.value as TaxTreatment)}
              className="w-full h-8.5 rounded-md border border-input bg-background px-3 text-xs"
            >
              <option value="TAXABLE">TAXABLE (Standard GST Slab)</option>
              <option value="EXEMPT">EXEMPT (Statutory Exemption)</option>
              <option value="NIL_RATED">NIL_RATED (0% Statutory Rate)</option>
              <option value="NON_GST">NON_GST (Outside GST Scope)</option>
            </select>
          </div>

          {/* Rates Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">CGST (%)</label>
              <Input
                type="number"
                step="0.01"
                value={cgstRate}
                onChange={(e) => handleCgstChange(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">SGST (%)</label>
              <Input
                type="number"
                step="0.01"
                value={sgstRate}
                onChange={(e) => {
                  setSgstRate(parseFloat(e.target.value) || 0)
                  setIgstRate((parseFloat(e.target.value) || 0) + cgstRate)
                }}
                className="h-8 text-xs font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground text-indigo-600 dark:text-indigo-400">
                IGST (%)
              </label>
              <Input
                type="number"
                step="0.01"
                value={igstRate}
                onChange={(e) => handleIgstChange(parseFloat(e.target.value) || 0)}
                className="h-8 text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Effective Date *
            </label>
            <Input
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              required
              className="h-8.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Gazette Notification Reference *
            </label>
            <Input
              value={notificationRef}
              onChange={(e) => setNotificationRef(e.target.value)}
              placeholder="e.g. CBIC Notif No. 04/2026-Central Tax (Rate)"
              required
              className="h-8.5 text-xs"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">
              Description / Schedule Note
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details regarding rate schedule, goods category or amendment..."
              rows={2}
              className="text-xs"
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
              {createMutation.isPending ? "Drafting..." : "Create Draft"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Approve Rule Dialog (Dual Authorization)
 */
function ApproveRuleDialog({
  rule,
  onClose,
}: {
  rule: TaxRule
  onClose: () => void
}) {
  const [reason, setReason] = React.useState(
    `Verified against official CBIC notification: ${rule.notificationRef || "Statutory Gazette"}`
  )
  const approveMutation = useApproveTaxRuleMutation()

  const handleApprove = async () => {
    await approveMutation.mutateAsync({
      id: rule.id,
      payload: { reason },
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <FileCheck2 className="size-4 text-blue-600" />
            Dual-Authorization Approval
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            As a designated Tax Approver, verify that this rule matches the published government gazette before signing off.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg border border-border/80 bg-muted/40 space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">HSN Code:</span>
            <span className="font-mono font-bold">{rule.hsnCode}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Statutory Rates:</span>
            <span className="font-mono">
              CGST {rule.cgstRate}% + SGST {rule.sgstRate}% = IGST {rule.igstRate}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Gazette Reference:</span>
            <span className="font-mono text-[11px] truncate max-w-xs">
              {rule.notificationRef || "—"}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground">
            Approval Reason / Legal Verification Note *
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            required
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={approveMutation.isPending || !reason.trim()}
            onClick={handleApprove}
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            {approveMutation.isPending ? "Approving..." : "Confirm Legal Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Publish Rule Dialog
 */
function PublishRuleDialog({
  rule,
  onClose,
}: {
  rule: TaxRule
  onClose: () => void
}) {
  const publishMutation = usePublishTaxRuleMutation()
  const isFuture = new Date(rule.effectiveFrom) > new Date()

  const handlePublish = async () => {
    await publishMutation.mutateAsync(rule.id)
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <Send className="size-4 text-emerald-600" />
            {isFuture ? "Schedule Statutory Rule" : "Activate Statutory Rule"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {isFuture
              ? `This rule has an effective date in the future (${new Date(
                  rule.effectiveFrom
                ).toLocaleDateString()}). It will transition to SCHEDULED and activate automatically at the effective midnight timestamp.`
              : "This rule will activate immediately. Any existing active rule for this HSN will be safely superseded and retired."}
          </DialogDescription>
        </DialogHeader>

        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
          <p className="font-bold">Zero-Downtime Safe Binding Guarantee</p>
          <p className="text-[11px] leading-relaxed">
            The checkout tax engine continues calculating quotes without interruption. No two active rules will conflict for HSN {rule.hsnCode}.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={publishMutation.isPending}
            onClick={handlePublish}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {publishMutation.isPending
              ? "Publishing..."
              : isFuture
              ? "Confirm Schedule"
              : "Publish Immediately"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Retire Rule Dialog
 */
function RetireRuleDialog({
  rule,
  onClose,
}: {
  rule: TaxRule
  onClose: () => void
}) {
  const [reason, setReason] = React.useState(
    "Superseded by statutory amendment or discarded by compliance manager"
  )
  const retireMutation = useRetireTaxRuleMutation()

  const handleRetire = async () => {
    await retireMutation.mutateAsync({
      id: rule.id,
      payload: { reason },
    })
    onClose()
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2 text-rose-600">
            <Archive className="size-4" />
            Retire Statutory Rule
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Retiring a rule prevents it from being used in future checkout quotes while preserving immutable historical snapshots.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 text-xs">
          <label className="font-semibold text-foreground">
            Justification / Retirement Reason *
          </label>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            required
            className="text-xs"
          />
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={retireMutation.isPending || !reason.trim()}
            onClick={handleRetire}
            className="text-xs"
          >
            {retireMutation.isPending ? "Retiring..." : "Confirm Retirement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Immutable Audit Trail Modal
 */
function RuleAuditsModal({
  rule,
  onClose,
}: {
  rule: TaxRule
  onClose: () => void
}) {
  const { data: audits, isLoading } = useTaxRuleAuditsQuery(rule.id)
  const auditList = audits && audits.length > 0 ? audits : rule.audits ?? []

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold flex items-center gap-2">
            <History className="size-4 text-indigo-600" />
            Immutable Audit Trail — HSN {rule.hsnCode}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Every modification, approval, and publication event is permanently recorded for statutory tax audit compliance.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-3 py-2 text-xs">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading audit entries...
            </div>
          ) : auditList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground border border-dashed rounded-lg">
              No previous audit records attached to this draft rule.
            </div>
          ) : (
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/80">
              {auditList.map((entry, index) => (
                <div key={entry.id || index} className="flex items-start gap-3 relative">
                  <div className="size-7 rounded-full bg-indigo-600/10 border border-indigo-600/30 flex items-center justify-center shrink-0 z-10 text-indigo-600">
                    <History className="size-3.5" />
                  </div>
                  <div className="flex-1 p-3 rounded-lg border border-border/80 bg-muted/40 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        Action: {entry.action}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(entry.createdAt).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      Actor:{" "}
                      <span className="font-mono text-foreground font-medium">
                        {entry.performedByEmail || entry.performedBy}
                      </span>
                    </div>

                    {entry.reason && (
                      <p className="text-[11px] bg-background/80 p-2 rounded border border-border/60 text-foreground italic mt-1">
                        &quot;{entry.reason}&quot;
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            className="text-xs"
          >
            Close Audit Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
