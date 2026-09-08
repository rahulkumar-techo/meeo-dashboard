/**
 * @file page.tsx
 * @description Promotions & Campaign Rules Orchestrator.
 * Currently under development (Feature not available right now). Zero mock data.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { Sparkles, ArrowRight, Tag, ShieldAlert, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { PageHeader } from "@/components/common/page-header"

export default function PromotionsPage() {
  return (
    <div className="flex-1 space-y-5 p-4 lg:p-6 max-w-[1400px] mx-auto">
      {/* 1. Page Header */}
      <PageHeader
        title="Promotions & Campaign Rules"
        badge="In Development"
        badgeVariant="outline"
        description="Dynamic cart rules, BOGO bundles, tiered basket savings, and automated discount orchestrators."
      />

      {/* 2. Feature Not Available Notice Card */}
      <Card className="border-border/80 bg-gradient-to-br from-card via-card to-muted/30 shadow-2xs overflow-hidden">
        <CardContent className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ring-8 ring-indigo-500/5">
            <Sparkles className="size-8" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono px-2 py-0.5 border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 gap-1"
              >
                <Clock className="size-3 inline" /> Feature Not Available Right Now
              </Badge>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Promotions Engine Under Development
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The automated omnichannel promotions and dynamic bundle rules engine is not yet available in this release. Active promotional discount codes can be managed via the Coupons console.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/marketing/coupons"
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-xs hover:bg-primary/90 transition-colors"
            >
              <Tag className="size-3.5" />
              <span>Go to Coupons Management</span>
              <ArrowRight className="size-3.5 ml-0.5" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
