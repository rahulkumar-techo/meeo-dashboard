/**
 * @file dashboard.ts
 * @description Mock data and constants for the root Dashboard Page.
 */

import { DollarSign, ShoppingBag, TrendingUp, Users } from "lucide-react"

export const DASHBOARD_TRIAGE_ITEMS = [
  { id: "low_stock", label: "Low Stock", count: "8 items", severity: "normal" as const },
  { id: "out_of_stock", label: "Out of Stock", count: "2 items", severity: "normal" as const },
  { id: "pending_fulfillment", label: "Pending Fulfillment", count: "142 orders", severity: "info" as const },
  { id: "failed_payments", label: "Failed Payments", count: "5 ($412.00)", severity: "danger" as const },
  { id: "failed_outbox", label: "Failed Outbox", count: "1 event", severity: "warning" as const },
]

export const DASHBOARD_KPI_CARDS = [
  {
    id: "revenue",
    title: "Total Revenue",
    value: "$1,248,320.50",
    trend: { value: "+18.4%", isPositive: true, comparisonPeriod: "prior 30d" },
    icon: DollarSign,
    colorTheme: "indigo" as const,
    footnote: "vs $1,054,120.00 baseline",
  },
  {
    id: "orders",
    title: "Total Orders",
    value: "14,290",
    trend: { value: "+12.1%", isPositive: true, comparisonPeriod: "prior 30d" },
    icon: ShoppingBag,
    colorTheme: "emerald" as const,
    footnote: "vs 12,746 prior 30d",
  },
  {
    id: "aov",
    title: "Average Order Value",
    value: "$87.35",
    trend: { value: "+5.6%", isPositive: true, comparisonPeriod: "prior 30d" },
    icon: TrendingUp,
    colorTheme: "amber" as const,
    footnote: "vs $82.70 prior 30d",
  },
  {
    id: "customers",
    title: "Active Customers",
    value: "8,940",
    trend: { value: "+9.8%", isPositive: true, comparisonPeriod: "prior 30d" },
    icon: Users,
    colorTheme: "cyan" as const,
    footnote: "vs 8,142 prior 30d",
  },
]

export const DASHBOARD_LIVE_ORDERS = [
  {
    id: "ORD-10248",
    customer: { name: "David Miller", email: "david.m@example.com" },
    itemsCount: 3,
    payment: { status: "Paid: Stripe", tone: "success" as const },
    fulfillment: { status: "Confirmed", tone: "info" as const },
    total: "$249.00",
    timeAgo: "4m ago",
  },
  {
    id: "ORD-10247",
    customer: { name: "Elena Rostova", email: "elena.r@techcorp.io" },
    itemsCount: 1,
    payment: { status: "Paid: PayPal", tone: "success" as const },
    fulfillment: { status: "Processing", tone: "brand" as const },
    total: "$1,199.00",
    timeAgo: "18m ago",
  },
  {
    id: "ORD-10246",
    customer: { name: "Marcus Chen", email: "mchen@acme.org" },
    itemsCount: 5,
    payment: { status: "Failed", tone: "destructive" as const },
    fulfillment: { status: "Cancelled", tone: "secondary" as const },
    total: "$342.50",
    timeAgo: "42m ago",
    isError: true,
  },
  {
    id: "ORD-10245",
    customer: { name: "Sarah Connor", email: "s.connor@sky.net" },
    itemsCount: 2,
    payment: { status: "Paid: Stripe", tone: "success" as const },
    fulfillment: { status: "Shipped", tone: "brand" as const },
    total: "$89.00",
    timeAgo: "1h ago",
  },
  {
    id: "ORD-10244",
    customer: { name: "Liam Vance", email: "lvance@design.co" },
    itemsCount: 4,
    payment: { status: "Paid: Apple Pay", tone: "success" as const },
    fulfillment: { status: "Delivered", tone: "success" as const },
    total: "$450.00",
    timeAgo: "2h ago",
  },
]
