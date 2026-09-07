/**
 * @file edit-product-images.tsx
 * @description Modular Media & Gallery management tab for product editing.
 * Supports multipart file uploads via FormData, URL attachment, and image deletion.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import {
  UploadCloud,
  Loader2,
  Trash2,
  Plus,
  Link2,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  useUploadProductImageMutation,
  useAttachProductImageMutation,
  useDeleteProductImageMutation,
  useProductQuery,
} from "@/hooks/use-product-query"
import type { Product, ProductImage } from "@/types/product"

export interface EditProductImagesProps {
  product: Product
  onImageChange?: () => void
}

export function EditProductImages({ product, onImageChange }: EditProductImagesProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [altText, setAltText] = React.useState("")
  const [imageUrlInput, setImageUrlInput] = React.useState("")
  const [fileIdInput, setFileIdInput] = React.useState("")
  const [urlAltInput, setUrlAltInput] = React.useState("")
  const [urlSortOrder, setUrlSortOrder] = React.useState<number | "">("")
  const [isUrlMode, setIsUrlMode] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadingCount, setUploadingCount] = React.useState(0)

  // Fetch live product data for fresh image list
  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const images: ProductImage[] = liveProduct?.images ?? product.images ?? []

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

  // Handle direct file uploads using FormData
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setError(null)
    setUploadingCount(files.length)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      try {
        const formData = new FormData()
        formData.append("file", file)
        const caption = altText.trim() || `${product.name} image ${images.length + i + 1}`
        formData.append("altText", caption)
        formData.append("sortOrder", String(images.length + i))

        await uploadMutation.mutateAsync({
          id: product.id,
          payload: formData,
        })
      } catch (err: any) {
        const validationMsg = err.response?.data?.errors?.[0]?.message
        const msg =
          validationMsg ||
          err.response?.data?.message ||
          err.message ||
          `Failed to upload ${file.name}`
        setError(msg)
      }
    }

    setUploadingCount(0)
    setAltText("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    await refetch()
    onImageChange?.()
  }

  // Handle attaching URL directly
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
      await refetch()
      onImageChange?.()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to attach image URL"
      setError(msg)
    }
  }

  // Handle deleting an image
  const handleDeleteImage = async (imageId: string) => {
    setError(null)
    try {
      await deleteMutation.mutateAsync({ id: product.id, imageId })
      await refetch()
      onImageChange?.()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to delete image"
      setError(msg)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Mode switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground">Media Assets & Gallery</h4>
          <p className="text-[11px] text-muted-foreground">
            Upload product photos to ImageKit or link external image URLs.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-xs h-7.5 gap-1.5 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"
        >
          {isUrlMode ? <UploadCloud className="size-3.5" /> : <Link2 className="size-3.5" />}
          <span>{isUrlMode ? "Switch to File Upload" : "Switch to URL Mode"}</span>
        </Button>
      </div>

      {/* File Dropzone */}
      {!isUrlMode ? (
        <div className="space-y-2.5">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 hover:border-indigo-500 hover:bg-indigo-500/10 cursor-pointer transition-all text-center"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex size-10 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-600 group-hover:scale-110 transition-transform mb-2">
              {uploadingCount > 0 ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <UploadCloud className="size-5" />
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">
              {uploadingCount > 0
                ? `Uploading ${uploadingCount} image(s)...`
                : "Click or drag & drop files here"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              PNG, JPG, WEBP up to 10MB each
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Alt Caption (Optional)
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Front perspective, Close-up detail"
              className="h-8 text-xs"
            />
          </div>
        </div>
      ) : (
        /* URL Input */
        <form onSubmit={handleAttachUrl} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
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
                placeholder="e.g. Close-up detail"
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
              size="sm"
              disabled={attachMutation.isPending}
              className="h-8.5 gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {attachMutation.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              <span>Attach Hosted Image</span>
            </Button>
          </div>
        </form>
      )}

      {/* Uploaded Gallery Grid */}
      <div className="border-t border-border/60 pt-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">
            Current Images ({images.length})
          </span>
          <span className="text-[11px] text-muted-foreground">
            First image serves as primary cover
          </span>
        </div>

        {images.length === 0 ? (
          <div className="py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1.5">
            <ImageIcon className="size-6 text-muted-foreground/50" />
            <span>No images attached to this product yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {images.map((img, idx) => (
              <div
                key={img.id}
                className="group relative h-24 rounded-lg overflow-hidden border border-border/70 bg-muted/30 flex items-center justify-center shadow-2xs"
              >
                <Image
                  src={img.url}
                  alt={img.altText || `Image ${idx + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-indigo-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                    Cover
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-1 right-1 size-6 rounded-md bg-rose-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                  title="Delete image"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
