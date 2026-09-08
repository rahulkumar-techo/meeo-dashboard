/**
 * @file page.tsx
 * @description Customer 360 Hub: Quick selector or direct fallback to the primary customer profile.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Users, Eye } from "lucide-react"
import { useCustomersQuery } from "@/hooks/use-customer-query"
import { EmptyState } from "@/components/common"
import { Button } from "@/components/ui/button"

export default function Customer360HubPage() {
  const router = useRouter()
  const { data: customersData, isLoading } = useCustomersQuery({ limit: 1 })

  const firstCustomer = customersData?.items?.[0]

  React.useEffect(() => {
    if (firstCustomer?.id) {
      router.replace(`/customers/${firstCustomer.id}`)
    }
  }, [firstCustomer, router])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-muted-foreground">
          Locating Customer 360 Profile...
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 max-w-4xl mx-auto space-y-4">
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Back to Customer Directory
      </Link>
      <EmptyState
        title="Select a Customer for 360° Intelligence"
        description="Choose any customer from the directory to inspect their full purchase ledger, risk rating, and active sessions."
        actionLabel="View Customer Directory"
        onAction={() => router.push("/customers")}
      />
    </div>
  )
}
