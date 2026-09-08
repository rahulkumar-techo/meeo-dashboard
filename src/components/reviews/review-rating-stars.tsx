/**
 * @file review-rating-stars.tsx
 * @description Star rating visualization component (1-5 stars).
 */

"use client"

import * as React from "react"
import { Star } from "lucide-react"

export interface ReviewRatingStarsProps {
  rating: number
  showScore?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ReviewRatingStars({
  rating = 5,
  showScore = false,
  size = "sm",
  className = "",
}: ReviewRatingStarsProps) {
  const starSizes = {
    sm: "size-3.5",
    md: "size-4",
    lg: "size-5",
  }[size]

  return (
    <div className={`inline-flex items-center gap-1 ${className}`}>
      <div className="flex items-center gap-0.5 text-amber-400">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < rating
          return (
            <Star
              key={i}
              className={`${starSizes} ${
                filled
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30 fill-muted-foreground/10"
              }`}
            />
          )
        })}
      </div>
      {showScore && (
        <span className="text-xs font-bold font-mono text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
