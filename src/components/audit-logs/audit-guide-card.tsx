/**
 * @file audit-guide-card.tsx
 * @description Operational Guide & Forensic Runbook Card for Compliance Audit Logs.
 * Explains append-only immutability, PII masking rules, and security investigation protocols.
 */

"use client"

import * as React from "react"
import {
  HelpCircle,
  ShieldCheck,
  Lock,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AuditGuideCard() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-xs transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <HelpCircle className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">
                Compliance Audit Trail & Forensic Runbook
              </h4>
              <p className="text-[11px] text-muted-foreground">
                SOC-2 / PCI-DSS compliance, non-blocking execution, and automatic PII redactions.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-7 text-xs gap-1 text-muted-foreground"
          >
            {isOpen ? (
              <>
                Hide Runbook <ChevronUp className="size-3.5" />
              </>
            ) : (
              <>
                View Runbook <ChevronDown className="size-3.5" />
              </>
            )}
          </Button>
        </div>

        {isOpen && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-border/60 text-xs">
            {/* 1. Append-Only Immutability */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Lock className="size-3.5 text-indigo-500" />
                <span>Immutability & Integrity</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Append-Only:</strong> Zero UPDATE/DELETE operations exist on audit logs.
                </p>
                <p>
                  • <strong className="text-foreground">Non-Blocking:</strong> Logging failures will never abort business transactions.
                </p>
                <p>
                  • <strong className="text-foreground">Context:</strong> Every record captures Actor ID, Ingress IP, and User-Agent.
                </p>
              </div>
            </div>

            {/* 2. Sensitive Data Masking */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                <span>Sensitive PII Redactions</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">Passwords:</strong> Completely replaced with <code className="font-mono text-[10px]">[REDACTED]</code>.
                </p>
                <p>
                  • <strong className="text-foreground">Card PANs:</strong> Masked to last 4 digits (<code className="font-mono text-[10px]">****-****-****-1234</code>).
                </p>
                <p>
                  • <strong className="text-foreground">Emails/Phones:</strong> Partially masked for GDPR & PCI compliance.
                </p>
              </div>
            </div>

            {/* 3. Forensic Investigation Protocol */}
            <div className="space-y-1.5 rounded-lg bg-muted/30 p-3 border border-border/50">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Search className="size-3.5 text-amber-500" />
                <span>Forensic Investigation Protocol</span>
              </div>
              <div className="text-[11px] text-muted-foreground leading-relaxed space-y-1">
                <p>
                  • <strong className="text-foreground">By Actor:</strong> Filter by <code className="font-mono text-[10px]">actorId</code> for employee offboarding audits.
                </p>
                <p>
                  • <strong className="text-foreground">By Entity:</strong> Trace financial mutations on <code className="font-mono text-[10px]">Order</code> or <code className="font-mono text-[10px]">Payment</code>.
                </p>
                <p>
                  • <strong className="text-foreground">Time Window:</strong> Use date filters to extract SOC-2 evidence packages.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
