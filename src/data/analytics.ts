/**
 * @file analytics.ts
 * @description Mock datasets and telemetry charts data for Executive Revenue & Funnel Analytics.
 */

export const REVENUE_TREND_DATA = [
  { label: "Oct 01", value: 34200, previousValue: 28900 },
  { label: "Oct 05", value: 38400, previousValue: 31200 },
  { label: "Oct 10", value: 41200, previousValue: 34500 },
  { label: "Oct 15", value: 39800, previousValue: 36100 },
  { label: "Oct 20", value: 44500, previousValue: 38200 },
  { label: "Oct 24", value: 54200, previousValue: 39400 },
  { label: "Oct 31", value: 48900, previousValue: 41000 },
]

export const CHANNEL_SHARE_DATA = [
  { name: "Web Storefront", value: 684200, color: "#6366f1" },
  { name: "Mobile iOS / Android", value: 342800, color: "#10b981" },
  { name: "B2B Wholesale Portal", value: 182100, color: "#f59e0b" },
  { name: "POS Retail Stores", value: 39220, color: "#06b6d4" },
]

export const FUNNEL_STAGES = [
  { stage: "Storefront Sessions", count: "342,890", dropoff: "100%", pct: 100 },
  { stage: "Product Detail Views", count: "184,200", dropoff: "53.7%", pct: 53.7 },
  { stage: "Added to Cart", count: "54,120", dropoff: "29.4%", pct: 29.4 },
  { stage: "Checkout Initiated", count: "21,480", dropoff: "39.7%", pct: 15.8 },
  { stage: "Completed Orders", count: "14,290", dropoff: "66.5%", pct: 10.5 },
]
