/**
 * @file page.tsx
 * @description Product Reviews & AI Sentiment Moderation Console (< 230 lines).
 */

"use client"

import React, { useState, useMemo } from "react"
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Send,
  Flag,
  Trash2,
  CheckCircle2,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PageHeader,
  MetricGrid,
  StatusBadge,
  DataTableToolbar,
  DataTablePagination,
  EmptyState,
} from "@/components/common"
import { REVIEWS_DATA, ReviewItem } from "@/data/reviews"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>(REVIEWS_DATA)
  const [selectedReviewId, setSelectedReviewId] = useState<string>(REVIEWS_DATA[0]?.id || "")
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [replyText, setReplyText] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const selectedReview = useMemo(
    () => reviews.find((r) => r.id === selectedReviewId) || reviews[0],
    [reviews, selectedReviewId]
  )

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (ratingFilter !== "all" && r.rating !== parseInt(ratingFilter)) return false
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          r.headline.toLowerCase().includes(q) ||
          r.body.toLowerCase().includes(q) ||
          r.customer.name.toLowerCase().includes(q) ||
          r.product.title.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [reviews, ratingFilter, statusFilter, searchQuery])

  const handleUpdateStatus = (id: string, newStatus: ReviewItem["status"]) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    )
  }

  const handleSendReply = () => {
    if (!replyText.trim() || !selectedReview) return
    setReviews((prev) =>
      prev.map((r) =>
        r.id === selectedReview.id
          ? {
              ...r,
              merchantReply: {
                author: "Sarah Jenkins (Apex Support)",
                date: "Today",
                text: replyText.trim(),
              },
            }
          : r
      )
    )
    setReplyText("")
  }

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6 max-w-[1600px] mx-auto">
      {/* 1. Header */}
      <PageHeader
        title="Product Reviews & Sentiment Moderation"
        badge="NLP Real-Time Pipeline"
        badgeVariant="brand"
        description="Monitor customer feedback, automated spam quarantine, multi-aspect sentiment parsing, and merchant resolution workflows."
      />

      {/* 2. KPI Metrics */}
      <MetricGrid
        columns={4}
        items={[
          { title: "Average CSAT Rating", value: "4.82 / 5.0", colorTheme: "amber", trend: { value: "+0.14", isPositive: true }, footnote: "From 1,420 ratings" },
          { title: "Positive Sentiment Score", value: "94.2%", colorTheme: "emerald", trend: { value: "+2.8%", isPositive: true }, footnote: "NLP model confidence: 99%" },
          { title: "Pending Moderation", value: "3 Reviews", colorTheme: "indigo", badge: { text: "Action Req", variant: "outline" }, footnote: "Avg triage time: 14m" },
          { title: "Spam Quarantined (30D)", value: "12 Filtered", colorTheme: "rose", badge: { text: "100% precision", variant: "destructive" }, footnote: "Bot URLs neutralized" },
        ]}
      />

      {/* 3. Filter Toolbar */}
      <DataTableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search review title, text, customer, SKU..."
        filters={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Stars</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8.5 rounded-md border border-border bg-background px-2 text-xs text-foreground focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="flagged">Flagged</option>
              <option value="quarantined">Quarantined</option>
            </select>
          </div>
        }
        activeFiltersCount={(ratingFilter !== "all" ? 1 : 0) + (statusFilter !== "all" ? 1 : 0)}
        onResetFilters={() => { setRatingFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
      />

      {/* 4. Split Layout: Stream & Inspector */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Reviews List */}
        <div className="space-y-2.5 lg:col-span-7">
          {filteredReviews.length === 0 ? (
            <EmptyState
              title="No Reviews Found"
              description="No reviews matched your filters."
              actionLabel="Reset Filters"
              onAction={() => { setRatingFilter("all"); setStatusFilter("all"); setSearchQuery("") }}
            />
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                onClick={() => setSelectedReviewId(rev.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedReview?.id === rev.id
                    ? "border-indigo-500 bg-indigo-500/5 shadow-xs"
                    : "border-border/70 bg-card hover:border-border"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-7 border border-border">
                      <AvatarImage src={rev.customer.avatar} />
                      <AvatarFallback>{rev.customer.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-xs text-foreground">{rev.customer.name}</p>
                      <p className="text-[11px] text-muted-foreground">{rev.product.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`size-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />
                    ))}
                  </div>
                </div>
                <h4 className="mt-2 text-xs font-bold text-foreground">{rev.headline}</h4>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{rev.body}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[11px]">
                  <StatusBadge status={rev.status} />
                  <span className="text-muted-foreground">{rev.createdAt.slice(0, 10)}</span>
                </div>
              </div>
            ))
          )}
          <DataTablePagination
            currentPage={page}
            totalPages={1}
            pageSize={pageSize}
            totalItems={filteredReviews.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </div>

        {/* Right: Selected Review Inspector */}
        <div className="space-y-4 lg:col-span-5">
          {selectedReview ? (
            <div className="rounded-xl border border-border/70 bg-card p-4 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">{selectedReview.id}</span>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedReview.id, "published")} className="h-7 text-xs">
                    <CheckCircle2 className="mr-1 size-3.5 text-emerald-600" /> Publish
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleUpdateStatus(selectedReview.id, "flagged")} className="h-7 text-xs text-rose-600">
                    <Flag className="mr-1 size-3.5" /> Flag
                  </Button>
                </div>
              </div>

              <div>
                <p className="font-bold text-sm text-foreground">{selectedReview.headline}</p>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{selectedReview.body}</p>
              </div>

              {selectedReview.aspects && (
                <div className="rounded-lg bg-muted/30 p-3 space-y-1.5">
                  <span className="font-semibold text-[11px]">NLP Aspect Sentiment</span>
                  {selectedReview.aspects.map((asp, idx) => (
                    <div key={idx} className="flex justify-between text-[11px]">
                      <span>{asp.name}</span>
                      <span className="font-mono font-bold text-emerald-600">{(asp.score * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Merchant Reply */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <span className="font-semibold text-xs">Merchant Public Reply</span>
                {selectedReview.merchantReply ? (
                  <div className="rounded-lg bg-indigo-500/10 p-2.5 text-xs">
                    <p className="font-semibold text-indigo-600">{selectedReview.merchantReply.author}</p>
                    <p className="text-muted-foreground mt-0.5">{selectedReview.merchantReply.text}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      placeholder="Write a public support reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full rounded-md border border-border bg-background p-2 text-xs focus:outline-hidden"
                    />
                    <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()} className="h-7 text-xs">
                      <Send className="mr-1.5 size-3" /> Post Reply
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
              Select a review to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
