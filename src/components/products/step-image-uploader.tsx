/**
 * @file step-image-uploader.tsx
 * @description Step 2 in Product creation wizard: Uploads images one-by-one / in parallel to ImageKit via POST /api/v1/products/:id/images/upload.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import {
  UploadCloud,
  Loader2,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  Link2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useUploadProductImageMutation,
  useAttachProductImageMutation,
  useDeleteProductImageMutation,
  useProductQuery,
} from "@/hooks/use-product-query"
import type { Product, ProductImage } from "@/types/product"

export interface StepImageUploaderProps {
  product: Product
  onNext: () => void
  onBack: () => void
  onImagesUpdated?: (images: ProductImage[]) => void
}

export function StepImageUploader({
  product,
  onNext,
  onBack,
  onImagesUpdated,
}: StepImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [altText, setAltText] = React.useState("")
  const [imageUrlInput, setImageUrlInput] = React.useState("")
  const [fileIdInput, setFileIdInput] = React.useState("")
  const [urlAltInput, setUrlAltInput] = React.useState("")
  const [urlSortOrder, setUrlSortOrder] = React.useState<number | "">("")
  const [isUrlMode, setIsUrlMode] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadingFilesCount, setUploadingFilesCount] = React.useState(0)

  // Live product data to get attached images
  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const images = liveProduct?.images ?? product.images ?? []

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

  React.useEffect(() => {
    onImagesUpdated?.(images)
  }, [images, onImagesUpdated])

  // Handle file picker selection (sends FormData with binary file, altText, sortOrder)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setError(null)
    setUploadingFilesCount(files.length)

    // Upload files sequentially or in parallel
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const formData = new FormData()
        formData.append("file", file)
        const itemAlt = altText.trim() || `${product.name} image ${images.length + i + 1}`
        formData.append("altText", itemAlt)
        formData.append("sortOrder", String(images.length + i))

        await uploadMutation.mutateAsync({
          id: product.id,
          payload: formData,
        })
      } catch (err: any) {
        const validationError = err.response?.data?.errors?.[0]?.message
        const msg =
          validationError ||
          err.response?.data?.message ||
          err.message ||
          `Failed to upload ${file.name}`
        setError(msg)
      }
    }

    setUploadingFilesCount(0)
    setAltText("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    refetch()
  }

  // Handle attaching URL directly (POST /api/v1/products/:id/images with { url, fileId, altText, sortOrder })
  const handleAttachUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return

    setError(null)
    try {
      await attachMutation.mutateAsync({
        id: product.id,
        payload: {
          url: imageUrlInput.trim(),
          fileId: fileIdInput.trim() || undefined,
          altText: urlAltInput.trim() || product.name,
          sortOrder: typeof urlSortOrder === "number" ? urlSortOrder : images.length,
        },
      })
      setImageUrlInput("")
      setFileIdInput("")
      setUrlAltInput("")
      setUrlSortOrder("")
      refetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to attach image URL"
      setError(msg)
    }
  }

  // Delete image
  const handleDeleteImage = async (imageId: string) => {
    setError(null)
    try {
      await deleteMutation.mutateAsync({ id: product.id, imageId })
      refetch()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete image"
      setError(msg)
    }
  }

  return (
    <Card className="border-border/70 shadow-2xs">
      <CardHeader className="p-4 sm:p-6 pb-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base sm:text-lg font-bold">Step 2: Upload Gallery Images</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Attach product visuals via direct ImageKit upload or external image URLs.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="text-xs h-8 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"
          >
            {isUrlMode ? <UploadCloud className="size-3.5" /> : <Link2 className="size-3.5" />}
            <span>{isUrlMode ? "File Upload Mode" : "Attach URL Mode"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Upload Mode A: File Dropzone / Multi-File Upload */}
        {!isUrlMode ? (
          <div className="space-y-3">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex size-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform mb-3">
                {uploadingFilesCount > 0 ? (
                  <Loader2 className="size-6 animate-spin" />
                ) : (
                  <UploadCloud className="size-6" />
                )}
              </div>
              <p className="text-xs font-bold text-foreground">
                {uploadingFilesCount > 0
                  ? `Uploading ${uploadingFilesCount} image(s) to ImageKit...`
                  : "Click or drag & drop images to upload"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Supports PNG, JPEG, WEBP up to 10MB each. Uploads one-by-one or in batch.
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Default Alt Caption (Optional)</label>
              <Input
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Front view, Sole profile, Box contents"
                className="h-8.5 text-xs"
              />
            </div>
          </div>
        ) : (
          /* Upload Mode B: Attach Image URL */
          <form onSubmit={handleAttachUrl} className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Hosted Image URL <span className="text-rose-500">*</span>
              </label>
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://ik.imagekit.io/your_account/products/image.jpg"
                className="h-8.5 text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">File ID (Optional)</label>
                <Input
                  value={fileIdInput}
                  onChange={(e) => setFileIdInput(e.target.value)}
                  placeholder="e.g. file_01abc..."
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Alt Caption (Optional)</label>
                <Input
                  value={urlAltInput}
                  onChange={(e) => setUrlAltInput(e.target.value)}
                  placeholder="e.g. Angle shot"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-muted-foreground">Sort Order</label>
                <Input
                  type="number"
                  min={0}
                  value={urlSortOrder}
                  onChange={(e) => setUrlSortOrder(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder={`Default: ${images.length}`}
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={attachMutation.isPending}
                className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {attachMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                <span>Attach Hosted Image</span>
              </Button>
            </div>
          </form>
        )}

        {/* Uploaded Gallery Grid */}
        <div className="border-t border-border/60 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Uploaded Images ({images.length})
            </span>
            <span className="text-[11px] text-muted-foreground">
              First image is used as the primary catalog cover
            </span>
          </div>

          {images.length === 0 ? (
            <div className="py-8 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground">
              No gallery images uploaded yet. You can continue or add images now.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div
                  key={img.id}
                  className="group relative h-28 rounded-lg overflow-hidden border border-border/70 bg-muted/30 flex items-center justify-center shadow-2xs"
                >
                  <Image
                    src={img.url}
                    alt={img.altText || `Image ${idx + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 rounded bg-indigo-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1.5 right-1.5 size-6 rounded-md bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                    title="Delete image"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Step Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="h-8.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Details</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onNext}
            className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            <span>Continue to Review & Publish</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
