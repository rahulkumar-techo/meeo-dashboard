/**
 * @file page.tsx
 * @description Dedicated Product Edit Wizard Page (< 170 lines).
 * Follows the same 3-step creation flow for editing existing catalog items:
 *  - Step 1: Update Product Details (PATCH /api/v1/products/:id)
 *  - Step 2: Manage & Upload Media (POST /api/v1/products/:id/images/upload, POST /api/v1/products/:id/images)
 *  - Step 3: Review & Publish Lifecycle (POST /api/v1/products/:id/publish, etc.)
 */

"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/common"
import { ProductWizardStepper } from "@/components/products/product-wizard-stepper"
import { StepEditDetails } from "@/components/products/step-edit-details"
import { StepImageUploader } from "@/components/products/step-image-uploader"
import { StepPublishReview } from "@/components/products/step-publish-review"
import { ProductFormPreview } from "@/components/products/product-form-preview"
import { useProductQuery } from "@/hooks/use-product-query"
import { useCategoriesQuery } from "@/hooks/use-category-query"
import { useBrandsQuery } from "@/hooks/use-brand-query"
import type { Product, ProductImage, ProductStatus } from "@/types/product"

export default function EditProductPage() {
  const params = useParams()
  const id = (params?.id as string) || ""

  // Wizard state
  const [currentStep, setCurrentStep] = React.useState<1 | 2 | 3>(1)
  const [completedSteps, setCompletedSteps] = React.useState<number[]>([1])
  const [editedProduct, setEditedProduct] = React.useState<Product | null>(null)
  const [liveImages, setLiveImages] = React.useState<ProductImage[]>([])

  // Live queries
  const { data: product, isLoading, isError, error } = useProductQuery(id)
  const { data: categoriesData } = useCategoriesQuery({ limit: 100 })
  const { data: brandsData } = useBrandsQuery({ limit: 100 })

  const categories = categoriesData?.items ?? []
  const brands = brandsData?.items ?? []

  // Initialize and sync product state
  React.useEffect(() => {
    if (product) {
      setEditedProduct(product)
      setLiveImages(product.images ?? [])
    }
  }, [product])

  // Live preview tracking
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

  // Handlers for step progression
  const handleDetailsSaved = (updated: Product) => {
    setEditedProduct(updated)
    setCompletedSteps((prev) => Array.from(new Set([...prev, 1])))
    setCurrentStep(2)
  }

  const handleStep2Next = () => {
    setCompletedSteps((prev) => Array.from(new Set([...prev, 2])))
    setCurrentStep(3)
  }

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
        <p className="text-xs text-muted-foreground">Loading product details...</p>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-3 max-w-md mx-auto text-center p-6">
        <AlertCircle className="size-10 text-rose-500" />
        <h3 className="text-sm font-bold text-foreground">Product Not Found</h3>
        <p className="text-xs text-muted-foreground">
          {(error as any)?.message || "The requested product could not be loaded."}
        </p>
        <Link href="/products">
          <Button size="sm" variant="outline" className="text-xs">
            Back to Products Catalog
          </Button>
        </Link>
      </div>
    )
  }

  const activeProduct = editedProduct || product

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 max-w-[1500px] mx-auto">
      {/* 1. Top Navigation & Header */}
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
        title={`Edit Product: ${activeProduct.name}`}
        badge={`Step ${currentStep} of 3`}
        badgeVariant="brand"
        description="Modify product attributes, media gallery assets, and publish status through the guided wizard."
      />

      {/* 2. Visual Stepper Bar */}
      <ProductWizardStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={(step) => setCurrentStep(step)}
      />

      {/* 3. Split Layout: Active Form (Left) & Real-time Live Preview (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        <div className="lg:col-span-7 space-y-4">
          {currentStep === 1 && (
            <StepEditDetails
              product={activeProduct}
              categories={categories}
              brands={brands}
              onSaved={handleDetailsSaved}
              onFormChange={setPreviewData}
            />
          )}

          {currentStep === 2 && (
            <StepImageUploader
              product={activeProduct}
              onNext={handleStep2Next}
              onBack={() => setCurrentStep(1)}
              onImagesUpdated={setLiveImages}
            />
          )}

          {currentStep === 3 && (
            <StepPublishReview
              product={activeProduct}
              categories={categories}
              brands={brands}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </div>

        {/* Right Column: Live Storefront Card Preview */}
        <div className="lg:col-span-5 sticky top-6">
          <ProductFormPreview
            name={previewData.name || activeProduct.name}
            slug={previewData.slug || activeProduct.slug}
            description={previewData.description || activeProduct.description || undefined}
            categoryId={previewData.categoryId || activeProduct.categoryId || undefined}
            brandId={previewData.brandId || activeProduct.brandId || undefined}
            status={(activeProduct.status as ProductStatus) || "DRAFT"}
            isFeatured={previewData.isFeatured ?? activeProduct.isFeatured}
            seoTitle={previewData.seoTitle || activeProduct.seoTitle || undefined}
            seoDescription={previewData.seoDescription || activeProduct.seoDescription || undefined}
            imageUrl={liveImages.length > 0 ? liveImages[0].url : undefined}
            categories={categories}
            brands={brands}
          />
        </div>
      </div>
    </div>
  )
}
