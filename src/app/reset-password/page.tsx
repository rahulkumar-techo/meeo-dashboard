"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Lock, Mail, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, ArrowLeft, KeyRound } from "lucide-react"
import { AuthCardLayout, OtpInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useResetPasswordMutation } from "@/hooks/use-auth-query"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const [email, setEmail] = React.useState(emailParam)
  const [otp, setOtp] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const resetMutation = useResetPasswordMutation()

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError("Please provide your email address.")
      return
    }

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit OTP code.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.")
      return
    }

    if (password.length < 5 || password.length > 12) {
      setError("Password length must be between 5 and 12 characters.")
      return
    }

    resetMutation.mutate(
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        password,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            router.push("/login?reset=true")
          } else {
            setError(res.message || "Failed to reset password. Please check your OTP and try again.")
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Invalid OTP or password reset expired. Please try again."
          setError(msg)
        },
      }
    )
  }

  return (
    <AuthCardLayout
      title="Create New Password"
      subtitle={
        email ? (
          <span>
            Enter the 4-digit OTP code sent to{" "}
            <strong className="text-foreground font-semibold">{email}</strong> and choose a new password.
          </span>
        ) : (
          "Enter your email, 4-digit reset OTP, and new password."
        )
      }
      badgeText="Password Reset"
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

      <form onSubmit={handleResetPassword} className="space-y-4">
        {/* Email Input if not in URL */}
        {!emailParam && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Email Address</label>
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
        )}

        {/* 4-digit OTP */}
        <div className="space-y-2">
          <label className="block text-center text-xs font-medium text-muted-foreground">
            4-Digit Reset OTP Code
          </label>
          <OtpInput
            length={4}
            value={otp}
            onChange={setOtp}
            disabled={resetMutation.isPending}
            error={!!error}
          />
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">New Password (5-12 chars)</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={5}
              maxLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={5}
              maxLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={resetMutation.isPending || otp.length !== 4}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {resetMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              <KeyRound className="size-4" />
              <span>Set New Password & Sign In</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
