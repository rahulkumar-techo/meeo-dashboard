/**
 * @file tax-runbook-view.tsx
 * @description Standard Operating Procedure (SOP) & Incident Recovery Runbook.
 * Guides compliance officers and engineers through statutory rate amendments (T-5, T-2, T+1)
 * and provides incident workflows for 409 conflicts and unverified HSN alerts.
 */

"use client"

import * as React from "react"
import {
  BookOpenCheck,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  FileCode,
  Copy,
  ExternalLink,
  Check,
  ArrowRight,
  Database,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export function TaxRunbookView() {
  const [checkedSteps, setCheckedSteps] = React.useState<Record<string, boolean>>({})

  const toggleStep = (id: string) => {
    setCheckedSteps((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const copySql = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success("SQL query copied to clipboard")
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="p-4 rounded-xl border border-border/80 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <BookOpenCheck className="size-5 text-indigo-600" />
            <h3 className="text-sm font-bold text-foreground">
              GST Statutory Amendment Runbook &amp; Production SOP
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Step-by-step checklist to follow whenever the CBIC or GST Council announces a tax rate or HSN schedule amendment.
          </p>
        </div>

        <a
          href="https://cbic.gov.in"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted bg-background shrink-0"
        >
          <span>cbic.gov.in Gazette</span>
          <ExternalLink className="size-3 text-muted-foreground" />
        </a>
      </div>

      {/* 2. Interactive Phase Timeline */}
      <div className="space-y-4">
        {/* Phase A */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-blue-600 text-white text-xs font-bold">
                A
              </span>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Phase A: Ingestion &amp; Impact Analysis (T - 5 Days)
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px]">
              T - 5 Days
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-a1"]}
                onChange={() => toggleStep("step-a1")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  1. Gazette PDF Download &amp; Verification
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Retrieve official notification PDF directly from cbic.gov.in. Verify notification number (e.g. Notification No. 04/2026-Central Tax (Rate)), effective midnight date, and exact 4/6/8-digit tariff code.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-a2"]}
                onChange={() => toggleStep("step-a2")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5 flex-1">
                <span className="font-semibold text-foreground">
                  2. Catalog Query — Identify Affected Inventory
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Execute catalog search to quantify affected products and ensure tax classifications are up to date:
                </p>
                <div className="relative mt-1">
                  <pre className="p-2 rounded bg-black/80 text-emerald-400 font-mono text-[10px] overflow-x-auto">
{`SELECT p.id, p.name, p."hsnCode", tc.id AS classification_id
FROM products p
LEFT JOIN tax_classifications tc ON p."taxClassificationId" = tc.id OR p."hsnCode" = tc."hsnCode"
WHERE p."hsnCode" LIKE '8471%';`}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      copySql(`SELECT p.id, p.name, p."hsnCode", tc.id AS classification_id FROM products p LEFT JOIN tax_classifications tc ON p."taxClassificationId" = tc.id OR p."hsnCode" = tc."hsnCode" WHERE p."hsnCode" LIKE '8471%';`)
                    }}
                    className="absolute top-1 right-1 h-6 px-1.5 text-[10px] text-muted-foreground hover:text-white"
                  >
                    <Copy className="size-3 mr-1" /> Copy
                  </Button>
                </div>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-a3"]}
                onChange={() => toggleStep("step-a3")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  3. Draft Statutory Rule Entry
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Compliance Manager drafts a new rule in Meeo Console with effectiveFrom set to official midnight commencement timestamp. Rule is created with status DRAFT.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Phase B */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-purple-600 text-white text-xs font-bold">
                B
              </span>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Phase B: Dual Approval &amp; Pre-Scheduling (T - 2 Days)
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px]">
              T - 2 Days
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-b1"]}
                onChange={() => toggleStep("step-b1")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  1. Independent Legal Verification (TAX_APPROVE)
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Independent Tax Counsel signs off on the draft rule in the Dual Authorization queue with explicit gazette verification reasons. Rule transitions to APPROVED.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-b2"]}
                onChange={() => toggleStep("step-b2")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  2. Schedule Publication
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Click &quot;Publish&quot; on the approved rule. Because effectiveFrom is in the future, the engine automatically transitions the status to SCHEDULED.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-b3"]}
                onChange={() => toggleStep("step-b3")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  3. Smoke Verification in Quote Simulator
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Open the POS Quote Simulator and verify that incoming checkouts continue using the current active rate until the scheduled midnight handover.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Phase C */}
        <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-emerald-600 text-white text-xs font-bold">
                C
              </span>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                Phase C: Activation &amp; Post-Commencement Audit (T + 1 Hour)
              </h4>
            </div>
            <Badge variant="outline" className="text-[10px]">
              T + 1 Hour
            </Badge>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-c1"]}
                onChange={() => toggleStep("step-c1")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5">
                <span className="font-semibold text-foreground">
                  1. Zero-Downtime Handover
                </span>
                <p className="text-[11px] text-muted-foreground">
                  At midnight commencement, the engine seamlessly selects the scheduled rule as ACTIVE. The superseded rule is bound and archived as RETIRED.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-lg bg-muted/40 cursor-pointer hover:bg-muted/70 transition-colors">
              <input
                type="checkbox"
                checked={!!checkedSteps["step-c2"]}
                onChange={() => toggleStep("step-c2")}
                className="mt-0.5 rounded border-border"
              />
              <div className="space-y-0.5 flex-1">
                <span className="font-semibold text-foreground">
                  2. Audit First Live Order Tax Snapshots
                </span>
                <p className="text-[11px] text-muted-foreground">
                  Confirm statutory accuracy on first orders placed after midnight:
                </p>
                <div className="relative mt-1">
                  <pre className="p-2 rounded bg-black/80 text-emerald-400 font-mono text-[10px] overflow-x-auto">
{`SELECT id, "orderId", "placeOfSupplyStateCode", "totalTaxableAmount", "totalTaxAmount", "shippingGstRate", "createdAt"
FROM order_tax_snapshots
ORDER BY "createdAt" DESC
LIMIT 5;`}
                  </pre>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      copySql(`SELECT id, "orderId", "placeOfSupplyStateCode", "totalTaxableAmount", "totalTaxAmount", "shippingGstRate", "createdAt" FROM order_tax_snapshots ORDER BY "createdAt" DESC LIMIT 5;`)
                    }}
                    className="absolute top-1 right-1 h-6 px-1.5 text-[10px] text-muted-foreground hover:text-white"
                  >
                    <Copy className="size-3 mr-1" /> Copy
                  </Button>
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Incident Troubleshooting Matrix */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
          <ShieldAlert className="size-4 text-amber-500" />
          Production Incident Recovery Procedures
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-1.5">
            <span className="font-bold text-rose-600 block">
              409 TAX_CONFLICT
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              If two rules overlap for the same HSN, checkout safely halts to prevent guessing a rate. Retire the erroneous rule immediately via &quot;Retire Rule&quot; in the Statutory Rules tab.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-1.5">
            <span className="font-bold text-amber-600 block">
              Payment Gateway ±₹0.01 Rounding
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Order Tax Snapshots are the immutable statutory truth. Compare OrderTaxSnapshot against Order total. Platform reconciles to the authoritative snapshot payload.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-border/80 bg-muted/30 space-y-1.5">
            <span className="font-bold text-blue-600 block">
              Unverified Classification Warning
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              When logged: navigate to HSN/SAC Master tab, filter by UNVERIFIED, check tariff schedule, and click &quot;Verify Code&quot; to stop fallback rates.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
