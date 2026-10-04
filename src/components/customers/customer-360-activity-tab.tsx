/**
 * @file customer-360-activity-tab.tsx
 * @description Real-time customer activity timeline with cursor-based infinite pagination and telemetry metadata inspection.
 */

"use client"

import * as React from "react"
import {
  Activity,
  Filter,
  Eye,
  ShoppingCart,
  ShoppingBag,
  CreditCard,
  Search,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Loader2,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/common"
import { useUserActivityInfiniteQuery } from "@/hooks/use-tracking"
import { formatDate } from "@/lib/formatters"
import type { UserActivityEvent } from "@/types/tracking"

interface Customer360ActivityTabProps {
  userId: string
  initialRecentActivity?: Array<{
    id: string
    event: string
    entityType: string | null
    entityId: string | null
    createdAt: string
  }>
}

export function Customer360ActivityTab({
  userId,
  initialRecentActivity = [],
}: Customer360ActivityTabProps) {
  const [selectedEventType, setSelectedEventType] = React.useState<string>("ALL")
  const [expandedEventId, setExpandedEventId] = React.useState<string | null>(null)

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useUserActivityInfiniteQuery(userId, 20)

  // Flatten pages
  const events: UserActivityEvent[] = React.useMemo(() => {
    if (data?.pages && data.pages.length > 0) {
      return data.pages.flatMap((page) => page.items)
    }
    // Fallback to recentActivity if infinite query hasn't loaded or returned empty
    return initialRecentActivity.map((a) => ({
      id: a.id,
      event: a.event,
      entityType: a.entityType,
      entityId: a.entityId,
      createdAt: a.createdAt,
    }))
  }, [data, initialRecentActivity])

  const filteredEvents = React.useMemo(() => {
    if (selectedEventType === "ALL") return events
    return events.filter((e) => e.event === selectedEventType)
  }, [events, selectedEventType])

  const eventTypes = React.useMemo(() => {
    const types = new Set(events.map((e) => e.event))
    return Array.from(types)
  }, [events])

  const getEventBadge = (event: string) => {
    switch (event) {
      case "PRODUCT_VIEW":
        return <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">VIEW</Badge>
      case "CART_ADD":
        return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">CART +</Badge>
      case "CART_REMOVE":
        return <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30">CART -</Badge>
      case "CHECKOUT_STARTED":
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30">CHECKOUT</Badge>
      case "PAYMENT_SUCCESS":
        return <Badge variant="secondary" className="bg-emerald-600/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">PAID</Badge>
      case "PAYMENT_FAILURE":
        return <Badge variant="destructive">FAILED</Badge>
      case "SEARCH":
        return <Badge variant="secondary" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30">SEARCH</Badge>
      default:
        return <Badge variant="outline">{event}</Badge>
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedEventId((curr) => (curr === id ? null : id))
  }

  return (
    <Card className="border-border/70 bg-card shadow-2xs">
      <CardHeader className="p-4 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <span>User Telemetry Activity Stream</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Chronological log of raw customer browse events, cart mutations, and checkout attempts
            </CardDescription>
          </div>

          {/* Event Filter */}
          <div className="flex items-center gap-2">
            <Filter className="size-3.5 text-muted-foreground" />
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="text-xs rounded-md border border-border bg-card px-2.5 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-primary [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="ALL">All Event Types ({events.length})</option>
              {eventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1">
        {isLoading && events.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Loader2 className="size-6 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-medium">
              Loading user activity stream...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <EmptyState
            title="No Activity Events Recorded"
            description="No matching telemetry events were captured for this user."
          />
        ) : (
          <div className="space-y-4">
            <div className="divide-y divide-border/50 rounded-lg border border-border/60 bg-muted/10 overflow-hidden">
              {filteredEvents.map((evt) => {
                const isExpanded = expandedEventId === evt.id
                return (
                  <div key={evt.id} className="p-3 text-xs hover:bg-muted/30 transition-colors space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(evt.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isExpanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                        </button>
                        {getEventBadge(evt.event)}
                        <span className="font-semibold text-foreground font-mono">
                          {evt.event}
                        </span>
                        {evt.entityType && (
                          <span className="text-muted-foreground text-[11px]">
                            on <span className="font-medium text-foreground">{evt.entityType}</span>
                            {evt.entityId ? `: ${evt.entityId}` : ""}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] self-start sm:self-auto">
                        <Calendar className="size-3" />
                        <span>{formatDate(evt.createdAt, "datetime")}</span>
                      </div>
                    </div>

                    {/* Metadata JSON Drawer */}
                    {isExpanded && (
                      <div className="ml-6 mt-2 p-2.5 rounded-md bg-muted/60 border border-border/40 font-mono text-[11px] text-muted-foreground overflow-x-auto">
                        <p className="font-semibold text-foreground text-[10px] uppercase mb-1">
                          Telemetry Event Details & Metadata:
                        </p>
                        <pre className="text-[11px] whitespace-pre-wrap">
                          {JSON.stringify(
                            {
                              id: evt.id,
                              event: evt.event,
                              entityType: evt.entityType,
                              entityId: evt.entityId,
                              metadata: evt.metadata || "None",
                              timestamp: evt.createdAt,
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Load More Pagination */}
            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="text-xs h-8 gap-1.5"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Loading More Events...</span>
                    </>
                  ) : (
                    <span>Load Older Activity</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
