/**
 * @file edit-variant-dialog.tsx
 * @description Modal dialog for updating variant price, cost, barcode, attributes, status, and direct device upload of variant photos.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Edit2, Loader2, Sparkles, AlertCircle, Package, Plus, Trash2, Image as ImageIcon, UploadCloud } from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  useUpdateVariantMutation,
  useAttachVariantImageMutation,
  useDeleteVariantImageMutation,
} from "@/hooks/use-variant-query"
import { uploadFileToImageKit } from "@/services/image-upload.service"
import { InlineAttributeManager } from "./inline-attribute-manager"
import type { ProductVariant, UpdateVariantPayload, VariantStatus } from "@/types/variant"

export interface EditVariantDialogProps {
  variant: ProductVariant | null
  productId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditVariantDialog({
  variant,
  productId,
  open,
  onOpenChange,
  onSuccess,
}: EditVariantDialogProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [sku, setSku] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [compareAtPrice, setCompareAtPrice] = React.useState("")
  const [costPrice, setCostPrice] = React.useState("")
  const [barcode, setBarcode] = React.useState("")
  const [status, setStatus] = React.useState<VariantStatus>("ACTIVE")
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = React.useState<string[]>([])
  const [isUploadingPhoto, setIsUploadingPhoto] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const updateMutation = useUpdateVariantMutation(productId)
  const attachImageMutation = useAttachVariantImageMutation(productId)
  const deleteImageMutation = useDeleteVariantImageMutation(productId)

  React.useEffect(() => {
    if (variant && open) {
      setSku(variant.sku || "")
      setPrice(variant.price !== undefined && variant.price !== null ? String(variant.price) : "")
      setCompareAtPrice(variant.compareAtPrice && Number(variant.compareAtPrice) > 0 ? String(variant.compareAtPrice) : "")
      setCostPrice(variant.costPrice && Number(variant.costPrice) > 0 ? String(variant.costPrice) : "")
      setBarcode(variant.barcode || "")
      setStatus((variant.status as VariantStatus) || "ACTIVE")
      const existingIds = (variant.attributeValues ?? []).map((av: any) => av.attributeValue?.id || av.id).filter(Boolean)
      setSelectedAttributeValueIds(existingIds)
      setError(null)
    }
  }, [variant, open])

  if (!variant) return null

  const numPrice = parseFloat(price) || 0
  const numCost = parseFloat(costPrice) || 0
  const profitMargin = numPrice > 0 && numCost > 0 ? Math.round(((numPrice - numCost) / numPrice) * 100) : null
  const reserved = Number(variant.inventory?.reservedQuantity ?? 0)
  const available = Number(variant.inventory?.availableQuantity ?? 0)
  const stock = variant.inventory?.quantity !== undefined && variant.inventory.quantity !== null ? Number(variant.inventory.quantity) : available + reserved

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !files[0]) return
    const file = files[0]
    setIsUploadingPhoto(true)
    setError(null)
    try {
      const uploadRes = await uploadFileToImageKit(file, { folder: `/products/${productId}/variants` })
      await attachImageMutation.mutateAsync({
        id: variant.id,
        payload: {
          url: uploadRes.url,
          fileId: uploadRes.fileId,
          thumbnailUrl: uploadRes.thumbnailUrl,
          altText: `${variant.sku} photo`,
        },
      })
      onSuccess?.()
    } catch (err: any) {
      setError(err.message || "Failed to upload and attach photo.")
    } finally {
      setIsUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    setError(null)
    try {
      await deleteImageMutation.mutateAsync({ id: variant.id, imageId })
      onSuccess?.()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to delete image.")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sku.trim()) {
      setError("SKU is required.")
      return
    }
    setError(null)
    const payload: UpdateVariantPayload = {
      sku: sku.trim(),
      price: numPrice,
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      costPrice: costPrice ? parseFloat(costPrice) : null,
      barcode: barcode.trim() || null,
      status,
      attributeValueIds: selectedAttributeValueIds,
    }

    updateMutation.mutate(
      { id: variant.id, payload },
      {
        onSuccess: () => {
          onOpenChange(false)
          onSuccess?.()
        },
        onError: (err: any) => {
          setError(err.response?.data?.errors?.[0]?.message || err.response?.data?.message || "Failed to update variant.")
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="p-5 pb-3 border-b border-border/70 bg-muted/10">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                  <Edit2 className="size-4" />
                </div>
                <div>
                  <DialogTitle className="text-base font-bold">
                    Edit Variant: <span className="font-mono text-indigo-600 dark:text-indigo-400">{variant.sku}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Update variant pricing, barcode, attributes, and ImageKit gallery.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/80 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between p-3 rounded-xl border border-border/70 bg-muted/20 gap-2">
              <div className="flex items-center gap-2">
                <Package className="size-4 text-muted-foreground" />
                <div>
                  <span className="font-semibold text-foreground text-xs block">
                    Current Inventory: <strong className="font-mono">{stock} units</strong>
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {available} available • {reserved} reserved
                  </span>
                </div>
              </div>
              <Badge variant={status === "ACTIVE" ? "default" : status === "DRAFT" ? "outline" : "secondary"} className="text-[10px] font-mono uppercase">
                {status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">SKU Code <span className="text-rose-500">*</span></label>
                <Input value={sku} onChange={(e) => setSku(e.target.value.toUpperCase())} className="h-8.5 text-xs font-mono uppercase" required />
              </div>
              <div className="space-y-1.5">
                <label className="font-semibold text-foreground">Barcode / UPC / EAN</label>
                <Input value={barcode} maxLength={64} onChange={(e) => setBarcode(e.target.value)} className="h-8.5 text-xs font-mono" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20">
              <InlineAttributeManager mode="single" selectedSingleValueIds={selectedAttributeValueIds} onSingleSelectionChange={setSelectedAttributeValueIds} />
            </div>

            {/* Variant Specific Images */}
            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="size-3.5 text-indigo-500" />
                  Variant Photos (ImageKit)
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">{variant.images?.length || 0} attached</span>
              </div>

              {variant.images && variant.images.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {variant.images.map((img) => (
                    <div key={img.id} className="relative size-14 shrink-0 rounded-md overflow-hidden border border-border/70 bg-muted group">
                      <Image src={img.thumbnailUrl || img.url} alt={img.altText || "Variant Photo"} fill className="object-cover" unoptimized />
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                        title="Delete photo"
                      >
                        <Trash2 className="size-3.5 text-rose-300" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Direct Device Upload Button */}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleDeviceUpload} className="hidden" />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto || attachImageMutation.isPending}
                className="w-full h-8 text-xs gap-1.5 border-dashed border-indigo-300 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/30"
              >
                {isUploadingPhoto ? <Loader2 className="size-3.5 animate-spin" /> : <UploadCloud className="size-3.5" />}
                <span>{isUploadingPhoto ? "Uploading to ImageKit..." : "Upload Variant Photo from Device"}</span>
              </Button>
            </div>

            <div className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground text-xs uppercase tracking-wider">Pricing</span>
                {profitMargin !== null && (
                  <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400">Est. Margin: {profitMargin}%</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-medium text-foreground text-xs">Selling Price (₹) <span className="text-rose-500">*</span></label>
                  <Input type="text" inputMode="decimal" value={price} onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setPrice(e.target.value)} className="h-8.5 text-xs font-mono" required />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">Compare At MRP (₹)</label>
                  <Input type="text" inputMode="decimal" value={compareAtPrice} onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setCompareAtPrice(e.target.value)} className="h-8.5 text-xs font-mono" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-medium text-muted-foreground text-xs">Cost Per Item (₹)</label>
                  <Input type="text" inputMode="decimal" value={costPrice} onChange={(e) => /^\d*\.?\d*$/.test(e.target.value) && setCostPrice(e.target.value)} className="h-8.5 text-xs font-mono" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground">Publishing Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VariantStatus)}
                className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs text-foreground focus:outline-hidden"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="DRAFT">DRAFT</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2 flex-col-reverse sm:flex-row p-4 border-t border-border/70">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={updateMutation.isPending} className="text-xs h-8.5">
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={updateMutation.isPending} className="text-xs h-8.5 gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
              {updateMutation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              <span>Save Changes</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
