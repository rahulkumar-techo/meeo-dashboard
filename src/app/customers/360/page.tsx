/**
 * @file page.tsx
 * @description Customer 360 Intelligence Hub: Interactive 360 dashboard allowing instant switching between customer profiles.
 */

"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useCustomersQuery } from "@/hooks/use-customer-query"
import { Customer360View } from "@/components/customers"
import { EmptyState } from "@/components/common"

function Customer360HubContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryUserId = searchParams.get("userId")

  const { data: customersData, isLoading } = useCustomersQuery({ limit: 1 })
  const firstCustomerId = customersData?.items?.[0]?.id

  const activeUserId = queryUserId || firstCustomerId

  const handleSelectCustomer = (newUserId: string) => {
    router.push(`/customers/360?userId=${newUserId}`)
  }

  if (isLoading && !activeUserId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Locating Customer 360 Records...
        </p>
      </div>
    )
  }

  if (!activeUserId) {
    return (
      <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
        <EmptyState
          title="No Customers Found"
          description="There are currently no registered customer accounts in the database to inspect."
          actionLabel="View Customer Directory"
          onAction={() => router.push("/customers")}
        />
      </div>
    )
  }

  return (
    <Customer360View
      userId={activeUserId}
      onSelectCustomer={handleSelectCustomer}
      showBackToDirectory={true}
    />
  )
}

export default function Customer360HubPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex-1 flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">
            Loading Customer 360 Hub...
          </p>
        </div>
      }
    >
      <Customer360HubContent />
    </React.Suspense>
  )
}
