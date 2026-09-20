/**
 * @file edit-product-banner.tsx
 * @description Product Hero / Campaign Banner manager utilizing ImageKit CDN assets.
 */

"use client"

import * as React from "react"
import Image from "next/image"
import { Sparkles, Trash2, CheckCircle2, Loader2, ImagePlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ImageUploadDropzone } from "@/components/common"
import { useUpdateProductMutation, useProductQuery } from "@/hooks/use-product-query"
import type { Product, ProductBannerImage } from "@/types/product"

export interface EditProductBannerProps {
  product: Product
  onBannerChange?: () => void
}

export function EditProductBanner({ product, onBannerChange }: EditProductBannerProps) {
  const { data: liveProduct, refetch } = useProductQuery(product.id)
  const currentBanner: ProductBannerImage | null =
    liveProduct?.bannerImage ?? product.bannerImage ?? null

  const [url, setUrl] = React.useState(currentBanner?.url || "")
  const [altText, setAltText] = React.useState(currentBanner?.altText || "")
  const [fileId, setFileId] = React.useState(currentBanner?.fileId || "")
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const updateMutation = useUpdateProductMutation()

  React.useEffect(() => {
    if (currentBanner) {
      setUrl(currentBanner.url || "")
      setAltText(currentBanner.altText || "")
      setFileId(currentBanner.fileId || "")
    } else {
      setUrl("")
      setAltText("")
      setFileId("")
    }
  }, [currentBanner])

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) return

    setError(null)
    setSuccess(false)
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        payload: {
          bannerImage: {
            url: url.trim(),
            altText: altText.trim() || undefined,
            fileId: fileId.trim() || undefined,
            thumbnailUrl: url.trim().includes("imagekit.io")
              ? `${url.trim()}?tr=w-300`
              : undefined,
          },
        },
      })
      setSuccess(true)
      await refetch()
      onBannerChange?.()
      setTimeout(() => setSuccess(false), 2500)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to update banner"
      setError(msg)
    }
  }

  const handleRemoveBanner = async () => {
    setError(null)
    setSuccess(false)
    try {
      await updateMutation.mutateAsync({
        id: product.id,
        payload: {
          bannerImage: null,
        },
      })
      setUrl("")
      setAltText("")
      setFileId("")
      await refetch()
      onBannerChange?.()
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Failed to remove banner"
      setError(msg)
    }
  }

  return (
    <Card className="border-border/70 bg-card/95 shadow-2xs text-xs">
      <CardHeader className="p-4 pb-3 border-b border-border/60 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-500" />
            <CardTitle className="text-xs font-bold text-foreground">
              Campaign & Hero Banner (ImageKit)
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] border-indigo-200 text-indigo-600 dark:text-indigo-400">
            Dedicated JSON Asset
          </Badge>
        </div>
        <CardDescription className="text-[11px] text-muted-foreground mt-0.5">
          Dedicated hero banner displayed on campaign landing pages and top-of-funnel promotions.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Live Banner Preview */}
        {currentBanner?.url ? (
          <div className="space-y-2">
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/70 bg-muted">
              <Image
                src={currentBanner.url}
                alt={currentBanner.altText || "Campaign Banner"}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground truncate max-w-xs">
                Alt: {currentBanner.altText || "None specified"}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleRemoveBanner}
                disabled={updateMutation.isPending}
                className="h-7 text-xs text-rose-600 hover:bg-rose-500/10 border-rose-200 gap-1"
              >
                <Trash2 className="size-3" />
                <span>Remove Banner</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-20 w-full items-center justify-center rounded-lg border border-dashed border-border/70 bg-muted/20 text-muted-foreground text-xs gap-1.5">
            <ImagePlus className="size-4 text-muted-foreground/60" />
            <span>No campaign banner currently configured.</span>
          </div>
        )}

        {/* Banner Configuration Form */}
        <form onSubmit={handleSaveBanner} className="space-y-3 pt-2 border-t border-border/50">
          <ImageUploadDropzone
            value={url}
            onChange={(newUrl, asset) => {
              setUrl(newUrl)
              if (asset?.fileId) setFileId(asset.fileId)
            }}
            folder="/products/banners"
            label="Upload Campaign / Hero Banner"
            description="Select banner image from device (PNG, JPG, WebP)"
            aspectRatio="banner"
            disabled={updateMutation.isPending}
          />

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-foreground">
              Accessibility & SEO Alt Text
            </label>
            <Input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="e.g. Summer Flash Sale Launch Banner"
              className="h-8.5 text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[10.5px] text-muted-foreground">
              {success && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <CheckCircle2 className="size-3" />
                  Banner updated successfully
                </span>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={updateMutation.isPending || !url.trim()}
              className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 px-3"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="size-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Banner</span>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
