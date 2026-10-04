export { cn } from "cn"

interface ErrorWithMessage {
  message?: unknown
  msg?: unknown
}

interface AxiosErrorLike {
  response?: {
    data?: {
      errors?: unknown
      message?: unknown
      error?: unknown
    }
  }
  message?: unknown
}

// Helper to extract clear error messages from API responses or exceptions.
export function getApiErrorMessage(
  err: unknown,
  fallback = "An error occurred. Please try again."
): string {
  if (!err) return fallback

  const errorObj = typeof err === "object" && err !== null ? (err as AxiosErrorLike) : null
  const data = errorObj?.response?.data

  // Check errors array: [{ message: "..." }] or ["..."]
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const firstErr = data.errors[0]
    if (typeof firstErr === "string") return firstErr
    if (typeof firstErr === "object" && firstErr !== null) {
      const typed = firstErr as ErrorWithMessage
      if (typeof typed.message === "string") return typed.message
      if (typeof typed.msg === "string") return typed.msg
    }
  }

  // Check errors object: { field: "message" } or { field: ["message"] }
  if (data?.errors && typeof data.errors === "object" && !Array.isArray(data.errors)) {
    const values = Object.values(data.errors as Record<string, unknown>).flat()
    if (values.length > 0) {
      const first = values[0]
      if (typeof first === "string") return first
      if (typeof first === "object" && first !== null) {
        const typed = first as ErrorWithMessage
        if (typeof typed.message === "string") return typed.message
      }
    }
  }

  // Check message property
  if (data?.message) {
    if (Array.isArray(data.message)) {
      return data.message.join(", ")
    }
    if (typeof data.message === "string") {
      return data.message
    }
  }

  // Check error property
  if (typeof data?.error === "string") {
    return data.error
  }

  // Fallback to error message
  if (typeof errorObj?.message === "string") {
    return errorObj.message
  }

  return fallback
}
