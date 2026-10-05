"use client"

import * as React from "react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    // Report to telemetry service
    console.error("Critical Root Layout Error:", error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-zinc-950 font-sans text-zinc-100 p-6">
        <div className="max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-900/90 p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-950/60 border border-red-500/30 text-red-400">
            <svg
              className="size-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-zinc-100">
            Application Encountered an Error
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            A critical system exception was caught by our runtime shield.
          </p>

          {error.digest && (
            <div className="mt-4 rounded-md border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-mono text-zinc-400">
              Incident ID: <span className="text-zinc-200">{error.digest}</span>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={() => reset()}
              type="button"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
            >
              Reload Application
            </button>
            <Link
              href="/"
              className="w-full rounded-lg border border-zinc-700 bg-transparent px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 transition-colors inline-block text-center"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
