"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, KeyRound, Loader2, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react"
import { AuthCardLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useForgotPasswordMutation } from "@/hooks/use-auth-query"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const forgotPasswordMutation = useForgotPasswordMutation()

  const [email, setEmail] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setError(null)

    forgotPasswordMutation.mutate(
      {
        email: email.trim().toLowerCase(),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`)
          } else {
            setError(res.message || "Unable to send password reset code. Please try again.")
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "An error occurred. Please verify your email and try again."
          setError(msg)
        },
      }
    )
  }

  return (
    <AuthCardLayout
      title="Reset Your Password"
      subtitle="Enter the email associated with your account and we'll send a 4-digit reset OTP code."
      badgeText="Account Recovery"
      footerContent={
        <div className="text-center">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Return to sign in</span>
          </Link>
        </div>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Registered Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={forgotPasswordMutation.isPending || !email.trim()}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {forgotPasswordMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Sending Reset Code...</span>
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              <span>Send 4-Digit Reset OTP</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
