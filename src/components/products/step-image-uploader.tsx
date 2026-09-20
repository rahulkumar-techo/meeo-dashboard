/**
 * @file step-image-uploader.tsx
 * @description Step 2 in Product creation wizard: Uploads images to ImageKit via POST /api/v1/products/:id/images/upload.
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
  const [isUrlMode, setIsUrlMode] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadingFilesCount, setUploadingFilesCount] = React.useState(0)

  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const images = liveProduct?.images ?? product.images ?? []

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

  React.useEffect(() => {
    onImagesUpdated?.(images)
  }, [images, onImagesUpdated])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setError(null)
    setUploadingFilesCount(files.length)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("altText", altText.trim() || `${product.name} image ${images.length + i + 1}`)
        formData.append("sortOrder", String(images.length + i))

        await uploadMutation.mutateAsync({ id: product.id, payload: formData })
      } catch (err: any) {
        setError(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || `Failed to upload ${file.name}`)
      }
    }

    setUploadingFilesCount(0)
    setAltText("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    await refetch()
  }

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
          sortOrder: images.length,
          thumbnailUrl: imageUrlInput.trim().includes("imagekit.io") ? `${imageUrlInput.trim()}?tr=w-200` : undefined,
        },
      })
      setImageUrlInput("")
      setFileIdInput("")
      setUrlAltInput("")
      await refetch()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to attach image URL.")
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setError(null)
    try {
      await deleteMutation.mutateAsync({ id: product.id, imageId })
      await refetch()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image.")
    }
  }

  return (
    <Card className="border-border/70 shadow-2xs text-xs">
      <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/60">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm sm:text-base font-bold">Product Media Gallery (ImageKit)</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Upload product photos to ImageKit or link existing hosted image URLs.
            </CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUrlMode(!isUrlMode)}
            className="h-7.5 text-xs gap-1.5"
          >
            {isUrlMode ? <UploadCloud className="size-3.5" /> : <Link2 className="size-3.5" />}
            <span>{isUrlMode ? "Direct File Upload" : "Link Image URL"}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-5 space-y-4">
        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {!isUrlMode ? (
          <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 text-center space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFilesCount > 0}
                className="h-9 gap-2 px-5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
              >
                {uploadingFilesCount > 0 ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
                <span>{uploadingFilesCount > 0 ? `Uploading (${uploadingFilesCount})...` : "Select Photos to Upload"}</span>
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Supports PNG, JPEG, WEBP up to 10MB each. Uploads directly to ImageKit CDN.</p>
          </div>
        ) : (
          <form onSubmit={handleAttachUrl} className="p-4 rounded-xl border border-border/70 bg-muted/20 space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">Hosted Image URL *</label>
              <Input
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://ik.imagekit.io/meeo/products/..."
                className="h-8.5 text-xs font-mono"
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Input value={fileIdInput} onChange={(e) => setFileIdInput(e.target.value)} placeholder="File ID (Optional)" className="h-8 text-xs font-mono" />
              <Input value={urlAltInput} onChange={(e) => setUrlAltInput(e.target.value)} placeholder="Alt Caption (Optional)" className="h-8 text-xs" />
            </div>
            <div className="flex justify-end pt-1">
              <Button type="submit" disabled={attachMutation.isPending} className="h-8 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
                {attachMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
                <span>Attach Hosted Image</span>
              </Button>
            </div>
          </form>
        )}

        {/* Gallery Grid */}
        <div className="border-t border-border/60 pt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Uploaded Photos ({images.length})</span>
            <span className="text-[10.5px] text-muted-foreground">Primary image shown on catalog card</span>
          </div>

          {images.length === 0 ? (
            <div className="py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground">
              No gallery images uploaded yet. You can continue or add images now.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {images.map((img, idx) => (
                <div key={img.id} className="group relative h-24 rounded-lg overflow-hidden border border-border/70 bg-muted/30">
                  <Image src={img.thumbnailUrl || img.url} alt={img.altText || `Image ${idx + 1}`} fill className="object-cover" unoptimized />
                  {idx === 0 && (
                    <span className="absolute top-1 left-1 rounded bg-indigo-600/90 px-1 py-0.2 text-[8.5px] font-bold text-white uppercase">Cover</span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 size-5 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete image"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border/60">
          <Button type="button" variant="outline" size="sm" onClick={onBack} className="h-8.5 gap-1 text-xs">
            <ArrowLeft className="size-3.5" />
            <span>Back</span>
          </Button>
          <Button type="button" size="sm" onClick={onNext} className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
            <span>Continue to Review</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
