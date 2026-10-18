/**
 * @file tax-context.tsx
 * @description Centralized React Context for the Meeo GST Statutory Tax Engine.
 * Manages active tab state between the dedicated TaxSidebar and the main workspace,
 * approval queue counters, modal states, and action triggers.
 */

"use client"

import * as React from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  useTaxRulesQuery,
  useTaxClassificationsQuery,
  useSeedStandardRulesMutation,
} from "@/hooks/use-tax-query"
import type { TaxRule, TaxClassification } from "@/types/tax"

export type TaxTabId =
  | "rules"
  | "classifications"
  | "approvals"
  | "simulator"
  | "reconciliation"
  | "runbook"
  | "sellers"

export interface TaxContextType {
  activeTab: TaxTabId
  setActiveTab: (tab: TaxTabId) => void

  // Summary Metrics
  pendingRulesCount: number
  unverifiedClassificationsCount: number
  activeRulesCount: number
  totalRulesCount: number
  isLoadingCounts: boolean

  // Modals & Action States
  isCreateRuleModalOpen: boolean
  setIsCreateRuleModalOpen: (open: boolean) => void
  isCreateClassificationModalOpen: boolean
  setIsCreateClassificationModalOpen: (open: boolean) => void
  isSeedModalOpen: boolean
  setIsSeedModalOpen: (open: boolean) => void

  // Specific Action Targets
  approvingRule: TaxRule | null
  setApprovingRule: (rule: TaxRule | null) => void
  publishingRule: TaxRule | null
  setPublishingRule: (rule: TaxRule | null) => void
  retiringRule: TaxRule | null
  setRetiringRule: (rule: TaxRule | null) => void
  inspectAuditRule: TaxRule | null
  setInspectAuditRule: (rule: TaxRule | null) => void

  // Fast Seed CBIC Trigger
  handleSeedCBIC: () => Promise<void>
  isSeeding: boolean
}

const TaxContext = React.createContext<TaxContextType | null>(null)

export function useTaxContext() {
  const context = React.useContext(TaxContext)
  if (!context) {
    throw new Error("useTaxContext must be used within a TaxEngineProvider")
  }
  return context
}

const VALID_TABS: TaxTabId[] = [
  "rules",
  "classifications",
  "approvals",
  "simulator",
  "reconciliation",
  "runbook",
  "sellers",
]

export function TaxEngineProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isTaxRoute = pathname?.startsWith("/finance/tax") || pathname?.startsWith("/tax")

  // Read initial tab from URL param "?tab=..." or default to "rules"
  const tabParam = searchParams.get("tab") as TaxTabId | null
  const [activeTab, setActiveTabState] = React.useState<TaxTabId>(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "rules"
  )

  // Sync state if URL searchParams change
  React.useEffect(() => {
    if (tabParam && VALID_TABS.includes(tabParam) && tabParam !== activeTab) {
      setActiveTabState(tabParam)
    }
  }, [tabParam, activeTab])

  // Support browser back/forward navigation
  React.useEffect(() => {
    const handlePopState = () => {
      if (typeof window === "undefined") return
      const urlTab = new URLSearchParams(window.location.search).get("tab") as TaxTabId | null
      if (urlTab && VALID_TABS.includes(urlTab)) {
        setActiveTabState(urlTab)
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [])

  const setActiveTab = React.useCallback((tab: TaxTabId) => {
    setActiveTabState(tab)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      url.searchParams.set("tab", tab)
      window.history.replaceState(null, "", url.toString())
    }
  }, [])

  // Fetch summary data for status badges ONLY when on tax routes
  const { data: allRulesData, isLoading: isLoadingRules } = useTaxRulesQuery(
    undefined,
    { enabled: isTaxRoute }
  )
  const {
    data: allClassificationsData,
    isLoading: isLoadingClassifications,
  } = useTaxClassificationsQuery(
    undefined,
    { enabled: isTaxRoute }
  )

  const rules = allRulesData?.rules ?? []
  const classifications = allClassificationsData?.classifications ?? []

  const pendingRulesCount = React.useMemo(
    () => rules.filter((r) => r.status === "DRAFT").length,
    [rules]
  )
  const activeRulesCount = React.useMemo(
    () => rules.filter((r) => r.status === "ACTIVE").length,
    [rules]
  )
  const totalRulesCount = rules.length

  const unverifiedClassificationsCount = React.useMemo(
    () => classifications.filter((c) => c.verificationStatus === "UNVERIFIED").length,
    [classifications]
  )

  // Modal dialog states
  const [isCreateRuleModalOpen, setIsCreateRuleModalOpen] = React.useState(false)
  const [
    isCreateClassificationModalOpen,
    setIsCreateClassificationModalOpen,
  ] = React.useState(false)
  const [isSeedModalOpen, setIsSeedModalOpen] = React.useState(false)

  const [approvingRule, setApprovingRule] = React.useState<TaxRule | null>(null)
  const [publishingRule, setPublishingRule] = React.useState<TaxRule | null>(null)
  const [retiringRule, setRetiringRule] = React.useState<TaxRule | null>(null)
  const [inspectAuditRule, setInspectAuditRule] = React.useState<TaxRule | null>(null)

  const seedMutation = useSeedStandardRulesMutation()

  const handleSeedCBIC = async () => {
    await seedMutation.mutateAsync()
    setIsSeedModalOpen(false)
  }

  return (
    <TaxContext.Provider
      value={{
        activeTab,
        setActiveTab,
        pendingRulesCount,
        unverifiedClassificationsCount,
        activeRulesCount,
        totalRulesCount,
        isLoadingCounts: isLoadingRules || isLoadingClassifications,
        isCreateRuleModalOpen,
        setIsCreateRuleModalOpen,
        isCreateClassificationModalOpen,
        setIsCreateClassificationModalOpen,
        isSeedModalOpen,
        setIsSeedModalOpen,
        approvingRule,
        setApprovingRule,
        publishingRule,
        setPublishingRule,
        retiringRule,
        setRetiringRule,
        inspectAuditRule,
        setInspectAuditRule,
        handleSeedCBIC,
        isSeeding: seedMutation.isPending,
      }}
    >
      {children}
    </TaxContext.Provider>
  )
}
