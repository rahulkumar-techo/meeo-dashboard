/**
 * @file page.tsx
 * @description Customer 360 Unified Profile & Lifetime Value Intelligence (< 220 lines).
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, Mail, Phone, MapPin, ShieldCheck, CreditCard, ShoppingBag, DollarSign } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PageHeader, MetricGrid, StatusBadge } from "@/components/common"
import {
  CUSTOMER_360_PROFILE,
  CUSTOMER_ORDER_HISTORY,
} from "@/data/customer-360"

export default function Customer360Page() {
  const profile = CUSTOMER_360_PROFILE
  const orders = CUSTOMER_ORDER_HISTORY

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <div className="flex items-center gap-2 mb-2">
        <Link href="/customers" className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-3.5" /> Back to Customers
        </Link>
      </div>

      <PageHeader
        title={`${profile.name} — Customer 360°`}
        badge={profile.tier}
        badgeVariant="brand"
        description={`Customer ID: ${profile.id} • Member since ${profile.memberSince}`}
      >
        <Button variant="outline" size="sm" className="h-8.5 gap-1.5 text-xs">
          <Mail className="size-3.5" /> Send Message
        </Button>
        <Button size="sm" className="h-8.5 gap-1.5 text-xs">
          Issue Store Credit
        </Button>
      </PageHeader>

      {/* 2. Top Profile Summary Card */}
      <Card className="border-border/70 bg-card/95 shadow-2xs">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="size-14 border border-border shadow-xs">
                <AvatarImage src={profile.avatar} alt={profile.name} />
                <AvatarFallback className="text-base font-bold">{profile.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{profile.name}</h2>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    <ShieldCheck className="mr-1 size-3" /> Identity Verified
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Mail className="size-3.5" /> {profile.email}</span>
                  <span className="flex items-center gap-1"><Phone className="size-3.5" /> {profile.phone}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {profile.location}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t border-border/60 pt-3 sm:border-t-0 sm:pt-0">
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground uppercase">Store Credit</p>
                <p className="text-base font-bold text-emerald-600">{profile.creditBalance}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-muted-foreground uppercase">Loyalty Points</p>
                <p className="text-base font-bold text-indigo-600">{profile.loyaltyPoints} pts</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Lifetime Value (LTV)", value: profile.lifetimeValue, colorTheme: "emerald", trend: { value: "+18.2%", isPositive: true }, footnote: "Top 5% buyer tier" },
          { title: "Total Orders Completed", value: `${profile.totalOrders} Orders`, colorTheme: "indigo", footnote: "100% successful fulfillment" },
          { title: "Average Order Value (AOV)", value: profile.avgOrderValue, colorTheme: "cyan", footnote: "Store baseline: $87.35" },
          { title: "Fraud & Risk Score", value: profile.fraudScore, colorTheme: "emerald", badge: { text: "Low Risk", variant: "success" }, footnote: "Zero disputed charges" },
        ]}
      />

      {/* 4. Order History Table */}
      <Card className="border-border/70 bg-card/95 shadow-2xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold tracking-tight">Purchase Ledger & Order History</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  <TableHead className="font-bold">ORDER ID</TableHead>
                  <TableHead className="font-bold">DATE</TableHead>
                  <TableHead className="font-bold">ITEMS SUMMARY</TableHead>
                  <TableHead className="font-bold">PAYMENT</TableHead>
                  <TableHead className="font-bold">STATUS</TableHead>
                  <TableHead className="font-bold text-right">TOTAL AMOUNT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs font-normal">
                {orders.map((ord) => (
                  <TableRow key={ord.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono font-bold text-indigo-600"><Link href="/orders" className="hover:underline">{ord.id}</Link></TableCell>
                    <TableCell className="text-muted-foreground">{ord.date}</TableCell>
                    <TableCell className="max-w-xs truncate">{ord.itemsSummary}</TableCell>
                    <TableCell className="text-muted-foreground font-mono">{ord.paymentMethod}</TableCell>
                    <TableCell><StatusBadge status={ord.status.toLowerCase()} showDot /></TableCell>
                    <TableCell className="text-right font-mono font-bold text-foreground">{ord.totalAmount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
