/**
 * @file page.tsx
 * @description Real-Time Promotions & Campaign Rules Orchestrator (< 230 lines).
 */

"use client"

import * as React from "react"
import { Plus, Sliders } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  MetricGrid,
  DataTableToolbar,
  EmptyState,
  ConfirmDialog,
} from "@/components/common"
import {
  PromotionRuleCard,
  PromotionSimulator,
  PromotionRuleData,
} from "@/components/modules/marketing"
import { MARKETING_PROMOTIONS } from "@/data/marketing"

export default function PromotionsPage() {
  const [promotions, setPromotions] = React.useState<PromotionRuleData[]>(MARKETING_PROMOTIONS)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [showSimulator, setShowSimulator] = React.useState<boolean>(false)
  const [deleteRuleId, setDeleteRuleId] = React.useState<string | null>(null)

  // Filter promotions
  const filteredPromotions = React.useMemo(() => {
    return promotions.filter((rule) => {
      if (statusFilter !== "all" && rule.status !== statusFilter) return false
      if (typeFilter !== "all" && rule.type !== typeFilter) return false

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const match =
          rule.name.toLowerCase().includes(q) ||
          rule.codeRef?.toLowerCase().includes(q) ||
          rule.triggerSummary.toLowerCase().includes(q) ||
          rule.actionSummary.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [promotions, statusFilter, typeFilter, searchQuery])

  const handleToggleStatus = (ruleId: string, active: boolean) => {
    setPromotions((prev) =>
      prev.map((r) =>
        r.id === ruleId ? { ...r, status: active ? "active" : "paused" } : r
      )
    )
  }

  const handleDuplicate = (rule: PromotionRuleData) => {
    const newRule: PromotionRuleData = {
      ...rule,
      id: `prm_${Math.floor(1000 + Math.random() * 9000)}`,
      name: `${rule.name} (Copy)`,
      codeRef: rule.codeRef ? `${rule.codeRef}-COPY` : undefined,
      status: "scheduled",
      redemptions: 0,
      attributedGmv: 0,
    }
    setPromotions((prev) => [newRule, ...prev])
  }

  const handleDelete = () => {
    if (deleteRuleId) {
      setPromotions((prev) => prev.filter((r) => r.id !== deleteRuleId))
      setDeleteRuleId(null)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Promotions & Campaign Rules Engine"
        badge="Omnichannel Rule Orchestrator"
        badgeVariant="brand"
        description="Configure dynamic discount rules, BOGO bundles, tiered cart savings, margin protection guards, and real-time coupon simulators."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSimulator((prev) => !prev)}
          className="h-8.5 gap-1.5 text-xs font-medium"
        >
          <Sliders className="size-3.5" />
          <span>{showSimulator ? "Hide Simulator" : "Rule Engine Sandbox"}</span>
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs font-medium">
          <Plus className="size-3.5" />
          <span>Create Promotion</span>
        </Button>
      </PageHeader>

      {/* 2. Metric KPI Summary */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Active Campaigns", value: "4 Active", colorTheme: "emerald", badge: { text: "1 Scheduled", variant: "outline" }, footnote: "Stacking limits enforced" },
          { title: "Attributed 30D GMV", value: "$616,750.00", colorTheme: "indigo", trend: { value: "+24.8%", isPositive: true }, footnote: "49.4% of total turnover" },
          { title: "Total Redemptions", value: "7,240", colorTheme: "cyan", trend: { value: "+18.2%", isPositive: true }, footnote: "Avg discount: 14.8%" },
          { title: "Blended Margin Impact", value: "-2.1%", colorTheme: "amber", badge: { text: "Safe Guard: -5.0%", variant: "warning" }, footnote: "Margin delta protected" },
        ]}
      />

      {/* 3. Interactive Sandbox Simulator */}
      {showSimulator && (
        <div className="pt-1 pb-2">
          <PromotionSimulator initialCartValue={185.0} />
        </div>
      )}

      {/* 4. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter promotions by name, promo code, trigger rule..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Rule Types</option>
              <option value="tiered_cart">Tiered Cart Value</option>
              <option value="bundle_bogo">Bundle Pairing (BOGO)</option>
              <option value="flash_sale">Flash Sale / Markdown</option>
              <option value="free_shipping">Free Shipping Surcharge</option>
              <option value="category_pct">Category Percentage</option>
            </select>
          </div>
        }
        activeFiltersCount={(statusFilter !== "all" ? 1 : 0) + (typeFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery("") }}
      />

      {/* 5. Promotion Rules Grid */}
      <div className="space-y-3">
        {filteredPromotions.length === 0 ? (
          <EmptyState
            title="No Promotion Rules Found"
            description="No campaign rules match your search or filter options."
            actionLabel="Reset Filters"
            onAction={() => { setStatusFilter("all"); setTypeFilter("all"); setSearchQuery("") }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredPromotions.map((rule) => (
              <PromotionRuleCard
                key={rule.id}
                rule={rule}
                onToggleStatus={handleToggleStatus}
                onDuplicate={handleDuplicate}
                onDelete={(id) => setDeleteRuleId(id)}
                onSimulate={() => setShowSimulator(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteRuleId !== null}
        onOpenChange={(open) => !open && setDeleteRuleId(null)}
        title="Delete Promotion Rule"
        description="Are you sure you want to permanently delete this promotional rule? Active customer carts applying this rule will immediately lose the discount."
        confirmLabel="Delete Rule"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  )
}
