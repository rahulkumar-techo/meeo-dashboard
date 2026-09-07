/**
 * @file page.tsx
 * @description Dedicated Product Creation Wizard Page (< 150 lines).
 * Implements 3-Step guided workflow:
 *  - Step 1: Create Product Draft (POST /api/v1/products)
 *  - Step 2: Upload Images (POST /api/v1/products/:id/images/upload)
 *  - Step 3: Review & Publish (POST /api/v1/products/:id/publish)
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common"
import { ProductWizardStepper } from "@/components/products/product-wizard-stepper"
import { StepDraftDetails } from "@/components/products/step-draft-details"
import { StepImageUploader } from "@/components/products/step-image-uploader"
import { StepPublishReview } from "@/components/products/step-publish-review"
import { ProductFormPreview } from "@/components/products/product-form-preview"
import { useCategoriesQuery } from "@/hooks/use-category-query"
import { useBrandsQuery } from "@/hooks/use-brand-query"
import type { Product, ProductImage } from "@/types/product"

export default function CreateProductPage() {
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([])
  const [createdProduct, setCreatedProduct] = React.useState<Product | null>(null)
  const [liveImages, setLiveImages] = React.useState<ProductImage[]>([])

  const { data: categoriesData } = useCategoriesQuery({ limit: 100 })
  const { data: brandsData } = useBrandsQuery({ limit: 100 })
  const categories = categoriesData?.items ?? []
  const brands = brandsData?.items ?? []

  // Live preview data
  const [previewData, setPreviewData] = React.useState<{
    name: string
    slug: string
    description: string
    categoryId: string
    brandId: string
    isFeatured: boolean
    seoTitle: string
    seoDescription: string
  }>({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    brandId: "",
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
  })

  // Callback when Step 1 creates product draft
  const handleDraftCreated = (product: Product) => {
    setCreatedProduct(product)
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])))
    setCurrentStep(2)
  }

  const handleStep2Next = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, 2])))
    setCurrentStep(3)
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1500px] mx-auto">
      {/* 1. Top Back Navigation & Header */}
      <div className="flex items-center justify-between">
        <Link href="/products">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground -ml-2"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Products</span>
          </Button>
        </Link>
      </div>

      <PageHeader
        title="Create New Product"
        badge={`Step ${currentStep} of 3`}
        badgeVariant="brand"
        description="Step-by-step product onboarding: Initialize draft, upload media assets, and activate in catalog."
      />

      {/* 2. Visual Stepper Bar */}
      <ProductWizardStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* 3. Split Layout: Active Step Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Multi-Step Forms */}
        <div className="lg:col-span-7 space-y-4">
          {currentStep === 1 && (
            <StepDraftDetails
              categories={categories}
              brands={brands}
              initialProduct={createdProduct}
              onDraftCreated={handleDraftCreated}
              onFormChange={setPreviewData}
            />
          )}

          {currentStep === 2 && createdProduct && (
            <StepImageUploader
              product={createdProduct}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
              onImagesUpdated={setLiveImages}
            />
          )}

          {currentStep === 3 && createdProduct && (
            <StepPublishReview
              product={createdProduct}
              categories={categories}
              brands={brands}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Right Column: Live Storefront Card Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <ProductFormPreview
            name={createdProduct?.name || previewData.name}
            slug={createdProduct?.slug || previewData.slug}
            description={createdProduct?.description || previewData.description}
            categoryId={createdProduct?.categoryId || previewData.categoryId}
            brandId={createdProduct?.brandId || previewData.brandId}
            status={currentStep === 3 ? "ACTIVE" : "DRAFT"}
            isFeatured={createdProduct?.isFeatured ?? previewData.isFeatured}
            seoTitle={createdProduct?.seoTitle || previewData.seoTitle}
            seoDescription={createdProduct?.seoDescription || previewData.seoDescription}
            imageUrl={liveImages.length > 0 ? liveImages[0].url : undefined}
            categories={categories}
            brands={brands}
          />
        </div>
      </div>
    </div>
  )
}
