/**
 * @file common.ts
 * @description Centralized TypeScript type definitions used across dashboard components and pages.
 * Adheres to Interface Segregation Principle (ISP) with granular, decoupled types.
 */

import * as React from "react"

/**
 * Metric trend direction and percentage comparison
 */
export interface MetricTrend {
  value: number | string
  isPositive: boolean
  label?: string
  comparisonPeriod?: string
}

/**
 * Common Metric Card representation
 */
export interface MetricCardData {
  id?: string
  title: string
  value: string | number
  subValue?: string
  trend?: MetricTrend
  icon?: React.ComponentType<{ className?: string }>
  badge?: {
    text: string
    variant?: "default" | "secondary" | "outline" | "destructive" | "brand" | "success" | "warning"
  }
  sparklineData?: number[]
  colorTheme?: "indigo" | "emerald" | "amber" | "rose" | "cyan" | "violet" | "slate"
  footnote?: string
  onClick?: () => void
}

/**
 * Generic Pagination State
 */
export interface PaginationState {
  pageIndex: number
  pageSize: number
  totalItems: number
  totalPages: number
}

/**
 * Filter select option
 */
export interface FilterOption<T = string> {
  label: string
  value: T
  count?: number
  icon?: React.ComponentType<{ className?: string }>
}

/**
 * Generic Table Action definition
 */
export interface TableAction<T> {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "ghost"
  onClick: (items: T[]) => void
  disabled?: boolean | ((items: T[]) => boolean)
  hidden?: boolean | ((items: T[]) => boolean)
}

/**
 * Common Status Types across E-Commerce Subsystems
 */
export type CommonStatus =
  | "active"
  | "inactive"
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed"
  | "refunded"
  | "partially_refunded"
  | "scheduled"
  | "draft"
  | "paused"
  | "expired"
  | "healthy"
  | "degraded"
  | "dead"
  | "succeeded"
  | "running"
  | "queued"

/**
 * Triage Queue Alert Item
 */
export interface TriageQueueItem {
  id: string
  label: string
  count: number | string
  severity?: "normal" | "warning" | "danger" | "info"
  filterKey?: string
  onClick?: () => void
}
