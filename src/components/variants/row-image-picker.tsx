/**
 * @file row-image-picker.tsx
 * @description Compact per-row image manager and dropzone for batch variant tables.
 * Provides instant drag-and-drop file ingestion directly on the table cell,
 * a thumbnail preview, and a full modal dialog backed by VariantImageManager.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { ImageIcon, Plus, Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VariantImageManager } from "./variant-image-manager"
import { uploadFileToImageKit } from "@/services/image-upload.service"
import type { CreateProductImageInput } from "@/types/product"

export interface RowImagePickerProps {
  productId: string
  sku: string
  rowLabel?: string
  images?: CreateProductImageInput[]
  onChange: (images: CreateProductImageInput[]) => void
  className?: string
}

export function RowImagePicker({
  productId,
  sku,
  rowLabel,
  images = [],
  onChange,
  className = "",
}: RowImagePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isCellDragging, setIsCellDragging] = React.useState(false)
  const [isUploadingDirect, setIsUploadingDirect] = React.useState(false)

  // Direct cell drag-and-drop file ingestion
  const handleCellDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCellDragging(true)
  }

  const handleCellDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCellDragging(false)
  }

  const handleCellDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsCellDragging(false)

    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    )
    if (droppedFiles.length === 0) return

    setIsUploadingDirect(true)
    let currentImages = [...images]

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i]
      if (file.size > 10 * 1024 * 1024) continue

      try {
        const uploadRes = await uploadFileToImageKit(file, {
          folder: `/products/${productId}/variants`,
        })
        const newImage: CreateProductImageInput = {
          url: uploadRes.url,
          fileId: uploadRes.fileId,
          thumbnailUrl: uploadRes.thumbnailUrl,
          altText: `${sku || "Variant"} photo ${currentImages.length + 1}`,
          sortOrder: currentImages.length,
        }
        currentImages = [...currentImages, newImage]
        onChange(currentImages)
      } catch (err) {
        console.error("Direct cell image upload failed:", err)
      }
    }

    setIsUploadingDirect(false)
  }

  const firstImage = images[0]

  return (
    <>
      <div
        onDragOver={handleCellDragOver}
        onDragLeave={handleCellDragLeave}
        onDrop={handleCellDrop}
        onClick={() => setIsOpen(true)}
        className={`group relative flex items-center justify-center cursor-pointer transition-all rounded-lg border ${
          isCellDragging
            ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20"
            : "border-border/70 hover:border-indigo-400 bg-background hover:bg-muted/30"
        } ${className}`}
        title={`Manage images for ${sku || rowLabel || "variant"}. Drag & drop files here.`}
      >
        {isUploadingDirect ? (
          <div className="flex items-center justify-center p-1.5 gap-1.5 text-[11px] text-indigo-600 font-medium">
            <Loader2 className="size-3.5 animate-spin" />
            <span className="hidden sm:inline">Uploading...</span>
          </div>
        ) : firstImage ? (
          <div className="flex items-center gap-1.5 p-1 w-full overflow-hidden">
            <div className="relative size-7 shrink-0 rounded-md overflow-hidden bg-muted border border-border/50">
              <Image
                src={firstImage.thumbnailUrl || firstImage.url}
                alt={firstImage.altText || sku}
                fill
                sizes="32px"
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-foreground truncate min-w-0">
              <Badge
                variant="secondary"
                className="text-[10px] px-1 py-0 h-4 bg-muted border border-border/60 text-muted-foreground font-mono"
              >
                {images.length} {images.length === 1 ? "img" : "imgs"}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 py-1.5 px-2 text-[11px] text-muted-foreground group-hover:text-foreground">
            <ImageIcon className="size-3.5 text-muted-foreground/80 group-hover:text-indigo-600" />
            <span className="whitespace-nowrap font-medium text-[10.5px]">+ Media</span>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[620px] max-h-[88vh] flex flex-col p-0 overflow-hidden">
          <div className="p-4 pb-3 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <ImageIcon className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                    <span>Variant Media & Gallery</span>
                    {sku && (
                      <Badge variant="outline" className="font-mono text-[10px] py-0 px-1.5">
                        {sku}
                      </Badge>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Drop images, attach hosted URLs, and drag cards to reorder display sequence.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <VariantImageManager
              productId={productId}
              draftImages={images}
              onDraftImagesChange={onChange}
              sku={sku || rowLabel || "Variant"}
            />
          </div>

          <DialogFooter className="p-3 border-t border-border/70 bg-muted/5 flex items-center justify-between sm:justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
