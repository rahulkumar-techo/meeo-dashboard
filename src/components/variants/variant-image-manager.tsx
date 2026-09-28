/**
 * @file variant-image-manager.tsx
 * @description Drag-and-drop image management for product variants.
 * Supports:
 * - Live variant endpoints (POST /:id/images/upload, POST /:id/images, DELETE /:id/images/:imageId, PUT /:id/images/reorder)
 * - Draft mode for Create Variant & Batch Variant dialogs (local state with ImageKit upload)
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
  useUploadVariantImageMutation,
  useAttachVariantImageMutation,
  useDeleteVariantImageMutation,
  useReorderVariantImagesMutation,
} from "@/hooks/use-variant-query"
import { uploadFileToImageKit } from "@/services/image-upload.service"
import type { ProductImage, CreateProductImageInput } from "@/types/product"

export interface VariantImageManagerProps {
  productId: string
  // If variantId is present, calls live server endpoints on the variant
  variantId?: string
  // Live server images for an existing variant
  images?: ProductImage[]
  // Controlled array for draft/creation mode before variant is saved
  draftImages?: CreateProductImageInput[]
  onDraftImagesChange?: (images: CreateProductImageInput[]) => void
  onImagesChange?: (images?: ProductImage[]) => void
  sku?: string
  compact?: boolean
}

export function VariantImageManager({
  productId,
  variantId,
  images = [],
  draftImages,
  onDraftImagesChange,
  onImagesChange,
  sku = "Variant",
  compact = false,
}: VariantImageManagerProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [imageUrlInput, setImageUrlInput] = React.useState("")
  const [fileIdInput, setFileIdInput] = React.useState("")
  const [altTextInput, setAltTextInput] = React.useState("")
  const [isUrlMode, setIsUrlMode] = React.useState(false)
  const [isDraggingFile, setIsDraggingFile] = React.useState(false)
  const [uploadingCount, setUploadingCount] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)

  // Target image selected for delete confirmation card
  const [imageToDelete, setImageToDelete] = React.useState<{
    index: number
    imageId?: string
    url: string
    altText?: string | null
  } | null>(null)

  // Drag-and-drop state for gallery card reordering
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  // Local copy of items for optimistic dragging and reordering
  const isDraftMode = !variantId
  const [localItems, setLocalItems] = React.useState<Array<ProductImage | CreateProductImageInput>>(
    isDraftMode ? draftImages || [] : images
  )

  // Keep local items in sync with external updates
  React.useEffect(() => {
    if (isDraftMode) {
      setLocalItems(draftImages || [])
    } else {
      setLocalItems(images)
    }
  }, [isDraftMode, draftImages, images])

  // Live variant mutations
  const uploadMutation = useUploadVariantImageMutation(productId)
  const attachMutation = useAttachVariantImageMutation(productId)
  const deleteMutation = useDeleteVariantImageMutation(productId)
  const reorderMutation = useReorderVariantImagesMutation(productId)

  const isPending =
    uploadingCount > 0 ||
    uploadMutation.isPending ||
    attachMutation.isPending ||
    deleteMutation.isPending ||
    reorderMutation.isPending

  // Handle uploading files via file picker or drag-and-drop
  const handleUploadFiles = async (rawFiles: File[]) => {
    const validFiles = rawFiles.filter((f) => f.type.startsWith("image/"))
    if (validFiles.length === 0) {
      setError("Please select or drop valid image files (PNG, JPEG, WebP).")
      return
    }

    setError(null)
    setUploadingCount(validFiles.length)

    let runningDrafts: CreateProductImageInput[] = isDraftMode ? [...(draftImages || [])] : []

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i]
      if (file.size > 10 * 1024 * 1024) {
        setError(`"${file.name}" exceeds the 10MB limit. Skipped.`)
        continue
      }

      try {
        if (!isDraftMode && variantId) {
          // Use POST /api/v1/variants/:id/images/upload
          const formData = new FormData()
          formData.append("file", file)
          formData.append("altText", altTextInput.trim() || `${sku} photo ${localItems.length + 1}`)
          formData.append("sortOrder", String(localItems.length))

          const uploadRes = await uploadMutation.mutateAsync({ id: variantId, payload: formData })
          // Instant reflection: immediately add newly uploaded image to local state
          if (uploadRes?.data) {
            setLocalItems((prev) => {
              const exists = prev.some((it) => (it as ProductImage).id === uploadRes.data.id)
              return exists ? prev : [...prev, uploadRes.data]
            })
          }
        } else {
          // In draft mode, upload directly to ImageKit and collect metadata for the create payload
          const uploadRes = await uploadFileToImageKit(file, {
            folder: `/products/${productId}/variants`,
          })
          const newImage: CreateProductImageInput = {
            url: uploadRes.url,
            fileId: uploadRes.fileId,
            thumbnailUrl: uploadRes.thumbnailUrl,
            altText: altTextInput.trim() || `${sku} photo ${runningDrafts.length + 1}`,
            sortOrder: runningDrafts.length,
          }
          runningDrafts = [...runningDrafts, newImage]
          setLocalItems(runningDrafts)
          onDraftImagesChange?.(runningDrafts)
        }
      } catch (err: any) {
        setError(
          err.response?.data?.errors?.[0]?.message ||
            err.response?.data?.message ||
            err.message ||
            `Failed to upload ${file.name}`
        )
      }
    }

    setUploadingCount(0)
    setAltTextInput("")
    if (fileInputRef.current) fileInputRef.current.value = ""
    onImagesChange?.()
  }

  // Handle attaching hosted URL
  const handleAttachUrl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageUrlInput.trim()) return

    setError(null)
    try {
      if (!isDraftMode && variantId) {
        // Use POST /api/v1/variants/:id/images
        const attachRes = await attachMutation.mutateAsync({
          id: variantId,
          payload: {
            url: imageUrlInput.trim(),
            fileId: fileIdInput.trim() || undefined,
            altText: altTextInput.trim() || `${sku} photo`,
            sortOrder: localItems.length,
            thumbnailUrl: imageUrlInput.trim().includes("imagekit.io")
              ? `${imageUrlInput.trim()}?tr=w-200`
              : undefined,
          },
        })
        // Instant reflection: immediately add attached image to local state
        if (attachRes?.data) {
          setLocalItems((prev) => {
            const exists = prev.some((it) => (it as ProductImage).id === attachRes.data.id)
            return exists ? prev : [...prev, attachRes.data]
          })
        }
      } else {
        const newImage: CreateProductImageInput = {
          url: imageUrlInput.trim(),
          fileId: fileIdInput.trim() || undefined,
          thumbnailUrl: imageUrlInput.trim().includes("imagekit.io")
            ? `${imageUrlInput.trim()}?tr=w-200`
            : undefined,
          altText: altTextInput.trim() || `${sku} photo`,
          sortOrder: localItems.length,
        }
        const nextDrafts = [...(draftImages || []), newImage]
        setLocalItems(nextDrafts)
        onDraftImagesChange?.(nextDrafts)
      }

      setImageUrlInput("")
      setFileIdInput("")
      setAltTextInput("")
      onImagesChange?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to attach image URL.")
    }
  }

  // Handle deleting an image
  const handleDeleteImage = async (index: number, imageId?: string) => {
    setError(null)
    try {
      if (!isDraftMode && variantId && imageId) {
        // Use DELETE /api/v1/variants/:id/images/:imageId
        await deleteMutation.mutateAsync({ id: variantId, imageId })
        // Instant reflection: immediately remove deleted image from local state
        setLocalItems((prev) => prev.filter((_, i) => i !== index))
      } else {
        const nextDrafts = (draftImages || []).filter((_, i) => i !== index)
        setLocalItems(nextDrafts)
        onDraftImagesChange?.(nextDrafts)
      }
      onImagesChange?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete image.")
    }
  }

  // Handle drag and drop reordering
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

  const handleItemDrop = async (e: React.DragEvent<HTMLDivElement>, targetIndex: number) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const reordered = [...localItems]
    const [moved] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, moved)

    // Update local state immediately for instant visual feedback
    setLocalItems(reordered)
    setDraggedIndex(null)
    setDragOverIndex(null)

    if (!isDraftMode && variantId) {
      // Use PUT /api/v1/variants/:id/images/reorder
      const serverPayload = reordered
        .map((img, idx) => {
          const id = (img as ProductImage).id
          return id ? { id, sortOrder: idx } : null
        })
        .filter(Boolean) as Array<{ id: string; sortOrder: number }>

      if (serverPayload.length > 0) {
        try {
          await reorderMutation.mutateAsync({ id: variantId, images: serverPayload })
          onImagesChange?.()
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to update image sequence.")
        }
      }
    } else {
      const updatedDrafts = reordered.map((img, idx) => ({ ...img, sortOrder: idx }))
      onDraftImagesChange?.(updatedDrafts)
    }
  }

  const handleItemDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  // Quick cover action moves target image to first slot
  const handleSetAsCover = async (index: number) => {
    if (index === 0) return
    const reordered = [...localItems]
    const [moved] = reordered.splice(index, 1)
    reordered.unshift(moved)
    setLocalItems(reordered)

    if (!isDraftMode && variantId) {
      const serverPayload = reordered
        .map((img, idx) => {
          const id = (img as ProductImage).id
          return id ? { id, sortOrder: idx } : null
        })
        .filter(Boolean) as Array<{ id: string; sortOrder: number }>

      if (serverPayload.length > 0) {
        try {
          await reorderMutation.mutateAsync({ id: variantId, images: serverPayload })
          onImagesChange?.()
        } catch (err: any) {
          setError(err.response?.data?.message || "Failed to update cover photo.")
        }
      }
    } else {
      const updatedDrafts = reordered.map((img, idx) => ({ ...img, sortOrder: idx }))
      onDraftImagesChange?.(updatedDrafts)
    }
  }

  return (
    <div className="space-y-3 text-xs">
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="size-3.5 text-indigo-500" />
          <span className="font-semibold text-foreground text-xs">
            Variant Photos (ImageKit)
          </span>
          <span className="text-[10px] text-muted-foreground font-mono">
            ({localItems.length})
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="h-6.5 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
        >
          {isUrlMode ? <UploadCloud className="size-3" /> : <Link2 className="size-3" />}
          <span>{isUrlMode ? "Upload Files" : "Attach URL"}</span>
        </Button>
      </div>

      {/* Dropzone or Hosted URL Mode */}
      {!isUrlMode ? (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!isDraggingFile) setIsDraggingFile(true)
          }}
          onDragLeave={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (e.currentTarget.contains(e.relatedTarget as Node)) return
            setIsDraggingFile(false)
          }}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDraggingFile(false)
            const files = Array.from(e.dataTransfer.files || [])
            if (files.length > 0) handleUploadFiles(files)
          }}
          onClick={() => !isPending && fileInputRef.current?.click()}
          className={`group relative rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer select-none space-y-1.5 ${
            isDraggingFile
              ? "border-indigo-500 bg-indigo-500/10 dark:bg-indigo-950/40 scale-[1.01]"
              : "border-border/80 bg-muted/20 hover:border-indigo-500/60 hover:bg-muted/40"
          } ${compact ? "p-3" : "p-4"}`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (files.length > 0) handleUploadFiles(files)
            }}
            multiple
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-1">
            <div
              className={`flex items-center justify-center rounded-lg transition-all ${
                compact ? "size-7" : "size-8"
              } ${
                isDraggingFile
                  ? "bg-indigo-600 text-white scale-110 shadow-xs"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 group-hover:scale-105"
              }`}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <UploadCloud className="size-3.5" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-foreground">
                {uploadingCount > 0
                  ? `Uploading ${uploadingCount} photo${uploadingCount > 1 ? "s" : ""}...`
                  : isDraggingFile
                  ? "Drop photo here to upload"
                  : "Drag & drop photos here, or click to browse"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                PNG, JPEG, WebP up to 10MB
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleAttachUrl} className="p-3 rounded-xl border border-border/70 bg-muted/20 space-y-2">
          <Input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://ik.imagekit.io/meeo/variants/..."
            className="h-7.5 text-xs font-mono"
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              value={fileIdInput}
              onChange={(e) => setFileIdInput(e.target.value)}
              placeholder="File ID (Optional)"
              className="h-7 text-xs font-mono"
            />
            <Input
              value={altTextInput}
              onChange={(e) => setAltTextInput(e.target.value)}
              placeholder="Alt Caption (Optional)"
              className="h-7 text-xs"
            />
          </div>
          <div className="flex justify-end pt-0.5">
            <Button
              type="submit"
              size="sm"
              disabled={isPending}
              className="h-7 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isPending ? <Loader2 className="size-3 animate-spin" /> : <Plus className="size-3" />}
              <span>Attach Image</span>
            </Button>
          </div>
        </form>
      )}

      {/* Gallery List with Drag-and-Drop Reordering */}
      {localItems.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-[10.5px] text-muted-foreground">
            <span>First photo is cover</span>
            {localItems.length > 1 && <span>Drag to reorder sequence</span>}
          </div>

          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
            {localItems.map((img, idx) => {
              const isItemDragged = draggedIndex === idx
              const isItemDragOver = dragOverIndex === idx
              const imageId = (img as ProductImage).id
              const displayUrl = img.thumbnailUrl || img.url

              return (
                <div
                  key={imageId || `${img.url}-${idx}`}
                  draggable={!isPending}
                  onDragStart={(e) => handleItemDragStart(e, idx)}
                  onDragOver={(e) => handleItemDragOver(e, idx)}
                  onDragLeave={() => handleItemDragLeave(idx)}
                  onDrop={(e) => handleItemDrop(e, idx)}
                  onDragEnd={handleItemDragEnd}
                  className={`group relative size-16 shrink-0 rounded-lg overflow-hidden border bg-muted/30 transition-all cursor-grab active:cursor-grabbing select-none ${
                    isItemDragged
                      ? "opacity-40 scale-95 border-indigo-500 ring-2 ring-indigo-500"
                      : isItemDragOver
                      ? "border-indigo-500 ring-2 ring-indigo-500 scale-105"
                      : "border-border/70 hover:border-border hover:shadow-xs"
                  }`}
                >
                  <Image
                    src={displayUrl}
                    alt={img.altText || `${sku} ${idx + 1}`}
                    fill
                    className="object-cover pointer-events-none"
                    unoptimized
                  />

                  {/* Drag Grip Cue & Cover Tag */}
                  <div className="absolute top-1 left-1 flex items-center gap-0.5">
                    <div className="size-4 rounded bg-black/60 text-white flex items-center justify-center opacity-70 group-hover:opacity-100">
                      <GripVertical className="size-2.5" />
                    </div>
                    {idx === 0 && (
                      <span className="rounded bg-indigo-600 px-1 py-0.2 text-[8px] font-bold text-white uppercase shadow-2xs">
                        Cover
                      </span>
                    )}
                  </div>

                  {/* Quick Set as Cover Action */}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetAsCover(idx)
                      }}
                      className="absolute bottom-1 left-1 text-[8.5px] bg-black/70 hover:bg-indigo-600 text-white font-medium px-1 py-0.2 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5"
                      title="Set as cover image"
                    >
                      <Star className="size-2" />
                      <span>Cover</span>
                    </button>
                  )}

                  {/* Delete button: always opens delete confirmation card first */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setImageToDelete({
                        index: idx,
                        imageId,
                        url: displayUrl,
                        altText: img.altText,
                      })
                    }}
                    disabled={isPending}
                    className="absolute top-1 right-1 size-4.5 rounded bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 cursor-pointer"
                    title="Delete photo"
                  >
                    <Trash2 className="size-2.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Delete Photo Confirmation Card Modal */}
      <Dialog open={Boolean(imageToDelete)} onOpenChange={(open) => !open && setImageToDelete(null)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">Delete Photo</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Confirm photo deletion from {sku}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {imageToDelete && (
            <div className="space-y-3 py-2 text-xs">
              <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                <div className="relative size-14 shrink-0 rounded-md overflow-hidden border border-border/80 bg-background">
                  <Image
                    src={imageToDelete.url}
                    alt={imageToDelete.altText || "Photo preview"}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {imageToDelete.altText || `${sku} Image`}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Position: Photo #{imageToDelete.index + 1}
                  </p>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">
                Are you sure you want to remove this photo? This will permanently delete it from this variant gallery.
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
                await handleDeleteImage(imageToDelete.index, imageToDelete.imageId)
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
