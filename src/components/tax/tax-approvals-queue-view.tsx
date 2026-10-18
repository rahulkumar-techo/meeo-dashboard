/**
 * @file tax-approvals-queue-view.tsx
 * @description Dedicated Dual-Authorization Approval Queue for Tax Approver / Counsel.
 * Aggregates all pending DRAFT rules and UNVERIFIED classifications requiring legal sign-off.
 */

"use client"

import * as React from "react"
import {
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Scale,
  Tag,
  ArrowRight,
  Send,
  Loader2,
} from "lucide-react"
import {
  useTaxRulesQuery,
  useTaxClassificationsQuery,
  useUpdateClassificationStatusMutation,
} from "@/hooks/use-tax-query"
import { useTaxContext } from "@/context/tax-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function TaxApprovalsQueueView() {
  const { setApprovingRule, setPublishingRule } = useTaxContext()

  const { data: rulesData, isLoading: isLoadingRules } = useTaxRulesQuery()
  const {
    data: classificationsData,
    isLoading: isLoadingClassifications,
  } = useTaxClassificationsQuery()

  const draftRules = React.useMemo(() => {
    return (rulesData?.rules ?? []).filter((r) => r.status === "DRAFT")
  }, [rulesData])

  const approvedRulesToPublish = React.useMemo(() => {
    return (rulesData?.rules ?? []).filter((r) => r.status === "APPROVED")
  }, [rulesData])

  const unverifiedClassifications = React.useMemo(() => {
    return (classificationsData?.classifications ?? []).filter(
      (c) => c.verificationStatus === "UNVERIFIED"
    )
  }, [classificationsData])

  const updateClassificationMutation = useUpdateClassificationStatusMutation()

  const handleVerifyClassification = async (id: string) => {
    await updateClassificationMutation.mutateAsync({
      id,
      payload: { status: "VERIFIED" },
    })
  }

  const isLoading = isLoadingRules || isLoadingClassifications
  const totalPending = draftRules.length + unverifiedClassifications.length

  return (
    <div className="space-y-6">
      {/* 1. Governance Separation of Duty Banner */}
      <div className="p-4 rounded-xl border border-indigo-500/20 bg-linear-to-r from-indigo-500/10 via-background to-background flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
              <ShieldCheck className="size-4" />
            </span>
            <h3 className="text-sm font-bold text-foreground">
              Dual-Authorization Legal Workbench
            </h3>
            <Badge
              variant="outline"
              className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 text-[10px]"
            >
              RBAC: TAX_APPROVE
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl">
            Under Meeo compliance guidelines, no statutory tax modification can go live without independent verification against official CBIC gazette publications.
          </p>
        </div>

        <a
          href="https://cbic.gov.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted bg-card shrink-0 transition-colors"
        >
          <span>Open CBIC Gazette</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      </div>

      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
          <Loader2 className="size-6 animate-spin text-indigo-600" />
          <p className="text-xs text-muted-foreground">
            Inspecting dual-authorization compliance queue...
          </p>
        </div>
      ) : totalPending === 0 && approvedRulesToPublish.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-border/80 bg-card flex flex-col items-center justify-center text-center space-y-3">
          <div className="size-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="size-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              Compliance Queue is Fully Cleared
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              All statutory rules are legally verified and published. All HSN classifications are verified against statutory tariff schedules.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section A: Draft Tax Rules Awaiting Legal Approval */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="size-4 text-indigo-600" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Draft Rules Awaiting Verification
                </h4>
              </div>
              <Badge
                variant="outline"
                className={
                  draftRules.length > 0
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                    : "text-[10px]"
                }
              >
                {draftRules.length} Pending
              </Badge>
            </div>

            {draftRules.length === 0 ? (
              <div className="p-6 rounded-xl border border-border/60 bg-muted/30 text-center text-xs text-muted-foreground">
                No draft rules pending approval.
              </div>
            ) : (
              <div className="space-y-2.5">
                {draftRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-indigo-500/40 transition-colors shadow-2xs space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground text-xs">
                            HSN {rule.hsnCode}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold">
                            DRAFT v{rule.version ?? 1}
                          </span>
                        </div>
                        {rule.description && (
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {rule.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          IGST {rule.igstRate}%
                        </span>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          CGST {rule.cgstRate}% + SGST {rule.sgstRate}%
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-muted/50 border border-border/60 text-[11px] font-mono text-muted-foreground space-y-0.5">
                      <div className="flex justify-between">
                        <span>Gazette Ref:</span>
                        <span className="text-foreground truncate max-w-[200px]">
                          {rule.notificationRef || "Not provided"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Effective:</span>
                        <span className="text-foreground">
                          {new Date(rule.effectiveFrom).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <Button
                        size="sm"
                        onClick={() => setApprovingRule(rule)}
                        className="h-7 text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 shadow-xs"
                      >
                        <FileCheck2 className="size-3" />
                        Verify &amp; Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Approved Rules Ready for Publication */}
            {approvedRulesToPublish.length > 0 && (
              <div className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Send className="size-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Approved Rules Ready to Publish
                    </h4>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]"
                  >
                    {approvedRulesToPublish.length} Approved
                  </Badge>
                </div>

                <div className="space-y-2.5">
                  {approvedRulesToPublish.map((rule) => (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-foreground">
                          HSN {rule.hsnCode} (Rate {rule.igstRate}%)
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setPublishingRule(rule)}
                          className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <Send className="size-3" />
                          Publish / Schedule
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        Approved by legal counsel. Click publish to commit to live checkout.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section B: Unverified Classifications Awaiting Sign-off */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="size-4 text-amber-600" />
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  Unverified HSN Classifications
                </h4>
              </div>
              <Badge
                variant="outline"
                className={
                  unverifiedClassifications.length > 0
                    ? "bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]"
                    : "text-[10px]"
                }
              >
                {unverifiedClassifications.length} Unverified
              </Badge>
            </div>

            {unverifiedClassifications.length === 0 ? (
              <div className="p-6 rounded-xl border border-border/60 bg-muted/30 text-center text-xs text-muted-foreground">
                All HSN classifications are verified.
              </div>
            ) : (
              <div className="space-y-2.5">
                {unverifiedClassifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-border/80 bg-card hover:border-amber-500/40 transition-colors shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono font-bold text-foreground text-xs">
                          {item.hsnCode}
                        </span>
                        <p className="text-xs text-foreground font-medium mt-0.5">
                          {item.description}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0 font-normal"
                      >
                        {item.category || "General"}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3 text-amber-500" />
                        Pending legal verification
                      </span>

                      <Button
                        size="sm"
                        onClick={() => handleVerifyClassification(item.id)}
                        disabled={updateClassificationMutation.isPending}
                        className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1 shadow-xs"
                      >
                        <ShieldCheck className="size-3" />
                        Mark Verified
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
