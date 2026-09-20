/**
 * @file edit-product-images.tsx
 * @description Product Gallery media manager supporting ImageKit file uploads and URL attachment.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { UploadCloud, Loader2, Trash2, Plus, Link2, ImageIcon } from "lucide-react"
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
  const [isUrlMode, setIsUrlMode] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [uploadingCount, setUploadingCount] = React.useState(0)

  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const images: ProductImage[] = liveProduct?.images ?? product.images ?? []

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

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
        formData.append("altText", altText.trim() || `${product.name} image ${images.length + i + 1}`)
        formData.append("sortOrder", String(images.length + i))

        await uploadMutation.mutateAsync({ id: product.id, payload: formData })
      } catch (err: any) {
        setError(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || `Failed to upload ${file.name}`)
      }
    }

    setUploadingCount(0)
    setAltText("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    await refetch()
    onImageChange?.()
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
      onImageChange?.()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to attach image URL.")
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setError(null)
    try {
      await deleteMutation.mutateAsync({ id: product.id, imageId })
      await refetch()
      onImageChange?.()
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete image.")
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground">Product Gallery Images (ImageKit)</h4>
          <p className="text-[11px] text-muted-foreground">Upload gallery photos or attach hosted URLs.</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="h-7 text-xs gap-1.5"
        >
          {isUrlMode ? <UploadCloud className="size-3" /> : <Link2 className="size-3" />}
          <span>{isUrlMode ? "Upload Files" : "Attach URL"}</span>
        </Button>
      </div>

      {!isUrlMode ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 text-center space-y-2">
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
              disabled={uploadingCount > 0}
              className="h-8 gap-1.5 px-4 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              {uploadingCount > 0 ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
              <span>{uploadingCount > 0 ? `Uploading (${uploadingCount})...` : "Upload Gallery Photos"}</span>
            </Button>
          </div>
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Optional alt caption for uploaded batch"
            className="h-7.5 text-xs max-w-sm mx-auto"
          />
        </div>
      ) : (
        <form onSubmit={handleAttachUrl} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
          <Input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://ik.imagekit.io/meeo/products/image.jpg"
            className="h-8 text-xs font-mono"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input value={fileIdInput} onChange={(e) => setFileIdInput(e.target.value)} placeholder="File ID (Optional)" className="h-7.5 text-xs font-mono" />
            <Input value={urlAltInput} onChange={(e) => setUrlAltInput(e.target.value)} placeholder="Alt Caption (Optional)" className="h-7.5 text-xs" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={attachMutation.isPending} className="h-7.5 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white">
              {attachMutation.isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              <span>Attach Image</span>
            </Button>
          </div>
        </form>
      )}

      {/* Gallery Grid */}
      <div className="border-t border-border/60 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Current Photos ({images.length})</span>
          <span className="text-[10.5px] text-muted-foreground">Primary image serves as catalog cover</span>
        </div>

        {images.length === 0 ? (
          <div className="py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
            <ImageIcon className="size-5 text-muted-foreground/50" />
            <span>No gallery photos attached to this product yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {images.map((img, idx) => (
              <div key={img.id} className="group relative h-24 rounded-lg overflow-hidden border border-border/70 bg-muted/30">
                <Image src={img.thumbnailUrl || img.url} alt={img.altText || `Image ${idx + 1}`} fill className="object-cover" unoptimized />
                {idx === 0 && (
                  <span className="absolute top-1 left-1 rounded bg-indigo-600/90 px-1 py-0.2 text-[8.5px] font-bold text-white uppercase">Cover</span>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteImage(img.id)}
                  disabled={deleteMutation.isPending}
                  className="absolute top-1 right-1 size-5 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete photo"
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
