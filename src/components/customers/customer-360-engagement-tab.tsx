/**
 * @file customer-360-engagement-tab.tsx
 * @description Engagements tab displaying cart items, wishlist activity, product reviews, and customer feedback sentiments.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShoppingCart,
  Heart,
  Star,
  MessageSquare,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MetricGrid, StatusBadge, EmptyState } from "@/components/common"
import { formatDate } from "@/lib/formatters"
import type { CustomerRecentReview } from "@/types/customer"

interface Customer360EngagementTabProps {
  engagement?: {
    totalReviews: number
    averageRatingGiven: number
    activeCartItemsCount: number
    wishlistItemsCount: number
  } | null
  recentReviews?: CustomerRecentReview[]
}

export function Customer360EngagementTab({
  engagement,
  recentReviews = [],
}: Customer360EngagementTabProps) {
  const cartCount = engagement?.activeCartItemsCount ?? 0
  const wishlistCount = engagement?.wishlistItemsCount ?? 0
  const totalReviews = engagement?.totalReviews ?? recentReviews.length
  const avgRating = engagement?.averageRatingGiven ?? 0

  return (
    <div className="space-y-6">
      {/* 1. Engagement Metric Cards */}
      <MetricGrid
        columns={4}
        items={[
          {
            title: "Active Cart Items",
            value: cartCount,
            colorTheme: "indigo",
            icon: ShoppingCart,
            footnote: cartCount > 0 ? "Pending cart checkout in progress" : "Cart is currently empty",
          },
          {
            title: "Saved to Wishlist",
            value: wishlistCount,
            colorTheme: "rose",
            icon: Heart,
            footnote: "Saved items marked for future purchase",
          },
          {
            title: "Product Reviews Written",
            value: totalReviews,
            colorTheme: "amber",
            icon: MessageSquare,
            footnote: "Community feedback and verified reviews",
          },
          {
            title: "Average Rating Given",
            value: avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0` : "No ratings",
            colorTheme: "emerald",
            icon: Star,
            footnote: "Overall customer satisfaction sentiment",
          },
        ]}
      />

      {/* 2. Customer Sentiment & Intent Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cart & Intent Card */}
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <ShoppingCart className="size-4 text-primary" />
              <span>Current Cart & Wishlist Affinity</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live engagement indicators on store items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Items in Shopping Cart</p>
                <p className="text-muted-foreground text-[11px]">Unchecked shopping bag items</p>
              </div>
              <Badge variant={cartCount > 0 ? "default" : "secondary"} className="text-sm font-bold px-2.5 py-0.5">
                {cartCount}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="space-y-0.5">
                <p className="font-semibold text-foreground">Items in Wishlist</p>
                <p className="text-muted-foreground text-[11px]">Saved favorite items</p>
              </div>
              <Badge variant={wishlistCount > 0 ? "outline" : "secondary"} className="text-sm font-bold px-2.5 py-0.5 border-rose-500/30 text-rose-600 dark:text-rose-400">
                {wishlistCount}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Sentiment Summary */}
        <Card className="border-border/70 bg-card shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              <span>Product Feedback Sentiment</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Average star ratings across purchased catalogue items
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
              <div className="flex items-center gap-1 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`size-4 ${
                      star <= Math.round(avgRating) ? "fill-amber-500 text-amber-500" : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>
              <span className="font-bold text-foreground text-sm">
                {avgRating > 0 ? `${avgRating.toFixed(1)} / 5.0 Rating` : "No ratings yet"}
              </span>
            </div>

            <p className="text-muted-foreground leading-relaxed text-[11px]">
              Customer sentiment reflects verified reviews submitted on fulfilled orders. High ratings indicate brand affinity and high repeat purchase probability.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Product Reviews List */}
      <Card className="border-border/70 bg-card shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="size-4 text-amber-500" />
              <span>Submitted Product Reviews ({recentReviews.length})</span>
            </div>
          </CardTitle>
          <CardDescription className="text-xs">
            Historical reviews, product ratings, and moderation feedback
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentReviews.length === 0 ? (
            <EmptyState
              title="No Reviews Submitted"
              description="This customer has not posted any product reviews yet."
            />
          ) : (
            <div className="divide-y divide-border/50 rounded-lg border border-border/60 bg-muted/10 overflow-hidden">
              {recentReviews.map((rev) => (
                <div key={rev.id} className="p-4 space-y-2 text-xs hover:bg-muted/30 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {rev.product?.name || "Product"}
                      </span>
                      <StatusBadge status={rev.status.toLowerCase()} />
                    </div>
                    <span className="text-muted-foreground text-[11px] font-mono">
                      {formatDate(rev.createdAt, "datetime")}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`size-3.5 ${
                          star <= rev.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="text-foreground font-semibold ml-1">{rev.rating}/5</span>
                  </div>

                  {rev.title && <p className="font-medium text-foreground">{rev.title}</p>}
                  {rev.comment && <p className="text-muted-foreground leading-relaxed">{rev.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
