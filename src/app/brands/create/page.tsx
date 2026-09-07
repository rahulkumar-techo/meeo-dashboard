/**
 * @file page.tsx
 * @description Dedicated Brand Registration Page (< 150 lines).
 * Features split layout with form fields and real-time storefront preview card.
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common"
import { CreateBrandForm } from "@/components/brands/create-brand-form"
import { BrandFormPreview } from "@/components/brands/brand-form-preview"
import type { BrandStatus } from "@/types/brand"

export default function CreateBrandPage() {
  // Live form state for real-time preview
  const [previewData, setPreviewData] = React.useState<{
    name: string
    slug: string
    logoUrl: string
    description: string
    status: BrandStatus
  }>({
    name: "",
    slug: "",
    logoUrl: "",
    description: "",
    status: "ACTIVE",
  })

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1400px] mx-auto">
      {/* 1. Header & Back Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/brands">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Brands</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Register New Brand"
        badge="Catalog Registry"
        badgeVariant="brand"
        description="Register a verified supplier, direct manufacturer, or brand to associate with catalog products."
      />

      {/* 2. Split Layout: Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Input Form */}
        <div className="lg:col-span-7">
          <CreateBrandForm onFormChange={setPreviewData} />
        </div>

        {/* Right: Live Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <BrandFormPreview
            name={previewData.name}
            slug={previewData.slug}
            logoUrl={previewData.logoUrl}
            description={previewData.description}
            status={previewData.status}
          />
        </div>
      </div>
    </div>
  )
}
