"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, X } from "lucide-react"
import { toast } from "sonner"
import { AuthCardLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useRegisterMutation } from "@/hooks/use-auth-query"
import { cn, getApiErrorMessage } from "@/lib/utils"

export default function SignupPage() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false)
  const [agreeTerms, setAgreeTerms] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const isPending = registerMutation.isPending

  // Helper to clear error when user types
  const clearError = () => {
    if (error) setError(null)
  }

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return
    setError(null)

    const trimmedFirst = firstName.trim()
    const trimmedLast = lastName.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (!trimmedFirst) {
      setError("Please enter your first name.")
      return
    }

    if (!trimmedLast) {
      setError("Please enter your last name.")
      return
    }

    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid work email address.")
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

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service to continue.")
      return
    }

    registerMutation.mutate(
      {
        firstName: trimmedFirst,
        lastName: trimmedLast,
        email: trimmedEmail,
        password,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(res.message || "Verification code sent! Please check your email.")
            router.push(`/verify-otp?email=${encodeURIComponent(trimmedEmail)}&registered=true`)
          } else {
            const msg = res.message || "Failed to create account. Please try again."
            setError(msg)
            toast.error(msg)
          }
        },
        onError: (err: unknown) => {
          const msg = getApiErrorMessage(
            err,
            "An error occurred during registration. Please try again."
          )
          setError(msg)
          if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already exists")) {
            toast.error("This email is already registered and verified. Please sign in.")
          } else {
            toast.error(msg)
          }
        },
      }
    )
  }

  return (
    <AuthCardLayout
      title="Create Administrator Account"
      subtitle="Join the Meeo commerce administration platform."
      badgeText="New Account"
      footerContent={
        <p className="text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className={cn(
              "font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors",
              isPending && "pointer-events-none opacity-60"
            )}
          >
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 flex items-start justify-between gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 animate-in fade-in-50">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="size-4 shrink-0 text-rose-600" />
              <span className="leading-tight font-medium">{error}</span>
            </div>
            {(error.toLowerCase().includes("already registered") || error.toLowerCase().includes("already exists")) && (
              <p className="ml-6 text-[11px] text-muted-foreground">
                Your account is already verified.{" "}
                <Link
                  href={`/login?email=${encodeURIComponent(email.trim().toLowerCase())}`}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 underline underline-offset-2"
                >
                  Sign in to your account &rarr;
                </Link>
              </p>
            )}
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

      <form onSubmit={handleSignup} className="space-y-3.5">
        {/* First & Last Name */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">First Name</label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                required
                disabled={isPending}
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  clearError()
                }}
                placeholder="Jane"
                autoFocus
                className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Last Name</label>
            <div className="relative">
              <input
                type="text"
                required
                disabled={isPending}
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  clearError()
                }}
                placeholder="Doe"
                className="h-9 w-full rounded-lg border border-border/80 bg-background/80 px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Work Email */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              disabled={isPending}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError()
              }}
              placeholder="jane.doe@company.com"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Password (5-12 chars)</label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              minLength={5}
              maxLength={12}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {showPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-foreground">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              disabled={isPending}
              minLength={5}
              maxLength={12}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                clearError()
              }}
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              disabled={isPending}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </div>
        </div>

        {/* Agree terms */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            disabled={isPending}
            checked={agreeTerms}
            onChange={(e) => {
              setAgreeTerms(e.target.checked)
              clearError()
            }}
            className="mt-0.5 size-3.5 rounded border-border text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <label
            htmlFor="terms"
            className={cn(
              "text-[11px] text-muted-foreground cursor-pointer leading-tight select-none",
              isPending && "cursor-not-allowed opacity-60"
            )}
          >
            I agree to the{" "}
            <Link
              href="/terms"
              className={cn(
                "text-indigo-600 hover:underline dark:text-indigo-400",
                isPending && "pointer-events-none"
              )}
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className={cn(
                "text-indigo-600 hover:underline dark:text-indigo-400",
                isPending && "pointer-events-none"
              )}
            >
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 mt-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Continue to Email Verification</span>
              <ArrowRight className="size-4 shrink-0" />
            </>
          )}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
