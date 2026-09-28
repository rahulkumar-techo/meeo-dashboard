/**
 * @file edit-product-images.tsx
 * @description Product Gallery media manager supporting ImageKit file uploads and URL attachment.
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
  GripVertical,
  Star,
  AlertTriangle,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
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
  const [isDraggingFile, setIsDraggingFile] = React.useState(false)
  const [imageToDelete, setImageToDelete] = React.useState<ProductImage | null>(null)

  // Drag and drop state for gallery assets reordering
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const serverImages: ProductImage[] = liveProduct?.images ?? product.images ?? []
  const [galleryItems, setGalleryItems] = React.useState<ProductImage[]>(serverImages)

  const uploadMutation = useUploadProductImageMutation()
  const attachMutation = useAttachProductImageMutation()
  const deleteMutation = useDeleteProductImageMutation()

  React.useEffect(() => {
    setGalleryItems(serverImages)
  }, [serverImages])

  const uploadFiles = async (rawFiles: File[]) => {
    const validFiles = rawFiles.filter((f) => f.type.startsWith("image/"))
    if (validFiles.length === 0) {
      setError("Please select or drop valid image files (PNG, JPEG, WebP).")
      return
    }

    setError(null)
    setUploadingCount(validFiles.length)

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB limit. Skipped.`)
        continue
      }
      try {
        const formData = new FormData()
        formData.append("file", file)
        formData.append("altText", altText.trim() || `${product.name} image ${galleryItems.length + 1}`)
        formData.append("sortOrder", String(galleryItems.length))

        const res = await uploadMutation.mutateAsync({ id: product.id, payload: formData })
        // Instant reflection: immediately add newly uploaded image to local gallery
        if (res?.data) {
          setGalleryItems((prev) => {
            const exists = prev.some((it) => it.id === res.data.id)
            return exists ? prev : [...prev, res.data]
          })
        }
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      uploadFiles(files)
    }
  }

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
    setDraggedIndex(null)
    setDragOverIndex(null)
    onImageChange?.()
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
    onImageChange?.()
  }

  const handleAttachUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return

    setError(null)
    try {
      const res = await attachMutation.mutateAsync({
        id: product.id,
        payload: {
          url: imageUrlInput.trim(),
          fileId: fileIdInput.trim() || undefined,
          altText: urlAltInput.trim() || product.name,
          sortOrder: galleryItems.length,
          thumbnailUrl: imageUrlInput.trim().includes("imagekit.io") ? `${imageUrlInput.trim()}?tr=w-200` : undefined,
        },
      })
      // Instant reflection: immediately add attached image to local gallery
      if (res?.data) {
        setGalleryItems((prev) => {
          const exists = prev.some((it) => it.id === res.data.id)
          return exists ? prev : [...prev, res.data]
        })
      }
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
      // Instant reflection: immediately remove deleted image from local gallery
      setGalleryItems((prev) => prev.filter((img) => img.id !== imageId))
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
          <p className="text-[11px] text-muted-foreground">Upload gallery photos via drag & drop or attach hosted URLs.</p>
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
        <div
          onDragOver={handleDropzoneDragOver}
          onDragLeave={handleDropzoneDragLeave}
          onDrop={handleDropzoneDrop}
          onClick={() => uploadingCount === 0 && fileInputRef.current?.click()}
          className={`group relative rounded-xl border-2 border-dashed p-5 text-center transition-all cursor-pointer select-none space-y-2.5 ${
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
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div
              className={`flex size-10 items-center justify-center rounded-xl transition-all ${
                isDraggingFile
                  ? "bg-indigo-600 text-white scale-110 shadow-md"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105"
              }`}
            >
              {uploadingCount > 0 ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UploadCloud className="size-4" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground">
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} image${uploadingCount > 1 ? "s" : ""}...`
                  : isDraggingFile
                  ? "Drop images here to upload"
                  : "Drag & drop photos here, or click to browse"}
              </p>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">
                PNG, JPEG, WebP up to 10MB
              </p>
            </div>

            {uploadingCount === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                className="h-7.5 gap-1.5 px-3 text-xs font-medium border-border/80 hover:border-indigo-500 hover:text-indigo-600 pointer-events-auto mt-1"
              >
                <Plus className="size-3" />
                <span>Select Photos</span>
              </Button>
            )}
          </div>
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

      {/* Gallery Grid & Drag-to-reorder Assets */}
      <div className="border-t border-border/60 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-foreground">Current Photos ({galleryItems.length})</span>
            {galleryItems.length > 1 && (
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                Drag cards to reorder
              </span>
            )}
          </div>
          <span className="text-[10.5px] text-muted-foreground">Primary image serves as catalog cover</span>
        </div>

        {galleryItems.length === 0 ? (
          <div className="py-6 text-center border border-dashed rounded-lg border-border/60 bg-muted/10 text-xs text-muted-foreground flex flex-col items-center justify-center gap-1">
            <ImageIcon className="size-5 text-muted-foreground/50" />
            <span>No gallery photos attached to this product yet.</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
            {galleryItems.map((img, idx) => {
              const isItemDragged = draggedIndex === idx
              const isItemDragOver = dragOverIndex === idx

              return (
                <div
                  key={img.id || `${img.url}-${idx}`}
                  draggable={uploadingCount === 0}
                  onDragStart={(e) => handleItemDragStart(e, idx)}
                  onDragOver={(e) => handleItemDragOver(e, idx)}
                  onDragLeave={() => handleItemDragLeave(idx)}
                  onDrop={(e) => handleItemDrop(e, idx)}
                  onDragEnd={handleItemDragEnd}
                  className={`group relative h-24 rounded-lg overflow-hidden border bg-muted/30 transition-all cursor-grab active:cursor-grabbing select-none ${
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
                      <span className="rounded bg-indigo-600 px-1 py-0.2 text-[8.5px] font-bold text-white uppercase shadow-xs">
                        Cover
                      </span>
                    )}
                  </div>

                  {/* Quick Set as Cover */}
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

                  {/* Delete button: opens delete confirmation card first */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageToDelete(img)
                    }}
                    disabled={deleteMutation.isPending}
                    className="absolute top-1 right-1 size-5 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Delete Product Photo Confirmation Card Modal */}
      <Dialog open={Boolean(imageToDelete)} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Delete Product Photo</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Confirm photo deletion from {product.name}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {imageToDelete && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                <div className="relative size-14 shrink-0 rounded-md overflow-hidden border border-border/80 bg-background">
                  <Image
                    src={imageToDelete.thumbnailUrl || imageToDelete.url}
                    alt={imageToDelete.altText || "Product photo"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {imageToDelete.altText || `${product.name} photo`}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Image ID: {imageToDelete.id.slice(0, 8)}...
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Are you sure you want to delete this photo? This will permanently remove it from the product media gallery.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImageToDelete(null)}
              disabled={deleteMutation.isPending}
              className="text-xs h-8.5"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={async () => {
                if (!imageToDelete) return
                await handleDeleteImage(imageToDelete.id)
                setImageToDelete(null)
              }}
              disabled={deleteMutation.isPending}
              className="text-xs h-8.5 gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Delete Photo</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
