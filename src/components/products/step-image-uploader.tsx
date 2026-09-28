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
  GripVertical,
  Star,
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
  const [isDraggingFile, setIsDraggingFile] = React.useState(false)

  // Drag and drop state for gallery assets reordering
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const serverImages = liveProduct?.images ?? product.images ?? []
  const [galleryItems, setGalleryItems] = React.useState<ProductImage[]>(serverImages)

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

  // Sync server images with local gallery items
  React.useEffect(() => {
    setGalleryItems(serverImages)
  }, [serverImages])

  React.useEffect(() => {
    onImagesUpdated?.(galleryItems)
  }, [galleryItems, onImagesUpdated])

  // Common file upload processor for input change and drag-and-drop
  const uploadFiles = async (rawFiles: File[]) => {
    const validFiles = rawFiles.filter((f) => f.type.startsWith("image/"))
    if (validFiles.length === 0) {
      setError("Please select or drop valid image files (PNG, JPEG, WebP).")
      return
    }

    setError(null)
    setUploadingFilesCount(validFiles.length)

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB limit. Skipped.`)
        continue
      }
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("altText", altText.trim() || `${product.name} image ${galleryItems.length + i + 1}`)
        formData.append("sortOrder", String(galleryItems.length + i))

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  // Dropzone drag & drop handlers
  const handleDropzoneDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isDraggingFile) setIsDraggingFile(true)
  }

  const handleDropzoneDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget.contains(e.relatedTarget as Node)) return
    setIsDraggingFile(false)
  }

  const handleDropzoneDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingFile(false)
    const files = Array.from(e.dataTransfer.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

  // Gallery items reordering handlers
  const handleItemDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }

  const handleItemDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = "move"
    if (dragOverIndex !== index) {
      setDragOverIndex(index)
    }
  }

  const handleItemDragLeave = (index: number) => {
    if (dragOverIndex === index) {
      setDragOverIndex(null)
    }
  }

  const handleItemDrop = (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...galleryItems]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    setGalleryItems(reordered)
    onImagesUpdated?.(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleItemDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleSetAsCover = (index: number) => {
    if (index === 0) return
    const reordered = [...galleryItems]
    const [moved] = reordered.splice(index, 1)
    reordered.unshift(moved)
    setGalleryItems(reordered)
    onImagesUpdated?.(reordered)
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
          sortOrder: galleryItems.length,
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
              Upload product photos via drag & drop or link existing hosted image URLs.
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
          <div
            onDragOver={handleDropzoneDragOver}
            onDragLeave={handleDropzoneDragLeave}
            onDrop={handleDropzoneDrop}
            onClick={() => uploadingFilesCount === 0 && fileInputRef.current?.click()}
            className={`group relative rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none ${
              isDraggingFile
                ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/40 scale-[1.01]"
                : "border-border/80 bg-muted/20 hover:border-indigo-500/60 hover:bg-muted/40"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              multiple
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2.5">
              <div
                className={`flex size-11 items-center justify-center rounded-xl transition-all ${
                  isDraggingFile
                    ? "bg-indigo-600 text-white scale-110 shadow-md"
                    : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105"
                }`}
              >
                {uploadingFilesCount > 0 ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <UploadCloud className="size-5" />
                )}
              </div>

              <div>
                <p className="text-xs font-semibold text-foreground">
                  {uploadingFilesCount > 0
                    ? `Uploading ${uploadingFilesCount} image${uploadingFilesCount > 1 ? "s" : ""} to ImageKit...`
                    : isDraggingFile
                    ? "Drop images here to upload"
                    : "Drag & drop photos here, or click to browse"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Supports PNG, JPEG, WEBP up to 10MB each. Uploads directly to ImageKit CDN.
                </p>
              </div>

              {uploadingFilesCount === 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="h-8 gap-1.5 px-4 text-xs font-medium border-border/80 hover:border-indigo-500 hover:text-indigo-600 pointer-events-auto"
                >
                  <Plus className="size-3.5" />
                  <span>Choose Files</span>
                </Button>
              )}
            </div>
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

        {/* Gallery Grid & Drag-to-reorder Assets */}
        <div className="border-t border-border/60 pt-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-foreground">Uploaded Photos ({galleryItems.length})</span>
              {galleryItems.length > 1 && (
                <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  Drag cards to reorder
                </span>
              )}
            </div>
            <span className="text-[10.5px] text-muted-foreground">Primary image shown on catalog card</span>
          </div>

          {galleryItems.length === 0 ? (
            <div className="py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground">
              No gallery images uploaded yet. You can continue or add images now.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
              {galleryItems.map((img, idx) => {
                const isItemDragged = draggedIndex === idx
                const isItemDragOver = dragOverIndex === idx

                return (
                  <div
                    key={img.id || `${img.url}-${idx}`}
                    draggable={uploadingFilesCount === 0}
                    onDragStart={(e) => handleItemDragStart(e, idx)}
                    onDragOver={(e) => handleItemDragOver(e, idx)}
                    onDragLeave={() => handleItemDragLeave(idx)}
                    onDrop={(e) => handleItemDrop(e, idx)}
                    onDragEnd={handleItemDragEnd}
                    className={`group relative h-28 rounded-lg overflow-hidden border bg-muted/30 transition-all cursor-grab active:cursor-grabbing select-none ${
                      isItemDragged
                        ? "opacity-40 scale-95 border-indigo-500 ring-2 ring-indigo-500"
                        : isItemDragOver
                        ? "border-indigo-500 ring-2 ring-indigo-500/80 scale-[1.03]"
                        : "border-border/70 hover:border-border hover:shadow-xs"
                    }`}
                  >
                    <Image
                      src={img.thumbnailUrl || img.url}
                      alt={img.altText || `Image ${idx + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      unoptimized
                    />

                    {/* Drag Handle Cue */}
                    <div className="absolute top-1 left-1 flex items-center gap-1">
                      <div className="size-5 rounded bg-black/60 text-white flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="size-3" />
                      </div>
                      {idx === 0 && (
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[8.5px] font-bold text-white uppercase shadow-xs">
                          Cover
                        </span>
                      )}
                    </div>

                    {/* Quick "Set as Cover" action on hover for non-cover images */}
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetAsCover(idx)
                        }}
                        className="absolute bottom-1 left-1 text-[9px] bg-black/70 hover:bg-indigo-600 text-white font-medium px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                        title="Set as catalog cover image"
                      >
                        <Star className="size-2.5" />
                        <span>Cover</span>
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteImage(img.id)
                      }}
                      className="absolute top-1 right-1 size-5 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700"
                      title="Delete image"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )
              })}
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
