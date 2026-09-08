/**
 * @file feature-flags-card.tsx
 * @description Card for configuring binary Feature Flags and Canary Percentage Rollouts with deterministic user hashing.
 */

"use client"

import * as React from "react"
import { Sparkles, Sliders, Zap, CheckSquare, Layers, Cpu } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import type { SystemSettings, FeatureFlags, PercentageFeatureRollout } from "@/types/settings"

export interface FeatureFlagsCardProps {
  settings: SystemSettings
  onChange: (updates: Partial<SystemSettings>) => void
}

const FEATURE_DEFINITIONS: {
  key: keyof FeatureFlags
  label: string
  description: string
  category: string
}[] = [
  {
    key: "enableReviews",
    label: "Customer Reviews & Star Ratings",
    description: "Enables product reviews, helpfulness votes, and automated spam moderation.",
    category: "Storefront & Social",
  },
  {
    key: "enableCoupons",
    label: "Promotions & Coupon Discounts",
    description: "Enables cart promotion evaluation, coupon redemption, and usage tracking.",
    category: "Marketing & Growth",
  },
  {
    key: "enableWishlists",
    label: "Customer Saved Wishlists",
    description: "Allows shoppers to save, organize, and share wishlists across devices.",
    category: "Storefront & Social",
  },
  {
    key: "enableGuestCheckout",
    label: "Express Guest Checkout",
    description: "Enables unauthenticated buyers to complete transactions without mandatory account registration.",
    category: "Fulfillment & Orders",
  },
  {
    key: "enableExpressPay",
    label: "One-Click Express Payment (Apple/Google Pay)",
    description: "Enables fast browser-native wallet payments directly from product pages.",
    category: "Finance & Checkout",
  },
  {
    key: "enableAiSearch",
    label: "AI Semantic Vector Search",
    description: "Powers neural embeddings for multilingual product search and recommendation ranking.",
    category: "AI & Search",
  },
]

export function FeatureFlagsCard({
  settings,
  onChange,
}: FeatureFlagsCardProps) {
  const flags = settings.featureFlags || ({} as FeatureFlags)
  const rollouts = settings.percentageFeatureRollout || {}

  const handleToggleFlag = (key: keyof FeatureFlags, val: boolean) => {
    onChange({
      featureFlags: {
        ...flags,
        [key]: val,
      },
    })
  }

  const handleRolloutChange = (key: string, val: number) => {
    onChange({
      percentageFeatureRollout: {
        ...rollouts,
        [key]: Math.min(100, Math.max(0, val)),
      },
    })
  }

  return (
    <div className="space-y-5">
      {/* 1. Canary Percentage Rollout Engine */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="size-4 text-violet-500" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Canary Percentage Rollout Engine
            </h2>
          </div>
          <Badge variant="outline" className="text-[10px] font-mono border-violet-500/30 text-violet-600">
            Deterministic Hashing (0-99)
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Gradually rollout experimental customer experiences using consistent user ID hashing to prevent UI flicker.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* New Checkout Funnel Slider */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-xs">
                New One-Step Checkout Funnel
              </span>
              <Badge className="font-mono text-xs bg-indigo-600 text-white">
                {rollouts.newCheckoutFunnel ?? 100}%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Direct checkout flow with optimized mobile form fields.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={rollouts.newCheckoutFunnel ?? 100}
                onChange={(e) =>
                  handleRolloutChange("newCheckoutFunnel", parseInt(e.target.value))
                }
                className="flex-1 accent-indigo-600 cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="font-mono text-xs w-10 text-right text-muted-foreground font-semibold">
                {rollouts.newCheckoutFunnel ?? 100}%
              </span>
            </div>
          </div>

          {/* AI Product Recommendations Slider */}
          <div className="p-3.5 rounded-lg border border-border bg-muted/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground text-xs">
                AI Product Recommendations Model
              </span>
              <Badge className="font-mono text-xs bg-violet-600 text-white">
                {rollouts.aiProductRecommendations ?? 25}%
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Deep reinforcement learning cohort collaborative filtering model.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={rollouts.aiProductRecommendations ?? 25}
                onChange={(e) =>
                  handleRolloutChange(
                    "aiProductRecommendations",
                    parseInt(e.target.value)
                  )
                }
                className="flex-1 accent-violet-600 cursor-pointer h-2 bg-muted rounded-lg"
              />
              <span className="font-mono text-xs w-10 text-right text-muted-foreground font-semibold">
                {rollouts.aiProductRecommendations ?? 25}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Binary Feature Flags Matrix */}
      <div className="rounded-xl border border-border/80 bg-card p-5 shadow-2xs space-y-4">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Sparkles className="size-4 text-cyan-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
            Feature Capability Toggles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {FEATURE_DEFINITIONS.map((def) => {
            const isEnabled = Boolean(flags[def.key])

            return (
              <div
                key={def.key}
                className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {def.label}
                    </span>
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1 py-0 border-border text-muted-foreground uppercase"
                    >
                      {def.category}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {def.description}
                  </p>
                </div>

                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked: boolean) =>
                    handleToggleFlag(def.key, checked)
                  }
                  className="mt-1 shrink-0"
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
