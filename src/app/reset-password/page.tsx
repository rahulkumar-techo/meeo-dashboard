"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  RotateCw,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { AuthCardLayout, OtpInput } from "@/components/auth"
import { Button } from "@/components/ui/button"
import {
  useResetPasswordMutation,
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
} from "@/hooks/use-auth-query"
import { cn, getApiErrorMessage } from "@/lib/utils"

type ResetStep = "verify" | "password"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get("email") || ""

  const [step, setStep] = React.useState<ResetStep>("verify")
  const [email, setEmail] = React.useState(emailParam)
  const [otp, setOtp] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [countdown, setCountdown] = React.useState(60)

  const verifyResetOtpMutation = useVerifyResetOtpMutation()
  const resetMutation = useResetPasswordMutation()
  const resendResetMutation = useForgotPasswordMutation()

  const isVerifyPending = verifyResetOtpMutation.isPending
  const isResetPending = resetMutation.isPending
  const isResendPending = resendResetMutation.isPending
  const isBusy = isVerifyPending || isResetPending || isResendPending

  // Countdown timer for resend OTP button
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const clearError = () => {
    if (error) setError(null)
  }

  // Handle Step 1: Hit POST /api/v1/auth/verify-reset-otp (Route 5)
  const handleProceedToPassword = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (isBusy) return

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please provide a valid registered email address.")
      return
    }

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit verification code.")
      return
    }

    setError(null)

    verifyResetOtpMutation.mutate(
      {
        email: trimmedEmail,
        otp: otp.trim(),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setError(null)
            setStep("password")
            toast.success("Reset code confirmed! Now create your new password.")
          } else {
            const msg = res.message || "Invalid or expired reset code. Please try again."
            setError(msg)
            toast.error(msg)
          }
        },
        onError: (err: unknown) => {
          const msg = getApiErrorMessage(
            err,
            "Invalid or expired reset code. Please check and try again."
          )
          setError(msg)
          toast.error(msg)
        },
      }
    )
  }

  // Auto-submit Step 1 when 4 digits are completed
  React.useEffect(() => {
    if (step === "verify" && otp.length === 4 && email.trim() && !isBusy) {
      handleProceedToPassword()
    }
  }, [otp, step])

  // Handle Resend Reset OTP in Step 1 (Route 4: POST /api/v1/auth/forgot-password)
  const handleResendOtp = () => {
    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || isBusy || countdown > 0) return

    setError(null)

    resendResetMutation.mutate(
      { email: trimmedEmail },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("A fresh 4-digit reset OTP has been sent to your email.")
            setCountdown(60)
            setOtp("")
          } else {
            const msg = res.message || "Failed to resend reset OTP. Please try again."
            setError(msg)
            toast.error(msg)
          }
        },
        onError: (err: unknown) => {
          const msg = getApiErrorMessage(err, "Failed to resend reset OTP.")
          setError(msg)
          toast.error(msg)
        },
      }
    )
  }

  // Handle Step 2: Submit New Password with verified OTP
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (isBusy) return

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please provide your email address.")
      setStep("verify")
      return
    }

    if (otp.length !== 4) {
      setError("Please enter the complete 4-digit OTP code.")
      setStep("verify")
      return
    }

    if (password.length < 5 || password.length > 12) {
      setError("Password length must be between 5 and 12 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.")
      return
    }

    setError(null)

    resetMutation.mutate(
      {
        email: trimmedEmail,
        otp: otp.trim(),
        password,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Password reset successful! Please log in with your new password.")
            router.push("/login?reset=true")
          } else {
            const msg =
              res.message || "Failed to reset password. Please check your OTP and try again."
            setError(msg)
            toast.error(msg)
            // If OTP failed or expired, return to verify step
            if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("expired")) {
              setStep("verify")
            }
          }
        },
        onError: (err: unknown) => {
          const msg = getApiErrorMessage(
            err,
            "Invalid OTP or password reset expired. Please try again."
          )
          setError(msg)
          toast.error(msg)
          if (msg.toLowerCase().includes("otp") || msg.toLowerCase().includes("expired")) {
            setStep("verify")
          }
        },
      }
    )
  }

  return (
    <AuthCardLayout
      title={step === "verify" ? "Verify Reset Code" : "Set New Password"}
      subtitle={
        step === "verify" ? (
          email ? (
            <span>
              Enter the 4-digit code sent to{" "}
              <strong className="text-foreground font-semibold">{email}</strong>.
            </span>
          ) : (
            "Enter your email and the 4-digit reset OTP code."
          )
        ) : (
          "Choose a secure new password (5-12 characters) for your account."
        )
      }
      badgeText={step === "verify" ? "Step 1 of 2: Verification" : "Step 2 of 2: New Password"}
      footerContent={
        <div className="flex items-center justify-between text-xs">
          {step === "verify" ? (
            <>
              <Link
                href="/login"
                className={cn(
                  "inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors",
                  isBusy && "pointer-events-none opacity-60"
                )}
              >
                <ArrowLeft className="size-3.5" />
                <span>Return to sign in</span>
              </Link>

              <Link
                href="/forgot-password"
                className={cn(
                  "font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors",
                  isBusy && "pointer-events-none opacity-60"
                )}
              >
                Change email
              </Link>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setError(null)
                setStep("verify")
              }}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to OTP code</span>
            </button>
          )}
        </div>
      }
    >
      {error && (
        <div className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in-50">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
            <span className="leading-tight">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-200 shrink-0"
            aria-label="Dismiss error"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* STEP 1: VERIFY OTP */}
      {step === "verify" && (
        <form onSubmit={handleProceedToPassword} className="space-y-5 animate-in fade-in-50 duration-200">
          {/* Email Input if not provided in URL */}
          {!emailParam && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Registered Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  disabled={isBusy}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    clearError()
                  }}
                  placeholder="name@company.com"
                  className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
                />
              </div>
            </div>
          )}

          {/* 4-digit OTP */}
          <div className="space-y-2">
            <label className="block text-center text-xs font-medium text-muted-foreground">
              4-Digit Reset Verification Code
            </label>
            <OtpInput
              length={4}
              value={otp}
              onChange={(val) => {
                setOtp(val)
                clearError()
              }}
              disabled={isBusy}
              error={Boolean(error)}
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
                disabled={isBusy || !email.trim()}
                className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed dark:text-indigo-400 transition-colors"
              >
                {isResendPending ? <RotateCw className="size-3 animate-spin shrink-0" /> : null}
                <span>{isResendPending ? "Resending..." : "Resend Code"}</span>
              </button>
            )}
          </div>

          {/* Verify & Proceed Button */}
          <Button
            type="submit"
            disabled={isBusy || otp.length !== 4}
            className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isVerifyPending ? (
              <>
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>Verifying code...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4 shrink-0" />
                <span>Verify Code & Continue</span>
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </Button>
        </form>
      )}

      {/* STEP 2: SET NEW PASSWORD */}
      {step === "password" && (
        <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in-50 duration-200">
          {/* Confirmed Code Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                Code verified for <strong className="font-semibold">{email}</strong>
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                setError(null)
                setStep("verify")
              }}
              disabled={isBusy}
              className="text-[11px] font-semibold text-emerald-700 hover:underline dark:text-emerald-400 shrink-0"
            >
              Change
            </button>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">New Password (5-12 chars)</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isBusy}
                minLength={5}
                maxLength={12}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  clearError()
                }}
                placeholder="••••••••"
                autoFocus
                className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={isBusy}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                type={showConfirmPassword ? "text" : "password"}
                required
                disabled={isBusy}
                minLength={5}
                maxLength={12}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  clearError()
                }}
                placeholder="••••••••"
                className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={isBusy}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isBusy || !password || !confirmPassword}
            className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isResetPending ? (
              <>
                <Loader2 className="size-4 animate-spin shrink-0" />
                <span>Resetting Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="size-4 shrink-0" />
                <span>Set New Password & Sign In</span>
                <ArrowRight className="size-4 shrink-0" />
              </>
            )}
          </Button>
        </form>
      )}
    </AuthCardLayout>
  )
}
