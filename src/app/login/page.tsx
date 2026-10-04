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
  CheckCircle2,
  ArrowRight,
  Zap,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { AuthCardLayout } from "@/components/auth"
import { Button } from "@/components/ui/button"
import { useLoginMutation } from "@/hooks/use-auth-query"
import { useUserStore } from "@/store/user.store"
import { cn, getApiErrorMessage } from "@/lib/utils"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectUrl = searchParams.get("redirect") || "/"
  const isVerified = searchParams.get("verified") === "true"
  const isReset = searchParams.get("reset") === "true"
  const emailParam = searchParams.get("email") || ""

  const [email, setEmail] = React.useState(emailParam)
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [rememberMe, setRememberMe] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { isAuthenticated } = useUserStore()
  const loginMutation = useLoginMutation()
  const isPending = loginMutation.isPending

  // Clear active error on input edit
  const clearError = () => {
    if (error) setError(null)
  }

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push(redirectUrl)
    }
  }, [isAuthenticated, redirectUrl, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (isPending) return
    setError(null)

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail) {
      setError("Please enter your work email address.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    loginMutation.mutate(
      {
        email: trimmedEmail,
        password,
        deviceName: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 80) : "Web Dashboard",
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success("Welcome back! Redirecting to dashboard...")
            router.push(redirectUrl)
          } else {
            const msg = res.message || "Failed to log in. Please check your credentials."
            setError(msg)
            toast.error(msg)
          }
        },
        onError: (err: unknown) => {
          const msg = getApiErrorMessage(err, "Invalid email or password. Please try again.")
          setError(msg)
          toast.error(msg)
        },
      }
    )
  }

  const fillDemoCredentials = () => {
    if (isPending) return
    setEmail("testing01@gmail.com")
    setPassword("testing@01")
    setError(null)
    toast.info("Demo credentials loaded.")
  }

  return (
    <AuthCardLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your control center."
      badgeText="Secure Sign In"
      footerContent={
        <p className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className={cn(
              "font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors",
              isPending && "pointer-events-none opacity-60"
            )}
          >
            Sign up
          </Link>
        </p>
      }
    >
      {isVerified && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in-50">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Email successfully verified! You can now log in.</span>
        </div>
      )}

      {isReset && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300 animate-in fade-in-50">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>Password reset successful! Please log in with your new password.</span>
        </div>
      )}

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

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground">Work Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              required
              disabled={isPending}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                clearError()
              }}
              placeholder="name@company.com"
              autoFocus={!emailParam}
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className={cn(
                "text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 transition-colors",
                isPending && "pointer-events-none opacity-60"
              )}
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              required
              disabled={isPending}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                clearError()
              }}
              placeholder="••••••••"
              autoFocus={Boolean(emailParam)}
              className="h-10 w-full rounded-lg border border-border/80 bg-background/80 pl-9 pr-10 text-xs text-foreground placeholder:text-muted-foreground focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-muted/40 transition-colors"
            />
            <button
              type="button"
              tabIndex={-1}
              disabled={isPending}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {/* Remember me checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              disabled={isPending}
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-3.5 rounded border-border text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
            <span className={cn(isPending && "opacity-60")}>Remember this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full gap-2 bg-indigo-600 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin shrink-0" />
              <span>Authenticating...</span>
            </>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="size-4 shrink-0" />
            </>
          )}
        </Button>
      </form>

      {/* Quick Demo Fill Button */}
      <div className="mt-4 pt-3 border-t border-dashed border-border/60">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={fillDemoCredentials}
          className="w-full gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Zap className="size-3.5 text-amber-500 shrink-0" />
          <span>Fill Demo Credentials (testing01@gmail.com)</span>
        </Button>
      </div>
    </AuthCardLayout>
  )
}
