"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ShieldCheck, Mail, Loader2, AlertCircle, CheckCircle2, RotateCw, ArrowLeft } from "lucide-react"
import { AuthCardLayout, OtpInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useVerifyOtpMutation, useResendOtpMutation } from "@/hooks/use-auth-query"

export default function VerifyOtpPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""
  const isRegistered = searchParams.get("registered") === "true"

  const [email, setEmail] = React.useState(emailParam)
  const [otp, setOtp] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [successMsg, setSuccessMsg] = React.useState<string | null>(
    isRegistered ? "Account created! A 4-digit verification code has been sent to your email." : null
  )
  const [countdown, setCountdown] = React.useState(60)

  const verifyMutation = useVerifyOtpMutation()
  const resendMutation = useResendOtpMutation()

  // Countdown timer for resend button
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!email.trim()) {
      setError("Please provide your email address.")
      return
    }

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit OTP code.")
      return
    }

    setError(null)

    verifyMutation.mutate(
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMsg("Email successfully verified! Redirecting to login...")
            setTimeout(() => {
              router.push(`/login?verified=true&email=${encodeURIComponent(email.trim())}`)
            }, 1200)
          } else {
            setError(res.message || "Invalid or expired OTP. Please try again.")
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "Invalid OTP verification code. Please check and try again."
          setError(msg)
        },
      }
    )
  }

  // Auto-submit when all 4 digits are entered
  React.useEffect(() => {
    if (otp.length === 4 && email.trim() && !verifyMutation.isPending) {
      handleVerify()
    }
  }, [otp])

  const handleResendOtp = () => {
    if (!email.trim() || resendMutation.isPending || countdown > 0) return

    setError(null)

    resendMutation.mutate(
      { email: email.trim().toLowerCase() },
      {
        onSuccess: (res) => {
          if (res.success) {
            setSuccessMsg("A fresh 4-digit OTP has been sent to your email.")
            setCountdown(60)
            setOtp("")
          } else {
            setError(res.message || "Failed to resend OTP. Please try again.")
          }
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || "Failed to resend OTP."
          setError(msg)
        },
      }
    )
  }

  return (
    <AuthCardLayout
      title="Verify Your Email"
      subtitle={
        email ? (
          <span>
            Enter the 4-digit code sent to{" "}
            <strong className="text-foreground font-semibold">{email}</strong>
          </span>
        ) : (
          "Enter your email and the 4-digit verification code."
        )
      }
      badgeText="Two-Factor Verification"
      footerContent={
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to sign in</span>
          </Link>

          <Link
            href="/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            Change email
          </Link>
        </div>
      }
    >
      {successMsg && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-5">
        {/* Email Input if not provided in URL */}
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

        {/* 4-Digit Segmented OTP Input */}
        <div className="space-y-2">
          <label className="block text-center text-xs font-medium text-muted-foreground">
            4-Digit Verification Code
          </label>
          <OtpInput
            length={4}
            value={otp}
            onChange={setOtp}
            disabled={verifyMutation.isPending}
            error={!!error}
            autoFocus
          />
        </div>

        {/* Resend Section */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <span>Didn&apos;t receive the code?</span>
          {countdown > 0 ? (
            <span className="font-mono font-medium text-indigo-600 dark:text-indigo-400">
              Resend in {countdown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendMutation.isPending || !email}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 dark:text-indigo-400"
            >
              {resendMutation.isPending ? <RotateCw className="size-3 animate-spin" /> : null}
              <span>Resend OTP</span>
            </button>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          disabled={verifyMutation.isPending || otp.length !== 4}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {verifyMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Verifying Code...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              <span>Verify & Activate Account</span>
            </>
          )}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
