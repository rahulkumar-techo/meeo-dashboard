/**
 * @file page.tsx
 * @description Dynamic 360-Degree Customer Intelligence View for a specific customer ID.
 * Features profile demographics, non-cancelled spend tiers, order history, engagement, behaviour telemetry, funnel insights, and active sessions.
 */

"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Customer360View } from "@/components/customers"

export default function Customer360DetailPage() {
  const params = useParams()
  const userId = String(params?.id || "")

  return <Customer360View userId={userId} showBackToDirectory={true} />
}
