"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight } from "lucide-react"
import { AuthCardLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useRegisterMutation } from "@/hooks/use-auth-query"

export default function SignupPage() {
  const router = useRouter()
  const registerMutation = useRegisterMutation()

  const [firstName, setFirstName] = React.useState("")
  const [lastName, setLastName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [agreeTerms, setAgreeTerms] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please verify and try again.")
      return
    }

    if (password.length < 5 || password.length > 12) {
      setError("Password length must be between 5 and 12 characters.")
      return
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service to continue.")
      return
    }

    registerMutation.mutate(
      {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            router.push(`/verify-otp?email=${encodeURIComponent(email.trim())}&registered=true`)
          } else {
            setError(res.message || "Failed to create account. Please try again.")
          }
        },
        onError: (err: any) => {
          const msg =
            err.response?.data?.message ||
            err.message ||
            "An error occurred during registration. Please try again."
          setError(msg)
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
        <p>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            Sign in
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
          <AlertCircle className="size-4 shrink-0 text-rose-600 mt-0.5" />
          <span>{error}</span>
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">Last Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="h-9 w-full rounded-lg border border-border/80 bg-background/80 px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane.doe@company.com"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
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
              minLength={5}
              maxLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
              type={showPassword ? "text" : "password"}
              required
              minLength={5}
              maxLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="h-9 w-full rounded-lg border border-border/80 bg-background/80 pl-8 pr-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Agree terms */}
        <div className="flex items-start gap-2 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 size-3.5 rounded border-border text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="text-[11px] text-muted-foreground cursor-pointer leading-tight">
            I agree to the{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline dark:text-indigo-400">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 mt-2"
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Continue to Email Verification</span>
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthCardLayout>
  )
}
