/**
 * @file page.tsx
 * @description Centralized GST Statutory Tax Engine Administration Workspace.
 * Interacts with the dedicated TaxSidebar and renders the active module:
 * Statutory Rules Catalog, HSN Master, Dual Authorization, POS Quote Simulator,
 * Reconciliation, CBIC Runbook SOP, and Seller GSTIN Profiles.
 */

"use client"

import * as React from "react"
import { PageHeader } from "@/components/common/page-header"
import { useTaxContext } from "@/context/tax-context"
import {
  TaxRulesView,
  TaxClassificationsView,
  TaxApprovalsQueueView,
  TaxSimulatorView,
  TaxReconciliationView,
  TaxRunbookView,
  TaxSellersView,
} from "@/components/tax"

const TAB_TITLES: Record<string, { title: string; desc: string; badge: string }> = {
  rules: {
    title: "Statutory GST Rules Catalog",
    desc: "Manage statutory tax rules across official lifecycles: DRAFT, APPROVED, ACTIVE, SCHEDULED, and RETIRED.",
    badge: "Rule Catalog",
  },
  classifications: {
    title: "HSN / SAC Tax Classification Master",
    desc: "Maintain official 4, 6, and 8-digit tariff schedules and perform legal verification.",
    badge: "Tariff Master",
  },
  approvals: {
    title: "Dual-Authorization & Legal Approval Queue",
    desc: "Independent legal verification of government gazette notifications by Tax Counsel.",
    badge: "Dual-Auth",
  },
  simulator: {
    title: "Place of Supply (POS) Quote Simulator",
    desc: "Simulate cart quotes, verify intra vs inter-state tax splits, freight GST, and Rule 46 invoices.",
    badge: "POS Simulator",
  },
  reconciliation: {
    title: "Tax Return Reconciliation & Audits",
    desc: "Monthly GSTR-1 and GSTR-8 return aggregation by Place of Supply state jurisdiction.",
    badge: "GSTR Returns",
  },
  runbook: {
    title: "CBIC Statutory Amendment Runbook & SOP",
    desc: "Standard operating procedures for official rate amendments and production incident resolution.",
    badge: "Compliance SOP",
  },
  sellers: {
    title: "Seller GSTIN Profiles & CBIC Seed",
    desc: "Configure supplier tax identities and initialize default CBIC statutory tax slabs.",
    badge: "Entities & Seed",
  },
}

export default function GstTaxEnginePage() {
  const { activeTab } = useTaxContext()
  const currentTabInfo = TAB_TITLES[activeTab] || TAB_TITLES.rules

  return (
    <div className="space-y-6">
      <PageHeader
        title={currentTabInfo.title}
        badge={currentTabInfo.badge}
        badgeVariant="brand"
        description={currentTabInfo.desc}
      />

      <div className="min-w-0">
        {activeTab === "rules" && <TaxRulesView />}
        {activeTab === "classifications" && <TaxClassificationsView />}
        {activeTab === "approvals" && <TaxApprovalsQueueView />}
        {activeTab === "simulator" && <TaxSimulatorView />}
        {activeTab === "reconciliation" && <TaxReconciliationView />}
        {activeTab === "runbook" && <TaxRunbookView />}
        {activeTab === "sellers" && <TaxSellersView />}
      </div>
    </div>
  )
}
