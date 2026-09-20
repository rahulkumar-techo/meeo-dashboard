/**
 * @file image-upload.service.ts
 * @description Centralized ImageKit direct upload service for device file uploads across brands, categories, and banners.
 */

import { productService } from "./product.service"

export interface UploadResult {
  url: string
  fileId?: string | null
  thumbnailUrl?: string | null
  name?: string
  size?: number
}

export interface DirectUploadOptions {
  folder?: string
  tags?: string[]
}

/**
 * Upload a local device File to ImageKit CDN using signed auth credentials.
 */
export async function uploadFileToImageKit(
  file: File,
  options?: DirectUploadOptions
): Promise<UploadResult> {
  // Step 1: Obtain temporary signed client upload token from backend
  const authRes = await productService.getImageKitAuth()
  if (!authRes.success || !authRes.data) {
    throw new Error(authRes.message || "Failed to retrieve ImageKit client authentication token.")
  }

  const { token, expire, signature, publicKey } = authRes.data
  const activePublicKey = publicKey || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || ""

  // Step 2: Build multipart payload for ImageKit direct client ingestion
  const formData = new FormData()
  formData.append("file", file)
  formData.append("fileName", file.name.replace(/\s+/g, "_"))
  formData.append("publicKey", activePublicKey)
  formData.append("signature", signature)
  formData.append("expire", String(expire))
  formData.append("token", token)

  if (options?.folder) {
    formData.append("folder", options.folder)
  }
  if (options?.tags && options.tags.length > 0) {
    formData.append("tags", options.tags.join(","))
  }

  // Step 3: Dispatch POST to ImageKit Media Ingestion API
  const uploadResponse = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData,
  })

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json().catch(() => ({}))
    throw new Error(
      errorData.message ||
        `Image upload failed with status ${uploadResponse.status}: ${uploadResponse.statusText}`
    )
  }

  const result = await uploadResponse.json()

  return {
    url: result.url,
    fileId: result.fileId || null,
    thumbnailUrl:
      result.thumbnailUrl || (result.url ? `${result.url}?tr=w-300` : null),
    name: result.name,
    size: result.size,
  }
}
