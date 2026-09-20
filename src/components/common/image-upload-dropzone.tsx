/**
 * @file image-upload-dropzone.tsx
 * @description Modern direct-from-device file upload dropzone component integrated with ImageKit CDN.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { UploadCloud, Loader2, Trash2, RefreshCw, AlertCircle, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadFileToImageKit, type UploadResult } from "@/services/image-upload.service"

export interface ImageUploadDropzoneProps {
  value?: string | null
  onChange: (url: string, asset?: { fileId?: string | null; thumbnailUrl?: string | null }) => void
  folder?: string
  label?: string
  description?: string
  aspectRatio?: "square" | "banner" | "wide" | "auto"
  disabled?: boolean
  className?: string
}

export function ImageUploadDropzone({
  value,
  onChange,
  folder = "/uploads",
  label,
  description = "PNG, JPG, WebP, or SVG up to 5MB",
  aspectRatio = "auto",
  disabled = false,
  className = "",
}: ImageUploadDropzoneProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const activeImage = previewUrl || value

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, SVG).")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds 5MB limit.")
      return
    }

    setError(null)
    const localUrl = URL.createObjectURL(file)
    setPreviewUrl(localUrl)
    setIsUploading(true)

    try {
      const result: UploadResult = await uploadFileToImageKit(file, { folder })
      onChange(result.url, {
        fileId: result.fileId,
        thumbnailUrl: result.thumbnailUrl,
      })
      setPreviewUrl(null)
    } catch (err: any) {
      setError(err.message || "Failed to upload image. Please try again.")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled || isUploading) return

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setError(null)
    setPreviewUrl(null)
    onChange("", { fileId: null, thumbnailUrl: null })
  }

  const getAspectClass = () => {
    switch (aspectRatio) {
      case "square":
        return "h-40 sm:h-48 w-40 sm:w-48 mx-auto"
      case "banner":
        return "h-36 sm:h-44 w-full"
      case "wide":
        return "h-32 sm:h-40 w-full"
      default:
        return "min-h-[140px] w-full"
    }
  }

  return (
    <div className={`space-y-1.5 text-xs ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-semibold text-foreground text-xs">{label}</label>
          {activeImage && !isUploading && !disabled && (
            <span className="text-[11px] text-muted-foreground font-normal">
              Click to replace or remove
            </span>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      <div
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && !isUploading) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all cursor-pointer overflow-hidden p-4 ${
          isDragging
            ? "border-primary bg-primary/5"
            : activeImage
            ? "border-border/80 bg-muted/20 hover:border-primary/50"
            : "border-border/70 hover:border-primary/40 hover:bg-muted/30"
        } ${getAspectClass()} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center gap-2 text-center p-4">
            <Loader2 className="size-7 animate-spin text-primary" />
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground text-xs">Uploading to ImageKit CDN...</p>
              <p className="text-[11px] text-muted-foreground">Generating optimized thumbnails</p>
            </div>
          </div>
        ) : activeImage ? (
          <div className="group relative size-full flex items-center justify-center">
            <div className="relative size-full min-h-[120px]">
              <Image
                src={activeImage}
                alt="Selected Image"
                fill
                className="object-contain rounded-md"
                unoptimized
              />
            </div>

            {/* Hover Actions Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-md">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
                disabled={disabled}
                className="h-7 text-xs gap-1.5 shadow-xs"
              >
                <RefreshCw className="size-3" />
                <span>Replace</span>
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
                disabled={disabled}
                className="h-7 text-xs gap-1.5 shadow-xs"
              >
                <Trash2 className="size-3" />
                <span>Remove</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-center py-2">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UploadCloud className="size-5" />
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground text-xs">
                Click to browse or drag & drop image
              </p>
              <p className="text-[11px] text-muted-foreground">{description}</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
